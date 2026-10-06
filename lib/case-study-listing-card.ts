import { resolveCaseStudyListingImage } from './case-study-listing-image.ts';

/** Card shape the hub already paints in the browser. */
export type CaseStudyListingCard = {
  id: number;
  title: string;
  slug: string;
  description: string;
  categories: string[];
  badge: string;
  badgeColor: string;
  buttonText: string;
  buttonColor: string;
  image: string;
};

/** Same mapping the hub client used after the WordPress fetch. */
export function mapCaseStudyToListingCard(item: any): CaseStudyListingCard {
  const title = item.title?.rendered || 'Sin título';

  let description = '';
  if (item.excerpt?.rendered) {
    description = item.excerpt.rendered
      .replace(/<[^>]*>?/gm, '')
      .replace(/\[\/?(p|br|strong|em|h[1-6])\]/g, '')
      .trim();
  } else if (item.content?.rendered) {
    description =
      item.content.rendered.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';
  }

  const image = resolveCaseStudyListingImage(item);

  const categories = [
    item.acf?.categoria1,
    item.acf?.categoria2,
    item.acf?.categoria3,
    item.acf?.categoria4,
    item.acf?.categoria5,
  ].filter(Boolean) as string[];

  return {
    id: item.id,
    title,
    slug: item.slug || `caso-${item.id}`,
    description: description || 'Descripción no disponible',
    categories,
    badge: item.acf?.badge || item.meta?._case_study_badge || '',
    badgeColor:
      item.acf?.badge_color ||
      item.meta?._case_study_badge_color ||
      'bg-purple-600',
    buttonText: item.acf?.button_text || 'Ver más',
    buttonColor: item.acf?.button_color || 'bg-blue-600 hover:bg-blue-700',
    image,
  };
}
