declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTAG_EVENT_TIMEOUT_MS = 300;

/**
 * gtag maps the reserved `page_path` field to collect `dp` and drops it as
 * `ep.page_path`. The `_&` prefix is gtag's raw Measurement Protocol escape
 * (`key.substring(2)`), so `_&ep.page_path` lands as `ep.page_path`. The
 * «CTA página» dimension reads that parameter on cta_ and chat_* events.
 */
export const GTAG_EP_PAGE_PATH_KEY = '_&ep.page_path';

export function encodeGtagEventParams(
  params: Record<string, unknown>,
  onDone?: () => void,
  timeoutMs?: number,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...params,
    event_callback: onDone,
    event_timeout: timeoutMs ?? GTAG_EVENT_TIMEOUT_MS,
  };
  if (typeof params.page_path === 'string' && params.page_path) {
    payload[GTAG_EP_PAGE_PATH_KEY] = params.page_path;
  }
  return payload;
}

/**
 * Sends a GA4 event through the production gtag already loaded in layout.
 * No-ops when gtag is missing (preview/staging, blocked script, SSR).
 */
export function sendGtagEvent(
  eventName: string,
  params: Record<string, unknown>,
  options?: { onDone?: () => void; timeoutMs?: number },
): void {
  const finish = () => {
    options?.onDone?.();
  };

  if (typeof window === 'undefined') {
    finish();
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, encodeGtagEventParams(params, finish, options?.timeoutMs));
    return;
  }

  finish();
}
