'use client';

import {
  ATTRIBUTION_FIELDS,
  CONTACT_FORM_ID,
  type ContactAttribution,
} from './types.ts';

const ORIGINAL_ATTRIBUTION_KEY = 'playful:first-touch:v1';

function currentTouch(): ContactAttribution {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.trim() || '';
  let source = utmSource.toLowerCase();

  if (!source && document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      source = referrer.hostname === window.location.hostname ? 'internal' : referrer.hostname;
    } catch {
      source = 'referral';
    }
  }

  const attribution: ContactAttribution = {
    source: source || 'direct',
    landing: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    formId: CONTACT_FORM_ID,
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  };

  for (const field of ATTRIBUTION_FIELDS) {
    attribution[field] = (params.get(field) || '').slice(0, 160);
  }

  return attribution;
}

function readOriginalAttribution(fallback: ContactAttribution): ContactAttribution {
  try {
    const stored = window.localStorage.getItem(ORIGINAL_ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored) as ContactAttribution;
    window.localStorage.setItem(ORIGINAL_ATTRIBUTION_KEY, JSON.stringify(fallback));
  } catch {
    // Attribution storage must never block a legitimate contact request.
  }
  return fallback;
}

export function getSubmissionAttribution(): {
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
} {
  const recentAttribution = currentTouch();
  return {
    originalAttribution: readOriginalAttribution(recentAttribution),
    recentAttribution,
  };
}

export function createSubmissionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(4)).join('_')}`;
}

