'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { sendSpaPageView, spaPagePath } from '@/lib/analytics/spa-page-view';

/**
 * Invisible client tracker. The document-load page_view is sent by gtag config;
 * this only fires on subsequent App Router navigations (pathname + search).
 */
export default function AnalyticsSpaPageView() {
  const pathname = usePathname();
  const skipInitialLoad = useRef(true);

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search.slice(1) : '';
    const path = spaPagePath(pathname, search);
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    sendSpaPageView(path);
  }, [pathname]);

  return null;
}
