import { isBookingHref } from '../../utils/booking-attribution.ts';
import { GTAG_EVENT_TIMEOUT_MS, sendGtagEvent } from './gtag-event.ts';

export const CTA_REUNION_EVENT = 'cta_reunion_click';
export const CTA_CONTACT_EVENT = 'cta_contact_click';
export const CTA_TEXT_MAX = 100;
export const CTA_EVENT_TIMEOUT_MS = GTAG_EVENT_TIMEOUT_MS;

export type CtaEventName = typeof CTA_REUNION_EVENT | typeof CTA_CONTACT_EVENT;

export type CtaClickParams = {
  page_path: string;
  cta_section: string;
  cta_text: string;
  link_url: string;
};

const CONTACT_PATHS = new Set([
  '/contactar-agencia-de-marketing-digital',
  '/contacto',
  '/contactanos',
]);

const GHL_BOOKING_HOSTS = [
  'gohighlevel.com',
  'leadconnectorhq.com',
  'msgsndr.com',
  'api.playfulagency.com',
];

const GHL_BOOKING_PATH = /\/widget\/bookings?\//i;
const GHL_CALENDAR_PATH = /\/calendar(?:\/|$)/i;
const WHATSAPP_HOSTS = new Set([
  'wa.me',
  'api.whatsapp.com',
  'whatsapp.com',
]);

function parseHref(href: string): URL | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('javascript:') || trimmed === '#') {
    return null;
  }
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    return absolute.startsWith('http') || /^[a-z][a-z0-9+.-]*:/i.test(absolute)
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
  } catch {
    return null;
  }
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function hostMatches(hostname: string, roots: readonly string[]): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  if (!host) return false;
  return roots.some((root) => host === root || host.endsWith(`.${root}`));
}

function isWhatsAppContactHref(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (!WHATSAPP_HOSTS.has(host)) return false;
  if (url.searchParams.get('phone')?.replace(/\D/g, '')) return true;
  return /\/\d{7,}/.test(url.pathname);
}

function isMailtoContactHref(href: string): boolean {
  if (!/^mailto:/i.test(href.trim())) return false;
  const rest = href.trim().slice(7);
  const address = rest.split('?')[0].trim();
  return address.length > 0;
}

function isDirectGhlBookingHref(url: URL): boolean {
  if (!hostMatches(url.hostname, GHL_BOOKING_HOSTS)) return false;
  return GHL_BOOKING_PATH.test(url.pathname) || GHL_CALENDAR_PATH.test(url.pathname);
}

export function classifyCtaHref(href: string): CtaEventName | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('javascript:')) {
    return null;
  }

  if (/^tel:/i.test(trimmed)) return CTA_CONTACT_EVENT;
  if (/^mailto:/i.test(trimmed)) {
    return isMailtoContactHref(trimmed) ? CTA_CONTACT_EVENT : null;
  }

  if (isBookingHref(trimmed)) return CTA_REUNION_EVENT;

  const url = parseHref(trimmed);
  if (!url) return null;

  if (isDirectGhlBookingHref(url)) return CTA_REUNION_EVENT;
  if (isWhatsAppContactHref(url)) return CTA_CONTACT_EVENT;
  if (CONTACT_PATHS.has(normalizePath(url.pathname))) return CTA_CONTACT_EVENT;

  return null;
}

export function clipCtaText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, CTA_TEXT_MAX);
}

export function resolveCtaSection(hints: {
  dataCtaSection?: string | null;
  closestId?: string | null;
  recognizableSection?: string | null;
}): string {
  const fromAttr = hints.dataCtaSection?.trim();
  if (fromAttr) return fromAttr;
  const fromId = hints.closestId?.trim();
  if (fromId) return fromId;
  const fromClass = hints.recognizableSection?.trim();
  if (fromClass) return fromClass;
  return 'unknown';
}

export function buildCtaClickParams(input: {
  href: string;
  pagePath: string;
  textContent?: string | null;
  ariaLabel?: string | null;
  dataCtaSection?: string | null;
  closestId?: string | null;
  recognizableSection?: string | null;
}): CtaClickParams {
  const visible = clipCtaText(input.textContent || '');
  const fallback = clipCtaText(input.ariaLabel || '');
  return {
    page_path: input.pagePath || 'unknown',
    cta_section: resolveCtaSection(input),
    cta_text: visible || fallback,
    link_url: input.href,
  };
}

