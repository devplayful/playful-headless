/**
 * Smoke: fetch live WP Elementor HTML for the four GO slugs, run the rewriter,
 * and print href + visible label for every former contact CTA.
 *
 * Usage: node --experimental-strip-types scripts/service-booking-cta-curl.mjs
 */
import {
  BOOKING_CTA_LABEL,
  SERVICE_BOOKING_HREF,
  rewriteServiceBookingCtas,
} from '../utils/booking.ts';

const SLUGS = [
  'agencia-e-commerce',
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
];

function visibleText(anchorHtml) {
  return anchorHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function listCtas(html, hrefNeedle) {
  const re = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  const out = [];
  for (const match of html.matchAll(re)) {
    const anchor = match[0];
    if (!anchor.includes(hrefNeedle)) continue;
    const href = anchor.match(/href=(["'])([^"']*)\1/i)?.[2] ?? '';
    out.push({ href, text: visibleText(anchor) });
  }
  return out;
}

for (const slug of SLUGS) {
  const url = `https://endpoint.playfulagency.com/wp-json/wp/v2/pages?slug=${slug}&_fields=id,slug,content`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`);
  }
  const pages = await response.json();
  const raw = pages[0]?.content?.rendered ?? '';
  const rewritten = rewriteServiceBookingCtas(raw, slug);
  const booked = listCtas(rewritten, '/reunion-playful');
  const leftover = listCtas(rewritten, 'contactar-agencia-de-marketing-digital');
  const widgetApi = listCtas(rewritten, 'widget/bookings/reunion-playful');

  console.log(`\n========== /${slug} ==========`);
  console.log(`booking href: ${SERVICE_BOOKING_HREF}`);
  console.log(`booking CTAs: ${booked.length}`);
  for (const cta of booked) {
    console.log(`  href=${cta.href}`);
    console.log(`  text=${cta.text}`);
  }
  console.log(`leftover contactar CTAs: ${leftover.length}`);
  if (leftover.length) {
    throw new Error(`/${slug} still has contactar CTAs in content HTML`);
  }
  if (widgetApi.length) {
    throw new Error(`/${slug} still exposes the GHL widget API URL`);
  }
  if (!booked.some((cta) => cta.text.includes('Agendar Reunión'))) {
    throw new Error(`/${slug} has no Agendar Reunión label after rewrite`);
  }
}

console.log(`\nOK — four slugs rewrite to ${SERVICE_BOOKING_HREF} with ${BOOKING_CTA_LABEL}`);
