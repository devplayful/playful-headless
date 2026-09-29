'use client';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export const GENERATE_LEAD_FLUSH_TIMEOUT_MS = 800;

type DataLayerLike = {
  push: (...items: Array<Record<string, unknown>>) => unknown;
};

function getDataLayer(): DataLayerLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const dataLayer = window.dataLayer;
  if (!dataLayer || typeof dataLayer.push !== 'function') return undefined;
  return dataLayer;
}

/**
 * Queues generate_lead and waits for GTM to flush it (eventCallback) or for
 * the hard timeout, whichever comes first. If dataLayer is missing, resolves
 * immediately so a blocked/absent GTM never holds the thank-you redirect.
 */
export function pushGenerateLead(
  formId: string,
  timeoutMs = GENERATE_LEAD_FLUSH_TIMEOUT_MS,
): Promise<void> {
  const dataLayer = getDataLayer();
  if (!dataLayer) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = setTimeout(finish, Math.max(0, timeoutMs));

    // Intentionally exclude email, phone, name, message, CRM IDs and raw UTMs.
    dataLayer.push({
      event: 'generate_lead',
      form_id: formId,
      eventCallback: () => {
        clearTimeout(timer);
        finish();
      },
      eventTimeout: timeoutMs,
    });
  });
}
