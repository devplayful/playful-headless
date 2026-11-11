'use client';

import { useEffect } from 'react';
import {
  normalizeThankYouSearch,
  pushBookAppointmentOnce,
} from '@/lib/analytics/book-appointment';
import { clearBookingIntent } from '@/lib/analytics/booking-abandon';

/**
 * Invisible tracker for /gracias?conv=Schedule. Sends book_appointment via gtag
 * (GA4 G-WH76RQWSCT) once per booking and clears booking-abandon intent.
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
    const trackingSearch = normalized || search;
    pushBookAppointmentOnce({
      search: trackingSearch,
      pathname: window.location.pathname,
    });
  }, []);

  return null;
}
