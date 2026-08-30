export const CONTACT_FORM_PATH = '/contactar-agencia-de-marketing-digital';
export const HIGHLEVEL_EXTERNAL_TRACKING_SRC = 'https://api.playfulagency.com/js/external-tracking.js';
export const HIGHLEVEL_CHAT_WIDGET_LOADER = 'https://widgets.leadconnectorhq.com/loader.js';
export const HIGHLEVEL_CHAT_WIDGET_ID = '67ac6d90a81d1c5969d763e7';

export function shouldLoadHighLevelExternalTracking(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized !== CONTACT_FORM_PATH;
}
