import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  AVISOS_ESHOW_GHL_FORM_IFRAME_SRC,
  AVISOS_ESHOW_GHL_FORM_EMBED_SCRIPT,
  AVISOS_ESHOW_PATH,
  AVISOS_ESHOW_PLACEHOLDER_TITLE,
} = await import('../lib/avisos-eshow.ts');

const { buildGhlFormIframeSrc, utmQueryFromSearch } = await import('../utils/ghl-form-embed.ts');

test('avisos-eshow page is noindex and has no meeting CTA', () => {
  const page = readFileSync(new URL('../app/avisos-eshow/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /reunion-playful/);
  assert.doesNotMatch(page, /widget\/bookings/);
  assert.match(page, /AVISOS_ESHOW_PLACEHOLDER_TITLE/);
  assert.match(page, /AVISOS_ESHOW_PLACEHOLDER_INTRO/);
  assert.equal(AVISOS_ESHOW_PLACEHOLDER_TITLE, '[COPY PENDIENTE]');
});

test('GHL form embed uses standard iframe and form_embed.js', () => {
  const component = readFileSync(new URL('../components/AvisosEshowGhlForm.tsx', import.meta.url), 'utf8');
  assert.match(component, /AVISOS_ESHOW_GHL_FORM_IFRAME_SRC/);
  assert.match(component, /AVISOS_ESHOW_GHL_FORM_EMBED_SCRIPT/);
  assert.match(component, /strategy="lazyOnload"/);
  assert.doesNotMatch(component, /setTimeout|setInterval/);
  assert.equal(AVISOS_ESHOW_GHL_FORM_IFRAME_SRC.includes('dFgOGgLMEaiJUHW8UrBF'), true);
  assert.equal(AVISOS_ESHOW_GHL_FORM_EMBED_SCRIPT, 'https://api.leadconnectorhq.com/js/form_embed.js');
});

test('UTM params from the page URL are merged into the iframe src', () => {
  const search = '?utm_source=test&utm_medium=email&utm_campaign=test&utm_content=hero&utm_term=kw';
  const src = buildGhlFormIframeSrc(AVISOS_ESHOW_GHL_FORM_IFRAME_SRC, search);
  const url = new URL(src);
  assert.equal(url.searchParams.get('utm_source'), 'test');
  assert.equal(url.searchParams.get('utm_medium'), 'email');
  assert.equal(url.searchParams.get('utm_campaign'), 'test');
  assert.equal(url.searchParams.get('utm_content'), 'hero');
  assert.equal(url.searchParams.get('utm_term'), 'kw');
  assert.equal(utmQueryFromSearch('?utm_source=a').utm_source, 'a');
});

test('expected routes manifest includes avisos-eshow', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
  );
  assert.equal(manifest.sourceRoutes.includes(AVISOS_ESHOW_PATH), true);
});
