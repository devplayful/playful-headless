export const HIGHLEVEL_EXTERNAL_TRACKING_SRC = 'https://api.playfulagency.com/js/external-tracking.js';
export const HIGHLEVEL_CHAT_WIDGET_LOADER = 'https://widgets.leadconnectorhq.com/loader.js';
export const HIGHLEVEL_CHAT_WIDGET_ID = '67ac6d90a81d1c5969d763e7';

export function highLevelScriptPolicy(externalTrackingEnabled: boolean) {
  return {
    externalTracking: externalTrackingEnabled,
    chatWidget: true,
  } as const;
}
