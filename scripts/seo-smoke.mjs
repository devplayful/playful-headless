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

{
  const reunion = await request('/reunion-playful?utm_source=seo-smoke');
  assert.equal(reunion.status, 301, '/reunion-playful should return 301');
  const location = reunion.headers.get('location');
  assert.ok(location, '/reunion-playful should include a Location header');
  const target = new URL(location);
  assert.equal(target.origin, 'https://api.playfulagency.com');
  assert.equal(target.pathname, '/widget/bookings/reunion-playful');
  assert.equal(target.search, '?utm_source=seo-smoke');
}
await expectRedirect(
  '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical?utm_source=seo-smoke&utm_medium=organic&utm_campaign=canonical-alias&utm_content=one&utm_content=two',
  '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
  308,
);
{
  const oneHop = await expectRedirect(
    '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical?noamp=mobile',
    '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
    308,
    { preserveQuery: false },
  );
  assert.equal(oneHop.search, '');
}
{
  const oneHop = await expectRedirect(
    '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical?noamp=mobile&utm_source=seo-smoke',
    '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
    308,
    { preserveQuery: false },
  );
  assert.equal(oneHop.searchParams.get('utm_source'), 'seo-smoke');
  assert.equal(oneHop.searchParams.has('noamp'), false);
}

