/** Single source of truth for the GHL reunion widget. Middleware 301s the apex path here. */
export const BOOKING_HREF =
  'https://api.playfulagency.com/widget/bookings/reunion-playful';

/**
 * Public slug on service landings and in-site links.
 * `/reunion-playful` 301s to BOOKING_HREF and must keep working.
 */
export const SERVICE_BOOKING_HREF = '/reunion-playful';

/** CTA copy that does not promise an immediate confirmed slot. */
export const BOOKING_CTA_LABEL = 'Solicitar una reunión';

/** Qualification closer: check fit, then request the meeting. */
export const BOOKING_FIT_CTA_LABEL = 'Comprobar si encajamos';

export const BOOKING_UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export const BOOKING_ATTRIBUTION_KEYS = [
  ...BOOKING_UTM_KEYS,
  'landing',
  'referrer',
] as const;

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

export type ServiceBookingCtaSlug = (typeof SERVICE_BOOKING_CTA_SLUGS)[number];
export type AboutHrefRewriteSlug = (typeof ABOUT_HREF_REWRITE_SLUGS)[number];
export type BookingAttributionKey = (typeof BOOKING_ATTRIBUTION_KEYS)[number];

type BookingSearch =
  | string
  | URLSearchParams
  | Record<string, string | null | undefined>;

export type BookingHrefInput = {
  search?: BookingSearch;
  landing?: string | null;
  referrer?: string | null;
};

const SERVICE_BOOKING_CTA_SLUG_SET: ReadonlySet<string> = new Set(
  SERVICE_BOOKING_CTA_SLUGS,
);

const ABOUT_HREF_REWRITE_SLUG_SET: ReadonlySet<string> = new Set(
  ABOUT_HREF_REWRITE_SLUGS,
);

const ABOUT_PATH = '/about';

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

function toSearchParams(search?: BookingSearch): URLSearchParams {
  if (!search) return new URLSearchParams();
  if (typeof search === 'string') {
    return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  }
  if (search instanceof URLSearchParams) return new URLSearchParams(search);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search as Record<string, string | null | undefined>)) {
    if (typeof value === 'string' && value.trim()) params.set(key, value);
  }
  return params;
}

function bookingPathname(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return trimmed.split(/[?#]/)[0].replace(/\/+$/, '') || null;
  }
}

function isAbsoluteHref(href: string): boolean {
  return /^https?:\/\//i.test(href.trim()) || href.trim().startsWith('//');
}

/** True for the public slug or the canonical GHL widget URL. */
export function isBookingDestination(href: string): boolean {
  const path = bookingPathname(href);
  return path === SERVICE_BOOKING_HREF || path === '/widget/bookings/reunion-playful';
}

/**
 * Build the meeting-request URL from BOOKING_HREF (or another booking base)
 * while forwarding utm_*, landing and referrer.
 */
export function buildBookingHref(
  input: BookingHrefInput = {},
  base: string = BOOKING_HREF,
): string {
  const incoming = toSearchParams(input.search);
  const dest = isAbsoluteHref(base)
    ? new URL(base.startsWith('//') ? `https:${base}` : base)
    : new URL(base, 'https://playfulagency.com');

  for (const key of BOOKING_UTM_KEYS) {
    const value = incoming.get(key)?.trim();
    if (value) dest.searchParams.set(key, value.slice(0, 160));
  }

  const landing = (incoming.get('landing') || input.landing || '').trim();
  if (landing) dest.searchParams.set('landing', landing.slice(0, 500));

  const referrer = (incoming.get('referrer') || input.referrer || '').trim();
  if (referrer) dest.searchParams.set('referrer', referrer.slice(0, 500));

  if (isAbsoluteHref(base)) return dest.toString();
  return `${dest.pathname}${dest.search}${dest.hash}`;
}

export function buildBookingHrefFromLocation(
  location: { pathname: string; search: string },
  referrer?: string | null,
  base: string = BOOKING_HREF,
): string {
  return buildBookingHref(
    {
      search: location.search,
      landing: `${location.pathname}${location.search}`.slice(0, 500),
      referrer,
    },
    base,
  );
}

export function enhanceBookingAnchors(
  root: ParentNode,
  location: { pathname: string; search: string },
  referrer?: string | null,
): number {
  let count = 0;
  root.querySelectorAll('a[href]').forEach((el) => {
    const href = el.getAttribute('href') || '';
    if (!isBookingDestination(href)) return;
    const path = bookingPathname(href) || SERVICE_BOOKING_HREF;
    const nextBase = isAbsoluteHref(href)
      ? (href.startsWith('//')
        ? `https:${href.split(/[?#]/)[0]}`
        : href.split(/[?#]/)[0])
      : path;
    const next = buildBookingHrefFromLocation(location, referrer, nextBase);
    if (next !== href) {
      el.setAttribute('href', next);
      count += 1;
    }
  });
  return count;
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
  if (normalized === 'agendar reunion con playful') return true;
  if (normalized === 'agendar sesion') return true;
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
 * On the four GO service landings, rewrite body anchors that point at the
 * contact page to the canonical `/reunion-playful` path (301 → GHL widget).
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

/** Elementor body pipeline: booking CTAs, then leftover `/about` anchors. */
export function rewriteElementorBodyHrefs(html: string, slug: string): string {
  return rewriteAboutHrefs(rewriteServiceBookingCtas(html, slug), slug);
}
