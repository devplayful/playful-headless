import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  FAQ_ITEMS,
  SHOPIFY_META,
  HERO,
  CTA,
  SERVICES,
  SERVICE_GRID_ITEMS,
  SERVICE_BAND_ITEMS,
  SOCIAL_PROOF,
  PLAYFUL_URL_RE,
  buildFaqPageJsonLd,
} = await import('../app/agencia-shopify/copy.ts');
const { ZELLE_BLOG_POST_HREF } = await import('../utils/blog-service-cta.ts');

const landing = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8');
const form = readFileSync(new URL('../components/ContactLeadForm.tsx', import.meta.url), 'utf8');

test('meta title, description and path match the signed v9 copy', () => {
  assert.equal(SHOPIFY_META.title, 'Agencia Shopify para marcas que ya venden | Playful Agency');
  assert.equal(
    SHOPIFY_META.description,
    'Agencia Shopify para marcas que ya venden: implementamos y migramos tu tienda para un checkout optimizado y mejor conversión. Agenda una llamada.',
  );
  assert.equal(SHOPIFY_META.path, '/agencia-shopify');
});

test('FAQPage JSON-LD uses the seven signed questions and answers exactly', () => {
  const jsonLd = buildFaqPageJsonLd();
  assert.equal(jsonLd['@type'], 'FAQPage');
  assert.equal(jsonLd.mainEntity.length, 7);
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.name),
    FAQ_ITEMS.map((item) => item.question),
  );
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.acceptedAnswer.text),
    FAQ_ITEMS.map((item) => item.answer),
  );
});

test('landing keeps one H1, signed CTAs, shared closing sections and five illustration slots', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /{HERO\.h1}/);
  assert.match(landing, /TwoColumnCtaSection/);
  assert.match(landing, /buttonText=\{CTA\.cta\}/);
  assert.match(landing, /buttonLink=\{CONTACT_HREF\}/);
  assert.doesNotMatch(landing, /ContactLeadForm/);
  assert.doesNotMatch(landing, /servicio-operar/);
  assert.equal(CTA.formButton, 'Agenda tu llamada de 30 a 40 minutos');
  assert.equal(HERO.cta, '¿Hablamos?');
  const contentSlots = SERVICES.items.filter((item) => item.slot);
  assert.equal(contentSlots.length, 4);
  assert.deepEqual(
    contentSlots.map((item) => item.slot),
    ['servicio-diseno', 'servicio-desarrollo', 'servicio-catalogo', 'servicio-checkout'],
  );
  assert.match(landing, /data-illustration-slot=\{id\}/);
  assert.match(landing, /id="hero"/);
  assert.match(landing, /\/images\/agencia-shopify\/hero-gORwV7MSXO@1x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/hero-gORwV7MSXO@2x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-diseno-ovqmfMO829@1x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-diseno-ovqmfMO829@2x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-desarrollo-ovqEk50829@1x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-desarrollo-ovqEk50829@2x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-catalogo-yiYYfxIPW9@1x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-catalogo-yiYYfxIPW9@2x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-checkout-SyZ2uJkUb8@1x\.png/);
  assert.match(landing, /\/images\/agencia-shopify\/servicio-checkout-SyZ2uJkUb8@2x\.png/);
  assert.match(landing, /TestimonialsSection/);
  assert.match(landing, /CaseStudyCard/);
  assert.match(landing, /BlogRelatedPostsSection/);
  assert.match(landing, /ServiceFaqAccordion/);
  assert.match(landing, /function PurpleBand/);
  assert.match(landing, /!text-white/);
  assert.match(landing, /!text-\[#E9D7FF\]/);
  const purpleBand = landing.slice(landing.indexOf('function PurpleBand'), landing.indexOf('export default'));
  assert.doesNotMatch(purpleBand, /playful-h2/);
  assert.doesNotMatch(purpleBand, /playful-contenido-p/);
  assert.doesNotMatch(landing, /Shopify Plus/i);
  assert.doesNotMatch(landing, /Cocina/i);
  assert.doesNotMatch(landing, /magnific/i);
});

