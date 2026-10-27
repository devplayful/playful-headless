import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const {
  DEFAULT_LP_META_ANGLE,
  DEFAULT_LP_META_MARKET,
  caseOrderForMarket,
  featuredCaseSlugForMarket,
  parseLpMetaAngle,
  parseLpMetaMarket,
} = await import('../app/lp/agencia-shopify/variants.ts');
const { LP_META_SHOPIFY_META } = await import('../app/lp/agencia-shopify/copy.ts');
const {
  isLpMetaShopifyPath,
  lpMetaBookingAnchorHref,
  lpMetaBookingHrefFromSearch,
  lpMetaHrefWithSearch,
} = await import('../app/lp/_lib/meta-booking-href.ts');
const { isBookingHref } = await import('../utils/booking-attribution.ts');
const page = readFileSync(new URL('../app/lp/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const unsigned = readFileSync(new URL('../app/lp/_lib/unsigned-copy.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/lp/agencia-shopify/copy.ts', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../app/lp/agencia-shopify/Landing.tsx', import.meta.url), 'utf8');
const bookingCta = readFileSync(new URL('../app/lp/agencia-shopify/BookingCta.tsx', import.meta.url), 'utf8');
const sticky = readFileSync(new URL('../app/lp/agencia-shopify/StickyCta.tsx', import.meta.url), 'utf8');
const hero = readFileSync(new URL('../app/lp/agencia-shopify/HeroLcp.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/lp/layout.tsx', import.meta.url), 'utf8');
const root = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const propagator = readFileSync(new URL('../components/BookingQueryPropagator.tsx', import.meta.url), 'utf8');
const nextConfig = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../utils/apex-sitemap.ts', import.meta.url), 'utf8');
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

