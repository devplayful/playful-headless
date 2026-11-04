import { PROD_FILTRO_CALENDAR_ID } from './constants.ts';

const LEADCONNECTOR_BOOKING_ORIGIN = 'https://api.leadconnectorhq.com';

/** Embed del calendario de producción (solo /reunion). */
export function buildCalificacionCalendarWidgetSrc(calendarId?: string): string {
  const resolvedId = calendarId?.trim() || PROD_FILTRO_CALENDAR_ID;
  const url = new URL(
    `${LEADCONNECTOR_BOOKING_ORIGIN}/widget/booking/${encodeURIComponent(resolvedId)}`,
  );
  url.searchParams.set('timezone', 'Europe/Madrid');
  url.searchParams.set('lang', 'es');
  return url.toString();
}
