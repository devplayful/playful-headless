'use client';

import { useEffect } from 'react';
import { pushBookAppointmentOnce } from '@/lib/analytics/book-appointment';

/**
 * Invisible tracker for /gracias?conv=Schedule. Pushes book_appointment to
 * dataLayer once per booking. Does not change gtag loading.
 */
export default function BookAppointmentTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    pushBookAppointmentOnce({ search: window.location.search });
  }, []);

  return null;
}
