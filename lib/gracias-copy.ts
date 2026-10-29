/** /gracias copy by conversion type (Ale 28 oct + propuestas 29 oct 2026). */

export const GRACIAS_LEAD_H1 = '¡Recibimos tu caso!';

export const GRACIAS_SCHEDULE_H1 = 'Tu reunión ya está confirmada';

export const GRACIAS_SCHEDULE_BODY =
  'En la reunión, de 30 a 40 minutos, revisamos el proyecto con tu equipo y te decimos qué plataforma, qué integraciones y qué fases necesita el canal. Con eso preparamos el presupuesto y te lo presentamos en otra reunión, unos días después.';

export const GRACIAS_LEAD_CTA_LABEL = 'Cumplo estas condiciones: agendar sesión';

export const GRACIAS_SCHEDULE_CTA_LABEL = 'Volver al inicio';

export const GRACIAS_SCHEDULE_CTA_HREF = '/';

export const GRACIAS_LEAD_CTA_HREF = '/reunion-playful';

export function isScheduleThanksConv(conv: string | undefined): boolean {
  return conv === 'Schedule';
}
