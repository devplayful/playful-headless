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

/**
 * Prepend public/synthetic cases, then remaining WordPress items.
 * WordPress wins on slug collision so a later CMS publish replaces the override.
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
    merged.push(fromWp ?? synthetic);
    seen.add(synthetic.slug);
  }

  for (const item of published) {
    const slug = slugOf(item);
    if (slug && seen.has(slug)) continue;
    if (slug) seen.add(slug);
    merged.push(item);
  }

  return merged;
}