export function collectCtaClick(input: {
  href: string;
  pagePath: string;
  textContent?: string | null;
  ariaLabel?: string | null;
  dataCtaSection?: string | null;
  closestId?: string | null;
  recognizableSection?: string | null;
}): { event: CtaEventName; params: CtaClickParams } | null {
  const event = classifyCtaHref(input.href);
  if (!event) return null;
  return {
    event,
    params: buildCtaClickParams(input),
  };
}

export function isModifiedOrNewTabClick(input: {
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  target?: string | null;
  download?: boolean;
}): boolean {
  if ((input.button ?? 0) !== 0) return true;
  if (input.metaKey || input.ctrlKey || input.shiftKey || input.altKey) return true;
  const target = (input.target || '').toLowerCase();
  if (target === '_blank' || target === '_new') return true;
  return Boolean(input.download);
}

export function canUseBeaconTransport(
  nav: { sendBeacon?: unknown } | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator,
): boolean {
  return typeof nav?.sendBeacon === 'function';
}

export function shouldHoldCtaNavigation(input: {
  modifiedOrNewTab: boolean;
  canBeacon: boolean;
}): boolean {
  if (input.modifiedOrNewTab) return false;
  return !input.canBeacon;
}

export function sendCtaEvent(
  eventName: CtaEventName,
  params: CtaClickParams,
  options?: { onDone?: () => void },
): void {
  sendGtagEvent(
    eventName,
    {
      page_path: params.page_path,
      cta_section: params.cta_section,
      cta_text: params.cta_text,
      link_url: params.link_url,
      transport_type: 'beacon',
    },
    { onDone: options?.onDone, timeoutMs: CTA_EVENT_TIMEOUT_MS },
  );
}

export function ctaSectionHintsFromElement(el: Element): {
  dataCtaSection: string | null;
  closestId: string | null;
  recognizableSection: string | null;
} {
  const attributed = el.closest('[data-cta-section]');
  const dataCtaSection = attributed?.getAttribute('data-cta-section') ?? null;
  const withId = el.closest('[id]');
  const closestId = withId?.id ?? null;

  let recognizableSection: string | null = null;
  if (el.closest('header')) recognizableSection = 'header';
  else if (el.closest('footer')) recognizableSection = 'footer';
  else {
    const classed = el.closest('[class]');
    const className = typeof classed?.className === 'string' ? classed.className : '';
    if (/\bhero\b/i.test(className)) recognizableSection = 'hero';
    else if (/\bcta\b/i.test(className)) recognizableSection = 'cta';
  }

  return { dataCtaSection, closestId, recognizableSection };
}

export function pagePathFromLocation(
  loc: { pathname?: string; search?: string } = typeof window === 'undefined' ? {} : window.location,
): string {
  const pathname = loc.pathname || '/';
  const search = (loc.search || '').replace(/^\?/, '');
  return search ? `${pathname}?${search}` : pathname;
}

export function findCtaAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest('a');
}

export function handleCtaDocumentClick(event: MouseEvent): void {
  if (typeof window === 'undefined') return;
  const anchor = findCtaAnchor(event.target);
  if (!anchor) return;

  const rawHref = anchor.getAttribute('href') || anchor.href;
  if (!rawHref) return;

  const collected = collectCtaClick({
    href: rawHref,
    pagePath: pagePathFromLocation(),
    textContent: anchor.textContent,
    ariaLabel: anchor.getAttribute('aria-label'),
    ...ctaSectionHintsFromElement(anchor),
  });
  if (!collected) return;

  const modifiedOrNewTab = isModifiedOrNewTabClick({
    button: event.button,
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    target: anchor.getAttribute('target'),
    download: anchor.hasAttribute('download'),
  });
  const hold = shouldHoldCtaNavigation({
    modifiedOrNewTab,
    canBeacon: canUseBeaconTransport(),
  });

  if (!hold) {
    sendCtaEvent(collected.event, collected.params);
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  let settled = false;
  const go = () => {
    if (settled) return;
    settled = true;
    window.location.assign(anchor.href);
  };

  sendCtaEvent(collected.event, collected.params, { onDone: go });
  window.setTimeout(go, CTA_EVENT_TIMEOUT_MS);
}
