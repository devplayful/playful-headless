import { QA_FILTRO_CALENDAR_ID } from './ghl-fields.ts';

/** Corte provisional de facturación (USD). Cambiar a 50_000 cuando confirme José. */
export const QA_FILTRO_REVENUE_CUTOFF_USD = 10_000;

export const QA_FILTRO_FORM_ID = 'qa-filtro-reunion';

export const QA_FILTRO_BLOG_GUIDE_HREF =
  '/blog/pautas-digitales/guia-para-hacer-marketing-digital';

export function qaFiltroCalendarId(env: Readonly<Record<string, string | undefined>> = process.env): string {
  const override = (env.QA_FILTRO_CALENDAR_ID || env.NEXT_PUBLIC_QA_FILTRO_CALENDAR_ID || '').trim();
  return override || QA_FILTRO_CALENDAR_ID;
}

export function qaFiltroRouteEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.VERCEL_ENV !== 'production';
}
