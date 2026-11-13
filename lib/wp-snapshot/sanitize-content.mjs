const NO_PUBLISH_MARKER = /<!--\s*NO PUBLICAR\s*-->/i;

/**
 * Strip editorial tail content after --- or <!-- NO PUBLICAR --> (export + runtime).
 */
export function sanitizeEditorialHtml(html) {
  if (typeof html !== 'string' || !html) return html;
  let out = html;
  const noPublish = out.search(NO_PUBLISH_MARKER);
  if (noPublish >= 0) {
    out = out.slice(0, noPublish);
  }
  const dashed = out.search(/\n-{3,}\s*\n/);
  if (dashed >= 0) {
    out = out.slice(0, dashed);
  }
  return out;
}

export function sanitizeWpObject(value) {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeWpObject(item));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'rendered' && typeof nested === 'string') {
        out[key] = sanitizeEditorialHtml(nested);
      } else if (key === 'yoast_head' && typeof nested === 'string') {
        out[key] = sanitizeEditorialHtml(nested);
      } else {
        out[key] = sanitizeWpObject(nested);
      }
    }
    return out;
  }
  if (typeof value === 'string') {
    return value;
  }
  return value;
}
