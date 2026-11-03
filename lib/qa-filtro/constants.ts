import { QA_FILTRO_CALENDAR_ID } from './ghl-fields.ts';

/** Corte provisional de facturación (USD/mes). Umbral mínimo para solicitud pendiente (calendario). */
export const QA_FILTRO_REVENUE_CUTOFF_USD = 50_000;

export const QA_FILTRO_FORM_ID = 'qa-filtro-reunion';

/** Misma URL que FILTRO_REUNION_BLOG_GUIDE_HREF (lib/filtro-reunion/copy.ts). */
export const QA_FILTRO_BLOG_GUIDE_HREF =
  '/blog/pautas-digitales/guia-para-hacer-marketing-digital';

export function qaFiltroCalendarId(env: Readonly<Record<string, string | undefined>> = process.env): string {
  const override = (env.QA_FILTRO_CALENDAR_ID || env.NEXT_PUBLIC_QA_FILTRO_CALENDAR_ID || '').trim();
  return override || QA_FILTRO_CALENDAR_ID;
}

export function qaFiltroRouteEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.VERCEL_ENV !== 'production';
}
