import type { NextRequest } from 'next/server';
import { CALIFICACION_DRY_RUN_HEADER } from './constants.ts';

/** Preview/dev never llama a GHL; en producción solo con cabecera explícita (tests). */
export function calificacionApiDryRun(
  request: NextRequest,
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  if (env.VERCEL_ENV !== 'production') return true;
  return request.headers.get(CALIFICACION_DRY_RUN_HEADER) === '1';
}
