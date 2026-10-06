import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ECOMMERCE_ZELLE_COVER_SLUG,
  ZELLE_POST_SLUG,
  ZELLE_APPROVED_COVER,
  rewriteEcommerceZelleCover,
} = await import('../utils/ecommerce-zelle-cover.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(new URL('../components/ElementorPageContent.tsx', import.meta.url), 'utf8');

const OLD_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2025/02/Playful-E-Commerce-Sistema-de-gestion-compatible-con-tu-E-commerce.png';
const OTHER_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/10/25553-370x300.jpg';

function zelleCard(src = OLD_SRC) {
  return (
    '<div class="master-news item-carousel">' +
    `<div class="image-wrap"><a class="thumb" href="/${ZELLE_POST_SLUG}" aria-label="Zelle">` +
    `<span class="inner"><img loading="lazy" width="301" height="300" src="${src}" ` +
    `class="wp-post-image" alt="Zelle en Venezuela" srcset="${src} 301w, ${src.replace('.png', '-150x150.png')} 150w" ` +
    'sizes="(max-width: 301px) 100vw, 301px" /></span></a></div>' +
    `<div class="content-wrap"><h3 class="headline-2"><a href="/${ZELLE_POST_SLUG}">Zelle en Venezuela</a></h3></div>` +
    '</div>'
  );
}

function otherCard() {
  return (
    '<div class="master-news item-carousel">' +
    '<div class="image-wrap"><a class="thumb" href="/actualizar-tu-e-commerce">' +
    `<span class="inner"><img src="${OTHER_SRC}" alt="Actualizar" /></span></a></div>` +
    '<div class="content-wrap"><h3 class="headline-2"><a href="/actualizar-tu-e-commerce">Actualizar</a></h3></div>' +
    '</div>'
  );
}

test('constants target the approved JN0rWQjOq4 cover on the e-commerce landing', () => {
  assert.equal(ECOMMERCE_ZELLE_COVER_SLUG, 'agencia-e-commerce');
  assert.equal(ZELLE_POST_SLUG, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
  assert.equal(
    ZELLE_APPROVED_COVER,
    '/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
  );
});

test('replaces the Zelle card img src and srcset on /agencia-e-commerce', () => {
  const html = `<section>${zelleCard()}${otherCard()}</section>`;
  const rewritten = rewriteEcommerceZelleCover(html, 'agencia-e-commerce');
  assert.match(rewritten, new RegExp(`src="${ZELLE_APPROVED_COVER}"`));
  assert.match(rewritten, new RegExp(`srcset="${ZELLE_APPROVED_COVER} 1200w"`));
  assert.doesNotMatch(rewritten, /Playful-E-Commerce-Sistema-de-gestion/);
  assert.match(rewritten, new RegExp(OTHER_SRC.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('does not change other cards on the same landing', () => {
  const html = otherCard();
  assert.equal(rewriteEcommerceZelleCover(html, 'agencia-e-commerce'), html);
});

test('is a no-op on other service slugs', () => {
  const html = zelleCard();
  assert.equal(rewriteEcommerceZelleCover(html, 'agencia-seo'), html);
  assert.equal(rewriteEcommerceZelleCover(html, 'agencia-sem'), html);
  assert.equal(rewriteEcommerceZelleCover(html, 'agencia-diseno-web'), html);
});

test('is idempotent when the card already uses JN0rWQjOq4', () => {
  const html = zelleCard(ZELLE_APPROVED_COVER);
  const once = rewriteEcommerceZelleCover(html, 'agencia-e-commerce');
  const twice = rewriteEcommerceZelleCover(once, 'agencia-e-commerce');
  assert.equal(once, twice);
  assert.equal((once.match(/JN0rWQjOq4/g) || []).length, 2);
});

test('getPageBySlug and Elementor compose the Zelle cover rewriter', () => {
  assert.match(wordpress, /rewriteEcommerceZelleCover\(/);
  assert.match(wordpress, /rewriteEcommerceShopifyLink\(/);
  assert.match(elementor, /rewriteEcommerceZelleCover\(/);
  assert.match(
    elementor,
    /rewriteEcommerceZelleCover\(\s*rewriteEcommerceShopifyLink\(restoreOldBodyCopy\(html\), slug\),\s*slug,?\s*\)/,
  );
});
