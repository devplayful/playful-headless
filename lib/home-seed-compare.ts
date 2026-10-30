import {
  HOME_MAIN_CONTENT,
  type HomeMainContent,
} from '../cms/data/home-main-content.ts';

/** Normaliza JSON para comparar seed vs Payload/Postgres (orden de claves, ids numéricos). */
export function normalizeForHomeSeedCompare(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(normalizeForHomeSeedCompare);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => {
        let child = record[key];
        if (key === 'id' && typeof child === 'string' && /^\d+$/.test(child)) {
          child = Number(child);
        }
        return [key, normalizeForHomeSeedCompare(child)] as const;
      });
    return Object.fromEntries(entries);
  }
  return String(value);
}

export function homeSeedJsonEqual(a: unknown, b: unknown): boolean {
  return (
    JSON.stringify(normalizeForHomeSeedCompare(a)) ===
    JSON.stringify(normalizeForHomeSeedCompare(b))
  );
}

export function parseHomeContentField(raw: unknown): HomeMainContent | null {
  let value: unknown = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as HomeMainContent;
}

export function homeSeedPayloadBody(): HomeMainContent {
  return JSON.parse(JSON.stringify(HOME_MAIN_CONTENT)) as HomeMainContent;
}
