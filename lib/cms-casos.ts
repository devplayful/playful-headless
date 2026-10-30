import { getPayload } from 'payload';
import config from '@payload-config';
import type { SuccessStory } from '@/services/wordpress';
import {
  isCmsCasosFromPayload,
  shouldRenderCasosFromPayload,
} from './cms-casos-flag.ts';
import { hasRuntimeDatabase } from './cms-database.ts';
import {
  soyTechnoApprovedCopy,
  type SoyTechnoApprovedCopy,
} from '../cms/data/soytechno-caso.ts';
import { mergePublicCaseStudies } from './public-case-studies.ts';
import { applyPublicCaseStudyOverrides } from '../utils/public-case-study-overrides.ts';
import { applyCaseStudyCoverOverride } from './case-study-listing-image.ts';
import { preserveFeaturedMediaUrl } from '../services/case-study-media-policy.mjs';
import { finalizePayloadSuccessStory } from './payload-success-story.ts';

const APPROVED_COPY_KEYS = Object.keys(soyTechnoApprovedCopy) as Array<
  keyof SoyTechnoApprovedCopy
>;

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

export async function findCasoBySlug(
  slug: string,
  options: { renderFromPayload?: boolean } = {},
): Promise<Record<string, unknown> | null> {
  const renderFromPayload =
    options.renderFromPayload ?? shouldRenderCasosFromPayload(false);
  if (!renderFromPayload || !hasRuntimeDatabase()) return null;
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

export async function getSuccessStoryFromPayload(
  slug: string,
  options: { renderFromPayload?: boolean } = {},
): Promise<SuccessStory | null> {
  const doc = await findCasoBySlug(slug, options);
  if (!doc) return null;
  const titulo = typeof doc.titulo === 'string' ? doc.titulo : slug;
  const acf = normalizeAcf(doc.acf);
  const story = {
    id: typeof doc.wpId === 'number' ? doc.wpId : typeof doc.id === 'number' ? doc.id : 0,
    slug,
    title: { rendered: titulo },
    acf: acf as SuccessStory['acf'],
  } as SuccessStory;
  return finalizePayloadSuccessStory(story);
}

function mediaUrl(value: unknown): string | undefined {
  const media = mediaOf(value);
  return media?.url;
}

function payloadDocToListingItem(doc: Record<string, unknown>): Record<string, unknown> {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  const titulo = typeof doc.titulo === 'string' ? doc.titulo : slug;
  const acfRaw = isRecord(doc.acf) ? doc.acf : {};
  const featured =
    mediaUrl(doc.imagenDestacada) ||
    mediaUrl(acfRaw.imagenbanner) ||
    '';
  const item = {
    id: typeof doc.wpId === 'number' ? doc.wpId : 0,
    slug,
    title: { rendered: titulo },
    excerpt: { rendered: '' },
    featured_media_url: featured,
    acf: acfRaw,
  };
  const sanitized = item as Record<string, unknown>;
  return applyCaseStudyCoverOverride(
    applyPublicCaseStudyOverrides(preserveFeaturedMediaUrl(item, sanitized)),
  );
}

/** Hub listing when CMS_CASOS_FROM_PAYLOAD o ?cms=1 en Preview. */
export async function getAllCaseStudiesFromPayload(
  options: { renderFromPayload?: boolean } = {},
): Promise<any[]> {
  const renderFromPayload =
    options.renderFromPayload ?? shouldRenderCasosFromPayload(false);
  if (!renderFromPayload || !hasRuntimeDatabase()) return [];
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'casos',
      where: { estado: { equals: 'publish' } },
      limit: 20,
      depth: 2,
    });
    const fromDb = found.docs.map((doc) =>
      payloadDocToListingItem(doc as unknown as Record<string, unknown>),
    );
    return mergePublicCaseStudies(fromDb);
  } catch {
    return [];
  }
}

export function renderCasosFromPayloadNow(cmsQueryOptIn = false): boolean {
  return shouldRenderCasosFromPayload(cmsQueryOptIn);
}

export { isCmsCasosFromPayload };
