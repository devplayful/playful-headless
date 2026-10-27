import type { ReactNode } from 'react';
import { lpMetaBookingAnchorHref } from '../_lib/meta-booking-href';

type BookingCtaProps = {
  dataCta: string;
  className: string;
  children: ReactNode;
};

/** Server CTA. Live query is written by the route-local script; click also uses location.search. */
export default function BookingCta({ dataCta, className, children }: BookingCtaProps) {
  return (
    <a href={lpMetaBookingAnchorHref('')} data-cta={dataCta} data-lp-meta-booking="1" className={className}>
      {children}
    </a>
  );
}