const canonicalPath = '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical';
{
  const stripped = await expectRedirect(`${canonicalPath}?amp=1`, canonicalPath, 301, {
    preserveQuery: false,
  });
  assert.equal(stripped.search, '');
}
{
  const stripped = await expectRedirect('/blog?noamp=mobile', '/blog', 301, {
    preserveQuery: false,
  });
  assert.equal(stripped.search, '');
}
{
  const stripped = await expectRedirect(`${canonicalPath}?noamp=mobile`, canonicalPath, 301, {
    preserveQuery: false,
  });
  assert.equal(stripped.search, '');
}
{
  const stripped = await expectRedirect(
    `${canonicalPath}?noamp=mobile&utm_source=x`,
    canonicalPath,
    301,
    { preserveQuery: false },
  );
  assert.equal(stripped.searchParams.get('utm_source'), 'x');
  assert.equal(stripped.searchParams.has('noamp'), false);
}
const canonicalResponse = await request(`${canonicalPath}?amp=1`, { redirect: 'follow' });
assert.equal(canonicalResponse.status, 200);
const canonicalHtml = await canonicalResponse.text();
const canonicals = [...canonicalHtml.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
assert.equal(canonicals.length, 1, 'canonical page should emit exactly one canonical');
assert.equal(canonicals[0][1], `https://playfulagency.com${canonicalPath}`);

const invalidResponse = await request(`${canonicalPath}/extra`, { redirect: 'manual' });
assert.equal(invalidResponse.status, 404, 'extra catch-all segments must not resolve');

const unknownCategoryResponse = await request(
  `/blog/categoria-inexistente/bad-bunny-como-marca-la-potencia-del-marketing-musical?utm_source=seo-smoke`,
  { redirect: 'manual' },
);
assert.equal(unknownCategoryResponse.status, 404, 'unknown category aliases must not drop attribution');

const homeResponse = await request('/', { redirect: 'follow' });
assert.equal(homeResponse.status, 200);
const homeHtml = await homeResponse.text();
const homeCanonicals = [...homeHtml.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
assert.equal(homeCanonicals.length, 1, 'home should emit exactly one canonical');
assert.equal(homeCanonicals[0][1], 'https://playfulagency.com/');
const homeOgUrls = [...homeHtml.matchAll(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["'][^>]*>/gi)];
assert.equal(homeOgUrls.length, 1, 'home should emit exactly one og:url');
assert.equal(homeOgUrls[0][1], 'https://playfulagency.com/');

const sitemapResponse = await request('/sitemap.xml', { redirect: 'follow' });
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(urls).size, urls.length, 'sitemap must not contain duplicate URLs');
assert.ok(urls.every((url) => url.startsWith('https://playfulagency.com')));
assert.ok(urls.every((url) => !url.includes('endpoint.playfulagency.com') && !url.includes('www.playfulagency.com')));

function extractTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
}

function extractOgTitle(html) {
  return (
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i)?.[1] ??
    ''
  );
}

const expectedTitles = {
  '/agencia-e-commerce':
    'Tu Agencia e-Commerce para Resultados Reales | Playful Agency',
  '/agencia-shopify':
    'Agencia Shopify para marcas que ya venden | Playful Agency',
  '/pagos-online-ecommerce':
    'Pagos Online para E-commerce | Haz tu Integración con Playful Agency',
  '/pasarela-de-pago-ecommerce':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  '/marketing-internacional':
    'Marketing Internacional: Lleva tu negocio al mundo (sin complicaciones)',
};

const observedTitles = [];
for (const [pathname, expected] of Object.entries(expectedTitles)) {
  const response = await request(pathname, { redirect: 'follow' });
  assert.equal(response.status, 200, `${pathname} should return 200`);
  const html = await response.text();
  const title = extractTitle(html);
  const ogTitle = extractOgTitle(html);
  assert.equal(title, expected, `${pathname} <title>`);
  assert.equal(ogTitle, expected, `${pathname} og:title`);
  assert.doesNotMatch(html, /name=["']robots["'][^>]*content=["'][^"']*noindex/i);
  observedTitles.push(title);
}
assert.equal(new Set(observedTitles).size, observedTitles.length, 'each QA URL must have a distinct title');

assert.ok(
  urls.includes('https://playfulagency.com/agencia-shopify'),
  'sitemap must include /agencia-shopify without a trailing slash',
);

const shopifyResponse = await request('/agencia-shopify', { redirect: 'follow' });
assert.equal(shopifyResponse.status, 200, '/agencia-shopify should return 200');
const shopifyHtml = await shopifyResponse.text();
const shopifyCanonicals = [...shopifyHtml.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
assert.equal(shopifyCanonicals.length, 1, '/agencia-shopify should emit exactly one canonical');
assert.equal(shopifyCanonicals[0][1], 'https://playfulagency.com/agencia-shopify');
assert.match(
  shopifyHtml,
  /name=["']description["'][^>]*content=["']Agencia Shopify para marcas que ya venden: implementamos y migramos tu tienda para un checkout optimizado y mejor conversión\. Agenda una llamada\./i,
);
assert.match(shopifyHtml, /"@type"\s*:\s*"FAQPage"/);
assert.match(shopifyHtml, /<h1[^>]*>Agencia Shopify\. Playful Agency, expertos en ecommerce<\/h1>/);
assert.doesNotMatch(shopifyHtml, /Shopify Plus/i);
assert.doesNotMatch(shopifyHtml, /Cocina/i);
assert.match(shopifyHtml, /Conversemos sobre tu tienda Shopify/);
assert.match(shopifyHtml, /api\.playfulagency\.com\/widget\/bookings\/reunion-playful/);
assert.match(shopifyHtml, /Agendar Reunión con Playful/);
assert.match(shopifyHtml, /contactar-agencia-de-marketing-digital/);
assert.doesNotMatch(shopifyHtml, /name=["']decisionRole["']/);

function extractRobots(html) {
  return (
    html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i)?.[1] ??
    ''
  );
}

const blogCleanResponse = await request('/blog', { redirect: 'follow' });
assert.equal(blogCleanResponse.status, 200, '/blog should return 200');
const blogCleanHtml = await blogCleanResponse.text();
const blogCleanCanonicals = [...blogCleanHtml.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
assert.equal(blogCleanCanonicals.length, 1, '/blog should emit exactly one canonical');
assert.equal(blogCleanCanonicals[0][1], 'https://playfulagency.com/blog');
assert.doesNotMatch(blogCleanHtml, /name=["']robots["'][^>]*content=["'][^"']*noindex/i);

const blogQueryPaths = [
  '/blog?page=1',
  '/blog?page=2',
  '/blog?category=seo',
  '/blog?page=2&category=seo',
];
for (const pathname of blogQueryPaths) {
  const response = await request(pathname, { redirect: 'follow' });
  assert.equal(response.status, 200, `${pathname} should return 200`);
  const html = await response.text();
  const robots = extractRobots(html);
  assert.match(robots, /noindex/i, `${pathname} must be noindex`);
  assert.match(robots, /follow/i, `${pathname} must remain follow`);
  const canonicals = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
  assert.equal(canonicals.length, 1, `${pathname} should emit exactly one canonical`);
  assert.equal(canonicals[0][1], 'https://playfulagency.com/blog');
}

const invalidBlogPage = await request('/blog?page=-2&category=seo', { redirect: 'manual' });
assert.equal(invalidBlogPage.status, 404, 'invalid/negative blog page stays 404');

console.log(`SEO smoke passed against ${origin}`);
