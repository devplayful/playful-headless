import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  reunionPlayfulWidgetDestination,
  scheduleReunionPlayfulRedirect,
} = await import('../lib/analytics/reunion-playful-redirect.ts');

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('/reunion-playful 308s to /reunion in middleware (query preserved)', () => {
  assert.match(middleware, /path === '\/reunion-playful'/);
  assert.match(middleware, /NextResponse\.redirect\(target, 308\)/);
  assert.doesNotMatch(middleware, /resolveBookingWidgetRedirect/);
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

test('scheduleReunionPlayfulRedirect still waits for GA when used client-side', () => {
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
