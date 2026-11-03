'use client';

import { buildCalificacionCalendarWidgetSrc } from '@/lib/calificacion/calendar-widget-url';

export default function ReunionCalendarEmbed() {
  const src = buildCalificacionCalendarWidgetSrc();

  return (
    <iframe
      title="Calendario de reunión Playful"
      src={src}
      className="reunion-calendar-iframe w-full rounded border border-neutral-200 bg-white"
      data-reunion-calendar="embedded"
      loading="eager"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="clipboard-read; clipboard-write"
    />
  );
}
