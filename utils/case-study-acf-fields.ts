/**
 * Clean ACF text for /casos-de-exito/[slug] without rewriting approved copy.
 * WordPress sometimes stores a JSON dump, a heading equal to the H1, a
 * duplicated desarrollo block, or the next result pasted into resultadopN.
 */

const CASE_STUDY_TEXT_KEYS = [
  'primerap',
  'primerh2',
  'segundap',
  'tercerap',
  'segundoh2',
  'cuartap',
  'quintap',
  'sextap',
  'septimap',
  'octavap',
  'novenap',
  'tercerh2',
  'decima',
  'otroh2st',
  'otropst',
  'primerah3desarrollo',
  'primerapdesarrollo',
  'segundah3desarrollo',
  'segundapdesarrollo',
  'tercerh3desarrollo',
  'tercerapdesarrollo',
  'resultadotitulo',
  'resultadodescripcion',
  'resultado1',
  'resultadop1',
  'resultado2',
  'resultadop2',
  'resultado3',
  'resultadop3',
] as const;

const DESARROLLO_BLOCKS = [
  ['primerah3desarrollo', 'primerapdesarrollo'],
  ['segundah3desarrollo', 'segundapdesarrollo'],
  ['tercerh3desarrollo', 'tercerapdesarrollo'],
] as const;

const TITLE_MATCH_HEADINGS = [
  'primerh2',
  'segundoh2',
  'tercerh2',
  'otroh2st',
  'resultadotitulo',
] as const;

export function normalizeComparableText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[\u2028\u2029\u00a0]/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .trim()
    .toLowerCase();
}

export function headingsMatch(left?: string | null, right?: string | null): boolean {
  if (!left || !right) return false;
  const a = normalizeComparableText(left);
  const b = normalizeComparableText(right);
  return Boolean(a) && a === b;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function looksLikeJsonObject(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}');
}

function extractStringFromParsed(parsed: unknown, fieldName?: string): string {
  if (typeof parsed === 'string') {
    return asRenderableHtml(parsed, fieldName);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return '';
  }

  const record = parsed as Record<string, unknown>;
  if (fieldName && typeof record[fieldName] === 'string') {
    return asRenderableHtml(record[fieldName], fieldName);
  }

  const strings = Object.values(record).filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  if (strings.length === 1) {
    return asRenderableHtml(strings[0], fieldName);
  }
  return '';
}

/** Turn an ACF value into HTML/text, or drop raw JSON dumps. */
export function asRenderableHtml(value: unknown, fieldName?: string): string {
  if (value == null || value === false) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'object') {
    return extractStringFromParsed(value, fieldName);
  }
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  const candidates = [trimmed, decodeHtmlEntities(trimmed)];
  for (const candidate of candidates) {
    if (!looksLikeJsonObject(candidate) && !candidate.trim().startsWith('{')) continue;
    try {
      return extractStringFromParsed(JSON.parse(candidate), fieldName);
    } catch {
      // Keep looking at the other candidate; unparseable JSON is discarded below.
    }
  }

  if (trimmed.startsWith('{')) return '';
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * If resultadopN ends with "Next Title: next body" (or the next body alone),
 * strip that suffix so the next card keeps the approved copy once.
 */
export function stripTrailingResultBleed(
  body: string,
  nextTitle?: string,
  nextBody?: string,
): string {
  const source = typeof body === 'string' ? body : '';
  if (!source.trim()) return source;

  const title = (nextTitle || '').trim();
  const next = (nextBody || '').trim();
  if (!title && !next) return source;

  const suffixes: string[] = [];
  if (title && next) {
    suffixes.push(`${title}: ${next}`, `${title}:${next}`, `${title} ${next}`);
  }
  if (next) suffixes.push(next);

  let cleaned = source;
  for (const suffix of suffixes) {
    if (!suffix.trim()) continue;
    if (!normalizeComparableText(cleaned).includes(normalizeComparableText(suffix))) {
      continue;
    }
    const pattern = new RegExp(
      `\\s+${escapeRegExp(suffix).replace(/\\ /g, '\\s+')}\\s*$`,
      'i',
    );
    const nextCleaned = cleaned.replace(pattern, '').trim();
    if (nextCleaned && nextCleaned !== cleaned.trim()) {
      cleaned = nextCleaned;
      break;
    }
  }
  return cleaned;
}

function dropDuplicateDesarrolloBlocks(acf: Record<string, unknown>): void {
  const seen = new Set<string>();
  for (const [headingKey, bodyKey] of DESARROLLO_BLOCKS) {
    const heading = typeof acf[headingKey] === 'string' ? acf[headingKey] : '';
    const body = typeof acf[bodyKey] === 'string' ? acf[bodyKey] : '';
    if (!heading && !body) continue;
    const signature = `${normalizeComparableText(heading)}||${normalizeComparableText(body)}`;
    if (seen.has(signature)) {
      acf[headingKey] = '';
      acf[bodyKey] = '';
      continue;
    }
    seen.add(signature);
  }
}

export function normalizeCaseStudyAcf<T extends Record<string, unknown>>(
  acf: T | null | undefined,
  title?: string,
): T {
  const source = (acf && typeof acf === 'object' ? acf : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...source };

  for (const key of CASE_STUDY_TEXT_KEYS) {
    if (key in out) {
      out[key] = asRenderableHtml(out[key], key);
    }
  }

  if (title) {
    for (const key of TITLE_MATCH_HEADINGS) {
      if (headingsMatch(typeof out[key] === 'string' ? out[key] : '', title)) {
        out[key] = '';
      }
    }
  }

  dropDuplicateDesarrolloBlocks(out);

  out.resultadop1 = stripTrailingResultBleed(
    typeof out.resultadop1 === 'string' ? out.resultadop1 : '',
    typeof out.resultado2 === 'string' ? out.resultado2 : '',
    typeof out.resultadop2 === 'string' ? out.resultadop2 : '',
  );
  out.resultadop2 = stripTrailingResultBleed(
    typeof out.resultadop2 === 'string' ? out.resultadop2 : '',
    typeof out.resultado3 === 'string' ? out.resultado3 : '',
    typeof out.resultadop3 === 'string' ? out.resultadop3 : '',
  );

  return out as T;
}
