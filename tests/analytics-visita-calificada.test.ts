import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';
import {
  FBQ_WAIT_MS,
  SCROLL_DEPTH_THRESHOLD,
  TIME_ON_PAGE_MS,
  VISITA_CALIFICADA_CONTENT_NAME,
  VISITA_CALIFICADA_DL_EVENT,
  VISITA_CALIFICADA_EVENT,
  createVisitaCalificadaEventId,
  fireVisitaCalificada,
  isLpPath,
  isReunionCtaHref,
  lpSlugFromPath,
  mountVisitaCalificada,
  pageScrollDepth,
  qualifiesScrollTime,
  resetVisitaCalificadaForTests,
  scheduleFbqTrackCustom,
} from '../lib/analytics/visita-calificada.ts';

type Listener = EventListenerOrEventListenerObject;

function installDom(opts?: {
  pathname?: string;
  search?: string;
  userAgent?: string;
  fbq?: (...args: unknown[]) => void;
  scrollY?: number;
  innerHeight?: number;
  scrollHeight?: number;
}) {
  const g = globalThis as Record<string, unknown>;
  const saved: Record<string, PropertyDescriptor | undefined> = {
    window: Object.getOwnPropertyDescriptor(g, 'window'),
    document: Object.getOwnPropertyDescriptor(g, 'document'),
    navigator: Object.getOwnPropertyDescriptor(g, 'navigator'),
    Element: Object.getOwnPropertyDescriptor(g, 'Element'),
  };
  const listeners = new Map<string, Set<Listener>>();
  const add = (key: string, fn: Listener) => {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
  };
  const remove = (key: string, fn: Listener) => {
    listeners.get(key)?.delete(fn);
  };
  const timers: Array<{ id: number; fn: () => void; ms: number }> = [];
  let nextTimer = 1;
  const dataLayer: Record<string, unknown>[] = [];
  const fbqCalls: unknown[][] = [];
  const fbq =
    opts && 'fbq' in opts
      ? opts.fbq
      : ((...args: unknown[]) => {
          fbqCalls.push(args);
        });

  class FakeElement {
    href = '';
    constructor(href = '') {
      this.href = href;
    }
    getAttribute(name: string) {
      return name === 'href' ? this.href : null;
    }
    closest(sel: string) {
      return sel === 'a' ? this : null;
    }
  }

  const win = {
    __vcSent: undefined as boolean | undefined,
    __vcEventId: undefined as string | undefined,
    fbq,
    dataLayer,
    location: {
      pathname: opts?.pathname ?? '/lp/calentamiento',
      search: opts?.search ?? '',
    },
    scrollY: opts?.scrollY ?? 0,
    pageYOffset: opts?.scrollY ?? 0,
    innerHeight: opts?.innerHeight ?? 800,
    addEventListener: (type: string, fn: Listener) => add(`win:${type}`, fn),
    removeEventListener: (type: string, fn: Listener) => remove(`win:${type}`, fn),
    setTimeout: (fn: () => void, ms?: number) => {
      const id = nextTimer++;
      timers.push({ id, fn, ms: ms ?? 0 });
      return id;
    },
    clearTimeout: (id: number) => {
      const i = timers.findIndex((t) => t.id === id);
      if (i >= 0) timers.splice(i, 1);
    },
  };
  const doc = {
    documentElement: {
      scrollHeight: opts?.scrollHeight ?? 4000,
      clientHeight: opts?.innerHeight ?? 800,
      scrollTop: opts?.scrollY ?? 0,
    },
    addEventListener: (type: string, fn: Listener) => add(`doc:${type}`, fn),
    removeEventListener: (type: string, fn: Listener) => remove(`doc:${type}`, fn),
  };

  const set = (k: string, v: unknown) =>
    Object.defineProperty(g, k, { value: v, configurable: true, writable: true });
  set('Element', FakeElement);
  set('window', win);
  set('document', doc);
  set('navigator', { userAgent: opts?.userAgent ?? 'Mozilla/5.0 Chrome' });

  const restore = () => {
    for (const [k, d] of Object.entries(saved)) {
      if (d) Object.defineProperty(g, k, d);
      else delete g[k];
    }
  };

  return { win, doc, listeners, timers, dataLayer, fbqCalls, FakeElement, restore };
}

