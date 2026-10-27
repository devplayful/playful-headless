'use client';

import type { MouseEvent, ReactNode } from 'react';
import { lpMetaBookingAnchorHref, lpMetaBookingHrefFromSearch } from '../_lib/meta-booking-href';

type BookingCtaProps = {
  dataCta: string;
  className: string;
  children: ReactNode;
  search?: string;
};

/** Route-local CTA. Visible href keeps the full query; hop path is not isBookingHref. */
export default function BookingCta({ dataCta, className, children, search = '' }: BookingCtaProps) {
  const q = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  const href = lpMetaBookingAnchorHref(q);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    window.location.assign(lpMetaBookingHrefFromSearch(window.location.search || q));
  };

  return (
    <a href={href} data-cta={dataCta} data-lp-meta-booking="1" className={className} onClick={onClick}>
      {children}
    </a>
  );
}
