import { largestAllowedCaseStudyMediaUrl } from '../services/case-study-media-policy.mjs';

/** Same listing endpoint and featured-media resolver as /casos-de-exito. */
export const CASE_STUDIES_LISTING_EMBED_URL =
  'https://endpoint.playfulagency.com/wp-json/wp/v2/casos-de-exito?_embed';

export const CASE_STUDY_COVER_SIZE = { width: 1200, height: 1200 } as const;

/**
 * Featured/OG tapas. Local `/casos/` paths win over WordPress the same way
 * BLOG_COVER_OVERRIDES win over featured_media (José, 19 oct 2026).
 */
export const CASOS_DE_EXITO_FEATURED_TAPAS = {
  'jumex-shopify-dtc-ecommerce': '/casos/Tapa-Caso-de-exito-JUMEX-US.png',
  'odwalla-shopify-dtc-ecommerce': '/casos/Tapa-Caso-de-exito-Odwalla.png',
  'soytechno-ecommerce-venezuela':
    '/images/casos/soytechno/images/lifestyle-f.jpg',
} as const;

export function featuredTapaForSlug(slug: string): string {
  return CASOS_DE_EXITO_FEATURED_TAPAS[slug as keyof typeof CASOS_DE_EXITO_FEATURED_TAPAS] || '';
}

/** José-approved 1200×1200 replacements live under public/casos/. */
export function isLocalCaseStudyCoverOverride(path: string): boolean {
  return path.startsWith('/casos/');
}

export function resolveCaseStudyCoverUrl(
  slug: string | undefined | null,
  fallback = '',
): string {
  return featuredTapaForSlug(slug || '') || fallback;
}

export function resolveCaseStudyOgImage(
  slug: string,
  fallbackJpeg = '',
  alt = '',
): { url: string; width: number; height: number; alt: string } | undefined {
  const tapa = featuredTapaForSlug(slug);
  if (isLocalCaseStudyCoverOverride(tapa)) {
    return {
      url: tapa,
      width: CASE_STUDY_COVER_SIZE.width,
      height: CASE_STUDY_COVER_SIZE.height,
      alt,
    };
  }
  if (!fallbackJpeg) return undefined;
  return { url: fallbackJpeg, width: 1200, height: 630, alt };
}

type CaseStudyCoverRecord = {
  slug?: string;
  featured_media_url?: string;
  acf?: Record<string, unknown> | null;
};

/** Prefer the local tapa for featured_media and the case-page hero (imagenbanner). */
export function applyCaseStudyCoverOverride<T extends CaseStudyCoverRecord>(story: T): T {
  const tapa = featuredTapaForSlug(story?.slug || '');
  if (!isLocalCaseStudyCoverOverride(tapa)) return story;

  const current = story.acf?.imagenbanner;
  const alt =
    current && typeof current === 'object' && typeof (current as { alt?: unknown }).alt === 'string'
      ? (current as { alt: string }).alt
      : '';

  return {
    ...story,
    featured_media_url: tapa,
    acf: {
      ...(story.acf && typeof story.acf === 'object' ? story.acf : {}),
      imagenbanner: {
        url: tapa,
        alt,
        width: CASE_STUDY_COVER_SIZE.width,
        height: CASE_STUDY_COVER_SIZE.height,
      },
    },
  };
}

export function resolveCaseStudyListingImage(item: {
  slug?: string;
  featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      width?: number;
      media_details?: {
        width?: number;
        sizes?: Record<string, { source_url?: string; width?: number }>;
      };
    }>;
  };
} | null | undefined): string {
  const override = resolveCaseStudyCoverUrl(item?.slug);
  if (override) return override;
  const fromEmbed = largestAllowedCaseStudyMediaUrl(
    item?._embedded?.['wp:featuredmedia']?.[0],
  );
  if (fromEmbed) return fromEmbed;
  if (typeof item?.featured_media_url === 'string' && item.featured_media_url) {
    return item.featured_media_url;
  }
  return '';
}
