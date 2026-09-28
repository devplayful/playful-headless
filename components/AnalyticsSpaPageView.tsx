'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { sendSpaPageView, spaPagePath } from '@/lib/analytics/spa-page-view';

/**
 * Invisible client tracker. The document-load page_view is sent by gtag config;
 * this only fires on subsequent App Router navigations (pathname + search).
 */
export default function AnalyticsSpaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipInitialLoad = useRef(true);

  useEffect(() => {
    const path = spaPagePath(pathname, searchParams.toString());
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    sendSpaPageView(path);
  }, [pathname, searchParams]);

  return null;
}
