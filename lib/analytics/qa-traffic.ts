/**
 * QA traffic marker for live checks.
 * GA4 does not expose user-agent, so desktop QA from Spain must also use
 * `?qa=1`. PlayfulQA/1.0 is a second client-side stop.
 */

export const QA_PARAM = 'qa';
export const QA_VALUE = '1';
export const PLAYFUL_QA_UA = 'PlayfulQA/1.0';

export function isQaSearch(search: string): boolean {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw).get(QA_PARAM) === QA_VALUE;
}

export function isPlayfulQaUserAgent(ua: string): boolean {
  return ua.includes(PLAYFUL_QA_UA);
}

/**
 * GA4 internal-traffic marker (CEO GO 21 oct 9:42): QA hits are sent, not
 * dropped, with traffic_type=internal so GA4's internal-traffic filter can
 * exclude or isolate them.
 */
export const QA_TRAFFIC_TYPE = 'internal';

export function withQaTrafficType<T extends Record<string, unknown>>(
  params: T,
  qa: boolean = isQaTraffic(),
): T & { traffic_type?: string } {
  return qa ? { ...params, traffic_type: QA_TRAFFIC_TYPE } : params;
}

export function isQaTraffic(input?: {
  search?: string;
  userAgent?: string;
}): boolean {
  const search =
    input?.search ??
    (typeof window === 'undefined' ? '' : window.location?.search || '');
  const ua =
    input?.userAgent ??
    (typeof navigator === 'undefined' ? '' : navigator.userAgent || '');
  return isQaSearch(search) || isPlayfulQaUserAgent(ua);
}
