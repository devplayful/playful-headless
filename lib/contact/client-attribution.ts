'use client';

import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  ATTRIBUTION_STORAGE_FIRST,
  ATTRIBUTION_STORAGE_LAST,
  ATTRIBUTION_TTL_SECONDS,
  deserializeAttributionCookie,
  emptyAttribution,
  mergeFirstTouch,
  mergeLastTouch,
  parseVisitAttribution,
  serializeAttributionCookie,
  type VisitInput,
} from './attribution.ts';
import { CONTACT_FORM_ID, type ContactAttribution } from './types.ts';

const SUBMISSION_ID_KEY = 'playful:contact-submission:v1';
const LEGACY_FIRST_TOUCH_KEY = 'playful:first-touch:v1';

function currentVisit(): ContactAttribution {
  if (typeof window === 'undefined') return emptyAttribution();
  return parseVisitAttribution({
    pathname: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    host: window.location.hostname,
  });
}

function readStorage(key: string): ContactAttribution | null {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<ContactAttribution>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.captured === true || parsed.landing || parsed.utm_source || parsed.source) {
      return {
        ...emptyAttribution(),
        ...parsed,
        captured: parsed.captured !== false,
        formId: CONTACT_FORM_ID,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: ContactAttribution): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Attribution storage must never block a legitimate contact request.
  }
}

function readCookie(name: string): ContactAttribution | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return match ? deserializeAttributionCookie(match.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: ContactAttribution): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${serializeAttributionCookie(value)}; Path=/; Max-Age=${ATTRIBUTION_TTL_SECONDS}; SameSite=Lax; Secure`;
}

function migrateLegacyFirstTouch(): ContactAttribution | null {
  try {
    const stored = window.localStorage.getItem(LEGACY_FIRST_TOUCH_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<ContactAttribution>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      ...emptyAttribution({ captured: true }),
      ...parsed,
      captured: true,
      formId: CONTACT_FORM_ID,
      gclid: parsed.gclid || '',
      fbclid: parsed.fbclid || '',
      referrer: parsed.referrer || '',
    };
  } catch {
    return null;
  }
}

function readPersistedFirst(): ContactAttribution | null {
  return readCookie(ATTRIBUTION_COOKIE_FIRST)
    || readStorage(ATTRIBUTION_STORAGE_FIRST)
    || migrateLegacyFirstTouch();
}

function readPersistedLast(): ContactAttribution | null {
  return readCookie(ATTRIBUTION_COOKIE_LAST) || readStorage(ATTRIBUTION_STORAGE_LAST);
}

function persistPair(first: ContactAttribution, last: ContactAttribution): void {
  writeCookie(ATTRIBUTION_COOKIE_FIRST, first);
  writeCookie(ATTRIBUTION_COOKIE_LAST, last);
  writeStorage(ATTRIBUTION_STORAGE_FIRST, first);
  writeStorage(ATTRIBUTION_STORAGE_LAST, last);
}

export function persistVisitAttribution(input?: VisitInput): {
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
} {
  const incoming = input ? parseVisitAttribution(input) : currentVisit();
  const first = mergeFirstTouch(readPersistedFirst(), incoming);
  const last = mergeLastTouch(readPersistedLast(), incoming);
  persistPair(first, last);
  return {
    originalAttribution: first,
    recentAttribution: last,
  };
}

export function getSubmissionAttribution(): {
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
} {
  return persistVisitAttribution();
}

export function createSubmissionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(4)).join('_')}`;
}

export function getOrCreateSubmissionId(): string {
  try {
    const current = window.sessionStorage.getItem(SUBMISSION_ID_KEY);
    if (current && /^[A-Za-z0-9_-]{20,100}$/.test(current)) return current;
    if (current) window.sessionStorage.removeItem(SUBMISSION_ID_KEY);
    const created = createSubmissionId();
    window.sessionStorage.setItem(SUBMISSION_ID_KEY, created);
    return created;
  } catch {
    return createSubmissionId();
  }
}

export function clearSubmissionId(): void {
  try {
    window.sessionStorage.removeItem(SUBMISSION_ID_KEY);
  } catch {
    // Storage availability must not affect the confirmed request response.
  }
}
