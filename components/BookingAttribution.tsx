'use client';

import { useEffect } from 'react';
import { enhanceBookingAnchors } from '@/utils/booking';

export default function BookingAttribution({
  rootSelector,
}: {
  rootSelector?: string;
}) {
  useEffect(() => {
    const root = rootSelector ? document.querySelector(rootSelector) : document;
    if (!root) return;
    enhanceBookingAnchors(root, window.location, document.referrer);
  }, [rootSelector]);

  return null;
}
