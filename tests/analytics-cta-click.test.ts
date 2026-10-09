import assert from 'node:assert/strict';
import test from 'node:test';
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
