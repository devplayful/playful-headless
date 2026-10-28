/**
 * Slug-scoped Elementor rewriter: label /agencia-e-commerce booking CTAs
 * so handleCtaDocumentClick can set cta_section (hero / mid / final).
 * Same lifecycle as rewriteServiceBookingCtas — body HTML only.
 */

import { isBookingHref } from './booking-attribution.ts';

export const ECOMMERCE_CTA_SECTION_SLUG = 'agencia-e-commerce';

export const ECOMMERCE_CTA_SECTIONS = ['hero', 'mid', 'final'] as const;

export type EcommerceCtaSection = (typeof ECOMMERCE_CTA_SECTIONS)[number] | `mid${number}`;

const ANCHOR_RE =
  /<a\b([^>]*?)\bhref\s*=\s*(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi;

function isGlobalChromeAnchor(pre: string, post: string): boolean {
  return /\bplayful-boton-header\b/.test(`${pre} ${post}`);
}

function alreadyHasCtaSection(pre: string, post: string): boolean {
  return /\bdata-cta-section\s*=/.test(`${pre} ${post}`);
}

/** First = hero, last = final, middles = mid or mid1..midN. */
export function ecommerceCtaSectionLabels(count: number): EcommerceCtaSection[] {
  if (count <= 0) return [];
  if (count === 1) return ['hero'];
  if (count === 2) return ['hero', 'final'];
  if (count === 3) return ['hero', 'mid', 'final'];

  const labels: EcommerceCtaSection[] = ['hero'];
  for (let i = 1; i <= count - 2; i += 1) {
    labels.push(`mid${i}`);
  }
  labels.push('final');
  return labels;
}

type BookingAnchor = {
  index: number;
  length: number;
  pre: string;
  quote: string;
  href: string;
  post: string;
  inner: string;
};

function collectUntaggedBookingAnchors(html: string): BookingAnchor[] {
  const out: BookingAnchor[] = [];
  ANCHOR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANCHOR_RE.exec(html))) {
    const pre = match[1];
    const quote = match[2];
    const href = match[3];
    const post = match[4];
    const inner = match[5];
    if (isGlobalChromeAnchor(pre, post) || alreadyHasCtaSection(pre, post)) {
      continue;
    }
    if (!isBookingHref(href)) continue;
    out.push({
      index: match.index,
      length: match[0].length,
      pre,
      quote,
      href,
      post,
      inner,
    });
  }
  return out;
}

/**
 * On /agencia-e-commerce only: add data-cta-section to each body booking CTA
 * in document order. Idempotent. Other slugs are a no-op.
 */
export function rewriteEcommerceCtaSections(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_CTA_SECTION_SLUG) return html;

  const booking = collectUntaggedBookingAnchors(html);
  if (booking.length === 0) return html;

  const labels = ecommerceCtaSectionLabels(booking.length);
  let out = html;
  for (let i = booking.length - 1; i >= 0; i -= 1) {
    const item = booking[i];
    const tagged =
      `<a${item.pre}href=${item.quote}${item.href}${item.quote}` +
      ` data-cta-section="${labels[i]}"${item.post}>${item.inner}</a>`;
    out = out.slice(0, item.index) + tagged + out.slice(item.index + item.length);
  }
  return out;
}
