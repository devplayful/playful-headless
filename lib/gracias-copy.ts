/** /gracias copy by conversion type (Ale 28 oct 2026 — Schedule only). */

export const GRACIAS_LEAD_H1 = '¡Recibimos tu caso!';

export const GRACIAS_SCHEDULE_H1 = '¡Reunión confirmada!';

export const GRACIAS_LEAD_CTA_LABEL = 'Cumplo estas condiciones: agendar sesión';

export const GRACIAS_SCHEDULE_CTA_LABEL = 'Volver al inicio';

export const GRACIAS_SCHEDULE_CTA_HREF = '/';

export const GRACIAS_LEAD_CTA_HREF = '/reunion-playful';

export function isScheduleThanksConv(conv: string | undefined): boolean {
  return conv === 'Schedule';
}
