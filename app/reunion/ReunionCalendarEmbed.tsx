'use client';

import { buildQaFiltroCalendarWidgetSrc } from '@/lib/qa-filtro/calendar-widget-url';
import { PROD_FILTRO_CALENDAR_ID } from '@/lib/calificacion/constants';

export default function ReunionCalendarEmbed() {
  const src = buildQaFiltroCalendarWidgetSrc(PROD_FILTRO_CALENDAR_ID);

  return (
    <iframe
      title="Calendario de reunión Playful"
      src={src}
      className="reunion-calendar-iframe w-full rounded border border-neutral-200"
      data-reunion-calendar="embedded"
    />
  );
}
