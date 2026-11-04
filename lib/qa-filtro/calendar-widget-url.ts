import { QA_FILTRO_CALENDAR_ID } from './ghl-fields.ts';

const BOOKING_WIDGET_ORIGIN = 'https://api.leadconnectorhq.com';

/**
 * Parámetros probados en el embed de booking GHL (preview QA).
 * Si free-slots sigue en UTC, el ajuste depende del calendario en GHL (Ops).
 */
export function buildQaFiltroCalendarWidgetSrc(calendarId?: string): string {
  const resolvedId = calendarId?.trim() || QA_FILTRO_CALENDAR_ID;
  const url = new URL(`${BOOKING_WIDGET_ORIGIN}/widget/booking/${encodeURIComponent(resolvedId)}`);
  url.searchParams.set('timezone', 'Europe/Madrid');
  url.searchParams.set('lang', 'es');
  return url.toString();
}
