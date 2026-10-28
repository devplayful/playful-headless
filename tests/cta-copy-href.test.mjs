import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shopifyPage = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const shopifyCss = readFileSync(
  new URL('../app/agencia-shopify/page.module.css', import.meta.url),
  'utf8',
);
const shopifyCopy = await import('../app/agencia-shopify/copy.ts');
const casos = readFileSync(
  new URL('../app/casos-de-exito/CaseStudiesContent.tsx', import.meta.url),
  'utf8',
);
const twoCol = readFileSync(
  new URL('../components/ui/TwoColumnCtaSection.tsx', import.meta.url),
  'utf8',
);
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

const HUB_CTA_TEXT = 'Llena el formulario y hablemos sobre tu web';

test('Shopify mid and sticky CTAs reuse TalkCta (same text + href as the hero)', () => {
  assert.equal(shopifyCopy.HERO.cta, 'Agendar Reunión con Playful');
  assert.equal(shopifyCopy.SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.match(shopifyPage, /function TalkCta\(\{ href = SERVICE_BOOKING_HREF \}/);
  assert.match(shopifyPage, /\{HERO\.cta\}/);
  assert.match(shopifyPage, /function MidCta/);
  assert.equal((shopifyPage.match(/<MidCta section="mid[12]" \/>/g) || []).length, 2);
  assert.match(shopifyPage, /data-cta-section="sticky"/);
  assert.match(shopifyPage, /data-cta-section=\{section\}/);
  assert.equal((shopifyPage.match(/<TalkCta \/>/g) || []).length, 3);
  assert.doesNotMatch(shopifyPage, /Agendar Reunión con Playful['"`]/);
});

test('Shopify sticky and hero recorte are mobile-only in the route CSS module', () => {
  assert.match(shopifyCss, /@media \(max-width: 767px\)/);
  assert.match(shopifyCss, /\.stickyBar[\s\S]*position:\s*fixed/);
  assert.match(shopifyCss, /env\(safe-area-inset-bottom/);
  assert.match(shopifyCss, /right:\s*92px/);
  assert.match(shopifyCss, /\.heroArt[\s\S]*display:\s*none/);
  assert.match(shopifyCss, /\.heroCta[\s\S]*order:\s*2/);
  assert.match(shopifyPage, /from '\.\/page\.module\.css'/);
});

test('casos hub top CTA reuses the existing TwoColumnCtaSection text and href', () => {
  assert.match(twoCol, new RegExp(`buttonText = "${HUB_CTA_TEXT}"`));
  assert.match(twoCol, /buttonLink = "\/contactar-agencia-de-marketing-digital"/);
  assert.match(casos, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(casos, /HUB_EXISTING_CTA_TEXT/);
  assert.match(casos, new RegExp(`"${HUB_CTA_TEXT}"`));
  assert.match(casos, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.match(casos, /data-cta-section="top"/);
  assert.match(casos, /\{HUB_EXISTING_CTA_TEXT\}/);
});

test('this change does not edit header, footer, root layout or global CSS', () => {
  assert.doesNotMatch(header, /data-cta-section="sticky"/);
  assert.doesNotMatch(header, /data-cta-section="top"/);
  assert.doesNotMatch(footer, /data-cta-section="mid1"/);
  assert.doesNotMatch(layout, /agencia-shopify\/page\.module/);
  assert.doesNotMatch(globals, /pageWithSticky/);
  assert.doesNotMatch(globals, /data-cta-section="sticky"/);
});
