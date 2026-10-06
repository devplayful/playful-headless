import {
  BOOKING_WIDGET_HREF,
  SERVICE_BOOKING_HREF as CANONICAL_SERVICE_BOOKING_HREF,
  isBookingHref,
  toServiceBookingHref,
} from './booking-attribution.ts';

/** Widget destination. Visible CTAs use SERVICE_BOOKING_HREF so the hop can fill query. */
export const BOOKING_HREF = BOOKING_WIDGET_HREF;

/**
 * Visible/canonical href for every booking CTA.
 * `/reunion-playful` 302s to BOOKING_HREF after filling gclid/utm from URL or cookie.
 */
export const SERVICE_BOOKING_HREF = CANONICAL_SERVICE_BOOKING_HREF;

export const BOOKING_CTA_LABEL = 'Agendar Reunión con Playful';

export const CONTACT_HREF = '/contactar-agencia-de-marketing-digital';

/** Next /nosotros is the live about page; WP `/about` 404s on apex. */
export const NOSOTROS_HREF = '/nosotros';

/** Apex landings whose Elementor body CTAs book GHL instead of the contact form. */
export const SERVICE_BOOKING_CTA_SLUGS = [
  'agencia-e-commerce',
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
] as const;

/**
 * Elementor landings that still ship WP `/about` anchors in the body.
 * e-com / Shopify have none — keep them off the allowlist.
 */
export const ABOUT_HREF_REWRITE_SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
] as const;

/** Body href on SEO/SEM that today 301s from the short 2025 slug. */
export const INTERNACIONAL_SEO_HREF =
  '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad';

export const INTERNACIONAL_SEO_HREF_REWRITE_SLUGS = [
  'agencia-seo',
  'agencia-sem',
] as const;

export type ServiceBookingCtaSlug = (typeof SERVICE_BOOKING_CTA_SLUGS)[number];
export type AboutHrefRewriteSlug = (typeof ABOUT_HREF_REWRITE_SLUGS)[number];
export type InternacionalSeoHrefRewriteSlug =
  (typeof INTERNACIONAL_SEO_HREF_REWRITE_SLUGS)[number];

const SERVICE_BOOKING_CTA_SLUG_SET: ReadonlySet<string> = new Set(
  SERVICE_BOOKING_CTA_SLUGS,
);

const ABOUT_HREF_REWRITE_SLUG_SET: ReadonlySet<string> = new Set(
  ABOUT_HREF_REWRITE_SLUGS,
);

const INTERNACIONAL_SEO_HREF_REWRITE_SLUG_SET: ReadonlySet<string> = new Set(
  INTERNACIONAL_SEO_HREF_REWRITE_SLUGS,
);

const ABOUT_PATH = '/about';
const INTERNACIONAL_SEO_OLD_PATH = '/agencia-seo-internacional-en-el-2025-es-una-necesidad';

const CONTACT_PATH = CONTACT_HREF;
const IN_SITE_PAGE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

