import { getPublicCaseStudySeoOverride } from '../utils/public-case-study-overrides.ts';
import { featuredTapaForSlug } from './case-study-listing-image.ts';

export const SOYTECHNO_CASE_SLUG = 'soytechno-ecommerce-venezuela';

const soytechnoSeo = getPublicCaseStudySeoOverride(SOYTECHNO_CASE_SLUG);

type PublicCaseStudy = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media_url: string;
  acf: {
    categoria1: string;
    categoria2: string;
    categoria3: string;
    categoria4: string;
    categoria5: string;
    badge: string;
    badge_color: string;
    button_text: string;
    button_color: string;
  };
};

/** Synthetic published cases that live in Next.js until WordPress has the same slug. */
export const PUBLIC_CASE_STUDIES: readonly PublicCaseStudy[] = [
  {
    id: -71001,
    slug: SOYTECHNO_CASE_SLUG,
    title: {
      rendered: soytechnoSeo?.title ?? 'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela',
    },
    excerpt: {
      rendered: soytechnoSeo?.description
        ?? 'Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo. Cómo compra y confía el mercado fuera del chat informal.',
    },
    featured_media_url: featuredTapaForSlug(SOYTECHNO_CASE_SLUG),
    acf: {
      categoria1: 'E-commerce',
      categoria2: '',
      categoria3: '',
      categoria4: '',
      categoria5: '',
      badge: '',
      badge_color: 'bg-purple-600',
      button_text: 'Ver más',
      button_color: 'bg-blue-600 hover:bg-blue-700',
    },
  },
];

function slugOf(item: { slug?: unknown }): string | null {
  return typeof item?.slug === 'string' && item.slug ? item.slug : null;
}

/** Hub card order on production (SoyTechno → Jumex → Odwalla). */
export const HUB_CASE_STUDY_SLUG_ORDER = [
  SOYTECHNO_CASE_SLUG,
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
] as const;

export function sortHubCaseStudies<T extends { slug?: unknown }>(items: readonly T[]): T[] {
  const rank = (slug: string | null) => {
    if (!slug) return HUB_CASE_STUDY_SLUG_ORDER.length;
    const index = HUB_CASE_STUDY_SLUG_ORDER.indexOf(slug as (typeof HUB_CASE_STUDY_SLUG_ORDER)[number]);
    return index === -1 ? HUB_CASE_STUDY_SLUG_ORDER.length : index;
  };
  return [...items].sort((left, right) => rank(slugOf(left)) - rank(slugOf(right)));
}

/** Listing copy for SoyTechno on the hub matches prod (SEO + categoría), not Payload titulo. */
function applyPublicHubListingFields<T extends { slug?: unknown; acf?: unknown }>(
  item: T,
  synthetic: PublicCaseStudy,
): T {
  return {
    ...item,
    title: synthetic.title,
    excerpt: synthetic.excerpt,
    featured_media_url: synthetic.featured_media_url || (item as { featured_media_url?: string }).featured_media_url,
    acf: {
      ...(typeof item.acf === 'object' && item.acf ? item.acf : {}),
      categoria1: synthetic.acf.categoria1,
      categoria2: synthetic.acf.categoria2,
      categoria3: synthetic.acf.categoria3,
      categoria4: synthetic.acf.categoria4,
      categoria5: synthetic.acf.categoria5,
      badge: synthetic.acf.badge,
      badge_color: synthetic.acf.badge_color,
      button_text: synthetic.acf.button_text,
      button_color: synthetic.acf.button_color,
    },
  };
}

/**
 * Prepend public/synthetic cases, then remaining WordPress items.
 * On slug collision the CMS row wins for id/body; hub listing copy for SoyTechno stays public.
 */
export function mergePublicCaseStudies<T extends { slug?: unknown }>(
  wpItems: readonly T[] | null | undefined,
): Array<T | PublicCaseStudy> {
  const published = Array.isArray(wpItems) ? wpItems : [];
  const wpBySlug = new Map<string, T>();

  for (const item of published) {
    const slug = slugOf(item);
    if (slug) wpBySlug.set(slug, item);
  }

  const merged: Array<T | PublicCaseStudy> = [];
  const seen = new Set<string>();

  for (const synthetic of PUBLIC_CASE_STUDIES) {
    const fromWp = wpBySlug.get(synthetic.slug);
    merged.push(fromWp ? applyPublicHubListingFields(fromWp, synthetic) : synthetic);
    seen.add(synthetic.slug);
  }

  for (const item of published) {
    const slug = slugOf(item);
    if (slug && seen.has(slug)) continue;
    if (slug) seen.add(slug);
    merged.push(item);
  }

  return sortHubCaseStudies(merged);
}
