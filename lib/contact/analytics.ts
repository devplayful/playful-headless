'use client';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushGenerateLead(formId: string): void {
  window.dataLayer = window.dataLayer || [];
  // Intentionally exclude email, phone, name, message, CRM IDs and raw UTMs.
  window.dataLayer.push({
    event: 'generate_lead',
    form_id: formId,
  });
}

