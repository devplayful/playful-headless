import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import seoCruce2810Redirects from './seo-cruce-2810-redirect-map.json' with { type: 'json' };
import { SEO_CRUCE_GONE_PATHS } from './blog-closed-paths.ts';

export { SEO_CRUCE_GONE_PATHS };

export const APEX_ORIGIN = 'https://playfulagency.com';

export const SEO_CRUCE_2810_REDIRECTS: Record<string, string> = seoCruce2810Redirects;

const SEO_CRUCE_ORIGIN_SET = new Set(Object.keys(SEO_CRUCE_2810_REDIRECTS));
const SEO_CRUCE_GONE_SET = new Set(SEO_CRUCE_GONE_PATHS);

export function normalizeCrucePath(pathname: string): string {
  const path = pathname.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, '') : path || '/';
}

export function isSeoCruceOriginPath(pathname: string): boolean {
  return SEO_CRUCE_ORIGIN_SET.has(normalizeCrucePath(pathname));
}

export function isSeoCruceGonePath(pathname: string): boolean {
  return SEO_CRUCE_GONE_SET.has(normalizeCrucePath(pathname));
}

export function seoCruceDestination(pathname: string): string | null {
  return SEO_CRUCE_2810_REDIRECTS[normalizeCrucePath(pathname)] ?? null;
}

export function pathnameFromDest(dest: string): string {
  if (/^https?:\/\//i.test(dest) || dest.startsWith('//')) {
    try {
      const url = dest.startsWith('//') ? new URL(`https:${dest}`) : new URL(dest);
      return normalizeCrucePath(url.pathname);
    } catch {
      return normalizeCrucePath(dest);
    }
  }
  return normalizeCrucePath(dest);
}

export type SeoCruceCsvRow = {
  url: string;
  http: string;
  wp_payload: string;
  decision: string;
  destino_301: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      field += char;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvPathFromModule(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', 'docs', 'migracion', 'seo-cruce-2810', 'urls-161.csv');
}

export function loadSeoCruceCsv(csvPath = csvPathFromModule()): SeoCruceCsvRow[] {
  const [header, ...rows] = parseCsv(readFileSync(csvPath, 'utf8'));
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  return rows.map((row) => ({
    url: row[index.url],
    http: row[index.http],
    wp_payload: row[index.wp_payload],
    decision: row[index.decision],
    destino_301: row[index.destino_301],
  }));
}

/** 19 live 301s already in code (CSV `http` starts with 301). */
export function existingWorking301s(rows = loadSeoCruceCsv()): Array<{ url: string; dest: string }> {
  return rows
    .filter((row) => row.http.startsWith('301'))
    .map((row) => ({ url: row.url, dest: row.destino_301 }));
}

/** 32 live 410s already in code (CSV `http` starts with 410). */
export function existingWorking410s(rows = loadSeoCruceCsv()): string[] {
  return rows.filter((row) => row.http.startsWith('410')).map((row) => row.url);
}

/** 75 URLs marked «no importar» — must stay out of Payload and the sitemap. */
export function noImportUrls(rows = loadSeoCruceCsv()): SeoCruceCsvRow[] {
  return rows.filter((row) => row.wp_payload.includes('no importar'));
}

export function destPathFor301(row: { dest?: string; destino_301?: string }): string {
  const dest = row.dest ?? row.destino_301 ?? '';
  return pathnameFromDest(dest);
}
