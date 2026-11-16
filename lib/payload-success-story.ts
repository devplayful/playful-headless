import type { SuccessStory } from '@/services/wordpress';
import { applyPublicCaseStudyOverrides } from '../utils/public-case-study-overrides.ts';
import { applyCaseStudyCoverOverride } from './case-study-listing-image.ts';
import { isAllowedCaseStudyMediaUrl } from '../services/case-study-media-policy.mjs';

const CASE_STUDY_MEDIA_FIELDS = [
  'imagenbanner',
  'imagenminuta1',
  'imagenminuta2',
  'imagenminuta3',
  'desafioimagen1',
  'desafioimagen2',
  'desafioimagen3',
  'desafioimagen4',
  'imagendesarrollo',
  'imagenminuta4',
  'imagenminuta5',
  'imagenminuta6',
  'grilla1',
  'grilla2',
  'grilla3',
  'grilla4',
  'grilla5',
  'grilla6',
  'grilla7',
  'grilla8',
  'telefono1',
  'telefono2',
  'telefono3',
  'telefono4',
  'telefonos',
  'testimonial_foto',
] as const;

function sanitizeAlt(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function preserveCaseStudyMediaValue(value: unknown): unknown {
  if (isAllowedCaseStudyMediaUrl(value)) return value;
  if (Array.isArray(value)) {
    const media = value
      .map((item) => preserveCaseStudyMediaValue(item))
      .filter((item) => item !== undefined);
    return media.length > 0 ? media : undefined;
  }
  if (!value || typeof value !== 'object') return undefined;

  const source = value as Record<string, unknown>;
  if (!isAllowedCaseStudyMediaUrl(source.url)) return undefined;

  const media: Record<string, unknown> = { url: source.url };
  const alt = sanitizeAlt(source.alt);
  if (typeof alt === 'string') media.alt = alt;
  if (typeof source.width === 'number' && Number.isFinite(source.width)) media.width = source.width;
  if (typeof source.height === 'number' && Number.isFinite(source.height)) media.height = source.height;
  return media;
}

function preserveCaseStudyMediaFields(acf: Record<string, unknown>): Record<string, unknown> {
  const media: Record<string, unknown> = {};
  for (const key of CASE_STUDY_MEDIA_FIELDS) {
    const preserved = preserveCaseStudyMediaValue(acf[key]);
    if (preserved !== undefined) media[key] = preserved;
  }
  return media;
}

/** Same cover + allowlisted media shaping as `getSuccessStoryBySlug` (WordPress path). */
export function finalizePayloadSuccessStory(story: SuccessStory): SuccessStory {
  const acf = story.acf as Record<string, unknown>;
  const withMedia: SuccessStory = {
    ...story,
    acf: {
      ...acf,
      ...preserveCaseStudyMediaFields(acf),
    } as SuccessStory['acf'],
  };
  return applyCaseStudyCoverOverride(applyPublicCaseStudyOverrides(withMedia));
}
