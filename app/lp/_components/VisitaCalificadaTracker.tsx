'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { mountVisitaCalificada } from '@/lib/analytics/visita-calificada';

/**
 * Invisible /lp/* tracker for Meta VisitaCalificada (plan B2).
 * Mounted only from app/lp/layout — not the root layout.
 */
export default function VisitaCalificadaTracker() {
  const pathname = usePathname();

  useEffect(() => {
    return mountVisitaCalificada({ pathname });
  }, [pathname]);

  return null;
}
