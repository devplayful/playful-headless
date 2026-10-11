import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COLLECT_PAGE_PATH_TTL_MS,
  queueCollectPagePath,
  resetGtagCollectPagePathForTests,
  rewriteCollectUrlForPagePath,
  sendGtagEvent,
} from '../lib/analytics/gtag-event.ts';

const COLLECT_CHAT =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=chat_open&_ee=1';
const COLLECT_PAGE_VIEW =
  'https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&dp=%2F&en=page_view';

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
