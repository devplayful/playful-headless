import type { ReactNode } from 'react';
import { lpMetaBookingAnchorHref } from '../_lib/meta-booking-href';

type BookingCtaProps = {
  dataCta: string;
  className: string;
  children: ReactNode;
  search?: string;
};

/** Server CTA. Visible hop href; click handled by the route-local script in Landing. */
export default function BookingCta({ dataCta, className, children, search = '' }: BookingCtaProps) {
  const q = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return (
    <a href={lpMetaBookingAnchorHref(q)} data-cta={dataCta} data-lp-meta-booking="1" className={className}>
      {children}
    </a>
  );
}
