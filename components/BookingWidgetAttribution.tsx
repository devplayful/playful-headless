'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ATTRIBUTION_COOKIE_FIRST, ATTRIBUTION_COOKIE_LAST } from '@/lib/contact/attribution';
import {
  applyBookingIframeAttrToSrc,
  BOOKING_IFRAME_ATTR_STORAGE_KEY,
  handleBookingWidgetMessage,
  isBookingWidgetIframeSrc,
  resolveBookingIframeAttr,
  serializeBookingIframeAttr,
  type BookingIframeAttrValues,
} from '@/utils/booking-widget-bridge';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function readStoredAttr(): string {
  try {
    return window.sessionStorage.getItem(BOOKING_IFRAME_ATTR_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeStoredAttr(values: BookingIframeAttrValues): void {
  try {
    window.sessionStorage.setItem(BOOKING_IFRAME_ATTR_STORAGE_KEY, serializeBookingIframeAttr(values));
  } catch {
    // Storage must never block the page.
  }
}

function currentValues(search: string): BookingIframeAttrValues {
  return resolveBookingIframeAttr({
    search,
    stored: readStoredAttr(),
    lastCookie: readCookie(ATTRIBUTION_COOKIE_LAST),
    firstCookie: readCookie(ATTRIBUTION_COOKIE_FIRST),
  });
}

function bindBookingIframes(values: BookingIframeAttrValues): void {
  Array.from(document.querySelectorAll('iframe[src]')).forEach((node) => {
    const iframe = node as HTMLIFrameElement;
    const src = iframe.getAttribute('src') || '';
    if (!isBookingWidgetIframeSrc(src)) return;
    const next = applyBookingIframeAttrToSrc(src, values);
    if (next && next !== src) iframe.setAttribute('src', next);
  });
}

/**
 * Persist visit utm, fbclid and gclid and, if a GHL booking iframe appears, put
 * them on its src and answer fetch-query-params. Confirm has no email/contactId
 * in GHL's msgsndr-booking-complete, so this component does not upsert.
 */
export default function BookingWidgetAttribution() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const valuesRef = useRef<BookingIframeAttrValues>({});

  useEffect(() => {
    const search = searchParams.toString();
    const values = currentValues(search ? `?${search}` : '');
    valuesRef.current = values;
    writeStoredAttr(values);
    bindBookingIframes(values);

    const observer = new MutationObserver((mutations) => {
      let shouldBind = false;
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes'
          && mutation.target instanceof HTMLIFrameElement
          && mutation.attributeName === 'src'
        ) {
          shouldBind = true;
          return;
        }
        Array.from(mutation.addedNodes).forEach((node) => {
          if (node instanceof HTMLIFrameElement) {
            shouldBind = true;
          } else if (node instanceof Element || node instanceof DocumentFragment) {
            if (node.querySelector?.('iframe[src]')) shouldBind = true;
          }
        });
      });
      if (shouldBind) bindBookingIframes(valuesRef.current);
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    const onMessage = (event: MessageEvent) => {
      const handled = handleBookingWidgetMessage({
        origin: event.origin,
        data: event.data,
        pageUrl: window.location.href,
        referrer: document.referrer,
        values: valuesRef.current,
      });
      if (!handled) return;
      if (handled.kind === 'query-params' && event.source) {
        (event.source as Window).postMessage(handled.reply, handled.targetOrigin);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      observer.disconnect();
      window.removeEventListener('message', onMessage);
    };
  }, [pathname, searchParams]);

  return null;
}
