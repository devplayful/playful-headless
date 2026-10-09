import canibalizacionOrigins from './blog-canibalizacion-redirect-map.json' with { type: 'json' };

export const APEX_ORIGIN = 'https://playfulagency.com';

/** 15 closed-list origins → absolute one-hop 301 destinations. */
export const CANIBALIZACION_301: Record<string, string> = canibalizacionOrigins;

/** Waiting on the receptor page. Do not 301 these in this PR. */
export const CANIBALIZACION_DEFERRED_PATHS = [
  '/blog/pautas-digitales/consejos-para-que-hagas-pautas-en-tus-post-de-instagram',
  '/blog/pautas-digitales/tipos-de-publicidad-online-conceptos-y-datos-curiosos',
  '/blog/mas-vistos/que-es-una-agencia-de-sem',
] as const;

export function normalizeRedirectPath(pathname: string): string {
  const path = pathname.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, '') : path || '/';
}

function pathnameFromDest(dest: string): string {
  if (/^https?:\/\//i.test(dest) || dest.startsWith('//')) {
    try {
      const url = dest.startsWith('//') ? new URL(`https:${dest}`) : new URL(dest);
      return normalizeRedirectPath(url.pathname);
    } catch {
      return normalizeRedirectPath(dest);
    }
  }
  return normalizeRedirectPath(dest);
}

const ORIGIN_DEST: Record<string, string> = {};
const ORIGIN_SLUG_DEST: Record<string, string> = {};
const ORIGIN_PATHS: string[] = [];
const DEST_PATHS = new Set<string>();

for (const [origin, dest] of Object.entries(CANIBALIZACION_301)) {
  const path = normalizeRedirectPath(origin);
  ORIGIN_DEST[path] = dest;
  ORIGIN_PATHS.push(path);
  DEST_PATHS.add(pathnameFromDest(dest));
  const parts = path.split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  if (slug) ORIGIN_SLUG_DEST[slug] = dest;
}

export function isCanibalizacionOriginPath(pathname: string): boolean {
  return Object.prototype.hasOwnProperty.call(ORIGIN_DEST, normalizeRedirectPath(pathname));
}

export function canibalizacionDestination(pathname: string): string | null {
  return ORIGIN_DEST[normalizeRedirectPath(pathname)] ?? null;
}

export function canibalizacionDestinationPath(pathname: string): string | null {
  const dest = canibalizacionDestination(pathname);
  return dest ? pathnameFromDest(dest) : null;
}

export function isCanibalizacionDestinationPath(pathname: string): boolean {
  return DEST_PATHS.has(normalizeRedirectPath(pathname));
}

/** Old apex aliases whose path ends with a 15-origin path or its slug. */
export function originForLegacySource(pathname: string): string | null {
  const path = normalizeRedirectPath(pathname);
  if (ORIGIN_DEST[path]) return path;
  for (const origin of ORIGIN_PATHS) {
    if (path.endsWith(origin)) return origin;
  }
  const parts = path.split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  if (!slug || !ORIGIN_SLUG_DEST[slug]) return null;
  for (const origin of ORIGIN_PATHS) {
    if (origin.endsWith(`/${slug}`)) return origin;
  }
  return null;
}

export function retargetRedirectDestination(dest: string): string {
  const path = pathnameFromDest(dest);
  return ORIGIN_DEST[path] ?? dest;
}

/**
 * Collapse chains: any map entry whose dest is a 15-origin, or whose source
 * ends with one, goes straight to the new absolute destination.
 */
export function mergeCanibalizacionIntoPermanent301(
  permanent: Record<string, string>,
  categoryMap: Record<string, string> = {},
): Record<string, string> {
  const merged: Record<string, string> = {
    ...permanent,
    ...CANIBALIZACION_301,
  };

  for (const [source, dest] of Object.entries(categoryMap)) {
    const fromDest = ORIGIN_DEST[pathnameFromDest(dest)];
    const fromSource = originForLegacySource(source);
    const next = fromDest ?? (fromSource ? ORIGIN_DEST[fromSource] : undefined);
    if (next) merged[normalizeRedirectPath(source)] = next;
  }

  for (const [source, dest] of Object.entries(merged)) {
    merged[source] = retargetRedirectDestination(dest);
    const fromSource = originForLegacySource(source);
    if (fromSource && ORIGIN_DEST[fromSource]) {
      merged[source] = ORIGIN_DEST[fromSource];
    }
  }

  return merged;
}

export function retargetCategoryRedirectDestination(destination: string): string {
  return pathnameFromDest(retargetRedirectDestination(destination));
}

export function remapCanibalizacionHref(href: string): string {
  if (typeof href !== 'string' || !href) return href;
  try {
    const absolute = href.startsWith('//') ? `https:${href}` : href;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, `${APEX_ORIGIN}/`);
    const dest = canibalizacionDestination(url.pathname);
    if (!dest) return href;
    const destUrl = new URL(dest);
    destUrl.search = url.search;
    destUrl.hash = url.hash;
    if (href.startsWith('http') || href.startsWith('//')) {
      return destUrl.href;
    }
    return `${destUrl.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}
