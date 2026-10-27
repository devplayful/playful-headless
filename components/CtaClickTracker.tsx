'use client';

import { useEffect } from 'react';
import { scheduleBookingAbandonUntilGaReady } from '@/lib/analytics/booking-abandon';
import { handleCtaDocumentClick } from '@/lib/analytics/cta-click';
import { publishTrafficType } from '@/lib/analytics/traffic-type';

/**
 * Single delegated listener for booking and contact CTAs.
 * Also evaluates booking_abandon on later apex page views, after GA4 config.
 * Fires before navigation; does not change copy or layout.
 */
export default function CtaClickTracker() {
  useEffect(() => {
    publishTrafficType();
    const onClick = (event: MouseEvent) => {
      handleCtaDocumentClick(event);
    };
    let stopAbandon = scheduleBookingAbandonUntilGaReady();
    const onPage = () => {
      stopAbandon();
      stopAbandon = scheduleBookingAbandonUntilGaReady();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('pageshow', onPage);
    return () => {
      stopAbandon();
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pageshow', onPage);
    };
  }, []);

  return null;
}
