import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  CASE_STUDY_COVER_SIZE,
  CASOS_DE_EXITO_FEATURED_TAPAS,
  applyCaseStudyCoverOverride,
  featuredTapaForSlug,
  isLocalCaseStudyCoverOverride,
  resolveCaseStudyCoverUrl,
  resolveCaseStudyListingImage,
  resolveCaseStudyOgImage,
} = await import('../lib/case-study-listing-image.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const JUMEX = 'jumex-shopify-dtc-ecommerce';
const ODWALLA = 'odwalla-shopify-dtc-ecommerce';
const WP_JUMEX =
  'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US.png';
const WP_ODWALLA =
  'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-Odwalla.png';

function pngSize(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('Jumex and Odwalla tapas are local 1200×1200 files under public/casos/', async () => {
  assert.equal(CASE_STUDY_COVER_SIZE.width, 1200);
  assert.equal(CASE_STUDY_COVER_SIZE.height, 1200);
  assert.equal(CASOS_DE_EXITO_FEATURED_TAPAS[JUMEX], '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  assert.equal(CASOS_DE_EXITO_FEATURED_TAPAS[ODWALLA], '/casos/Tapa-Caso-de-exito-Odwalla.png');
  assert.equal(featuredTapaForSlug(JUMEX), '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  assert.equal(featuredTapaForSlug(ODWALLA), '/casos/Tapa-Caso-de-exito-Odwalla.png');
  assert.equal(isLocalCaseStudyCoverOverride(featuredTapaForSlug(JUMEX)), true);
  assert.equal(
    isLocalCaseStudyCoverOverride(featuredTapaForSlug('soytechno-ecommerce-venezuela')),
    false,
  );

  for (const slug of [JUMEX, ODWALLA]) {
    const rel = featuredTapaForSlug(slug).replace(/^\//, '');
    const file = join(root, 'public', rel);
    assert.ok(existsSync(file), rel);
    const buffer = await readFile(file);
    assert.deepEqual(pngSize(buffer), { width: 1200, height: 1200 }, rel);
    assert.ok(buffer.byteLength > 50 * 1024, `${rel} too small`);
    assert.ok(buffer.byteLength < 900 * 1024, `${rel} too large`);
  }
});

test('listing and cover resolvers prefer the local tapa over the 500×500 WP featured', () => {
  const wpEmbed = {
    slug: JUMEX,
    featured_media_url: WP_JUMEX,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: WP_JUMEX,
          media_details: {
            width: 500,
            sizes: {
              full: { source_url: WP_JUMEX, width: 500 },
              medium: {
                source_url: WP_JUMEX.replace('.png', '-300x300.png'),
                width: 300,
              },
            },
          },
        },
      ],
    },
  };

  assert.equal(resolveCaseStudyCoverUrl(JUMEX, WP_JUMEX), '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  assert.equal(resolveCaseStudyListingImage(wpEmbed), '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  assert.equal(
    resolveCaseStudyListingImage({ slug: ODWALLA, featured_media_url: WP_ODWALLA }),
    '/casos/Tapa-Caso-de-exito-Odwalla.png',
  );
  assert.equal(
    resolveCaseStudyListingImage({
      featured_media_url: WP_JUMEX,
      _embedded: { 'wp:featuredmedia': [{ source_url: WP_JUMEX }] },
    }),
    WP_JUMEX,
  );
});

test('applyCaseStudyCoverOverride rewrites featured_media and imagenbanner for Jumex/Odwalla', () => {
  const jumex = applyCaseStudyCoverOverride({
    slug: JUMEX,
    featured_media_url: WP_JUMEX,
    acf: {
      imagenbanner: { url: WP_JUMEX, alt: 'Jumex' },
      primerap: 'keep',
    },
  });
  assert.equal(jumex.featured_media_url, '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  assert.deepEqual(jumex.acf.imagenbanner, {
    url: '/casos/Tapa-Caso-de-exito-JUMEX-US.png',
    alt: 'Jumex',
    width: 1200,
    height: 1200,
  });
  assert.equal(jumex.acf.primerap, 'keep');

  const soytechno = applyCaseStudyCoverOverride({
    slug: 'soytechno-ecommerce-venezuela',
    featured_media_url: '/images/casos/soytechno/images/lifestyle-f.jpg',
    acf: { imagenbanner: { url: '/images/casos/soytechno/images/lifestyle-f.jpg' } },
  });
  assert.equal(
    soytechno.featured_media_url,
    '/images/casos/soytechno/images/lifestyle-f.jpg',
  );
  assert.deepEqual(soytechno.acf.imagenbanner, {
    url: '/images/casos/soytechno/images/lifestyle-f.jpg',
  });
});

test('OG for Jumex and Odwalla uses the 1200×1200 tapa, SoyTechno keeps the JPEG crop', () => {
  assert.deepEqual(
    resolveCaseStudyOgImage(JUMEX, '/images/og/casos-de-exito-jumex-shopify-dtc-ecommerce.jpg', 'Jumex'),
    {
      url: '/casos/Tapa-Caso-de-exito-JUMEX-US.png',
      width: 1200,
      height: 1200,
      alt: 'Jumex',
    },
  );
  assert.deepEqual(
    resolveCaseStudyOgImage(
      ODWALLA,
      '/images/og/casos-de-exito-odwalla-shopify-dtc-ecommerce.jpg',
      'Odwalla',
    ),
    {
      url: '/casos/Tapa-Caso-de-exito-Odwalla.png',
      width: 1200,
      height: 1200,
      alt: 'Odwalla',
    },
  );
  assert.deepEqual(
    resolveCaseStudyOgImage(
      'soytechno-ecommerce-venezuela',
      '/images/og/casos-de-exito-soytechno-ecommerce-venezuela.jpg',
      'SoyTechno',
    ),
    {
      url: '/images/og/casos-de-exito-soytechno-ecommerce-venezuela.jpg',
      width: 1200,
      height: 630,
      alt: 'SoyTechno',
    },
  );
});

test('listing, carousel, case page and WP pipelines consume the cover override', async () => {
  const wordpress = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const carousel = await readFile(new URL('../components/CarouselResultados.tsx', import.meta.url), 'utf8');
  const listing = await readFile(new URL('../lib/case-study-listing-card.ts', import.meta.url), 'utf8');
  const shopify = await readFile(new URL('../app/(frontend)/agencia-shopify/shopify-cases.ts', import.meta.url), 'utf8');
  const casePage = await readFile(new URL('../app/(frontend)/casos-de-exito/[slug]/page.tsx', import.meta.url), 'utf8');

  assert.match(wordpress, /applyCaseStudyCoverOverride/);
  assert.match(wordpress, /getSuccessStoryBySlug[\s\S]*applyCaseStudyCoverOverride/);
  assert.match(wordpress, /loadAllCaseStudies[\s\S]*applyCaseStudyCoverOverride/);
  assert.match(carousel, /resolveCaseStudyListingImage/);
  assert.doesNotMatch(carousel, /selectCaseStudyCardMediaUrl/);
  assert.match(listing, /resolveCaseStudyListingImage/);
  assert.match(shopify, /resolveCaseStudyListingImage/);
  assert.match(casePage, /resolveCaseStudyOgImage/);
  assert.match(casePage, /imagenbanner/);
});
