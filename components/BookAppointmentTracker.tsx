'use client';

import { useEffect } from 'react';
import {
  persistPaBookingCookies,
  scheduleAdsBookingConversion,
} from '@/lib/analytics/ads-booking-conversion';
import { pushBookAppointmentOnce } from '@/lib/analytics/book-appointment';
import { clearBookingIntent } from '@/lib/analytics/booking-abandon';

/**
 * Invisible tracker for /gracias. Saves pa_booking_* cookies from the query,
 * pushes book_appointment once on conv=Schedule, and queues the Google Ads
 * conversion at that same point. ?qa=1 skips the conversion and does not
 * load gtag. Does not change layout, header, footer or global CSS.
 */
export default function BookAppointmentTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    persistPaBookingCookies({
      search,
      hostname: window.location.hostname,
    });
    clearBookingIntent();
    pushBookAppointmentOnce({ search });
    return scheduleAdsBookingConversion();
  }, []);

  return null;
}
