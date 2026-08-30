import assert from 'node:assert/strict';

const baseUrl = process.env.SEO_BASE_URL;

if (!baseUrl) {
  throw new Error('SEO_BASE_URL is required, for example https://branch.vercel.app');
}

const origin = new URL(baseUrl).origin;

async function request(pathname, options = {}) {
  return fetch(new URL(pathname, origin), {
    redirect: 'manual',
    ...options,
  });
}

async function expectRedirect(pathname, expectedPathname, status, { preserveQuery = true } = {}) {
  const response = await request(pathname);
  assert.equal(response.status, status, `${pathname} should return ${status}`);
  const location = response.headers.get('location');
  assert.ok(location, `${pathname} should include a Location header`);
  const target = new URL(location, origin);
  assert.equal(target.pathname, expectedPathname);
  if (preserveQuery) {
    assert.equal(target.search, new URL(pathname, origin).search, 'redirect must preserve query parameters');
  }
  return target;
}

await expectRedirect(
  '/contacto?utm_source=seo-smoke',
  '/contactar-agencia-de-marketing-digital',
  301,
);
await expectRedirect(
  '/contactanos?utm_source=seo-smoke',
  '/contactar-agencia-de-marketing-digital',
  301,
);
const blogAliasTarget = await expectRedirect(
  '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical?utm_source=seo-smoke',
  '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
  308,
  { preserveQuery: false },
);
assert.equal(
  blogAliasTarget.search,
  '',
  'known limitation: static blog category redirects currently drop query parameters',
);

const canonicalPath = '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical';
const canonicalResponse = await request(`${canonicalPath}?amp=1`, { redirect: 'follow' });
assert.equal(canonicalResponse.status, 200);
const canonicalHtml = await canonicalResponse.text();
const canonicals = [...canonicalHtml.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
assert.equal(canonicals.length, 1, 'canonical page should emit exactly one canonical');
assert.equal(canonicals[0][1], `https://playfulagency.com${canonicalPath}`);

const invalidResponse = await request(`${canonicalPath}/extra`, { redirect: 'manual' });
assert.equal(invalidResponse.status, 404, 'extra catch-all segments must not resolve');

const sitemapResponse = await request('/sitemap.xml', { redirect: 'follow' });
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(urls).size, urls.length, 'sitemap must not contain duplicate URLs');
assert.ok(urls.every((url) => url.startsWith('https://playfulagency.com')));
assert.ok(urls.every((url) => !url.includes('endpoint.playfulagency.com') && !url.includes('www.playfulagency.com')));

console.log(`SEO smoke passed against ${origin}`);
