import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  AVISOS_ESHOW_BENEFITS,
  AVISOS_ESHOW_EMAIL_UTM,
  AVISOS_ESHOW_FORM,
  AVISOS_ESHOW_GHL_FORM_ID,
  AVISOS_ESHOW_HERO,
  AVISOS_ESHOW_META,
  AVISOS_ESHOW_PATH,
} from '../content/avisos-eshow.ts';
import { HIGHLEVEL_FORM_EMBED_SCRIPT, highLevelFormWidgetSrc } from '../lib/highlevel/external-tracking.ts';
import {
  applyBookingIframeAttrToSrc,
  isHighLevelFormIframeSrc,
} from '../utils/booking-widget-bridge.ts';
import {
  SITEMAP_STATIC_PATHS,
  SITEMAP_UNPUBLISHED_PATHS,
  buildSitemapXml,
  getSitemapLocs,
  getSitemapPaths,
} from '../utils/apex-sitemap.ts';

const page = readFileSync(new URL('../app/avisos-eshow/page.tsx', import.meta.url), 'utf8');
const embed = readFileSync(new URL('../components/HighLevelFormEmbed.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../content/avisos-eshow.ts', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
const headerClient = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const sitemap = buildSitemapXml();

test('copy lives in one content file and every user-facing string is a PLACEHOLDER', () => {
  assert.match(copy, /PLACEHOLDER/);
  for (const value of [
    AVISOS_ESHOW_META.title,
    AVISOS_ESHOW_META.description,
    AVISOS_ESHOW_HERO.h1,
    AVISOS_ESHOW_HERO.intro,
    AVISOS_ESHOW_BENEFITS.h2,
    ...AVISOS_ESHOW_BENEFITS.items.flatMap((item) => [item.title, item.body]),
    AVISOS_ESHOW_FORM.h2,
    AVISOS_ESHOW_FORM.embedTitle,
  ]) {
    assert.match(value, /^\[PLACEHOLDER\]/);
  }
  assert.equal(AVISOS_ESHOW_PATH, '/avisos-eshow');
  assert.equal(AVISOS_ESHOW_GHL_FORM_ID, 'dFgOGgLMEaiJUHW8UrBF');
  assert.deepEqual({ ...AVISOS_ESHOW_EMAIL_UTM }, {
    utm_source: 'ghl',
    utm_medium: 'email',
    utm_campaign: 'eshow-madrid-2026',
    utm_content: 'base-avisos',
  });
});

test('page reads copy from content/avisos-eshow and keeps one H1, benefits and GHL embed', () => {
  assert.match(page, /from '@\/content\/avisos-eshow'/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.match(page, /\{AVISOS_ESHOW_HERO\.h1\}/);
  assert.match(page, /\{AVISOS_ESHOW_HERO\.intro\}/);
  assert.match(page, /\{AVISOS_ESHOW_BENEFITS\.h2\}/);
  assert.match(page, /AVISOS_ESHOW_BENEFITS\.items\.map/);
  assert.match(page, /HighLevelFormEmbed/);
  assert.match(page, /formId=\{AVISOS_ESHOW_GHL_FORM_ID\}/);
  assert.doesNotMatch(page, /robots:\s*\{[^}]*index:\s*false/);
  assert.doesNotMatch(page, /<Link\b|href=["']\//);
  assert.match(page, /pageSocialMetadata\(/);
  assert.match(page, /type: 'website'/);
});

test('GHL embed follows the official iframe + form_embed.js pattern', () => {
  assert.match(embed, /HIGHLEVEL_FORM_EMBED_SCRIPT/);
  assert.match(embed, /highLevelFormWidgetSrc/);
  assert.match(embed, /data-form-id=\{formId\}/);
  assert.match(embed, /applyBookingIframeAttrToSrc/);
  assert.equal(
    highLevelFormWidgetSrc(AVISOS_ESHOW_GHL_FORM_ID),
    'https://api.leadconnectorhq.com/widget/form/dFgOGgLMEaiJUHW8UrBF',
  );
  assert.equal(HIGHLEVEL_FORM_EMBED_SCRIPT, 'https://link.msgsndr.com/js/form_embed.js');
});

test('form iframe gets the same UTM stamp as GHL booking widgets', () => {
  const src = highLevelFormWidgetSrc(AVISOS_ESHOW_GHL_FORM_ID);
  assert.equal(isHighLevelFormIframeSrc(src), true);
  const stamped = applyBookingIframeAttrToSrc(src, { ...AVISOS_ESHOW_EMAIL_UTM });
  const url = new URL(stamped);
  assert.equal(url.searchParams.get('utm_source'), 'ghl');
  assert.equal(url.searchParams.get('utm_medium'), 'email');
  assert.equal(url.searchParams.get('utm_campaign'), 'eshow-madrid-2026');
  assert.equal(url.searchParams.get('utm_content'), 'base-avisos');
});

test('indexable but unpublished: 200 route stays out of sitemap and nav', () => {
  assert.equal(SITEMAP_STATIC_PATHS.includes(AVISOS_ESHOW_PATH), false);
  assert.equal(SITEMAP_UNPUBLISHED_PATHS.includes(AVISOS_ESHOW_PATH), false);
  assert.equal(getSitemapPaths().includes(AVISOS_ESHOW_PATH), false);
  assert.equal(getSitemapLocs().includes(`https://playfulagency.com${AVISOS_ESHOW_PATH}`), false);
  assert.doesNotMatch(sitemap, /avisos-eshow/);
  assert.equal(expectedRoutes.sourceRoutes.includes(AVISOS_ESHOW_PATH), true);
  assert.equal(expectedRoutes.criticalRoutes.includes(AVISOS_ESHOW_PATH), true);
  assert.doesNotMatch(header, /avisos-eshow/);
  assert.doesNotMatch(headerClient, /avisos-eshow/);
  assert.doesNotMatch(footer, /avisos-eshow/);
  assert.doesNotMatch(layout, /avisos-eshow/);
});
