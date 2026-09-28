'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { persistVisitAttribution } from '@/lib/contact/client-attribution';

/** Invisible first/last-touch capture. Must not render UI. */
export default function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    persistVisitAttribution();
  }, [pathname]);

  return null;
}
