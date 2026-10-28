import { getPayload } from 'payload';
import config from '@payload-config';
import type { SuccessStory } from '@/services/wordpress';
import { isCmsCasosFromPayload } from './cms-casos-flag.ts';
import {
  soyTechnoApprovedCopy,
  type SoyTechnoApprovedCopy,
} from '../cms/data/soytechno-caso.ts';

const APPROVED_COPY_KEYS = Object.keys(soyTechnoApprovedCopy) as Array<
  keyof SoyTechnoApprovedCopy
>;

function hasDatabaseUri(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean((env.DATABASE_URI || env.POSTGRES_URL || '').trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mediaOf(value: unknown): { url: string; alt: string } | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return { url: value, alt: '' };
  if (!isRecord(value)) return undefined;
  const url =
    (typeof value.url === 'string' && value.url) ||
    (typeof value.sourceUrl === 'string' && value.sourceUrl) ||
    '';
  if (!url) return undefined;
  const alt = typeof value.alt === 'string' ? value.alt : '';
  return { url, alt };
}

function normalizeAcf(acf: unknown): Record<string, unknown> {
  if (!isRecord(acf)) return {};
  const out: Record<string, unknown> = { ...acf };
  for (const [key, value] of Object.entries(out)) {
    const media = mediaOf(value);
    if (media && isRecord(value) && !('url' in value && typeof value.url === 'string')) {
      out[key] = media;
    }
  }
  return out;
}

export function extractSoyTechnoCopy(doc: unknown): SoyTechnoApprovedCopy | null {
  if (!isRecord(doc)) return null;
  const acf = isRecord(doc.acf) ? doc.acf : {};
  const soytechno = isRecord(acf.soytechno) ? acf.soytechno : {};
  const raw = isRecord(soytechno.copy) ? soytechno.copy : null;
  if (!raw) return null;
  const copy = { ...soyTechnoApprovedCopy };
  for (const key of APPROVED_COPY_KEYS) {
    const value = raw[key];
    if (typeof value === 'string' && value.length > 0) copy[key] = value as never;
  }
  return copy;
}

export async function findCasoBySlug(slug: string): Promise<Record<string, unknown> | null> {
  if (!isCmsCasosFromPayload() || !hasDatabaseUri()) return null;
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'casos',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    const doc = found.docs[0];
    return doc ? (doc as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function getSuccessStoryFromPayload(slug: string): Promise<SuccessStory | null> {
  const doc = await findCasoBySlug(slug);
  if (!doc) return null;
  const titulo = typeof doc.titulo === 'string' ? doc.titulo : slug;
  const acf = normalizeAcf(doc.acf);
  return {
    id: typeof doc.wpId === 'number' ? doc.wpId : typeof doc.id === 'number' ? doc.id : 0,
    slug,
    title: { rendered: titulo },
    acf: acf as SuccessStory['acf'],
  } as SuccessStory;
}
