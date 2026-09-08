import type { CaseStudy } from '@/components/CarouselResultados';
import { SOCIAL_PROOF } from './copy';

function caseImage(item: {
  acf?: { imagen_destacada?: string };
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
}) {
  return item._embedded?.['wp:featuredmedia']?.[0]?.source_url || item.acf?.imagen_destacada || '';
}

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

  return SOCIAL_PROOF.cases.map((item, index) => {
    const slug = item.href.replace('https://playfulagency.com/casos-de-exito/', '');
    const wp = bySlug.get(slug);
    return {
      id: typeof wp?.id === 'number' ? wp.id : index + 1,
      title: wp?.title?.rendered || item.name,
      slug,
      description: item.line,
      categories: wp ? caseCategories(wp) : [],
      badge: typeof wp?.acf?.badge === 'string' ? wp.acf.badge : '',
      badgeColor: typeof wp?.acf?.badge_color === 'string' ? wp.acf.badge_color : 'bg-purple-600',
      buttonText: typeof wp?.acf?.button_text === 'string' ? wp.acf.button_text : 'Ver más',
      buttonColor: typeof wp?.acf?.button_color === 'string' ? wp.acf.button_color : 'bg-blue-600',
      image: wp ? caseImage(wp) : '',
    };
  });
}
