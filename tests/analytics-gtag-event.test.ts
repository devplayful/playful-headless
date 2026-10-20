import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bootstrapGtagCollectIntercept,
  COLLECT_PAGE_PATH_TTL_MS,
  isUrlLikeGa4EventName,
  queueCollectPagePath,
  resetGtagCollectPagePathForTests,
  rewriteCollectUrlForPagePath,
  sendGtagEvent,
  URL_LIKE_GA4_EVENT_FALLBACK,
} from '../lib/analytics/gtag-event.ts';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';

const COLLECT_CHAT =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=chat_open&_ee=1';
const COLLECT_PAGE_VIEW =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=page_view';

test('rewrites URL-like GA4 event names to page_view with ep.page_url', () => {
  resetGtagCollectPagePathForTests();
  const bad =
    'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&en=https%3A%2F%2Fplayfulagency.com%2Fagencia-shopify';
  const rewritten = rewriteCollectUrlForPagePath(bad);
  const parsed = new URL(rewritten);
  assert.equal(parsed.searchParams.get('en'), URL_LIKE_GA4_EVENT_FALLBACK);
  assert.equal(
    parsed.searchParams.get('ep.page_url'),
    'https://playfulagency.com/agencia-shopify',
  );
  assert.equal(isUrlLikeGa4EventName('https://playful-headless-abc.vercel.app/agencia-seo'), true);
  assert.equal(isUrlLikeGa4EventName('cta_reunion_click'), false);
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

test('bootstrapGtagCollectIntercept rewrites URL-like collects without sendGtagEvent', async () => {
  resetGtagCollectPagePathForTests();
  const originalWindow = globalThis.window;
  const badCollect =
    'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&en=https%3A%2F%2Fplayfulagency.com%2Freunion-playful';
  const originalFetch = globalThis.fetch;
  let seenUrl = '';
  const fetchMock = (input: RequestInfo | URL) => {
    seenUrl = typeof input === 'string' ? input : input.toString();
    return Promise.resolve(new Response(null, { status: 204 }));
  };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: fetchMock,
  });
  try {
    bootstrapGtagCollectIntercept();
    await globalThis.fetch(badCollect);
    const parsed = new URL(seenUrl);
    assert.equal(parsed.searchParams.get('en'), URL_LIKE_GA4_EVENT_FALLBACK);
    assert.equal(
      parsed.searchParams.get('ep.page_url'),
      'https://playfulagency.com/reunion-playful',
    );
  } finally {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: originalFetch,
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
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
