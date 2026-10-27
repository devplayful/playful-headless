import type { CaseStudy } from '@/components/CarouselResultados';
import { featuredTapaForSlug, resolveCaseStudyListingImage } from '@/lib/case-study-listing-image';

const ADS_CASE_SLUG_ORDER = [
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
  'soytechno-ecommerce-venezuela',
] as const;

const ADS_CASE_LINES: Record<(typeof ADS_CASE_SLUG_ORDER)[number], string> = {
  'jumex-shopify-dtc-ecommerce':
    'Jumex — ecommerce D2C en Shopify (componente reutilizado; copy de tarjeta pendiente en landings de ads).',
  'odwalla-shopify-dtc-ecommerce':
    'Odwalla — ecommerce D2C en Shopify (componente reutilizado; copy de tarjeta pendiente en landings de ads).',
  'soytechno-ecommerce-venezuela':
    'SoyTechno — ecommerce en Venezuela (componente reutilizado; copy de tarjeta pendiente en landings de ads).',
};

function caseCategories(item: { acf?: Record<string, unknown> }) {
  const categories: string[] = [];
  const tags = item.acf?.tags;
  if (Array.isArray(tags)) {
    categories.push(...tags.filter((tag): tag is string => typeof tag === 'string'));
  }
  for (let index = 1; index <= 5; index += 1) {
    const category = item.acf?.[`categoria${index}`];
    if (typeof category === 'string' && category) {
      categories.push(category);
    }
  }
  return categories;
}

export function toAdsLandingCaseCards(casosDeExito: Array<Record<string, any>> = []): CaseStudy[] {
  const bySlug = new Map(
    casosDeExito
      .filter((item) => typeof item?.slug === 'string')
      .map((item) => [item.slug as string, item]),
  );

  return ADS_CASE_SLUG_ORDER.map((slug, index) => {
    const wp = bySlug.get(slug);
    return {
      id: typeof wp?.id === 'number' ? wp.id : index + 1,
      title: wp?.title?.rendered || slug,
      slug,
      description: ADS_CASE_LINES[slug],
      categories: wp ? caseCategories(wp) : [],
      badge: typeof wp?.acf?.badge === 'string' ? wp.acf.badge : '',
      badgeColor: typeof wp?.acf?.badge_color === 'string' ? wp.acf.badge_color : 'bg-purple-600',
      buttonText: typeof wp?.acf?.button_text === 'string' ? wp.acf.button_text : 'Ver más',
      buttonColor: typeof wp?.acf?.button_color === 'string' ? wp.acf.button_color : 'bg-blue-600',
      image: resolveCaseStudyListingImage(wp) || featuredTapaForSlug(slug),
    };
  });
}
