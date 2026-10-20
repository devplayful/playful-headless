'use client';

import { useEffect } from 'react';
import { maybeFireBookingAbandon } from '@/lib/analytics/booking-abandon';
import { handleCtaDocumentClick } from '@/lib/analytics/cta-click';

/**
 * Single delegated listener for booking and contact CTAs.
 * Also evaluates booking_abandon on later apex page views.
 * Fires before navigation; does not change copy or layout.
 */
export default function CtaClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      handleCtaDocumentClick(event);
    };
    const onPage = () => {
      maybeFireBookingAbandon();
    };
    onPage();
    document.addEventListener('click', onClick, true);
    window.addEventListener('pageshow', onPage);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pageshow', onPage);
    };
  }, []);

  return null;
}
