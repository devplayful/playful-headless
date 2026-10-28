'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { bookingHrefFromPageSearch, isBookingHref } from '@/utils/booking-attribution';

/** Rewrites booking anchors to /reunion-playful plus the current page query. */
export default function BookingQueryPropagator() {
  const pathname = usePathname();

  useEffect(() => {
    // /links buttons keep a fixed href. Incoming bio UTM must not overwrite them.
    if (pathname === '/links') return;

    const search = typeof window !== 'undefined' ? window.location.search : '';
    const nextHref = bookingHrefFromPageSearch(search || '');

    const applyHref = (anchor: HTMLAnchorElement) => {
      const href = anchor.getAttribute('href') || '';
      if (anchor.hasAttribute('data-links-fixed-href')) return;
      if (!isBookingHref(href) || href === nextHref) return;
      anchor.setAttribute('href', nextHref);
    };

    const rewrite = (root: ParentNode) => {
      Array.from(root.querySelectorAll('a[href]')).forEach((node) => {
        applyHref(node as HTMLAnchorElement);
      });
    };

    rewrite(document);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLAnchorElement) {
          applyHref(mutation.target);
          return;
        }
        Array.from(mutation.addedNodes).forEach((node) => {
          if (node instanceof HTMLAnchorElement) {
            applyHref(node);
          } else if (node instanceof Element || node instanceof DocumentFragment) {
            rewrite(node);
          }
        });
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
