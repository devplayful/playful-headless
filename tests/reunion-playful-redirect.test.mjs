import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  reunionPlayfulWidgetDestination,
  scheduleReunionPlayfulRedirect,
} = await import('../lib/analytics/reunion-playful-redirect.ts');

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const reunionPage = readFileSync(new URL('../app/reunion-playful/page.tsx', import.meta.url), 'utf8');

test('/reunion-playful is a Next page, not a middleware 302 to GHL', () => {
  assert.match(reunionPage, /ReunionPlayfulRedirect/);
  assert.doesNotMatch(middleware, /resolveBookingWidgetRedirect/);
  assert.doesNotMatch(middleware, /path === '\/reunion-playful'/);
});

test('reunionPlayfulWidgetDestination merges attribution onto /reunion', () => {
  const dest = reunionPlayfulWidgetDestination({
    search: '?utm_source=google&gclid=ABC',
    lastCookie: '',
    firstCookie: '',
  });
  assert.equal(dest.startsWith('/reunion'), true);
  const url = new URL(dest, 'https://playfulagency.com');
  assert.equal(url.pathname, '/reunion');
  assert.equal(url.searchParams.get('utm_source'), 'google');
  assert.equal(url.searchParams.get('gclid'), 'ABC');
});

test('scheduleReunionPlayfulRedirect redirects after GA readiness', () => {
  let redirected = false;
  const timers = [];
  scheduleReunionPlayfulRedirect({
    go: () => { redirected = true; },
    isReady: () => true,
    setTimeoutFn: (handler) => {
      timers.push(handler);
      return timers.length;
    },
    clearTimeoutFn: () => {},
    postReadyDelayMs: 0,
  });
  assert.equal(redirected, false);
  assert.equal(timers.length, 1);
  timers[0]();
  assert.equal(redirected, true);
});
