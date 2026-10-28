import { isQaTraffic } from './qa-traffic.ts';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    __playfulQa?: 1;
  }
}

export const TRAFFIC_TYPE_QA = 'qa';
export const TRAFFIC_TYPE_BOT = 'bot';
export const TRAFFIC_TYPE_USER = 'user';

export type TrafficType =
  | typeof TRAFFIC_TYPE_QA
  | typeof TRAFFIC_TYPE_BOT
  | typeof TRAFFIC_TYPE_USER;

export type TrafficFlags = {
  traffic_type: TrafficType;
  bot_suspect: boolean;
};

export type TrafficInput = {
  search?: string;
  userAgent?: string;
  webdriver?: boolean;
  interacted?: boolean;
};

export const CONVERSION_EVENTS = [
  'generate_lead',
  'cta_reunion_click',
  'book_appointment',
] as const;

export type ConversionEventName = (typeof CONVERSION_EVENTS)[number];

/**
 * Headless browsers and known crawlers. QA (`PlayfulQA/1.0`) is checked first
 * via isQaTraffic and must not fall through to this list.
 */
export const CRAWLER_UA_RE =
  /headlesschrome|headless|phantomjs|puppeteer|playwright|lighthouse|googlebot|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandex(?:bot)?|facebookexternalhit|twitterbot|linkedinbot|slackbot|applebot|semrushbot|ahrefsbot|dotbot|mj12bot|bytespider|gptbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|ccbot|petalbot|crawler|spider/i;

let interacted = false;
let listenersInstalled = false;
let published = false;

export function isConversionEvent(eventName: string): eventName is ConversionEventName {
  return (CONVERSION_EVENTS as readonly string[]).includes(eventName);
}

export function isHeadlessOrCrawlerUserAgent(ua: string): boolean {
  return CRAWLER_UA_RE.test(ua || '');
}

function readWebdriver(input?: TrafficInput): boolean {
  if (typeof input?.webdriver === 'boolean') return input.webdriver;
  if (typeof navigator === 'undefined') return false;
  return Boolean(navigator.webdriver);
}

function readUserAgent(input?: TrafficInput): string {
  if (typeof input?.userAgent === 'string') return input.userAgent;
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

/** Immediate automation signals. Does not look at interaction. */
export function isAutomatedClient(input?: TrafficInput): boolean {
  if (isQaTraffic(input)) return false;
  return readWebdriver(input) || isHeadlessOrCrawlerUserAgent(readUserAgent(input));
}

export function hasRealInteraction(): boolean {
  return interacted;
}

export function markRealInteraction(): void {
  interacted = true;
}

export function installInteractionListeners(
  target: {
    addEventListener?: (type: string, listener: () => void, options?: AddEventListenerOptions) => void;
  } | null = typeof window === 'undefined' ? null : window,
): void {
  if (listenersInstalled || !target || typeof target.addEventListener !== 'function') return;
  listenersInstalled = true;
  const mark = () => {
    markRealInteraction();
  };
  const options: AddEventListenerOptions = { capture: true, passive: true };
  for (const type of ['scroll', 'pointerdown', 'keydown', 'touchstart', 'wheel']) {
    target.addEventListener(type, mark, options);
  }
}

export function resolveTrafficFlags(input?: TrafficInput): TrafficFlags {
  if (isQaTraffic(input)) {
    return { traffic_type: TRAFFIC_TYPE_QA, bot_suspect: false };
  }
  if (isAutomatedClient(input)) {
    return { traffic_type: TRAFFIC_TYPE_BOT, bot_suspect: true };
  }
  return { traffic_type: TRAFFIC_TYPE_USER, bot_suspect: false };
}

/**
 * Conversion-time bot_suspect: automation, or no real interaction except on
 * book_appointment (GHL returns to /gracias with no local gesture).
 */
export function isConversionBotSuspect(eventName: string, input?: TrafficInput): boolean {
  if (isAutomatedClient(input)) return true;
  if (eventName === 'book_appointment') return false;
  const didInteract = typeof input?.interacted === 'boolean'
    ? input.interacted
    : hasRealInteraction();
  return !didInteract;
}

export function shouldSuppressConversion(eventName: string, input?: TrafficInput): boolean {
  if (!isConversionEvent(eventName)) return false;
  if (isQaTraffic(input)) return true;
  return isConversionBotSuspect(eventName, input);
}

function getDataLayer(): { push: (...items: Array<Record<string, unknown>>) => unknown } | undefined {
  if (typeof window === 'undefined') return undefined;
  const existing = window.dataLayer;
  if (existing && typeof existing.push === 'function') return existing;
  const created: Array<Record<string, unknown>> = [];
  window.dataLayer = created;
  return created;
}

/**
 * Tags dataLayer + gtag.set. Does not skip page_view or block load.
 * Safe to call more than once; only the first publish writes.
 */
export function publishTrafficType(input?: TrafficInput): TrafficFlags {
  const flags = resolveTrafficFlags(input);
  installInteractionListeners();

  if (typeof window !== 'undefined' && flags.traffic_type === TRAFFIC_TYPE_QA) {
    window.__playfulQa = 1;
  }

  if (published) return flags;
  published = true;

  const dataLayer = getDataLayer();
  dataLayer?.push({
    traffic_type: flags.traffic_type,
    bot_suspect: flags.bot_suspect,
  });

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', {
      traffic_type: flags.traffic_type,
      bot_suspect: flags.bot_suspect,
    });
  }

  return flags;
}

export function resetTrafficTypeForTests(): void {
  interacted = false;
  listenersInstalled = false;
  published = false;
}
