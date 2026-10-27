'use client';

import type { ReactNode } from 'react';
import { SERVICE_BOOKING_HREF } from '@/utils/booking-attribution';
import { lpMetaBookingHrefFromSearch } from '@/utils/lp-meta-booking';
import { useAdsMetaParams } from './AdsMetaParams';

type AdsMetaBookingLinkProps = {
  dataCta: string;
  className: string;
  children: ReactNode;
};

export default function AdsMetaBookingLink({ dataCta, className, children }: AdsMetaBookingLinkProps) {
  const { search } = useAdsMetaParams();
  const href = lpMetaBookingHrefFromSearch(search ? `?${search}` : '');

  return (
    <a href={href || SERVICE_BOOKING_HREF} data-cta={dataCta} className={className}>
      {children}
    </a>
  );
}
