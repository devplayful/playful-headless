'use client';

import { QA_FILTRO_CALENDAR_WIDGET_URL } from '@/lib/qa-filtro/ghl-fields';

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

  const src = calendarId === 'AR82Tqlm75JTU8QMk5ID'
    ? QA_FILTRO_CALENDAR_WIDGET_URL
    : `https://api.leadconnectorhq.com/widget/booking/${encodeURIComponent(calendarId)}`;

  return (
    <iframe
      title="Calendario de prueba QA"
      src={src}
      className="min-h-[640px] w-full rounded border border-neutral-200"
      data-qa-calendar="embedded"
    />
  );
}
