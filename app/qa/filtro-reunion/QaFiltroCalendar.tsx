'use client';

import { buildQaFiltroCalendarWidgetSrc } from '@/lib/qa-filtro/calendar-widget-url';

export default function QaFiltroCalendar({ calendarId }: { calendarId: string }) {
  if (!calendarId) {
    return (
      <div
        className="flex min-h-[420px] items-center justify-center rounded border border-dashed border-neutral-400 bg-neutral-100 text-neutral-600"
        data-qa-calendar="pending"
      >
        [Calendario de prueba pendiente]
      </div>
    );
  }

  const src = buildQaFiltroCalendarWidgetSrc(calendarId);

  return (
    <iframe
      title="Calendario de prueba QA"
      src={src}
      className="min-h-[640px] w-full rounded border border-neutral-200"
      data-qa-calendar="embedded"
      data-qa-calendar-src={src}
    />
  );
}
