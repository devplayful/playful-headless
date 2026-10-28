import { isQaTraffic } from './qa-traffic.ts';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
    __vcSent?: boolean;
    __vcEventId?: string;
  }
}

export const VISITA_CALIFICADA_EVENT = 'VisitaCalificada';
export const VISITA_CALIFICADA_DL_EVENT = 'visita_calificada';
export const VISITA_CALIFICADA_CONTENT_NAME = 'lp-calentamiento';
export const SCROLL_DEPTH_THRESHOLD = 0.5;
export const TIME_ON_PAGE_MS = 15_000;
export const FBQ_WAIT_MS = 5_000;
export const FBQ_POLL_MS = 200;

export type VisitaCalificadaTrigger = 'scroll_time' | 'cta_click';

export type VisitaCalificadaParams = {
  content_name: typeof VISITA_CALIFICADA_CONTENT_NAME;
  trigger: VisitaCalificadaTrigger;
  lp_slug: string;
};

export type VisitaCalificadaFireResult = {
  sent: boolean;
  eventId: string | null;
  qa: boolean;
  fbqCalled: boolean;
  skippedReason?: 'ssr' | 'already_sent';
};

export function isLpPath(pathname: string): boolean {
  const path = (pathname || '').split('?')[0];
  return path === '/lp' || path.startsWith('/lp/');
}

export function lpSlugFromPath(pathname: string): string {
  const path = (pathname || '').split('?')[0].replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'lp') return '';
  return parts[1] || '';
}

export function isReunionCtaHref(href: string): boolean {
  return typeof href === 'string' && href.includes('/reunion-playful');
}

export function pageScrollDepth(input?: {
  scrollY?: number;
  viewportHeight?: number;
  scrollHeight?: number;
}): number {
  const scrollY =
    input?.scrollY ??
    (typeof window === 'undefined' ? 0 : window.scrollY || window.pageYOffset || 0);
  const viewportHeight =
    input?.viewportHeight ??
    (typeof window === 'undefined' ? 0 : window.innerHeight || 0);
  const scrollHeight =
    input?.scrollHeight ??
    (typeof document === 'undefined' ? 0 : document.documentElement?.scrollHeight || 0);
  if (scrollHeight <= 0) return 0;
  return Math.min(1, (scrollY + viewportHeight) / scrollHeight);
}

export function qualifiesScrollTime(scrollDepth: number, elapsedMs: number): boolean {
  return scrollDepth >= SCROLL_DEPTH_THRESHOLD && elapsedMs >= TIME_ON_PAGE_MS;
}

export function createVisitaCalificadaEventId(
  now = Date.now(),
  random: () => number = Math.random,
): string {
  return 'vc-' + now + '-' + random().toString(36).slice(2, 10);
}

export function resetVisitaCalificadaForTests(): void {
  if (typeof window === 'undefined') return;
  window.__vcSent = false;
  delete window.__vcEventId;
}

function ensureDataLayer(): Array<Record<string, unknown>> {
  if (!window.dataLayer || typeof window.dataLayer.push !== 'function') {
    window.dataLayer = [];
  }
  return window.dataLayer;
}

export function scheduleFbqTrackCustom(
  params: VisitaCalificadaParams,
  eventId: string,
  opts?: {
    waitMs?: number;
    pollMs?: number;
    now?: () => number;
    setTimeoutFn?: (fn: () => void, ms: number) => unknown;
  },
): boolean {
  if (typeof window === 'undefined') return false;
  const waitMs = opts?.waitMs ?? FBQ_WAIT_MS;
  const pollMs = opts?.pollMs ?? FBQ_POLL_MS;
  const now = opts?.now ?? Date.now;
  const started = now();
  const setTimeoutFn =
    opts?.setTimeoutFn ??
    ((fn: () => void, ms: number) => {
      if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
        return window.setTimeout(fn, ms);
      }
      return setTimeout(fn, ms);
    });

  const attempt = (): boolean => {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', VISITA_CALIFICADA_EVENT, params, { eventID: eventId });
      return true;
    }
    if (now() - started >= waitMs) return false;
    setTimeoutFn(attempt, pollMs);
    return false;
  };

  return attempt();
}