test('scroll+time threshold needs both 50% depth and 15s', () => {
  assert.equal(SCROLL_DEPTH_THRESHOLD, 0.5);
  assert.equal(TIME_ON_PAGE_MS, 15_000);
  assert.equal(qualifiesScrollTime(0.49, 15_000), false);
  assert.equal(qualifiesScrollTime(0.5, 14_999), false);
  assert.equal(qualifiesScrollTime(0.5, 15_000), true);
  assert.equal(qualifiesScrollTime(1, 15_000), true);
  assert.equal(pageScrollDepth({ scrollY: 0, viewportHeight: 800, scrollHeight: 4000 }), 0.2);
  assert.equal(pageScrollDepth({ scrollY: 1200, viewportHeight: 800, scrollHeight: 4000 }), 0.5);
});

test('event id matches vc-<timestamp>-<rand> and is stored on window', () => {
  const id = createVisitaCalificadaEventId(1_700_000_000_000, () => 0.123456789);
  assert.match(id, /^vc-1700000000000-[a-z0-9]+$/);
  assert.equal(id, 'vc-1700000000000-' + (0.123456789).toString(36).slice(2, 10));
});

test('fires once: second call is a no-op and fbq is called once', () => {
  const f = installDom();
  try {
    const first = fireVisitaCalificada({ trigger: 'scroll_time', lpSlug: 'calentamiento' });
    const second = fireVisitaCalificada({ trigger: 'cta_click', lpSlug: 'calentamiento' });
    assert.equal(first.sent, true);
    assert.equal(second.sent, false);
    assert.equal(second.skippedReason, 'already_sent');
    assert.equal(first.eventId, f.win.__vcEventId);
    assert.equal(f.win.__vcSent, true);
    assert.equal(f.fbqCalls.length, 1);
    assert.equal(f.fbqCalls[0][0], 'trackCustom');
    assert.equal(f.fbqCalls[0][1], VISITA_CALIFICADA_EVENT);
    assert.deepEqual(f.fbqCalls[0][2], {
      content_name: VISITA_CALIFICADA_CONTENT_NAME,
      trigger: 'scroll_time',
      lp_slug: 'calentamiento',
    });
    assert.deepEqual(f.fbqCalls[0][3], { eventID: first.eventId });
    assert.equal(f.dataLayer.length, 1);
    assert.equal(f.dataLayer[0].event, VISITA_CALIFICADA_DL_EVENT);
    assert.equal(f.dataLayer[0].trigger, 'scroll_time');
    assert.equal(f.dataLayer[0].lp_slug, 'calentamiento');
    assert.equal(f.dataLayer[0].event_id, first.eventId);
  } finally {
    f.restore();
  }
});

test('QA traffic (?qa=1 or PlayfulQA/1.0) never calls fbq and pushes qa:true', () => {
  const debugs: unknown[][] = [];
  const originalDebug = console.debug;
  console.debug = (...args: unknown[]) => {
    debugs.push(args);
  };
  const byQuery = installDom({ search: '?qa=1' });
  try {
    const result = fireVisitaCalificada({
      trigger: 'cta_click',
      lpSlug: 'calentamiento',
      search: '?qa=1',
    });
    assert.equal(result.qa, true);
    assert.equal(result.fbqCalled, false);
    assert.equal(byQuery.fbqCalls.length, 0);
    assert.equal(byQuery.dataLayer[0].qa, true);
    assert.equal(byQuery.dataLayer[0].event, 'visita_calificada');
    assert.equal(debugs.length, 1);
    assert.equal(debugs[0][0], '[visita_calificada]');
  } finally {
    byQuery.restore();
  }

  const byUa = installDom({ userAgent: PLAYFUL_QA_UA, search: '' });
  try {
    resetVisitaCalificadaForTests();
    const result = fireVisitaCalificada({
      trigger: 'scroll_time',
      lpSlug: 'propuesta-ecommerce',
      userAgent: PLAYFUL_QA_UA,
    });
    assert.equal(result.qa, true);
    assert.equal(byUa.fbqCalls.length, 0);
    assert.equal(byUa.dataLayer[0].qa, true);
    assert.equal(byUa.dataLayer[0].lp_slug, 'propuesta-ecommerce');
  } finally {
    byUa.restore();
    console.debug = originalDebug;
  }
});

