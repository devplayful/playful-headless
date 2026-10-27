/** Conservative Elementor HTML a11y pass: missing img alt + nameless links. */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const ANCHOR_RE = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const DECORATIVE_SRC = /pixel\.gif|spacer|1x1|rectangle\d*\.svg|shape[-_]|divider|ornament|confeti|confetti|background\.webp/i;

function getQuotedAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}=("[^"]*"|'[^']*')`, 'i'));
  if (!match) return null;
  return match[1].slice(1, -1);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function basenameFromSrc(src: string): string {
  try {
    const path = new URL(src, 'https://playfulagency.com').pathname;
    return path.slice(path.lastIndexOf('/') + 1);
  } catch {
    const clean = src.split('?')[0].split('#')[0];
    return clean.slice(clean.lastIndexOf('/') + 1);
  }
}

export function descriptiveAltFromSrc(src: string): string {
  if (!src || src.startsWith('data:') || DECORATIVE_SRC.test(src)) return '';
  const base = basenameFromSrc(src)
    .replace(/-\d+x\d+(?=\.[^.]+$)/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return base;
}

export function ensureMissingImgAlt(html: string): string {
  if (!html) return html;
  IMG_TAG_RE.lastIndex = 0;
  return html.replace(IMG_TAG_RE, (tag) => {
    if (/\salt\s*=/i.test(tag)) return tag;
    const src = getQuotedAttr(tag, 'src') || '';
    const alt = descriptiveAltFromSrc(src);
    if (/\/>$/.test(tag)) {
      return tag.replace(/\s*\/>$/, ` alt="${escapeAttr(alt)}" />`);
    }
    return tag.replace(/>$/, ` alt="${escapeAttr(alt)}">`);
  });
}

function innerText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function labelFromHref(href: string): string {
  if (!href || href === '#' || href.startsWith('javascript:')) return 'Enlace';
  try {
    const url = new URL(href, 'https://playfulagency.com');
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last) return last.replace(/[-_]+/g, ' ');
    if (url.hostname && url.hostname !== 'playfulagency.com') return url.hostname.replace(/^www\./, '');
  } catch {
    /* keep fallback */
  }
  return 'Enlace';
}

export function labelEmptyLinks(html: string): string {
  if (!html) return html;
  ANCHOR_RE.lastIndex = 0;
  return html.replace(ANCHOR_RE, (full, attrs: string, inner: string) => {
    if (/\saria-label\s*=/i.test(attrs)) return full;
    if (innerText(inner)) return full;
    const title = getQuotedAttr(`<a${attrs}>`, 'title');
    const imgAlt = /alt=("[^"]*"|'[^']*')/i.exec(inner)?.[1]?.slice(1, -1);
    const href = getQuotedAttr(`<a${attrs}>`, 'href') || '';
    const label = (title && title.trim())
      || (imgAlt && imgAlt.trim())
      || labelFromHref(href);
    return `<a${attrs} aria-label="${escapeAttr(label)}">${inner}</a>`;
  });
}

export function stripInvalidButtonAriaSelected(html: string): string {
  if (!html) return html;
  return html.replace(/<div\b([^>]*)>/gi, (full, attrs: string) => {
    if (!/\brole=["']button["']/i.test(attrs)) return full;
    if (!/\saria-selected=/i.test(attrs)) return full;
    return `<div${attrs.replace(/\saria-selected=("[^"]*"|'[^']*')/i, '')}>`;
  });
}

export function applyElementorA11y(html: string): string {
  return stripInvalidButtonAriaSelected(labelEmptyLinks(ensureMissingImgAlt(html)));
}
