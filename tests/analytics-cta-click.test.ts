import assert from 'node:assert/strict';
import test from 'node:test';
import { GTAG_EP_PAGE_PATH_KEY } from '../lib/analytics/gtag-event.ts';
import {
  CTA_CONTACT_EVENT,
  CTA_EVENT_TIMEOUT_MS,
  CTA_REUNION_EVENT,
  CTA_TEXT_MAX,
  buildCtaClickParams,
  classifyCtaHref,
  collectCtaClick,
  isModifiedOrNewTabClick,
  resolveCtaSection,
  sendCtaEvent,
  shouldHoldCtaNavigation,
} from '../lib/analytics/cta-click.ts';

test('classifies reunion-playful and GHL widget/calendar hrefs', () => {
  assert.equal(classifyCtaHref('/reunion-playful'), CTA_REUNION_EVENT);
  assert.equal(classifyCtaHref('/reunion-playful?gclid=abc'), CTA_REUNION_EVENT);
  assert.equal(classifyCtaHref('https://playfulagency.com/reunion-playful'), CTA_REUNION_EVENT);
  assert.equal(
    classifyCtaHref('https://api.playfulagency.com/widget/bookings/reunion-playful'),
    CTA_REUNION_EVENT,
  );
  assert.equal(
    classifyCtaHref('https://api.leadconnectorhq.com/widget/booking/abc123'),
    CTA_REUNION_EVENT,
  );
  assert.equal(
    classifyCtaHref('https://msgsndr.com/widget/bookings/reunion-playful'),
    CTA_REUNION_EVENT,
  );
  assert.equal(
    classifyCtaHref('https://calendar.gohighlevel.com/calendar/abc'),
    CTA_REUNION_EVENT,
  );
});

test('classifies contact form, mailto, tel and WhatsApp with a number', () => {
  assert.equal(classifyCtaHref('/contactar-agencia-de-marketing-digital'), CTA_CONTACT_EVENT);
  assert.equal(classifyCtaHref('/contacto'), CTA_CONTACT_EVENT);
  assert.equal(classifyCtaHref('/contactanos/'), CTA_CONTACT_EVENT);
  assert.equal(
    classifyCtaHref('https://playfulagency.com/contactar-agencia-de-marketing-digital?utm_source=li'),
    CTA_CONTACT_EVENT,
  );
  assert.equal(classifyCtaHref('mailto:hola@playfulagency.com'), CTA_CONTACT_EVENT);
  assert.equal(classifyCtaHref('tel:+584121234567'), CTA_CONTACT_EVENT);
  assert.equal(classifyCtaHref('https://wa.me/584121234567'), CTA_CONTACT_EVENT);
  assert.equal(
    classifyCtaHref('https://api.whatsapp.com/send?phone=584121234567&text=Hola'),
    CTA_CONTACT_EVENT,
  );
});

test('ignores share-only mailto/WhatsApp, nav links and hashes', () => {
  assert.equal(classifyCtaHref('mailto:?subject=Te%20comparto'), null);
  assert.equal(classifyCtaHref('https://wa.me/?text=https://playfulagency.com/blog'), null);
  assert.equal(classifyCtaHref('/agencia-shopify'), null);
  assert.equal(classifyCtaHref('/blog'), null);
  assert.equal(classifyCtaHref('#condiciones'), null);
  assert.equal(classifyCtaHref('https://www.linkedin.com/company/playful-agency/'), null);
});

test('builds params from section hints and clips visible text', () => {
  const long = `${'Agenda una reunión con Playful '.repeat(8)}fin`;
  const collected = collectCtaClick({
    href: '/reunion-playful',
    pagePath: '/agencia-shopify',
    textContent: `  ${long}  `,
    ariaLabel: 'ignored when text exists',
    dataCtaSection: 'hero',
    closestId: 'should-not-win',
    recognizableSection: 'cta',
  });

  assert.deepEqual(collected, {
    event: CTA_REUNION_EVENT,
    params: {
      page_path: '/agencia-shopify',
      cta_section: 'hero',
      cta_text: long.replace(/\s+/g, ' ').trim().slice(0, CTA_TEXT_MAX),
      link_url: '/reunion-playful',
    },
  });
  assert.equal(collected?.params.cta_text.length, CTA_TEXT_MAX);
});

test('section falls back to id, then recognizable name, then unknown', () => {
  assert.equal(resolveCtaSection({ dataCtaSection: ' footer ', closestId: 'x' }), 'footer');
  assert.equal(resolveCtaSection({ closestId: 'condiciones' }), 'condiciones');
  assert.equal(resolveCtaSection({ recognizableSection: 'header' }), 'header');
  assert.equal(resolveCtaSection({}), 'unknown');
  assert.equal(
    buildCtaClickParams({
      href: '/contacto',
      pagePath: '/',
      ariaLabel: 'Contáctanos',
    }).cta_text,
    'Contáctanos',
  );
});

