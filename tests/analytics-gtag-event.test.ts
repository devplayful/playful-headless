import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COLLECT_PAGE_PATH_TTL_MS,
  encodeGtagEventParams,
  GTAG_EVENT_SEND_TO,
  queueCollectPagePath,
  resetGtagCollectPagePathForTests,
  rewriteCollectUrlForPagePath,
  sendGtagEvent,
} from '../lib/analytics/gtag-event.ts';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';

const COLLECT_CHAT =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=chat_open&_ee=1';
const COLLECT_PAGE_VIEW =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=page_view';

test('no longer rewrites URL-like event names (patch removed, CEO GO 20 oct 20:46)', () => {
  resetGtagCollectPagePathForTests();
  const bad =
    'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&en=https%3A%2F%2Fplayfulagency.com%2Fagencia-shopify';
  const parsed = new URL(rewriteCollectUrlForPagePath(bad));
  assert.equal(parsed.searchParams.get('en'), 'https://playfulagency.com/agencia-shopify');
  assert.equal(parsed.searchParams.has('ep.page_url'), false);
});

test('rewrites the matching collect hit with ep.page_path', () => {
  resetGtagCollectPagePathForTests();
  queueCollectPagePath('chat_open', '/');
  const rewritten = rewriteCollectUrlForPagePath(COLLECT_CHAT);
  const parsed = new URL(rewritten);
  assert.equal(parsed.searchParams.get('en'), 'chat_open');
  assert.equal(parsed.searchParams.get('ep.page_path'), '/');
  assert.equal(parsed.searchParams.get('dp'), '/');
});

test('leaves page_view and non-collect URLs untouched', () => {
  resetGtagCollectPagePathForTests();
  queueCollectPagePath('chat_open', '/');
  assert.equal(rewriteCollectUrlForPagePath(COLLECT_PAGE_VIEW), COLLECT_PAGE_VIEW);
  assert.equal(
    rewriteCollectUrlForPagePath('https://playfulagency.com/'),
    'https://playfulagency.com/',
  );
});

test('does not overwrite an existing ep.page_path and ignores expired queues', () => {
  resetGtagCollectPagePathForTests();
  const already =
    'https://analytics.google.com/g/collect?v=2&en=chat_open&ep.page_path=%2Fagencia-seo';
  queueCollectPagePath('chat_open', '/');
  assert.equal(rewriteCollectUrlForPagePath(already), already);

  resetGtagCollectPagePathForTests();
  const now = 1_000_000;
  queueCollectPagePath('chat_lead', '/agencia-ux-ui', now);
  assert.equal(
    rewriteCollectUrlForPagePath(
      'https://analytics.google.com/g/collect?en=chat_lead',
      now + COLLECT_PAGE_PATH_TTL_MS + 1,
    ),
    'https://analytics.google.com/g/collect?en=chat_lead',
  );
});

test('sendGtagEvent no-ops when qa=1 or PlayfulQA/1.0 is present', () => {
  resetGtagCollectPagePathForTests();
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  const calls: unknown[] = [];
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { search: '?qa=1', pathname: '/agencia-e-commerce' },
      gtag: (...args: unknown[]) => { calls.push(args); },
    },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent: 'Chrome' },
  });
  try {
    sendGtagEvent('cta_reunion_click', { page_path: '/agencia-e-commerce' });
    assert.equal(calls.length, 0);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    resetGtagCollectPagePathForTests();
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { search: '', pathname: '/' },
      gtag: (...args: unknown[]) => { calls.push(args); },
    },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent: PLAYFUL_QA_UA },
  });
  try {
    sendGtagEvent('cta_reunion_click', { page_path: '/' });
    assert.equal(calls.length, 0);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    resetGtagCollectPagePathForTests();
  }
});

test('sendGtagEvent queues the collect rewrite before calling gtag', () => {
  resetGtagCollectPagePathForTests();
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      gtag: () => {},
    },
  });
  try {
    sendGtagEvent('cta_reunion', { page_path: '/agencia-shopify' });
    const rewritten = rewriteCollectUrlForPagePath(
      'https://analytics.google.com/g/collect?en=cta_reunion&dp=%2Fagencia-shopify',
    );
    assert.equal(new URL(rewritten).searchParams.get('ep.page_path'), '/agencia-shopify');
  } finally {
    resetGtagCollectPagePathForTests();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

test('encodeGtagEventParams routes every event to GA4 + Ads via send_to', () => {
  assert.deepEqual([...GTAG_EVENT_SEND_TO], ['G-WH76RQWSCT', 'AW-427600160']);
  const payload = encodeGtagEventParams({ link_url: '/reunion-playful' });
  assert.deepEqual(payload.send_to, ['G-WH76RQWSCT', 'AW-427600160']);
  assert.equal(payload.link_url, '/reunion-playful');
  const explicit = encodeGtagEventParams({ send_to: 'G-WH76RQWSCT' });
  assert.equal(explicit.send_to, 'G-WH76RQWSCT');
});
