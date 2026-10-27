import { applyPublicCaseStudyOverrides } from '@/utils/public-case-study-overrides';
import { mergePublicCaseStudies } from '@/lib/public-case-studies';
import { applyCaseStudyCoverOverride } from '@/lib/case-study-listing-image';
import { preserveFeaturedMediaUrl } from '@/services/case-study-media-policy.mjs';
import type { SuccessStory } from '@/services/wordpress';
import { loadCmsExportBundle } from './load-bundle';

function attachFeatured(caso: Record<string, unknown>): Record<string, unknown> {
  const mediaId = caso.featured_media as number | undefined;
  if (!mediaId) return caso;
  const m = loadCmsExportBundle().mediaById.get(mediaId);
  if (!m) return caso;
  return {
    ...caso,
    featured_media_url: m.source_url,
    featured_media_alt: m.alt_text || '',
    _embedded: {
      ...(caso._embedded as object),
      'wp:featuredmedia': [{ id: m.id, source_url: m.source_url, alt_text: m.alt_text || '' }],
    },
  };
}

function normalizeCaso(raw: any): Record<string, unknown> {
  const withMedia = attachFeatured({ ...raw });
  const sanitized = { ...withMedia };
  return applyCaseStudyCoverOverride(
    applyPublicCaseStudyOverrides(preserveFeaturedMediaUrl(raw, sanitized)),
  );
}

export async function getAllCaseStudiesFromExport(): Promise<any[]> {
  const bundle = loadCmsExportBundle();
  const published = bundle.casos
    .filter((c) => c.status === 'publish')
    .map((c) => normalizeCaso(c));
  return mergePublicCaseStudies(published);
}

export async function getSuccessStoryBySlugFromExport(slug: string): Promise<SuccessStory | null> {
  const raw = loadCmsExportBundle().casos.find((c) => c.slug === slug);
  if (!raw?.acf) return null;
  return normalizeCaso(raw) as SuccessStory;
}
