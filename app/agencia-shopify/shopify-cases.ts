import type { CaseStudy } from '@/components/CarouselResultados';
import { featuredTapaForSlug, resolveCaseStudyListingImage } from '@/lib/case-study-listing-image';
import { SOCIAL_PROOF } from './copy';

const CARD_SLUG_ORDER = [
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
] as const;

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

export function toShopifyCaseCards(casosDeExito: Array<Record<string, any>> = []): CaseStudy[] {
  const bySlug = new Map(
    casosDeExito
      .filter((item) => typeof item?.slug === 'string')
      .map((item) => [item.slug as string, item]),
  );
  const copyBySlug = new Map(
    SOCIAL_PROOF.cases.map((item) => [
      item.href.replace('https://playfulagency.com/casos-de-exito/', ''),
      item,
    ]),
  );

  return CARD_SLUG_ORDER.flatMap((slug, index) => {
    const copy = copyBySlug.get(slug);
    if (!copy) return [];
    const wp = bySlug.get(slug);
    return [
      {
        id: typeof wp?.id === 'number' ? wp.id : index + 1,
        title: wp?.title?.rendered || copy.name,
        slug,
        description: copy.line,
        categories: wp ? caseCategories(wp) : [],
        badge: typeof wp?.acf?.badge === 'string' ? wp.acf.badge : '',
        badgeColor: typeof wp?.acf?.badge_color === 'string' ? wp.acf.badge_color : 'bg-purple-600',
        buttonText: typeof wp?.acf?.button_text === 'string' ? wp.acf.button_text : 'Ver más',
        buttonColor: typeof wp?.acf?.button_color === 'string' ? wp.acf.button_color : 'bg-blue-600',
        image: resolveCaseStudyListingImage(wp) || featuredTapaForSlug(slug),
      },
    ];
  });
}