/**
 * Fires VisitaCalificada once per page view. QA traffic never calls fbq;
 * it still pushes dataLayer (with qa:true) so preview can assert the event.
 */
export function fireVisitaCalificada(input: {
  trigger: VisitaCalificadaTrigger;
  lpSlug: string;
  search?: string;
  userAgent?: string;
  eventId?: string;
  fbqWait?: {
    waitMs?: number;
    pollMs?: number;
    now?: () => number;
    setTimeoutFn?: (fn: () => void, ms: number) => unknown;
  };
}): VisitaCalificadaFireResult {
  if (typeof window === 'undefined') {
    return { sent: false, eventId: null, qa: false, fbqCalled: false, skippedReason: 'ssr' };
  }
  if (window.__vcSent) {
    return {
      sent: false,
      eventId: window.__vcEventId ?? null,
      qa: false,
      fbqCalled: false,
      skippedReason: 'already_sent',
    };
  }

  const qa = isQaTraffic({ search: input.search, userAgent: input.userAgent });
  const eventId = input.eventId || createVisitaCalificadaEventId();
  window.__vcSent = true;
  window.__vcEventId = eventId;

  const params: VisitaCalificadaParams = {
    content_name: VISITA_CALIFICADA_CONTENT_NAME,
    trigger: input.trigger,
    lp_slug: input.lpSlug,
  };

  const dlPayload: Record<string, unknown> = {
    event: VISITA_CALIFICADA_DL_EVENT,
    event_id: eventId,
    trigger: input.trigger,
    lp_slug: input.lpSlug,
  };
  if (qa) dlPayload.qa = true;

  ensureDataLayer().push(dlPayload);

  if (qa) {
    console.debug('[visita_calificada]', dlPayload);
    return { sent: true, eventId, qa: true, fbqCalled: false };
  }

  const fbqCalled = scheduleFbqTrackCustom(params, eventId, input.fbqWait);
  return { sent: true, eventId, qa: false, fbqCalled };
}

function reunionHrefFromEventTarget(target: EventTarget | null): string | null {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return null;
  const anchor = target.closest('a');
  if (!anchor) return null;
  const href = anchor.getAttribute('href') || (anchor as HTMLAnchorElement).href || '';
  return isReunionCtaHref(href) ? href : null;
}

/**
 * Binds scroll+time and CTA listeners on /lp/* only. Returns a disposer.
 * Paths outside /lp are a no-op (no listeners, no timers).
 */
export function mountVisitaCalificada(input?: {
  pathname?: string;
  search?: string;
  userAgent?: string;
}): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const pathname = input?.pathname ?? window.location?.pathname ?? '';
  if (!isLpPath(pathname)) return () => {};
  // /lp/agencia-shopify has its own 30s + 50% dataLayer boot (no fbq here).
  const lpPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (lpPath === '/lp/agencia-shopify' || lpPath.startsWith('/lp/agencia-shopify/')) {
    return () => {};
  }

  window.__vcSent = false;
  delete window.__vcEventId;

  const slug = lpSlugFromPath(pathname);
  let scrolled = pageScrollDepth() >= SCROLL_DEPTH_THRESHOLD;
  let waited = false;
  let disposed = false;

  const emit = (trigger: VisitaCalificadaTrigger) => {
    if (disposed) return;
    fireVisitaCalificada({
      trigger,
      lpSlug: slug,
      search: input?.search,
      userAgent: input?.userAgent,
    });
  };

  const onScroll = () => {
    if (pageScrollDepth() >= SCROLL_DEPTH_THRESHOLD) {
      scrolled = true;
      if (waited) emit('scroll_time');
    }
  };

  const onClick = (event: Event) => {
    if (!reunionHrefFromEventTarget(event.target)) return;
    emit('cta_click');
  };

  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onClick, true);

  const timer = window.setTimeout(() => {
    waited = true;
    if (scrolled || pageScrollDepth() >= SCROLL_DEPTH_THRESHOLD) {
      scrolled = true;
      emit('scroll_time');
    }
  }, TIME_ON_PAGE_MS);

  onScroll();

  return () => {
    disposed = true;
    window.clearTimeout(timer);
    document.removeEventListener('scroll', onScroll);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick, true);
  };
}
