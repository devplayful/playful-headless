import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  deserializeAttributionCookie,
  preferStoredAttribution,
} from '../contact/attribution.ts';
import { normalizeAttribution } from '../contact/normalize.ts';
import type { ContactAttribution } from '../contact/types.ts';
import type { NextRequest } from 'next/server';

export function calificacionAttributionFromRequest(
  body: Record<string, unknown>,
  request: NextRequest,
): {
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
} {
  const cookieFirst = deserializeAttributionCookie(
    request.cookies.get(ATTRIBUTION_COOKIE_FIRST)?.value,
  );
  const cookieLast = deserializeAttributionCookie(
    request.cookies.get(ATTRIBUTION_COOKIE_LAST)?.value,
  );
  const submittedOriginal = normalizeAttribution(body.originalAttribution);
  const submittedRecent = normalizeAttribution(body.recentAttribution);
  return {
    originalAttribution: preferStoredAttribution(cookieFirst, submittedOriginal),
    recentAttribution: preferStoredAttribution(cookieLast, submittedRecent),
  };
}
