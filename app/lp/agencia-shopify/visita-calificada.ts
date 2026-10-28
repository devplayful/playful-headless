/**
 * VisitaCalificada for /lp/agencia-shopify and /[ang] only.
 * dataLayer.push once per page view after 30s AND 50% scroll. Never on load.
 * GTM (GO de José) will call fbq; this file never touches GTM or fbq.
 */

export const LP_META_VC_EVENT = 'visita_calificada';
export const LP_META_VC_TIME_MS = 30_000;
export const LP_META_VC_SCROLL = 0.5;
export const PLAYFUL_QA_UA = 'PlayfulQA/1.0';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLpAgenciaShopifyPath(pathname: string): boolean {
  const path = (pathname || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path === '/lp/agencia-shopify' || path.startsWith('/lp/agencia-shopify/');
}

export function isLpMetaVcQa(input?: { search?: string; userAgent?: string }): boolean {
  const search = input?.search ?? '';
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const qa = new URLSearchParams(raw).get('qa') === '1';
  const ua = (input?.userAgent ?? '').includes(PLAYFUL_QA_UA);
  return qa || ua;
}

export function createPageViewEventId(randomUUID?: () => string): string {
  if (typeof randomUUID === 'function') return randomUUID();
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const n = (Math.random() * 16) | 0;
    const v = ch === 'x' ? n : (n & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isPageViewEventId(id: string): boolean {
  return UUID_RE.test(id);
}

export function pageScrollDepth(input?: {
  scrollY?: number;
  viewportHeight?: number;
  scrollHeight?: number;
}): number {
  const scrollY = input?.scrollY ?? 0;
  const viewportHeight = input?.viewportHeight ?? 0;
  const scrollHeight = input?.scrollHeight ?? 0;
  if (scrollHeight <= 0) return 0;
  return Math.min(1, (scrollY + viewportHeight) / scrollHeight);
}

export function qualifiesLpMetaVisitaCalificada(scrollDepth: number, elapsedMs: number): boolean {
  return scrollDepth >= LP_META_VC_SCROLL && elapsedMs >= LP_META_VC_TIME_MS;
}

export type LpMetaVcEnv = {
  dataLayer: Array<Record<string, unknown>>;
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
  search: string;
  userAgent: string;
  now: () => number;
  setTimeoutFn: (fn: () => void, ms: number) => unknown;
  addScroll: (fn: () => void) => void;
};

export type LpMetaVcMount = {
  eventId: string;
  pushCount: () => number;
  lastPush: () => Record<string, unknown> | null;
  onScroll: () => void;
  fireTimer: () => void;
};

/**
 * Testable mount. Does not push on start even if the page is already 50% scrolled.
 * Timer is 30s from navigation (`now()`), not from script eval.
 */
export function mountLpMetaVisitaCalificada(env: LpMetaVcEnv): LpMetaVcMount {
  const eventId = createPageViewEventId();
  let waited = false;
  let scrolled = false;
  let sent = false;
  const pushes: Array<Record<string, unknown>> = [];

  const depth = () =>
    pageScrollDepth({
      scrollY: env.scrollY,
      viewportHeight: env.innerHeight,
      scrollHeight: env.scrollHeight,
    });

  const maybePush = () => {
    if (sent || !waited || !scrolled) return;
    if (!qualifiesLpMetaVisitaCalificada(depth(), LP_META_VC_TIME_MS)) return;
    sent = true;
    const payload: Record<string, unknown> = {
      event: LP_META_VC_EVENT,
      event_id: eventId,
    };
    if (isLpMetaVcQa({ search: env.search, userAgent: env.userAgent })) {
      payload.qa = true;
    }
    env.dataLayer.push(payload);
    pushes.push(payload);
  };

  const onScroll = () => {
    if (depth() >= LP_META_VC_SCROLL) {
      scrolled = true;
      maybePush();
    }
  };

  const fireTimer = () => {
    waited = true;
    if (depth() >= LP_META_VC_SCROLL) scrolled = true;
    maybePush();
  };

  env.addScroll(onScroll);
  const remain = Math.max(0, LP_META_VC_TIME_MS - env.now());
  env.setTimeoutFn(fireTimer, remain);

  return {
    eventId,
    pushCount: () => pushes.length,
    lastPush: () => pushes[pushes.length - 1] ?? null,
    onScroll,
    fireTimer,
  };
}

/** Lazy, non-blocking boot. Work starts after load + idle. Never calls fbq. */
export const LP_META_VISITA_CALIFICADA_BOOT = `
(function () {
  function start() {
    var TIME_MS = ${LP_META_VC_TIME_MS};
    var DEPTH = ${LP_META_VC_SCROLL};
    var sent = false;
    var waited = false;
    var scrolled = false;
    var eventId = (crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) {
          var n = (Math.random() * 16) | 0;
          var v = ch === "x" ? n : (n & 0x3) | 0x8;
          return v.toString(16);
        });
    function qa() {
      var raw = (location.search || "").replace(/^\\?/, "");
      if (new URLSearchParams(raw).get("qa") === "1") return true;
      return (navigator.userAgent || "").indexOf("PlayfulQA/1.0") !== -1;
    }
    function depth() {
      var el = document.documentElement;
      var sh = (el && el.scrollHeight) || 0;
      if (sh <= 0) return 0;
      var y = window.scrollY || window.pageYOffset || (el && el.scrollTop) || 0;
      var vh = window.innerHeight || (el && el.clientHeight) || 0;
      return Math.min(1, (y + vh) / sh);
    }
    function push() {
      if (sent || !waited || !scrolled) return;
      sent = true;
      window.dataLayer = window.dataLayer || [];
      var payload = { event: "${LP_META_VC_EVENT}", event_id: eventId };
      if (qa()) payload.qa = true;
      window.dataLayer.push(payload);
    }
    function onScroll() {
      if (depth() >= DEPTH) {
        scrolled = true;
        push();
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    var elapsed = (window.performance && performance.now) ? performance.now() : 0;
    window.setTimeout(function () {
      waited = true;
      if (depth() >= DEPTH) scrolled = true;
      push();
    }, Math.max(0, TIME_MS - elapsed));
  }
  function schedule() {
    if (window.requestIdleCallback) window.requestIdleCallback(start, { timeout: 4000 });
    else window.setTimeout(start, 0);
  }
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule);
})();
`.trim();
