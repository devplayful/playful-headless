export const BOOKING_HREF =
  'https://api.playfulagency.com/widget/bookings/reunion-playful';

export const BOOKING_CTA_LABEL = 'Agendar Reunión con Playful';

export const CONTACT_HREF = '/contactar-agencia-de-marketing-digital';

/** Apex landings whose Elementor body CTAs book GHL instead of the contact form. */
export const SERVICE_BOOKING_CTA_SLUGS = [
  'agencia-e-commerce',
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
] as const;

export type ServiceBookingCtaSlug = (typeof SERVICE_BOOKING_CTA_SLUGS)[number];

const SERVICE_BOOKING_CTA_SLUG_SET: ReadonlySet<string> = new Set(
  SERVICE_BOOKING_CTA_SLUGS,
);

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
 * On the four GO service landings, rewrite body anchors that point at the
 * contact page to the shared GHL booking widget. Header/footer live outside
 * this HTML; `playful-boton-header` is skipped as a belt-and-suspenders guard.
 */
export function rewriteServiceBookingCtas(html: string, slug: string): string {
  if (!html || !isServiceBookingCtaSlug(slug)) return html;

  return html.replace(ANCHOR_RE, (full, pre: string, quote: string, href: string, post: string, inner: string) => {
    if (isGlobalChromeAnchor(pre, post) || !isContactPageHref(href)) {
      return full;
    }

    return `<a${pre}href=${quote}${BOOKING_HREF}${quote}${post}>${rewriteContactCtaLabels(inner)}</a>`;
  });
}
