'use client';

import { useEffect } from 'react';
import { handleCtaDocumentClick } from '@/lib/analytics/cta-click';

/**
 * Single delegated listener for booking and contact CTAs.
 * Fires before navigation; does not change copy or layout.
 */
export default function CtaClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      handleCtaDocumentClick(event);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
