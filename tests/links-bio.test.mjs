import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { CONTACT_HREF } from '../utils/booking.ts';
import {
  SITEMAP_STATIC_PATHS,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} from '../utils/apex-sitemap.ts';
import {
  LINKS_BIO_ENTRIES,
  LINKS_BIO_UTM,
  buildLinksBioHref,
} from '../lib/links-bio.ts';

const APEX = 'https://playfulagency.com';
const page = readFileSync(new URL('../app/links/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/links/layout.tsx', import.meta.url), 'utf8');
const chat = readFileSync(new URL('../components/ChatWidget.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const entriesSource = readFileSync(new URL('../lib/links-bio.ts', import.meta.url), 'utf8');
const CLIENT_NAME = /jumex|odwalla|soytechno|mercantil|venemergencia|aitheras|fundahigado/i;

test('bio buttons stay in one array, Cashea can be prepended later', () => {
  assert.deepEqual(
    LINKS_BIO_ENTRIES.map((entry) => [entry.label, entry.path]),
    [
      ['Cómo integrar Zelle en tu tienda', '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'],
      ['Casos de éxito', '/casos-de-exito'],
      ['Agencia e-commerce', '/agencia-e-commerce'],
      ['Agencia Shopify', '/agencia-shopify'],
      ['Contacto', CONTACT_HREF],
    ],
  );
  assert.equal(CONTACT_HREF, '/contactar-agencia-de-marketing-digital');
  assert.match(entriesSource, /Cashea: add first/);
  assert.doesNotMatch(page, /reunion-playful/);
  assert.doesNotMatch(entriesSource, /reunion-playful/);
});

test('each bio href carries the Instagram campaign query', () => {
  assert.equal(LINKS_BIO_UTM, '?utm_source=instagram&utm_medium=social&utm_campaign=bio');
  for (const entry of LINKS_BIO_ENTRIES) {
    assert.equal(buildLinksBioHref(entry.path), `${entry.path}${LINKS_BIO_UTM}`);
  }
});

test('/links is noindex and stays out of the sitemap', () => {
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/links'), false);
  assert.equal(getSitemapPaths().includes('/links'), false);
  assert.equal(getSitemapLocs().includes(`${APEX}/links`), false);
  assert.doesNotMatch(buildSitemapXml(), /playfulagency\.com\/links</);
});

test('/links copy and chrome have no client names', () => {
  assert.doesNotMatch(page, CLIENT_NAME);
  assert.doesNotMatch(layout, CLIENT_NAME);
  assert.doesNotMatch(entriesSource, CLIENT_NAME);
  for (const entry of LINKS_BIO_ENTRIES) {
    assert.doesNotMatch(entry.label, CLIENT_NAME);
    assert.doesNotMatch(entry.path, CLIENT_NAME);
  }
});

test('header, footer and chat stay off /links after hooks', () => {
  for (const [name, source] of [['header', header], ['footer', footer]]) {
    const themeAt = source.lastIndexOf('useTheme()');
    const skipAt = source.indexOf("pathname === '/links'");
    assert(themeAt > 0 && skipAt > themeAt, `${name} must skip /links after hooks`);
  }
  const skipAt = chat.indexOf("pathname === '/links'");
  const loadAt = chat.indexOf('attachChatWidgetDeferredLoad(load)');
  assert.match(chat, /window\.location\.pathname\.replace/);
  assert(skipAt > 0 && loadAt > skipAt);
});
