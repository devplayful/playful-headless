import IMAGE_ALT_OVERRIDE_ENTRIES from './image-alt-overrides.json' with { type: 'json' };

export const WP_MEDIA_HOST = 'https://endpoint.playfulagency.com';
export const WP_UPLOADS_PREFIX = '/wp-content/uploads/';
export const WP_KEY_PREFIX = 'WP:';

/** WordPress resized derivative: name-370x300.png → name.png */
const WP_SIZE_SUFFIX = /-\d+x\d+(?=\.[^.]+$)/;

export const IMAGE_ALT_OVERRIDES: Record<string, string> = IMAGE_ALT_OVERRIDE_ENTRIES;

export const IMAGE_ALT_OVERRIDE_COUNT = Object.keys(IMAGE_ALT_OVERRIDES).length;

const LOOKUP = new Map<string, string>();

function addLookupKey(key: string, alt: string): void {
  if (!key || LOOKUP.has(key)) return;
  LOOKUP.set(key, alt);
}

function withoutSizeSuffix(value: string): string {
  return value.replace(WP_SIZE_SUFFIX, '');
}

function decodeSrc(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function encodeLineSeparators(value: string): string {
  return value.replace(/\u2028/g, '%E2%80%A8').replace(/\u2029/g, '%E2%80%A9');
}

function stripQueryAndHash(value: string): string {
  return value.split('#')[0].split('?')[0];
}

/**
 * Keys a rendered src can match: raw, decoded, WP: shorthand, path-only,
 * and the same forms with the -WxH WordPress suffix stripped.
 */
export function imageAltLookupKeys(src: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  const push = (value: string | undefined | null) => {
    if (!value) return;
    if (seen.has(value)) return;
    seen.add(value);
    keys.push(value);
  };

  const trimmed = src.trim();
  if (!trimmed) return keys;

  const base = stripQueryAndHash(trimmed);
  const decoded = decodeSrc(base);
  const encoded = encodeLineSeparators(decoded);

  for (const candidate of [trimmed, base, decoded, encoded]) {
    push(candidate);
    push(withoutSizeSuffix(candidate));
  }

  let pathname = '';
  try {
    if (/^https?:\/\//i.test(base) || base.startsWith('//')) {
      const url = new URL(base.startsWith('//') ? `https:${base}` : base);
      pathname = url.pathname;
      push(url.origin + url.pathname);
      push(`${url.protocol}//${url.host}${url.pathname}`);
    } else {
      pathname = base.startsWith('/') ? base : `/${base}`;
    }
  } catch {
    pathname = base.startsWith('/') ? decoded : decoded;
  }

  if (pathname) {
    const decodedPath = decodeSrc(pathname);
    const encodedPath = encodeLineSeparators(decodedPath);
    for (const path of [pathname, decodedPath, encodedPath]) {
      push(path);
      push(withoutSizeSuffix(path));
      const uploadsAt = path.indexOf(WP_UPLOADS_PREFIX);
      if (uploadsAt !== -1) {
        const rest = path.slice(uploadsAt + WP_UPLOADS_PREFIX.length);
        push(`${WP_KEY_PREFIX}${rest}`);
        push(`${WP_KEY_PREFIX}${withoutSizeSuffix(rest)}`);
        push(`${WP_MEDIA_HOST}${WP_UPLOADS_PREFIX}${rest}`);
        push(`${WP_MEDIA_HOST}${WP_UPLOADS_PREFIX}${withoutSizeSuffix(rest)}`);
      }
    }
  }

  if (trimmed.startsWith(WP_KEY_PREFIX) || base.startsWith(WP_KEY_PREFIX)) {
    const rest = (base.startsWith(WP_KEY_PREFIX) ? base : trimmed).slice(WP_KEY_PREFIX.length);
    const decodedRest = decodeSrc(rest);
    for (const restKey of [rest, decodedRest, encodeLineSeparators(decodedRest)]) {
      push(`${WP_KEY_PREFIX}${restKey}`);
      push(`${WP_KEY_PREFIX}${withoutSizeSuffix(restKey)}`);
      push(`${WP_UPLOADS_PREFIX}${restKey}`);
      push(`${WP_MEDIA_HOST}${WP_UPLOADS_PREFIX}${restKey}`);
      push(`${WP_MEDIA_HOST}${WP_UPLOADS_PREFIX}${withoutSizeSuffix(restKey)}`);
    }
  }

  return keys;
}

for (const [key, alt] of Object.entries(IMAGE_ALT_OVERRIDES)) {
  for (const variant of imageAltLookupKeys(key)) {
    addLookupKey(variant, alt);
  }
}

export function lookupImageAlt(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  for (const key of imageAltLookupKeys(src)) {
    if (LOOKUP.has(key)) return LOOKUP.get(key);
  }
  return undefined;
}

export function resolveImageAlt(
  src: string | null | undefined,
  fallback = '',
): string {
  const found = lookupImageAlt(src);
  return found !== undefined ? found : fallback;
}

export type AcfImageRef = string | { url?: string; alt?: string } | null | undefined;

export function acfImageSrc(image: AcfImageRef): string {
  if (typeof image === 'string') return image;
  if (image && typeof image.url === 'string') return image.url;
  return '';
}

export function resolveMediaAlt(image: AcfImageRef, fallback: string): string {
  if (typeof image === 'string') return resolveImageAlt(image, fallback);
  const src = image?.url;
  const mediaFallback = image?.alt || fallback;
  return resolveImageAlt(src, mediaFallback);
}

function getQuotedAttr(tag: string, name: string): { value: string; quote: '"' | "'" } | null {
  const match = tag.match(new RegExp(`\\s${name}=("[^"]*"|'[^']*')`, 'i'));
  if (!match) return null;
  const quoted = match[1];
  return { value: quoted.slice(1, -1), quote: quoted[0] as '"' | "'" };
}

function firstSrcsetUrl(srcset: string): string {
  const first = srcset.split(',')[0]?.trim() ?? '';
  return first.split(/\s+/)[0] ?? '';
}

function escapeAlt(value: string, quote: '"' | "'"): string {
  const amp = value.replace(/&/g, '&amp;');
  return quote === '"'
    ? amp.replace(/"/g, '&quot;')
    : amp.replace(/'/g, '&#39;');
}

function setImgAlt(tag: string, alt: string): string {
  if (/\salt\s*=/i.test(tag)) {
    return tag.replace(/\salt=("[^"]*"|'[^']*')/i, (_full, quoted: string) => {
      const quote = quoted[0] as '"' | "'";
      return ` alt=${quote}${escapeAlt(alt, quote)}${quote}`;
    });
  }
  if (/\/>$/.test(tag)) {
    return tag.replace(/\s*\/>$/, ` alt="${escapeAlt(alt, '"')}" />`);
  }
  return tag.replace(/>$/, ` alt="${escapeAlt(alt, '"')}">`);
}

const IMG_TAG_RE = /<img\b[^>]*>/gi;

/**
 * For each <img>: drop tags whose src is empty; if src (or first srcset)
 * hits the map, set/replace alt. Everything else is left byte-identical.
 */
export function applyImageAltOverrides(html: string): string {
  if (!html) return html;
  IMG_TAG_RE.lastIndex = 0;
  return html.replace(IMG_TAG_RE, (tag) => {
    const srcAttr = getQuotedAttr(tag, 'src');
    if (srcAttr && srcAttr.value.trim() === '') return '';

    const srcsetAttr = getQuotedAttr(tag, 'srcset');
    const src = srcAttr?.value || (srcsetAttr ? firstSrcsetUrl(srcsetAttr.value) : '');
    if (!src) return tag;

    const alt = lookupImageAlt(src);
    if (alt === undefined) return tag;
    return setImgAlt(tag, alt);
  });
}
