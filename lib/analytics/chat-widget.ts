import { sendGtagEvent } from './gtag-event.ts';
import { pagePathFromLocation } from './cta-click.ts';

export const CHAT_LEAD_EVENT = 'chat_lead';
export const CHAT_OPEN_EVENT = 'chat_open';

export type ChatBeforeSubmit = (values: unknown, host?: unknown) => boolean;

type ChatWidgetApi = {
  registerBeforeSubmit?: (fn: ChatBeforeSubmit) => void;
  isActive?: () => boolean;
};

declare global {
  interface Window {
    leadConnector?: {
      chatWidget?: ChatWidgetApi;
    };
  }
}

let loadedListenerAttached = false;
let beforeSubmitRegistered = false;
let openWatchAttached = false;
let lastOpenActive = false;
let openObserver: MutationObserver | null = null;

function chatWidgetApi(): ChatWidgetApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.leadConnector?.chatWidget;
}

function chatPagePath(): string {
  return pagePathFromLocation() || 'unknown';
}

function sendChatEvent(eventName: typeof CHAT_LEAD_EVENT | typeof CHAT_OPEN_EVENT): void {
  sendGtagEvent(eventName, { page_path: chatPagePath() });
}

/**
 * Documented HighLevel before-submit hook. Always returns true so a gtag
 * failure never blocks the chat. `values` stay unused: they carry PII.
 */
export function handleChatBeforeSubmit(_values?: unknown, _host?: unknown): true {
  try {
    sendChatEvent(CHAT_LEAD_EVENT);
  } catch {
    // The widget already proceeds if this throws; still return true.
  }
  return true;
}

function registerBeforeSubmitOnce(): void {
  if (beforeSubmitRegistered) return;
  const api = chatWidgetApi();
  if (typeof api?.registerBeforeSubmit !== 'function') return;
  beforeSubmitRegistered = true;
  api.registerBeforeSubmit(handleChatBeforeSubmit);
}

function emitChatOpenIfNeeded(): void {
  const api = chatWidgetApi();
  if (typeof api?.isActive !== 'function') return;
  const active = Boolean(api.isActive());
  if (active && !lastOpenActive) {
    try {
      sendChatEvent(CHAT_OPEN_EVENT);
    } catch {
      // Opening the widget must never depend on analytics.
    }
  }
  lastOpenActive = active;
}

function watchChatOpen(event: Event): void {
  if (openWatchAttached) return;
  const api = chatWidgetApi();
  if (typeof api?.isActive !== 'function') return;

  const detail = 'detail' in event ? (event as CustomEvent).detail : undefined;
  if (
    typeof MutationObserver !== 'function'
    || typeof Element !== 'function'
    || !(detail instanceof Element)
  ) {
    return;
  }

  openWatchAttached = true;
  lastOpenActive = Boolean(api.isActive());
  openObserver = new MutationObserver(() => {
    emitChatOpenIfNeeded();
  });
  openObserver.observe(detail, { attributes: true });
}

function onChatWidgetLoaded(event: Event): void {
  registerBeforeSubmitOnce();
  watchChatOpen(event);
}

/**
 * Subscribe to the documented HighLevel events before the widget script is
 * added. Idempotent: React remounts do not register a second before-submit.
 */
export function attachChatWidgetAnalytics(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!loadedListenerAttached) {
    loadedListenerAttached = true;
    window.addEventListener('LC_chatWidgetLoaded', onChatWidgetLoaded, false);
  }

  registerBeforeSubmitOnce();

  return () => {};
}

export function resetChatWidgetAnalyticsForTests(): void {
  if (typeof window !== 'undefined' && loadedListenerAttached) {
    window.removeEventListener('LC_chatWidgetLoaded', onChatWidgetLoaded, false);
  }
  loadedListenerAttached = false;
  beforeSubmitRegistered = false;
  openWatchAttached = false;
  lastOpenActive = false;
  openObserver?.disconnect();
  openObserver = null;
}
