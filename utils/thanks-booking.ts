export type ThanksFit = 'priority' | 'transition' | 'review';

export const THANKS_LEAD_PATH = '/gracias?conv=Lead';
export const THANKS_PRIORITY_PATH = '/gracias?conv=Lead&fit=priority';

export function thanksBookingAllowed(params: {
  fit?: string | string[] | null;
}): boolean {
  const fit = Array.isArray(params.fit) ? params.fit[0] : params.fit;
  return fit === 'priority';
}

export function contactThanksHref(fit: ThanksFit): string {
  return fit === 'priority' ? THANKS_PRIORITY_PATH : THANKS_LEAD_PATH;
}

export function qualificationLevelFromResponse(
  value: unknown,
  fallback: ThanksFit,
): ThanksFit {
  if (value === 'priority' || value === 'transition' || value === 'review') {
    return value;
  }
  return fallback;
}
