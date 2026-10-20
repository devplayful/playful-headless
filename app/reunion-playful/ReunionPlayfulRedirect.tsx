'use client';

import { useEffect } from 'react';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
} from '@/lib/contact/attribution';
import {
  reunionPlayfulWidgetDestination,
  scheduleReunionPlayfulRedirect,
} from '@/lib/analytics/reunion-playful-redirect';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

/**
 * Same-origin hop: loads layout GA4 (page_view via gtag config), then 302-equivalent
 * client redirect to the GHL widget with attribution query/cookies applied.
 */
export default function ReunionPlayfulRedirect() {
  useEffect(() => {
    const destination = reunionPlayfulWidgetDestination({
      search: window.location.search,
      lastCookie: readCookie(ATTRIBUTION_COOKIE_LAST),
      firstCookie: readCookie(ATTRIBUTION_COOKIE_FIRST),
    });

    return scheduleReunionPlayfulRedirect({
      go: () => {
        window.location.replace(destination);
      },
    });
  }, []);

  return (
    <p className="sr-only" aria-live="polite">
      Redirigiendo al calendario de reservas…
    </p>
  );
}