test('sitemap lists the interior URL without a trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-shopify</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-shopify\//);
});

test('signed copy never invents Plus, Cocina notes, surtido or prices', () => {
  const published = JSON.stringify({
    SHOPIFY_META,
    HERO,
    SERVICES,
    FAQ_ITEMS,
    CTA,
  });
  assert.doesNotMatch(published, /Shopify Plus/i);
  assert.doesNotMatch(published, /Cocina/);
  assert.doesNotMatch(published, /surtido/i);
  assert.doesNotMatch(published, /\$\d/);
});

test('FAQ case URLs keep the trailing period outside the link', () => {
  const jumexFaq = FAQ_ITEMS.find((item) => item.question.includes('trabajo en Shopify'));
  const parts = jumexFaq.answer.split(PLAYFUL_URL_RE);
  assert.ok(parts.includes('https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce'));
  assert.ok(parts.some((part) => part.startsWith('. En las dos páginas')));
  assert.ok(!parts.some((part) => part.endsWith('ecommerce.')));
});

test('Odwalla and Jumex cards keep v9 lines and never expose raw case URLs', () => {
  assert.equal(SERVICE_GRID_ITEMS.length, 4);
  assert.equal(SERVICE_BAND_ITEMS.length, 2);
  assert.ok(landing.includes('toShopifyCaseCards'));
  assert.deepEqual(
    SOCIAL_PROOF.cases.map((item) => item.line),
    [
      'Odwalla — implementación de ecommerce en Shopify. Ver el caso:',
      'Jumex — implementación de ecommerce en Shopify. Ver el caso:',
    ],
  );
  for (const item of SOCIAL_PROOF.cases) {
    assert.doesNotMatch(item.line, /https:\/\//);
  }
});

test('Shopify case cards reuse Casos de Éxito featured tapas', async () => {
  const {
    CASOS_DE_EXITO_FEATURED_TAPAS,
    featuredTapaForSlug,
    resolveCaseStudyListingImage,
  } = await import('../lib/case-study-listing-image.ts');
  assert.equal(
    CASOS_DE_EXITO_FEATURED_TAPAS['jumex-shopify-dtc-ecommerce'],
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US.png',
  );
  assert.equal(
    CASOS_DE_EXITO_FEATURED_TAPAS['odwalla-shopify-dtc-ecommerce'],
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-Odwalla.png',
  );
  assert.equal(
    resolveCaseStudyListingImage({
      _embedded: { 'wp:featuredmedia': [{ source_url: CASOS_DE_EXITO_FEATURED_TAPAS['jumex-shopify-dtc-ecommerce'] }] },
    }),
    CASOS_DE_EXITO_FEATURED_TAPAS['jumex-shopify-dtc-ecommerce'],
  );
  assert.equal(featuredTapaForSlug('odwalla-shopify-dtc-ecommerce'), CASOS_DE_EXITO_FEATURED_TAPAS['odwalla-shopify-dtc-ecommerce']);
  const casesSource = readFileSync(new URL('../app/agencia-shopify/shopify-cases.ts', import.meta.url), 'utf8');
  assert.match(casesSource, /featuredTapaForSlug/);
  assert.match(casesSource, /jumex-shopify-dtc-ecommerce/);
  assert.match(casesSource, /odwalla-shopify-dtc-ecommerce/);
});

test('landing includes exactly one contextual href to the Zelle blog post', () => {
  assert.equal(
    ZELLE_BLOG_POST_HREF,
    '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );
  assert.match(landing, /href=\{ZELLE_BLOG_POST_HREF\}/);
  assert.equal((landing.match(/ZELLE_BLOG_POST_HREF/g) || []).length, 2);
});

test('shared High Level form still owns qualification and receipt recovery', () => {
  assert.match(form, /name="decisionRole"/);
  assert.match(form, /name="salesModel"/);
  assert.match(form, /name="monthlyRevenue"/);
  assert.match(form, /name="projectTiming"/);
  assert.match(form, /await submitRequest\('reconcile'\)/);
  assert.match(form, /Comprobar estado de la entrega/);
});
