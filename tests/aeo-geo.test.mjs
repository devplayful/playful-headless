import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import robots, { AI_CRAWLER_USER_AGENTS } from '../app/robots.ts';
import {
  LLMS_FULL_TXT_BODY,
  LLMS_TXT_BODY,
  SHOPIFY_FAQ_PUBLISHED,
  SHOPIFY_OPENING_PUBLISHED,
  ZELLE_NOTICE_PUBLISHED,
} from '../lib/llms-txt.ts';
import { FAQ_ITEMS, HERO } from '../app/agencia-shopify/copy.ts';
import { SITEMAP_STATIC_PATHS, getSitemapLocs } from '../utils/apex-sitemap.ts';
import {
  getBlogFaqJsonLd,
  getServiceFaqJsonLd,
  SERVICE_FAQ_PAGES,
} from '../utils/service-faq-jsonld.ts';
import {
  applyElementorAeoRewrites,
  stripDuplicateAccordionItems,
  stripSemPlaceholderCopy,
} from '../utils/elementor-aeo-rewrites.ts';
import { ORGANIZATION_SAME_AS } from '../utils/organization-schema.mjs';

test('llms.txt body matches LISTA-WEB and points at the long version', () => {
  assert.match(LLMS_TXT_BODY, /^# Playful Agency\n/);
  assert.match(LLMS_TXT_BODY, /Versión larga: https:\/\/playfulagency\.com\/llms-full\.txt\n$/);
  assert.doesNotMatch(LLMS_TXT_BODY, /Shopify Partner|Clutch|Sortlist|GoodFirms/i);
  assert.match(LLMS_TXT_BODY, /https:\/\/www\.linkedin\.com\/company\/playful-agency/);
});

test('llms-full.txt appends live Shopify opening, seven FAQ and the Zelle notice', () => {
  assert.ok(LLMS_FULL_TXT_BODY.startsWith(LLMS_TXT_BODY.trimEnd()));
  assert.equal(SHOPIFY_OPENING_PUBLISHED, HERO.body);
  assert.equal(SHOPIFY_FAQ_PUBLISHED.length, 7);
  assert.deepEqual(
    SHOPIFY_FAQ_PUBLISHED.map((item) => item.question),
    FAQ_ITEMS.map((item) => item.question),
  );
  assert.match(LLMS_FULL_TXT_BODY, new RegExp(ZELLE_NOTICE_PUBLISHED.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(LLMS_FULL_TXT_BODY, /Shopify Partner/);
  assert.match(
    LLMS_FULL_TXT_BODY,
    /https:\/\/playfulagency\.com\/casos-de-exito\/jumex-shopify-dtc-ecommerce(?:\s|En)/,
  );
  assert.doesNotMatch(
    LLMS_FULL_TXT_BODY,
    /https:\/\/playfulagency\.com\/casos-de-exito\/jumex-shopify-dtc-ecommerce\./,
  );
  assert.match(
    SHOPIFY_FAQ_PUBLISHED.map((item) => item.answer).join('\n'),
    /https:\/\/playfulagency\.com\/casos-de-exito\/jumex-shopify-dtc-ecommerce\./,
  );
});

test('llms routes return text/plain without noindex', () => {
  const headers = readFileSync(new URL('../lib/llms-txt.ts', import.meta.url), 'utf8');
  const shortRoute = readFileSync(new URL('../app/llms.txt/route.ts', import.meta.url), 'utf8');
  const fullRoute = readFileSync(new URL('../app/llms-full.txt/route.ts', import.meta.url), 'utf8');
  assert.match(headers, /'Content-Type': 'text\/plain; charset=utf-8'/);
  assert.match(shortRoute, /LLMS_PLAIN_HEADERS/);
  assert.match(fullRoute, /LLMS_PLAIN_HEADERS/);
  assert.doesNotMatch(shortRoute, /noindex|X-Robots-Tag/);
  assert.doesNotMatch(fullRoute, /noindex|X-Robots-Tag/);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/llms.txt'), false);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/llms-full.txt'), false);
  assert.equal(getSitemapLocs().includes('https://playfulagency.com/llms.txt'), false);
  assert.equal(getSitemapLocs().includes('https://playfulagency.com/llms-full.txt'), false);
});

test('robots.txt allows the six AI crawlers and adds no new Disallow', () => {
  const manifest = robots();
  assert.deepEqual(AI_CRAWLER_USER_AGENTS, [
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Google-Extended',
    'ClaudeBot',
    'Anthropic-ai',
  ]);
  assert.equal(manifest.rules[0].userAgent, '*');
  assert.deepEqual(manifest.rules[0].disallow, ['/wp-json/', '/?rest_route=']);
  assert.equal(manifest.rules.length, 7);
  for (const agent of AI_CRAWLER_USER_AGENTS) {
    assert.ok(manifest.rules.some((rule) => rule.userAgent === agent && rule.allow === '/'));
  }
  assert.equal(manifest.sitemap, 'https://playfulagency.com/sitemap.xml');
});

test('sameAs lists only the official profiles verified live on 21 oct 2026', () => {
  assert.deepEqual(ORGANIZATION_SAME_AS, [
    'https://www.facebook.com/somosplayful',
    'https://www.instagram.com/somosplayful',
    'https://www.youtube.com/channel/UCT_NSpYZCqu7oW0nANwfnEw',
    'https://www.linkedin.com/company/playful-agency/',
  ]);
});

test('FAQPage exists for the five service landings and Zelle, not a second Shopify FAQ', () => {
  assert.deepEqual(Object.keys(SERVICE_FAQ_PAGES).sort(), [
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-sem',
    'agencia-seo',
    'agencia-ux-ui',
  ]);
  assert.equal(getServiceFaqJsonLd('agencia-e-commerce').mainEntity.length, 5);
  assert.equal(getServiceFaqJsonLd('agencia-seo').mainEntity.length, 3);
  assert.equal(getServiceFaqJsonLd('agencia-shopify'), null);
  assert.equal(
    getBlogFaqJsonLd('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce').mainEntity.length,
    3,
  );
  assert.equal(getBlogFaqJsonLd('rediseno-web'), null);

  const shopifyPage = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
  const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
  const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
  assert.equal((shopifyPage.match(/id="playful-faq"/g) || []).length, 1);
  assert.match(slugPage, /id="playful-faq"/);
  assert.match(blogPage, /getBlogFaqJsonLd/);
  assert.match(blogPage, /id="playful-faq"/);
});

test('SEM placeholder and duplicate SEO accordion items are stripped', () => {
  const sem = '<p class="e-lottie__caption"> dfghfdgdgdgdgdg</p>';
  assert.equal(stripSemPlaceholderCopy(sem), '');

  const first = `<div class="elementor-accordion-item">
    <div id="elementor-tab-title-2251" class="elementor-tab-title"><a class="elementor-accordion-title">¿Cuánto tiempo tarda en ver resultados con una estrategia de SEO?</a></div>
    <div id="elementor-tab-content-2251">wrong</div>
  </div>`;
  const second = `<div class="elementor-accordion-item">
    <div id="elementor-tab-title-2252" class="elementor-tab-title"><a class="elementor-accordion-title">¿Cuánto tiempo tarda en ver resultados con una estrategia de SEO?</a></div>
    <div id="elementor-tab-content-2252">keep</div>
  </div>`;
  const third = `<div class="elementor-accordion-item">
    <div id="elementor-tab-title-2253" class="elementor-tab-title"><a class="elementor-accordion-title">¿Cómo sé qué palabras clave debo usar para mi negocio?</a></div>
    <div id="elementor-tab-content-2253">keys</div>
  </div>`;
  const rewritten = stripDuplicateAccordionItems(`${first}${second}${third}`);
  assert.equal((rewritten.match(/elementor-accordion-item/g) || []).length, 2);
  assert.match(rewritten, />keep</);
  assert.doesNotMatch(rewritten, />wrong</);
  assert.doesNotMatch(applyElementorAeoRewrites(`${sem}${first}${second}`), /dfghfdgdgdgdgdg/);
});
