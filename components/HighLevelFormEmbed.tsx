'use client';

import { useEffect, useRef } from 'react';
import { ATTRIBUTION_COOKIE_FIRST, ATTRIBUTION_COOKIE_LAST } from '@/lib/contact/attribution';
import {
  HIGHLEVEL_FORM_EMBED_SCRIPT,
  highLevelFormWidgetSrc,
} from '@/lib/highlevel/external-tracking';
import {
  applyBookingIframeAttrToSrc,
  BOOKING_IFRAME_ATTR_STORAGE_KEY,
  resolveBookingIframeAttr,
  type BookingIframeAttrValues,
} from '@/utils/booking-widget-bridge';

type HighLevelFormEmbedProps = {
  formId: string;
  title: string;
  height?: number;
};

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

function currentValues(): BookingIframeAttrValues {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return resolveBookingIframeAttr({
    search,
    stored: readStoredAttr(),
    lastCookie: readCookie(ATTRIBUTION_COOKIE_LAST),
    firstCookie: readCookie(ATTRIBUTION_COOKIE_FIRST),
  });
}

function ensureFormEmbedScript(): void {
  if (document.querySelector(`script[src="${HIGHLEVEL_FORM_EMBED_SCRIPT}"]`)) return;
  const script = document.createElement('script');
  script.src = HIGHLEVEL_FORM_EMBED_SCRIPT;
  script.async = true;
  document.body.appendChild(script);
}

/**
 * Official GHL inline form: iframe `/widget/form/{id}` + form_embed.js.
 * Stamps visit UTM/gclid/fbclid on the iframe src the same way booking widgets do.
 */
export default function HighLevelFormEmbed({
  formId,
  title,
  height = 720,
}: HighLevelFormEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeId = `inline-${formId}`;
  const baseSrc = highLevelFormWidgetSrc(formId);

  useEffect(() => {
    ensureFormEmbedScript();
    const iframe = iframeRef.current;
    if (!iframe) return;
    const next = applyBookingIframeAttrToSrc(iframe.getAttribute('src') || baseSrc, currentValues());
    if (next && next !== iframe.getAttribute('src')) iframe.setAttribute('src', next);
  }, [baseSrc]);

  return (
    <div
      className="w-full overflow-hidden rounded-[32px] bg-white"
      style={{ minHeight: height }}
      data-ghl-form={formId}
    >
      <iframe
        ref={iframeRef}
        src={baseSrc}
        id={iframeId}
        title={title}
        style={{ width: '100%', height: '100%', minHeight: height, border: 'none', borderRadius: 3 }}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name={title}
        data-height={String(height)}
        data-layout-iframe-id={iframeId}
        data-form-id={formId}
      />
    </div>
  );
}