const ANCHOR_RE =
  /<a\b([^>]*?)\bhref\s*=\s*(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi;

export function isServiceBookingCtaSlug(slug: string): slug is ServiceBookingCtaSlug {
  return SERVICE_BOOKING_CTA_SLUG_SET.has(slug);
}

export function isAboutHrefRewriteSlug(slug: string): slug is AboutHrefRewriteSlug {
  return ABOUT_HREF_REWRITE_SLUG_SET.has(slug);
}

export function isInternacionalSeoHrefRewriteSlug(
  slug: string,
): slug is InternacionalSeoHrefRewriteSlug {
  return INTERNACIONAL_SEO_HREF_REWRITE_SLUG_SET.has(slug);
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&aacute;/gi, 'á')
    .replace(/&#225;/g, 'á')
    .replace(/&#xE1;/gi, 'á')
    .replace(/&iexcl;/gi, '¡');
}

function pathnameOfHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;

  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');

    if (absolute.startsWith('http') || trimmed.startsWith('//')) {
      if (!IN_SITE_PAGE_HOSTS.has(url.hostname.toLowerCase())) return null;
    }

    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    const path = trimmed.split(/[?#]/)[0].replace(/\/+$/, '');
    return path || null;
  }
}

/** True for relative, apex, www, endpoint, or old host URLs to the contact page. */
export function isContactPageHref(href: string): boolean {
  return pathnameOfHref(href) === CONTACT_PATH;
}

/** True for relative, apex, www, endpoint, or old host URLs to the legacy WP about page. */
export function isAboutPageHref(href: string): boolean {
  return pathnameOfHref(href) === ABOUT_PATH;
}

/** Short 2025 slug that already 301s to the blog article. */
export function isInternacionalSeoOldHref(href: string): boolean {
  return pathnameOfHref(href) === INTERNACIONAL_SEO_OLD_PATH;
}

function normalizeCtaLabel(text: string): string {
  return decodeBasicEntities(text)
    .replace(/[áàäâÁÀÄÂ]/g, 'a')
    .replace(/[éèëêÉÈËÊ]/g, 'e')
    .replace(/[íìïîÍÌÏÎ]/g, 'i')
    .replace(/[óòöôÓÒÖÔ]/g, 'o')
    .replace(/[úùüûÚÙÜÛ]/g, 'u')
    .replace(/[¡!?.…]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Generic contact labels we retitle to the Shopify booking CTA.
 * Service-specific button copy (¡Quiero saber más!, Haz que funcione tu tienda)
 * keeps its text; only the href is rewritten.
 */
export function isContactCtaLabel(text: string): boolean {
  const normalized = normalizeCtaLabel(text);
  if (!normalized) return false;
  if (normalized === 'contactanos' || normalized.startsWith('contactanos ')) {
    return true;
  }
  if (normalized === 'agenda una reunion') return true;
  if (normalized === 'hablemos') return true;
  return false;
}

function rewriteContactCtaLabels(inner: string): string {
  const next = inner.replace(/>([^<]+)</g, (full, text: string) => {
    if (!isContactCtaLabel(text)) return full;
    const lead = text.match(/^\s*/)?.[0] ?? '';
    const trail = text.match(/\s*$/)?.[0] ?? '';
    return `>${lead}${BOOKING_CTA_LABEL}${trail}<`;
  });

  if (next !== inner) return next;

  const stripped = decodeBasicEntities(inner.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  if (isContactCtaLabel(stripped) && !/<[a-z][\s\S]*>/i.test(inner)) {
    return BOOKING_CTA_LABEL;
  }

  return inner;
}

function isGlobalChromeAnchor(pre: string, post: string): boolean {
  return /\bplayful-boton-header\b/.test(`${pre} ${post}`);
}

/**
 * Any rendered HTML (Elementor, ACF, blog): send widget / apex booking
 * hrefs through `/reunion-playful` so middleware can attach attribution.
 */
export function rewriteBookingWidgetHrefs(html: string): string {
  if (!html) return html;
  return html.replace(/href\s*=\s*(["'])([^"']*)\1/gi, (full, quote: string, href: string) => {
    if (!isBookingHref(href)) return full;
    return `href=${quote}${toServiceBookingHref(href)}${quote}`;
  });
}

/**
 * On the four GO service landings, rewrite body anchors that point at the
 * contact page to the canonical `/reunion-playful` path (302 → GHL widget).
 * Header/footer live outside this HTML; `playful-boton-header` is skipped.
 */
export function rewriteServiceBookingCtas(html: string, slug: string): string {
  if (!html || !isServiceBookingCtaSlug(slug)) return html;

  return html.replace(ANCHOR_RE, (full, pre: string, quote: string, href: string, post: string, inner: string) => {
    if (isGlobalChromeAnchor(pre, post) || !isContactPageHref(href)) {
      return full;
    }

    return `<a${pre}href=${quote}${SERVICE_BOOKING_HREF}${quote}${post}>${rewriteContactCtaLabels(inner)}</a>`;
  });
}

/**
 * On SEO / SEM / diseño landings, rewrite body anchors that point at the
 * dead WP `/about` page to the live `/nosotros` path.
 * Header/footer already use `/nosotros`; `playful-boton-header` is skipped.
 */
export function rewriteAboutHrefs(html: string, slug: string): string {
  if (!html || !isAboutHrefRewriteSlug(slug)) return html;

  return html.replace(ANCHOR_RE, (full, pre: string, quote: string, href: string, post: string, inner: string) => {
    if (isGlobalChromeAnchor(pre, post) || !isAboutPageHref(href)) {
      return full;
    }

    return `<a${pre}href=${quote}${NOSOTROS_HREF}${quote}${post}>${inner}</a>`;
  });
}

/**
 * On /agencia-seo and /agencia-sem only: send the short 2025 slug href
 * straight to the live blog path. Anchor text stays as WordPress left it.
 */
export function rewriteInternacionalSeoHrefs(html: string, slug: string): string {
  if (!html || !isInternacionalSeoHrefRewriteSlug(slug)) return html;

  return html.replace(ANCHOR_RE, (full, pre: string, quote: string, href: string, post: string, inner: string) => {
    if (isGlobalChromeAnchor(pre, post) || !isInternacionalSeoOldHref(href)) {
      return full;
    }

    return `<a${pre}href=${quote}${INTERNACIONAL_SEO_HREF}${quote}${post}>${inner}</a>`;
  });
}

/** Elementor body pipeline: widget URLs, booking CTAs, leftover `/about`, then the 2025 SEO href. */
export function rewriteElementorBodyHrefs(html: string, slug: string): string {
  return rewriteInternacionalSeoHrefs(
    rewriteAboutHrefs(
      rewriteServiceBookingCtas(rewriteBookingWidgetHrefs(html), slug),
      slug,
    ),
    slug,
  );
}