test('ruta /lp/agencia-shopify es noindex, fuera del sitemap y resuelve mkt/ang en servidor', () => {
  assert.equal(LP_META_SHOPIFY_META.path, '/lp/agencia-shopify');
  assert.match(page, /index:\s*false/);
  assert.match(page, /follow:\s*false/);
  assert.match(page, /canonical:\s*LP_META_SHOPIFY_META\.path/);
  assert.match(page, /searchParams/);
  assert.match(page, /force-dynamic/);
  assert.match(page, /parseLpMetaAngle/);
  assert.match(page, /parseLpMetaMarket/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(nextConfig, /source: '\/lp\/:path\*'/);
  assert.match(nextConfig, /noindex, nofollow/);
  assert.ok(expectedRoutes.sourceRoutes.includes('/lp/agencia-shopify'));
  assert.doesNotMatch(sitemap, /\/lp\/agencia-shopify/);
  assert.doesNotMatch(header, /\/lp\/agencia-shopify/);
});

test('mkt y ang: default ES y titular genérico si faltan o no valen', () => {
  assert.equal(DEFAULT_LP_META_MARKET, 'es');
  assert.equal(DEFAULT_LP_META_ANGLE, 'generic');
  assert.equal(parseLpMetaMarket(null), 'es');
  assert.equal(parseLpMetaMarket(''), 'es');
  assert.equal(parseLpMetaMarket('ES'), 'es');
  assert.equal(parseLpMetaMarket('latam'), 'latam');
  assert.equal(parseLpMetaMarket('ve'), 've');
  assert.equal(parseLpMetaMarket('mx'), 'es');
  assert.equal(parseLpMetaAngle(null), 'generic');
  assert.equal(parseLpMetaAngle(''), 'generic');
  assert.equal(parseLpMetaAngle('nope'), 'generic');
  assert.equal(parseLpMetaAngle('c3'), 'c3');
  assert.equal(parseLpMetaAngle('C1'), 'c1');
  assert.equal(parseLpMetaAngle(null, 'c3_gancho_final'), 'c3');
  assert.equal(parseLpMetaAngle('invalid', 'c2_foo'), 'c2');
  assert.equal(featuredCaseSlugForMarket('es'), 'odwalla-shopify-dtc-ecommerce');
  assert.equal(featuredCaseSlugForMarket('latam'), 'jumex-shopify-dtc-ecommerce');
  assert.equal(featuredCaseSlugForMarket('ve'), 'soytechno-ecommerce-venezuela');
  assert.deepEqual(caseOrderForMarket('latam')[0], 'jumex-shopify-dtc-ecommerce');
});

test('CTA local conserva la query completa y el propagador global no se toca', () => {
  const search =
    '?ang=c3&mkt=latam&utm_source=facebook&fbclid=test&gclid=G1&qa=1&utm_id=99';
  const href = lpMetaBookingHrefFromSearch(search);
  const url = new URL(href, 'https://playfulagency.com');
  assert.equal(url.pathname, '/reunion-playful');
  assert.equal(url.searchParams.get('ang'), 'c3');
  assert.equal(url.searchParams.get('mkt'), 'latam');
  assert.equal(url.searchParams.get('utm_source'), 'facebook');
  assert.equal(url.searchParams.get('fbclid'), 'test');
  assert.equal(url.searchParams.get('gclid'), 'G1');
  assert.equal(url.searchParams.get('qa'), '1');
  assert.equal(url.searchParams.get('utm_id'), '99');

  const hop = lpMetaBookingAnchorHref(search);
  const hopUrl = new URL(hop, 'https://playfulagency.com');
  assert.equal(hopUrl.pathname, '/reunion-playful/ir');
  assert.equal(hopUrl.searchParams.get('ang'), 'c3');
  assert.equal(hopUrl.searchParams.get('mkt'), 'latam');
  assert.equal(hopUrl.searchParams.get('qa'), '1');
  assert.equal(isBookingHref(hop), false);
  assert.equal(isBookingHref(href), true);

  assert.equal(
    lpMetaHrefWithSearch('/casos-de-exito/jumex-shopify-dtc-ecommerce', search),
    '/casos-de-exito/jumex-shopify-dtc-ecommerce?ang=c3&mkt=latam&utm_source=facebook&fbclid=test&gclid=G1&qa=1&utm_id=99',
  );
  assert.equal(isLpMetaShopifyPath('/lp/agencia-shopify'), true);
  assert.equal(isLpMetaShopifyPath('/lp/agencia-shopify/'), true);
  assert.equal(isLpMetaShopifyPath('/lp/calentamiento'), false);

  assert.doesNotMatch(propagator, /lpMetaBookingHrefFromSearch/);
  assert.doesNotMatch(propagator, /isLpMetaShopifyPath/);
  assert.doesNotMatch(propagator, /lp-meta/);
  assert.doesNotMatch(propagator, /agencia-shopify/);
  assert.match(landing, /dataCta="lp-meta-hero"/);
  assert.match(landing, /dataCta="lp-meta-hero-sec"/);
  assert.match(sticky, /data-cta="lp-meta-sticky"|dataCta="lp-meta-sticky"/);
  assert.match(bookingCta, /data-cta=\{dataCta\}/);
  assert.match(bookingCta, /data-lp-meta-booking/);
});

test('VisitaCalificada se hereda del layout /lp; no se toca layout raíz ni CSS global', () => {
  assert.match(layout, /VisitaCalificadaTracker/);
  assert.match(page, /Landing/);
  assert.doesNotMatch(root, /AdsMetaShopify/);
  assert.doesNotMatch(root, /lp-meta-agencia/);
  assert.doesNotMatch(header, /VisitaCalificada|lp-meta-shopify/);
  assert.doesNotMatch(footer, /VisitaCalificada|lp-meta-shopify/);
  assert.doesNotMatch(globals, /lp-meta-shopify|visita.calificada|VisitaCalificada/);
});

test('copy visible va marcado COPY SIN FIRMAR y no inventa cifras', () => {
  assert.match(unsigned, /COPY SIN FIRMAR — \$\{tag\}/);
  assert.match(copy, /COPY SIN FIRMAR|titular genérico|titular C3/);
  assert.match(landing, /unsignedLabel|UnsignedBlock/);
  assert.doesNotMatch(copy, /\[COPY PENDIENTE/);
  assert.match(copy, /PERMISO JOSÉ PENDIENTE/);
  assert.match(copy, /SIN VERIFICAR/);
  assert.match(copy, /Sin cifras inventadas|sin cifras inventadas|PROHIBIDO inventar/);
  assert.match(landing, /data-lp-block="1"/);
  assert.match(landing, /data-lp-block="2"/);
  assert.match(landing, /data-lp-block="8"/);
  assert.match(landing, /id="problema"/);
  assert.doesNotMatch(landing, /data-lp-when-ang/);
  assert.doesNotMatch(landing, /hidden=\{ang !== 'generic'\}/);
  assert.match(landing, /LP_META_HERO_TITLES\[ang\]/);
});

test('hero LCP es img local con priority y sin lazy', () => {
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /hero-gORwV7MSXO@1x\.webp/);
  assert.match(hero, /decoding="sync"/);
  assert.doesNotMatch(hero, /loading=["']lazy["']/);
  assert.doesNotMatch(hero, /from ['"]next\/image['"]/);
  assert.match(landing, /rel="preload"/);
  assert.match(landing, /HeroLcp/);
});
