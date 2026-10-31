'use client';

import { useEffect } from 'react';
import {
  normalizeThankYouSearch,
  pushBookAppointmentOnce,
} from '@/lib/analytics/book-appointment';
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
    const search = window.location.search;
    const normalized = normalizeThankYouSearch(search);
    if (normalized && normalized !== search) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${normalized}`);
    }
    pushBookAppointmentOnce({ search: normalized || search });
  }, []);

  return null;
}
