'use client';

import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import {
  BOOKING_HREF,
  buildBookingHrefFromLocation,
} from '@/utils/booking';

type BookingLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href?: string;
};

export default function BookingLink({
  href = BOOKING_HREF,
  children,
  ...props
}: BookingLinkProps) {
  const [resolved, setResolved] = useState(href);

  useEffect(() => {
    setResolved(buildBookingHrefFromLocation(window.location, document.referrer, href));
  }, [href]);

  return (
    <a href={resolved} {...props}>
      {children}
    </a>
  );
}
