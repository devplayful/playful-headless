'use client';

import { isProductionAnalyticsHostname } from './production-tags.ts';

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
  if (!isProductionAnalyticsHostname(window.location.hostname)) return;

  try {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (typeof window.gtag === 'function') {
      if (gaId) {
        window.gtag('config', gaId, { page_path: path });
        return;
      }
      window.gtag('event', 'page_view', { page_path: path });
      return;
    }

    if (!window.dataLayer || typeof window.dataLayer.push !== 'function') return;
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
    });
  } catch {
    // Absent or broken gtag/GTM must never break client navigation.
  }
}
