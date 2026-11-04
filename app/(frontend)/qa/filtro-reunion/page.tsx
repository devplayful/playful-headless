import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { qaFiltroCalendarId, qaFiltroRouteEnabled } from '@/lib/qa-filtro/constants';
import QaFiltroReunionClient from './QaFiltroReunionClient';

export const metadata: Metadata = {
  title: 'QA filtro reunión (preview)',
  robots: { index: false, follow: false },
};

export default function QaFiltroReunionPage() {
  if (!qaFiltroRouteEnabled()) {
    notFound();
  }

  return <QaFiltroReunionClient calendarId={qaFiltroCalendarId()} />;
}
