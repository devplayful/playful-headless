declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTAG_EVENT_TIMEOUT_MS = 300;

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
    window.gtag('event', eventName, {
      ...params,
      event_callback: finish,
      event_timeout: options?.timeoutMs ?? GTAG_EVENT_TIMEOUT_MS,
    });
    return;
  }

  finish();
}
