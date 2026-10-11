declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTAG_EVENT_TIMEOUT_MS = 300;

/**
 * gtag maps reserved `page_path` to collect `dp` and drops it as `ep.page_path`.
 * The `_&` raw-MP escape only allowlists gtag internals (`_&rcb`, `_&ae`, …);
 * `_&ep.page_path` is stripped before the collect URL is built. The «CTA página»
 * dimension reads `ep.page_path`, so sendGtagEvent rewrites the next
 * `/g/collect` hit for that event name.
 */
export const GTAG_EP_PAGE_PATH_KEY = '_&ep.page_path';

// gtag often holds the hit 3–8s (`_et`, batching). 2.5s expired before collect.
export const COLLECT_PAGE_PATH_TTL_MS = 20_000;

type PendingPagePath = {
  eventName: string;
  pagePath: string;
  expiresAt: number;
};

let pendingPagePaths: PendingPagePath[] = [];
let collectPatchInstalled = false;

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

function prunePending(now = Date.now()): PendingPagePath[] {
  pendingPagePaths = pendingPagePaths.filter((item) => item.expiresAt > now);
  return pendingPagePaths;
}

export function rewriteCollectUrlForPagePath(url: string, now = Date.now()): string {
  if (!url || !url.includes('/g/collect')) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.searchParams.has('ep.page_path')) return url;
  const en = parsed.searchParams.get('en') || '';
  const match = prunePending(now).find((item) => item.eventName === en);
  if (!match) return url;
  parsed.searchParams.set('ep.page_path', match.pagePath);
  return parsed.href;
}

export function queueCollectPagePath(
  eventName: string,
  pagePath: string,
  now = Date.now(),
): void {
  if (!eventName || !pagePath) return;
  pendingPagePaths = prunePending(now).filter((item) => item.eventName !== eventName);
  pendingPagePaths.push({
    eventName,
    pagePath,
    expiresAt: now + COLLECT_PAGE_PATH_TTL_MS,
  });
  installCollectPagePathPatch();
}

function installCollectPagePathPatch(): void {
  if (typeof window === 'undefined' || collectPatchInstalled) return;
  collectPatchInstalled = true;

  const nav = window.navigator;
  if (nav && typeof nav.sendBeacon === 'function') {
    const originalBeacon = nav.sendBeacon.bind(nav);
    nav.sendBeacon = (url: string | URL, data?: BodyInit | null) =>
      originalBeacon(rewriteCollectUrlForPagePath(String(url)), data);
  }

  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string') {
        return originalFetch(rewriteCollectUrlForPagePath(input), init);
      }
      if (typeof URL !== 'undefined' && input instanceof URL) {
        return originalFetch(rewriteCollectUrlForPagePath(input.toString()), init);
      }
      if (typeof Request !== 'undefined' && input instanceof Request) {
        const rewritten = rewriteCollectUrlForPagePath(input.url);
        if (rewritten !== input.url) {
          return originalFetch(new Request(rewritten, input), init);
        }
      }
      return originalFetch(input, init);
    }) as typeof window.fetch;
  }

  if (typeof XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      const next = typeof url === 'string' || (typeof URL !== 'undefined' && url instanceof URL)
        ? rewriteCollectUrlForPagePath(String(url))
        : url;
      return originalOpen.call(this, method, next, async ?? true, username, password);
    };
  }
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

  if (typeof params.page_path === 'string' && params.page_path) {
    queueCollectPagePath(eventName, params.page_path);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, encodeGtagEventParams(params, finish, options?.timeoutMs));
    return;
  }

  finish();
}

export function resetGtagCollectPagePathForTests(): void {
  pendingPagePaths = [];
  collectPatchInstalled = false;
}