test('does not hold cmd/ctrl-click or new-tab targets; holds only without beacon', () => {
  assert.equal(isModifiedOrNewTabClick({ metaKey: true }), true);
  assert.equal(isModifiedOrNewTabClick({ ctrlKey: true }), true);
  assert.equal(isModifiedOrNewTabClick({ target: '_blank' }), true);
  assert.equal(isModifiedOrNewTabClick({ button: 0 }), false);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: true, canBeacon: false }), false);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: false, canBeacon: true }), false);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: false, canBeacon: false }), true);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: false, canBeacon: true, event: 'cta_reunion_click' }), true);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: true, canBeacon: true, event: 'cta_reunion_click' }), false);
  assert.equal(shouldHoldCtaNavigation({ modifiedOrNewTab: false, canBeacon: true, event: 'cta_contact_click' }), false);
});

test('sendCtaEvent uses gtag with beacon transport', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      dataLayer: [],
    },
  });
  try {
    sendCtaEvent(CTA_REUNION_EVENT, {
      page_path: '/agencia-shopify',
      cta_section: 'hero',
      cta_text: 'Agendar Reunión con Playful',
      link_url: '/reunion-playful',
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'event');
    assert.equal(calls[0][1], CTA_REUNION_EVENT);
    const payload = calls[0][2] as Record<string, unknown>;
    assert.equal(payload.transport_type, 'beacon');
    assert.equal(payload.page_path, '/agencia-shopify');
    assert.equal(payload[GTAG_EP_PAGE_PATH_KEY], '/agencia-shopify');
    assert.equal(payload.cta_section, 'hero');
    assert.equal(payload.link_url, '/reunion-playful');
    assert.equal(payload.event_timeout, CTA_EVENT_TIMEOUT_MS);
    assert.equal(typeof payload.event_callback, 'function');
    assert.deepEqual(window.dataLayer, []);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

function fakeWindow(withGtag: boolean) {
  const calls: unknown[][] = [];
  const assigned: string[] = [];
  const timers: Array<() => void> = [];
  const anchor = {
    href: 'https://playfulagency.com/reunion-playful',
    textContent: 'Reservar',
    getAttribute: (n: string) => (n === 'href' ? '/reunion-playful' : null),
    hasAttribute: () => false,
    closest: (sel: string) => (sel === 'a' ? anchor : null),
  };
  const g = globalThis as Record<string, unknown>;
  const set = (k: string, v: unknown) =>
    Object.defineProperty(g, k, { value: v, configurable: true, writable: true });
  const saved: Record<string, PropertyDescriptor | undefined> = {
    window: Object.getOwnPropertyDescriptor(g, 'window'),
    Element: Object.getOwnPropertyDescriptor(g, 'Element'),
    document: Object.getOwnPropertyDescriptor(g, 'document'),
  };
  class FakeElement {}
  Object.setPrototypeOf(anchor, FakeElement.prototype);
  set('Element', FakeElement);
  set('document', { cookie: '' });
  set('window', {
    location: { pathname: '/', search: '', hostname: 'playfulagency.com', assign: (u: string) => assigned.push(u) },
    setTimeout: (fn: () => void) => { timers.push(fn); return timers.length; },
    clearTimeout: () => {},
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    gtag: withGtag ? (...a: unknown[]) => calls.push(a) : undefined,
  });
  let prevented = false;
  const event = { target: anchor, button: 0, preventDefault: () => { prevented = true; }, stopPropagation: () => {} };
  const restore = () => {
    for (const [k, d] of Object.entries(saved)) {
      if (d) Object.defineProperty(g, k, d);
      else delete g[k];
    }
  };
  return { calls, assigned, timers, event, restore, prevented: () => prevented };
}

test('cta_reunion_click: gtag gets transport_type beacon + callback, navigation after callback', async () => {
  const { handleCtaDocumentClick } = await import('../lib/analytics/cta-click.ts');
  const f = fakeWindow(true);
  try {
    handleCtaDocumentClick(f.event as unknown as MouseEvent);
    assert.equal(f.prevented(), true);
    const call = f.calls.find((c) => c[1] === 'cta_reunion_click');
    assert.ok(call, 'gtag event called');
    const params = call![2] as Record<string, unknown>;
    assert.equal(params.transport_type, 'beacon');
    assert.equal(params.event_timeout, 300);
    assert.equal(f.assigned.length, 0);
    (params.event_callback as () => void)();
    f.timers.forEach((t) => t());
    assert.deepEqual(f.assigned, ['https://playfulagency.com/reunion-playful']);
  } finally { f.restore(); }
});

test('cta_reunion_click: without gtag navigation still happens (once)', async () => {
  const { handleCtaDocumentClick } = await import('../lib/analytics/cta-click.ts');
  const f = fakeWindow(false);
  try {
    handleCtaDocumentClick(f.event as unknown as MouseEvent);
    f.timers.forEach((t) => t());
    assert.deepEqual(f.assigned, ['https://playfulagency.com/reunion-playful']);
  } finally { f.restore(); }
});
