import { loadCollection } from './load-snapshot.mjs';

const HEADERS = {
  'content-type': 'application/json; charset=UTF-8',
  'x-wp-snapshot': '1',
};

function jsonResponse(body, { status = 200, total, totalPages } = {}) {
  const headers = new Headers(HEADERS);
  if (typeof total === 'number') headers.set('X-WP-Total', String(total));
  if (typeof totalPages === 'number') headers.set('X-WP-TotalPages', String(totalPages));
  return new Response(JSON.stringify(body), { status, headers });
}

function parseRoute(url) {
  const parsed = typeof url === 'string' ? new URL(url) : url;
  const path = parsed.pathname.replace(/^\/wp-json/, '') || '/';
  const segments = path.split('/').filter(Boolean);
  const namespace = segments[0] || 'wp';
  const version = segments[1] || 'v2';
  const resource = segments[2] || '';
  const params = Object.fromEntries(parsed.searchParams.entries());
  return { namespace, version, resource, params, searchParams: parsed.searchParams };
}

function pickFields(item, fieldsParam) {
  if (!fieldsParam || fieldsParam === 'id') return item;
  const fields = fieldsParam.split(',').map((f) => f.trim()).filter(Boolean);
  if (fields.length === 0) return item;
  const out = {};
  for (const field of fields) {
    if (field in item) out[field] = item[field];
  }
  if (!('id' in out) && 'id' in item) out.id = item.id;
  return out;
}

function parsePageParams(params, defaultPerPage = 10) {
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(params.per_page || String(defaultPerPage), 10) || defaultPerPage));
  return { page, perPage };
}

function orderItems(items, params) {
  const orderby = params.orderby || 'date';
  const order = (params.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  const sorted = [...items];
  sorted.sort((a, b) => {
    let av = a[orderby];
    let bv = b[orderby];
    if (orderby === 'title' && a.title?.rendered) {
      av = a.title.rendered;
      bv = b.title?.rendered;
    }
    if (av == null && bv == null) return 0;
    if (av == null) return order;
    if (bv == null) return -order;
    if (av < bv) return -order;
    if (av > bv) return order;
    return 0;
  });
  if (params.orderby === 'include' && params.include) {
    const ids = params.include.split(',').map((id) => parseInt(id, 10));
    const byId = new Map(sorted.map((item) => [item.id, item]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }
  return sorted;
}

function filterByStatus(items, status) {
  if (!status) return items;
  return items.filter((item) => (item.status || 'publish') === status);
}

function filterPosts(items, params) {
  let out = filterByStatus(items, params.status || 'publish');
  if (params.slug) {
    out = out.filter((item) => item.slug === params.slug);
  }
  if (params.categories) {
    const categoryId = parseInt(params.categories, 10);
    out = out.filter((item) => {
      const cats = item.categories;
      if (!Array.isArray(cats)) return false;
      return cats.some((c) => (typeof c === 'number' ? c : c?.id) === categoryId);
    });
  }
  if (params.include) {
    const ids = new Set(params.include.split(',').map((id) => parseInt(id, 10)));
    out = out.filter((item) => ids.has(item.id));
  }
  if (params.exclude) {
    const ids = new Set(params.exclude.split(',').map((id) => parseInt(id, 10)));
    out = out.filter((item) => !ids.has(item.id));
  }
  return out;
}

function paginate(items, params, defaultPerPage = 10) {
  const { page, perPage } = parsePageParams(params, defaultPerPage);
  const ordered = orderItems(items, params);
  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const slice = ordered.slice(start, start + perPage);
  return { items: slice, total, totalPages };
}

function collectionResponse(resource, params) {
  const all = loadCollection(resource);
  let items = [...all];
  if (resource === 'posts') {
    items = filterPosts(items, params);
  } else if (resource === 'pages' || resource === 'podcast' || resource === 'casos-de-exito') {
    items = filterByStatus(items, params.status);
    if (params.slug) {
      items = items.filter((item) => item.slug === params.slug);
    }
  } else if (resource === 'categories') {
    if (params.slug) {
      items = items.filter((item) => item.slug === params.slug);
    }
  } else if (resource === 'media' || resource === 'users') {
    if (params.include) {
      const ids = new Set(params.include.split(',').map((id) => parseInt(id, 10)));
      items = items.filter((item) => ids.has(item.id));
    }
  }
  const { items: pageItems, total, totalPages } = paginate(items, params, parseInt(params.per_page || '10', 10) || 10);
  const fields = params._fields;
  const mapped = pageItems.map((item) => pickFields(item, fields));
  return jsonResponse(mapped, { status: 200, total, totalPages });
}

function singleItemResponse(resource, params) {
  const all = loadCollection(resource);
  const items = resource === 'posts' ? filterPosts(all, params) : all.filter((item) => item.slug === params.slug);
  const fields = params._fields;
  const mapped = items.map((item) => pickFields(item, fields));
  return jsonResponse(mapped, { status: 200, total: mapped.length, totalPages: 1 });
}

export function resolveWordPressSnapshotRequest(input) {
  const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
  const { namespace, version, resource, params } = parseRoute(url);
  if (namespace !== 'wp' || version !== 'v2') {
    return jsonResponse({ code: 'rest_no_route', message: 'No route' }, { status: 404 });
  }
  const known = new Set(['posts', 'pages', 'categories', 'users', 'media', 'podcast', 'equipo', 'casos-de-exito']);
  if (!known.has(resource)) {
    return jsonResponse({ code: 'rest_no_route', message: 'No route' }, { status: 404 });
  }
  if (params.slug && resource !== 'media') {
    return singleItemResponse(resource, params);
  }
  return collectionResponse(resource, params);
}

export async function wordpressFetchFromSnapshot(input) {
  return resolveWordPressSnapshotRequest(input);
}

export async function wordpressFetchCollectionFromSnapshot(input) {
  const response = await resolveWordPressSnapshotRequest(input);
  if (response.status !== 200) {
    const err = new Error(`WordPress snapshot collection failed with ${response.status}`);
    err.status = response.status;
    throw err;
  }
  const body = await response.arrayBuffer();
  const items = JSON.parse(new TextDecoder().decode(body));
  if (!Array.isArray(items)) {
    throw new Error('WordPress snapshot collection returned a non-array payload');
  }
  return { items, response: new Response(body, { status: response.status, headers: response.headers }) };
}
