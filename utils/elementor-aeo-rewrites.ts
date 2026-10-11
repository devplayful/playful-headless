const ACCORDION_ITEM_RE =
  /<div class="elementor-accordion-item">\s*<div id="elementor-tab-title-[^"]+"[\s\S]*?<\/div>\s*<div id="elementor-tab-content-[^"]+"[\s\S]*?<\/div>\s*<\/div>/g;

function accordionTitle(item: string): string {
  return item.match(/class="elementor-accordion-title"[^>]*>([\s\S]*?)<\/a>/)?.[1]?.trim() || '';
}

/** Drop leftover SEM Lottie caption; do not replace it with new copy. */
export function stripSemPlaceholderCopy(html: string): string {
  return html
    .replace(/dfghfdgdgdgdgdg/g, '')
    .replace(/<p class="e-lottie__caption">\s*<\/p>/g, '');
}

/** Keep the last accordion item when the same title appears twice (SEO live HTML). */
export function stripDuplicateAccordionItems(html: string): string {
  const items = Array.from(html.matchAll(ACCORDION_ITEM_RE));
  if (items.length < 2) return html;

  const titles = items.map((match) => accordionTitle(match[0]));
  const keep = new Set<number>();
  const keptTitle = new Set<string>();

  for (let index = items.length - 1; index >= 0; index -= 1) {
    const title = titles[index];
    if (!title || !keptTitle.has(title)) {
      keep.add(index);
      if (title) keptTitle.add(title);
    }
  }

  let cursor = 0;
  let out = '';
  items.forEach((match, index) => {
    const start = match.index ?? 0;
    out += html.slice(cursor, start);
    if (keep.has(index)) out += match[0];
    cursor = start + match[0].length;
  });
  out += html.slice(cursor);
  return out;
}

export function applyElementorAeoRewrites(html: string): string {
  return stripDuplicateAccordionItems(stripSemPlaceholderCopy(html));
}
