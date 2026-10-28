import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const {
  LP_META_VC_EVENT,
  LP_META_VC_SCROLL,
  LP_META_VC_TIME_MS,
  LP_META_VISITA_CALIFICADA_BOOT,
  PLAYFUL_QA_UA,
  createPageViewEventId,
  isLpAgenciaShopifyPath,
  isLpMetaVcQa,
  isPageViewEventId,
  mountLpMetaVisitaCalificada,
  pageScrollDepth,
  qualifiesLpMetaVisitaCalificada,
} = await import('../app/lp/agencia-shopify/visita-calificada.ts');

const landing = readFileSync(new URL('../app/lp/agencia-shopify/Landing.tsx', import.meta.url), 'utf8');
const root = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
const meta = readFileSync(new URL('../components/MetaPixel.tsx', import.meta.url), 'utf8');
const sharedMount = readFileSync(new URL('../lib/analytics/visita-calificada.ts', import.meta.url), 'utf8');

function env(opts = {}) {
  const dataLayer = [];
  const scrolls = [];
  const timers = [];
  const state = {
    dataLayer,
    scrollY: opts.scrollY ?? 0,
    innerHeight: opts.innerHeight ?? 800,
    scrollHeight: opts.scrollHeight ?? 4000,
    search: opts.search ?? '',
    userAgent: opts.userAgent ?? 'Mozilla/5.0 Chrome',
    now: opts.now ?? (() => 0),
    setTimeoutFn: (fn, ms) => {
      timers.push({ fn, ms });
    },
    addScroll: (fn) => {
      scrolls.push(fn);
    },
  };
  const mounted = mountLpMetaVisitaCalificada(state);
  return { state, timers, scrolls, mounted, dataLayer };
}

test('regla: 30 s y 50 % de scroll, las dos; no califica en la carga', () => {
  assert.equal(LP_META_VC_TIME_MS, 30_000);
  assert.equal(LP_META_VC_SCROLL, 0.5);
  assert.equal(LP_META_VC_EVENT, 'visita_calificada');
  assert.equal(qualifiesLpMetaVisitaCalificada(0.5, 0), false);
  assert.equal(qualifiesLpMetaVisitaCalificada(0.49, 30_000), false);
  assert.equal(qualifiesLpMetaVisitaCalificada(0.5, 29_999), false);
  assert.equal(qualifiesLpMetaVisitaCalificada(0.5, 30_000), true);
  assert.equal(pageScrollDepth({ scrollY: 1200, viewportHeight: 800, scrollHeight: 4000 }), 0.5);
  assert.ok(isLpAgenciaShopifyPath('/lp/agencia-shopify'));
  assert.ok(isLpAgenciaShopifyPath('/lp/agencia-shopify/c3'));
  assert.ok(isLpAgenciaShopifyPath('/lp/agencia-shopify/generic'));
  assert.equal(isLpAgenciaShopifyPath('/lp/calentamiento'), false);
});

test('event_id es un UUID por página vista', () => {
  const id = createPageViewEventId(() => '2c1a0b3e-4d5f-6789-a0b1-c2d3e4f50678');
  assert.equal(isPageViewEventId(id), true);
  const a = createPageViewEventId();
  const b = createPageViewEventId();
  assert.equal(isPageViewEventId(a), true);
  assert.equal(isPageViewEventId(b), true);
  assert.notEqual(a, b);
});

test('no se dispara en la carga ni antes de cumplir 30 s y 50 %', () => {
  const alreadyHalf = env({ scrollY: 1200, innerHeight: 800, scrollHeight: 4000 });
  alreadyHalf.mounted.onScroll();
  assert.equal(alreadyHalf.dataLayer.length, 0, '50 % en la carga no emite');

  alreadyHalf.timers[0].fn();
  assert.equal(alreadyHalf.dataLayer.length, 1, 'a los 30 s, si ya hay 50 %, sí emite');
  assert.equal(alreadyHalf.dataLayer[0].event, 'visita_calificada');
  assert.equal(alreadyHalf.dataLayer[0].event_id, alreadyHalf.mounted.eventId);
  assert.equal(alreadyHalf.dataLayer[0].qa, undefined);

  const waitOnly = env();
  assert.equal(waitOnly.timers[0].ms, 30_000);
  waitOnly.timers[0].fn();
  assert.equal(waitOnly.dataLayer.length, 0, '30 s sin 50 % no emite');

  waitOnly.state.scrollY = 1200;
  waitOnly.mounted.onScroll();
  assert.equal(waitOnly.dataLayer.length, 1);

  const scrollOnly = env();
  scrollOnly.state.scrollY = 1200;
  scrollOnly.mounted.onScroll();
  assert.equal(scrollOnly.dataLayer.length, 0, '50 % antes de 30 s no emite');
  scrollOnly.timers[0].fn();
  assert.equal(scrollOnly.dataLayer.length, 1);

  scrollOnly.mounted.onScroll();
  scrollOnly.mounted.fireTimer();
  assert.equal(scrollOnly.dataLayer.length, 1, 'una sola vez por visita');
});

test('QA (?qa=1 o PlayfulQA/1.0) emite el evento con qa:true', () => {
  assert.equal(isLpMetaVcQa({ search: '?qa=1' }), true);
  assert.equal(isLpMetaVcQa({ userAgent: PLAYFUL_QA_UA }), true);
  assert.equal(isLpMetaVcQa({ search: '', userAgent: 'Mozilla' }), false);

  const byQuery = env({ search: '?qa=1', scrollY: 1200 });
  byQuery.timers[0].fn();
  assert.equal(byQuery.dataLayer.length, 1);
  assert.equal(byQuery.dataLayer[0].qa, true);
  assert.equal(byQuery.dataLayer[0].event, 'visita_calificada');
  assert.ok(isPageViewEventId(byQuery.dataLayer[0].event_id));

  const byUa = env({ userAgent: PLAYFUL_QA_UA, scrollY: 1200 });
  byUa.timers[0].fn();
  assert.equal(byUa.dataLayer[0].qa, true);
});

test('el script es lazy, no bloquea el render y no llama a fbq ni a GTM', () => {
  assert.match(landing, /data-lp-meta-visita-calificada/);
  assert.match(landing, /LP_META_VISITA_CALIFICADA_BOOT/);
  assert.match(landing, /type="module"/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /requestIdleCallback/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /addEventListener\("load"/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /30000/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /0\.5/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /visita_calificada/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /randomUUID/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /get\("qa"\) === "1"/);
  assert.match(LP_META_VISITA_CALIFICADA_BOOT, /PlayfulQA\/1\.0/);
  assert.doesNotMatch(LP_META_VISITA_CALIFICADA_BOOT, /\bfbq\s*\(/);
  assert.doesNotMatch(LP_META_VISITA_CALIFICADA_BOOT, /trackCustom/);
  assert.doesNotMatch(root, /visita_calificada|VisitaCalificada|lp-meta-visita/);
  assert.doesNotMatch(gtm, /visita_calificada|VisitaCalificada/);
  assert.doesNotMatch(meta, /visita_calificada|VisitaCalificada/);
  assert.match(sharedMount, /\/lp\/agencia-shopify/);
});
