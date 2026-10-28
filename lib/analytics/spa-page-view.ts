'use client';

import { isQaTraffic } from './qa-traffic.ts';
import { resolveTrafficFlags } from './traffic-type.ts';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function spaPagePath(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * Sends a GA4 page_view for client-side Next navigations. Prefer gtag (already
 * loaded on the site); fall back to dataLayer if gtag is not present.
 */
export function sendSpaPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (isQaTraffic()) return;

  const flags = resolveTrafficFlags();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag === 'function') {
    if (gaId) {
      window.gtag('config', gaId, {
        page_path: path,
        traffic_type: flags.traffic_type,
        bot_suspect: flags.bot_suspect,
      });
      return;
    }
    window.gtag('event', 'page_view', {
      page_path: path,
      traffic_type: flags.traffic_type,
      bot_suspect: flags.bot_suspect,
    });
    return;
  }

  if (!window.dataLayer || typeof window.dataLayer.push !== 'function') return;
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    traffic_type: flags.traffic_type,
    bot_suspect: flags.bot_suspect,
  });
}