test('if fbq is missing it retries then gives up; dataLayer still receives the push', () => {
  const f = installDom({ fbq: undefined });
  try {
    const scheduled: Array<() => void> = [];
    const result = fireVisitaCalificada({
      trigger: 'scroll_time',
      lpSlug: 'calentamiento',
      fbqWait: {
        waitMs: FBQ_WAIT_MS,
        pollMs: 200,
        now: (() => {
          let t = 0;
          return () => {
            const current = t;
            t += 200;
            return current;
          };
        })(),
        setTimeoutFn: (fn) => {
          scheduled.push(fn);
        },
      },
    });
    assert.equal(result.sent, true);
    assert.equal(result.fbqCalled, false);
    assert.equal(f.dataLayer.length, 1);
    assert.ok(scheduled.length >= 1, 'scheduled a retry');
    f.win.fbq = (...args: unknown[]) => {
      f.fbqCalls.push(args);
    };
    scheduled[0]();
    assert.equal(f.fbqCalls.length, 1);
    assert.equal(f.fbqCalls[0][1], VISITA_CALIFICADA_EVENT);
  } finally {
    f.restore();
  }
});

test('fbq retry stops after the wait window without throwing', () => {
  const f = installDom({ fbq: undefined });
  try {
    let now = 0;
    const called = scheduleFbqTrackCustom(
      { content_name: 'lp-calentamiento', trigger: 'scroll_time', lp_slug: 'calentamiento' },
      'vc-test',
      {
        waitMs: 400,
        pollMs: 200,
        now: () => now,
        setTimeoutFn: (fn) => {
          now += 200;
          fn();
        },
      },
    );
    assert.equal(called, false);
    assert.equal(f.fbqCalls.length, 0);
    assert.ok(now >= 400);
  } finally {
    f.restore();
  }
});

test('only /lp/* paths are landing routes; slugs and CTA hrefs parse as expected', () => {
  assert.equal(isLpPath('/lp/calentamiento'), true);
  assert.equal(isLpPath('/lp/integraciones-pasarela-erp'), true);
  assert.equal(isLpPath('/lp/propuesta-ecommerce'), true);
  assert.equal(isLpPath('/lp/agencia-shopify'), true);
  assert.equal(isLpPath('/lp/calentamiento/'), true);
  assert.equal(isLpPath('/agencia-shopify'), false);
  assert.equal(isLpPath('/'), false);
  assert.equal(isLpPath('/lpx'), false);
  assert.equal(isLpPath('/reunion-playful'), false);
  assert.equal(lpSlugFromPath('/lp/agencia-shopify'), 'agencia-shopify');
  assert.equal(lpSlugFromPath('/lp/calentamiento'), 'calentamiento');
  assert.equal(lpSlugFromPath('/lp/integraciones-pasarela-erp?qa=1'), 'integraciones-pasarela-erp');
  assert.equal(lpSlugFromPath('/agencia-shopify'), '');
  assert.equal(isReunionCtaHref('/reunion-playful'), true);
  assert.equal(isReunionCtaHref('/reunion-playful?utm_source=meta'), true);
  assert.equal(isReunionCtaHref('https://playfulagency.com/reunion-playful'), true);
  assert.equal(isReunionCtaHref('/contactar-agencia-de-marketing-digital'), false);
  assert.equal(isReunionCtaHref('#dolor'), false);
});

test('mountVisitaCalificada is a no-op outside /lp (no listeners, no timers)', () => {
  const f = installDom({ pathname: '/agencia-shopify' });
  try {
    const stop = mountVisitaCalificada({ pathname: '/agencia-shopify' });
    assert.equal(typeof stop, 'function');
    assert.equal(f.listeners.size, 0);
    assert.equal(f.timers.length, 0);
    assert.equal(f.win.__vcSent, undefined);
    stop();
  } finally {
    f.restore();
  }
});

