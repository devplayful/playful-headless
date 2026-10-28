'use client';

import { useEffect } from 'react';
import { pushBookAppointmentOnce } from '@/lib/analytics/book-appointment';
import { clearBookingIntent } from '@/lib/analytics/booking-abandon';

/**
 * Invisible tracker for /gracias?conv=Schedule. Pushes book_appointment to
 * dataLayer once per booking and clears booking-abandon intent.
 * Does not change gtag loading.
 */
export default function BookAppointmentTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    clearBookingIntent();
    pushBookAppointmentOnce({
      search: window.location.search,
      cookie: typeof document === 'undefined' ? '' : document.cookie,
    });
  }, []);

  return null;
}
