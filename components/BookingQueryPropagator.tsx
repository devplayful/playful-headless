'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { bookingHrefFromPageSearch, isBookingHref } from '@/utils/booking-attribution';

/** Rewrites booking anchors to /reunion-playful plus the current page query. */
export default function BookingQueryPropagator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const nextHref = bookingHrefFromPageSearch(search ? `?${search}` : '');

    const rewrite = (root: ParentNode) => {
      const anchors = root.querySelectorAll('a[href]');
      for (const node of anchors) {
        const anchor = node as HTMLAnchorElement;
        const href = anchor.getAttribute('href') || '';
        if (!isBookingHref(href) || href === nextHref) continue;
        anchor.setAttribute('href', nextHref);
      }
    };

    rewrite(document);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLAnchorElement) {
          const href = mutation.target.getAttribute('href') || '';
          if (isBookingHref(href) && href !== nextHref) {
            mutation.target.setAttribute('href', nextHref);
          }
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLAnchorElement) {
            const href = node.getAttribute('href') || '';
            if (isBookingHref(href) && href !== nextHref) {
              node.setAttribute('href', nextHref);
            }
          } else if (node instanceof Element || node instanceof DocumentFragment) {
            rewrite(node);
          }
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    });
    return () => observer.disconnect();
  }, [pathname, searchParams]);

  return null;
}
