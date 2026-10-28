import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  reunionPlayfulWidgetDestination,
  scheduleReunionPlayfulRedirect,
} = await import('../lib/analytics/reunion-playful-redirect.ts');
const { BOOKING_WIDGET_HREF } = await import('../utils/booking-attribution.ts');

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const reunionPage = readFileSync(new URL('../app/(frontend)/reunion-playful/page.tsx', import.meta.url), 'utf8');

test('/reunion-playful is a Next page, not a middleware 302 to GHL', () => {
  assert.match(reunionPage, /ReunionPlayfulRedirect/);
  assert.doesNotMatch(middleware, /resolveBookingWidgetRedirect/);
  assert.doesNotMatch(middleware, /path === '\/reunion-playful'/);
});

test('reunionPlayfulWidgetDestination merges search onto the widget URL', () => {
  const dest = reunionPlayfulWidgetDestination({
    search: '?utm_source=google&gclid=ABC',
    lastCookie: '',
    firstCookie: '',
  });
  const url = new URL(dest);
  assert.equal(url.origin, 'https://api.playfulagency.com');
  assert.equal(url.pathname, '/widget/bookings/reunion-playful');
  assert.equal(url.searchParams.get('utm_source'), 'google');
  assert.equal(url.searchParams.get('gclid'), 'ABC');
  assert.equal(dest.startsWith(BOOKING_WIDGET_HREF), true);
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
