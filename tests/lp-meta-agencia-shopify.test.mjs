import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const {
  DEFAULT_LP_META_ANGLE,
  DEFAULT_LP_META_MARKET,
  LP_META_STATIC_ANGLES,
  caseOrderForMarket,
  featuredCaseSlugForMarket,
  parseLpMetaAngle,
  parseLpMetaMarket,
} = await import('../app/lp/agencia-shopify/variants.ts');
const { LP_META_HERO_TITLES, LP_META_SHOPIFY_META } = await import('../app/lp/agencia-shopify/copy.ts');
const {
  generateStaticAngleParams,
  LP_META_ANGLE_TITLES,
  LP_META_ANG_QUERY_REDIRECTS,
} = await import('../app/lp/agencia-shopify/angles.js');
const {
  isLpMetaShopifyPath,
  lpMetaBookingAnchorHref,
  lpMetaBookingHrefFromSearch,
  lpMetaHrefWithSearch,
} = await import('../app/lp/_lib/meta-booking-href.ts');
const { isBookingHref } = await import('../utils/booking-attribution.ts');
const page = readFileSync(new URL('../app/lp/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const anglePage = readFileSync(new URL('../app/lp/agencia-shopify/[ang]/page.tsx', import.meta.url), 'utf8');
const angRedirects = readFileSync(
  new URL('../app/lp/agencia-shopify/ang-query-redirects.js', import.meta.url),
  'utf8',
);
const unsigned = readFileSync(new URL('../app/lp/_lib/unsigned-copy.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/lp/agencia-shopify/copy.ts', import.meta.url), 'utf8');
const anglesSrc = readFileSync(new URL('../app/lp/agencia-shopify/angles.js', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../app/lp/agencia-shopify/Landing.tsx', import.meta.url), 'utf8');
const queryBoot = readFileSync(new URL('../app/lp/agencia-shopify/query-boot.ts', import.meta.url), 'utf8');
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

test('ruta /lp/agencia-shopify es noindex, fuera del sitemap y el hero no lee searchParams', () => {
  assert.equal(LP_META_SHOPIFY_META.path, '/lp/agencia-shopify');
  assert.match(page, /index:\s*false/);
  assert.match(page, /follow:\s*false/);
  assert.match(page, /canonical:\s*LP_META_SHOPIFY_META\.path/);
  assert.match(page, /force-static/);
  assert.doesNotMatch(page, /searchParams/);
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(anglePage, /canonical:\s*LP_META_SHOPIFY_META\.path/);
  assert.match(anglePage, /index:\s*false/);
  assert.match(anglePage, /follow:\s*false/);
  assert.match(anglePage, /generateStaticParams/);
  assert.match(anglePage, /dynamicParams = false/);
  assert.match(anglePage, /force-static/);
  assert.doesNotMatch(anglePage, /useSearchParams/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(nextConfig, /source: '\/lp\/:path\*'/);
  assert.match(nextConfig, /noindex, nofollow/);
  assert.match(nextConfig, /LP_META_ANG_QUERY_REDIRECTS/);
  assert.match(nextConfig, /x-vercel-skip-toolbar/);
  assert.match(nextConfig, /hero-gORwV7MSXO@1x\.webp/);
  assert.match(angRedirects, /require\(['"]\.\/angles['"]\)/);
  assert.match(anglesSrc, /permanent: true/);
  assert.match(anglesSrc, /destination: `\/lp\/agencia-shopify\/\$\{ang\}`/);
  assert.ok(expectedRoutes.sourceRoutes.includes('/lp/agencia-shopify'));
  assert.ok(expectedRoutes.sourceRoutes.includes('/lp/agencia-shopify/[ang]'));
  assert.deepEqual(expectedRoutes.governedConcreteRoutes['/lp/agencia-shopify/[ang]'].slice().sort(), [
    '/lp/agencia-shopify/c1',
    '/lp/agencia-shopify/c2',
    '/lp/agencia-shopify/c3',
    '/lp/agencia-shopify/c4',
    '/lp/agencia-shopify/c5',
    '/lp/agencia-shopify/generic',
  ]);
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
  assert.deepEqual([...LP_META_STATIC_ANGLES], ['generic', 'c1', 'c2', 'c3', 'c4', 'c5']);
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
  assert.equal(isLpMetaShopifyPath('/lp/agencia-shopify/c3'), true);
  assert.equal(isLpMetaShopifyPath('/lp/agencia-shopify/generic'), true);
  assert.equal(isLpMetaShopifyPath('/lp/calentamiento'), false);

  assert.doesNotMatch(propagator, /lpMetaBookingHrefFromSearch/);
  assert.doesNotMatch(propagator, /isLpMetaShopifyPath/);
  assert.doesNotMatch(propagator, /lp-meta/);
  assert.doesNotMatch(propagator, /agencia-shopify/);
  assert.match(landing, /dataCta="lp-meta-hero"/);
  assert.match(landing, /dataCta="lp-meta-hero-sec"/);
  assert.match(landing, /QUERY_BOOT_SCRIPT/);
  assert.match(queryBoot, /location\.search/);
  assert.doesNotMatch(queryBoot, /<h1|querySelector\(["']h1/);
  assert.match(sticky, /data-cta="lp-meta-sticky"|dataCta="lp-meta-sticky"/);
  assert.doesNotMatch(sticky, /use client/);
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
  assert.match(copy, /COPY SIN FIRMAR|PERMISO JOSÉ PENDIENTE/);
  assert.match(anglesSrc, /titular genérico|titular C3/);
  assert.match(landing, /unsignedLabel|UnsignedBlock/);
  assert.doesNotMatch(copy, /\[COPY PENDIENTE/);
  assert.match(copy, /PERMISO JOSÉ PENDIENTE/);
  assert.match(copy, /SIN VERIFICAR/);
  assert.match(copy, /Sin cifras inventadas|sin cifras inventadas|PROHIBIDO inventar/);
  assert.match(landing, /data-lp-block="1"/);
  assert.match(landing, /data-lp-block="2"/);
  assert.match(landing, /data-lp-block="8"/);
  assert.match(landing, /id="problema"/);
  assert.doesNotMatch(landing, /useSearchParams/);
  assert.doesNotMatch(landing, /hidden=\{ang !== 'generic'\}/);
  assert.match(landing, /LP_META_HERO_TITLES\[ang\]/);
  assert.match(landing, /as="h1"/);
  assert.match(anglesSrc, /tag: 'titular genérico'/);
  assert.match(anglesSrc, /tag: 'titular C1'/);
  assert.match(anglesSrc, /tag: 'titular C2'/);
  assert.match(anglesSrc, /tag: 'titular C3'/);
  assert.match(anglesSrc, /tag: 'titular C4'/);
  assert.match(anglesSrc, /tag: 'titular C5'/);
});

test('ángulos: un solo archivo de datos alimenta generateStaticParams, H1 y 308', () => {
  const slugs = Object.keys(LP_META_ANGLE_TITLES);
  assert.ok(slugs.includes('generic'));
  assert.deepEqual([...LP_META_STATIC_ANGLES], slugs);
  assert.deepEqual(Object.keys(LP_META_HERO_TITLES), slugs);
  slugs.forEach((slug) => {
    assert.equal(LP_META_HERO_TITLES[slug].tag, LP_META_ANGLE_TITLES[slug].tag);
    assert.equal(LP_META_HERO_TITLES[slug].note, LP_META_ANGLE_TITLES[slug].note);
  });

  assert.deepEqual(
    generateStaticAngleParams().map((p) => p.ang),
    slugs,
  );
  assert.match(anglePage, /generateStaticAngleParams/);
  assert.match(copy, /LP_META_ANGLE_TITLES/);
  assert.match(landing, /LP_META_HERO_TITLES\[ang\]/);
  assert.match(nextConfig, /LP_META_ANG_QUERY_REDIRECTS/);
  assert.match(angRedirects, /require\(['"]\.\/angles['"]\)/);

  const hardcodedList = /['"]c1['"]\s*,\s*['"]c2['"]\s*,\s*['"]c3['"]/;
  assert.doesNotMatch(anglePage, hardcodedList);
  assert.doesNotMatch(page, hardcodedList);
  assert.doesNotMatch(nextConfig, hardcodedList);
  assert.doesNotMatch(angRedirects, hardcodedList);
  assert.doesNotMatch(landing, hardcodedList);
  assert.doesNotMatch(copy, hardcodedList);

  const destSlugs = [
    ...new Set(
      LP_META_ANG_QUERY_REDIRECTS.map((r) => r.destination.replace('/lp/agencia-shopify/', '')),
    ),
  ].sort();
  assert.deepEqual(destSlugs, [...slugs].sort());
  slugs.forEach((slug) => {
    const values = new Set([slug, slug.toUpperCase()]);
    values.forEach((value) => {
      assert.ok(
        LP_META_ANG_QUERY_REDIRECTS.some(
          (r) =>
            r.has[0].key === 'ang' &&
            r.has[0].value === value &&
            r.destination === `/lp/agencia-shopify/${slug}` &&
            r.permanent === true,
        ),
        `falta 308 ?ang=${value} → /lp/agencia-shopify/${slug}`,
      );
    });
  });
});

test('hero LCP es img local con priority y sin lazy', () => {
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /hero-gORwV7MSXO@1x\.webp/);
  assert.match(hero, /HeroLcpPreload/);
  assert.match(hero, /rel="preload"/);
  assert.match(hero, /decoding="async"/);
  assert.doesNotMatch(hero, /HERO_LCP_DATA_URI|data:image\/webp/);
  assert.doesNotMatch(hero, /opacity\s*[:=]/);
  assert.doesNotMatch(hero, /loading=["']lazy["']/);
  assert.doesNotMatch(hero, /from ['"]next\/image['"]/);
  assert.doesNotMatch(hero, /use client/);
  assert.match(landing, /HeroLcp/);
  assert.doesNotMatch(landing, /use client/);
  assert.doesNotMatch(landing, /from ['"]next\/image['"]/);
  assert.doesNotMatch(landing, /from ['"]next\/link['"]/);
  assert.doesNotMatch(landing, /CimaBreaker|AdsCaseCard/);
  assert.match(page, /HeroLcpPreload/);
  assert.match(anglePage, /HeroLcpPreload/);
  assert.doesNotMatch(queryBoot, /data-lp-meta-shopify/);
  assert.match(queryBoot, /addEventListener\("load"/);
});