test('mount on /lp binds listeners; scroll+time and CTA each fire at most once', () => {
  const f = installDom({
    pathname: '/lp/calentamiento',
    scrollY: 0,
    innerHeight: 800,
    scrollHeight: 4000,
  });
  try {
    const stop = mountVisitaCalificada({ pathname: '/lp/calentamiento' });
    assert.ok(f.listeners.get('win:scroll')?.size);
    assert.ok(f.listeners.get('doc:scroll')?.size);
    assert.ok(f.listeners.get('doc:click')?.size);
    assert.equal(f.timers.length, 1);
    assert.equal(f.timers[0].ms, TIME_ON_PAGE_MS);
    assert.equal(f.dataLayer.length, 0);

    f.win.scrollY = 1200;
    f.doc.documentElement.scrollTop = 1200;
    Array.from(f.listeners.get('win:scroll') || []).forEach((fn) => {
      (fn as () => void)();
    });
    assert.equal(f.dataLayer.length, 0, 'scroll alone does not fire');

    f.timers[0].fn();
    assert.equal(f.dataLayer.length, 1);
    assert.equal(f.dataLayer[0].trigger, 'scroll_time');
    assert.equal(f.fbqCalls.length, 1);

    const anchor = new f.FakeElement('/reunion-playful');
    Array.from(f.listeners.get('doc:click') || []).forEach((fn) => {
      (fn as (ev: { target: unknown }) => void)({ target: anchor });
    });
    assert.equal(f.dataLayer.length, 1, 'already sent; CTA is ignored');
    stop();
    assert.equal(f.timers.length, 0);
  } finally {
    f.restore();
  }
});

test('CTA click on /reunion-playful fires without preventDefault and without holding nav', () => {
  const f = installDom({
    pathname: '/lp/propuesta-ecommerce',
    scrollY: 0,
    innerHeight: 800,
    scrollHeight: 4000,
  });
  try {
    mountVisitaCalificada({ pathname: '/lp/propuesta-ecommerce' });
    let prevented = false;
    const anchor = new f.FakeElement('/reunion-playful?utm_source=meta');
    const event = {
      target: anchor,
      preventDefault() {
        prevented = true;
      },
    };
    Array.from(f.listeners.get('doc:click') || []).forEach((fn) => {
      (fn as unknown as (ev: typeof event) => void)(event);
    });
    assert.equal(prevented, false);
    assert.equal(f.dataLayer.length, 1);
    assert.equal(f.dataLayer[0].trigger, 'cta_click');
    assert.equal(f.dataLayer[0].lp_slug, 'propuesta-ecommerce');
    assert.equal(f.fbqCalls[0][2] && (f.fbqCalls[0][2] as { trigger: string }).trigger, 'cta_click');
  } finally {
    f.restore();
  }
});

test('tracker mounts only in app/lp/layout; root layout, header, footer and global CSS stay untouched', () => {
  const lpLayout = readFileSync(new URL('../app/lp/layout.tsx', import.meta.url), 'utf8');
  const tracker = readFileSync(
    new URL('../app/lp/_components/VisitaCalificadaTracker.tsx', import.meta.url),
    'utf8',
  );
  const helper = readFileSync(new URL('../lib/analytics/visita-calificada.ts', import.meta.url), 'utf8');
  const rootLayout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
  const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const finalCta = readFileSync(new URL('../app/lp/_components/AdsFinalCta.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  const meta = readFileSync(new URL('../components/MetaPixel.tsx', import.meta.url), 'utf8');

  assert.match(lpLayout, /VisitaCalificadaTracker/);
  assert.match(tracker, /mountVisitaCalificada/);
  assert.match(tracker, /usePathname/);
  assert.match(helper, /trackCustom/);
  assert.match(helper, /VisitaCalificada/);
  assert.match(helper, /isQaTraffic/);
  assert.match(finalCta, /data-cta="lp-meta-final"/);
  assert.doesNotMatch(rootLayout, /VisitaCalificada/);
  assert.doesNotMatch(rootLayout, /visita-calificada/);
  assert.doesNotMatch(header, /VisitaCalificada|visita-calificada/);
  assert.doesNotMatch(footer, /VisitaCalificada|visita-calificada/);
  assert.doesNotMatch(globals, /visita.calificada|VisitaCalificada/);
  assert.doesNotMatch(gtm, /VisitaCalificada|visita_calificada/);
  assert.doesNotMatch(meta, /VisitaCalificada|visita_calificada/);
});
