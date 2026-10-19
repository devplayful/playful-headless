export const HIGHLEVEL_EXTERNAL_TRACKING_SRC = 'https://api.playfulagency.com/js/external-tracking.js';
export const HIGHLEVEL_CHAT_WIDGET_LOADER = 'https://widgets.leadconnectorhq.com/loader.js';
export const HIGHLEVEL_CHAT_WIDGET_ID = '67ac6d90a81d1c5969d763e7';

/** Official GHL inline form embed (iframe + form_embed.js). */
export const HIGHLEVEL_FORM_WIDGET_ORIGIN = 'https://api.leadconnectorhq.com';
export const HIGHLEVEL_FORM_EMBED_SCRIPT = 'https://link.msgsndr.com/js/form_embed.js';

export function highLevelFormWidgetSrc(formId: string): string {
  const id = formId.trim();
  return `${HIGHLEVEL_FORM_WIDGET_ORIGIN}/widget/form/${id}`;
}

export function highLevelScriptPolicy(externalTrackingEnabled: boolean) {
  return {
    externalTracking: externalTrackingEnabled,
    chatWidget: true,
  } as const;
}
