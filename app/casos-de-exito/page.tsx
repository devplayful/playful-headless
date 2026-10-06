import { getAllCaseStudies, getPageMetadataBySlug } from '@/services/wordpress';
import { mapCaseStudyToListingCard } from '@/lib/case-study-listing-card';
import { canonicalForPath } from '@/utils/canonical';
import {
  CASE_STUDIES_HUB_DESCRIPTION,
  CASE_STUDIES_HUB_PATH,
  CASE_STUDIES_HUB_TITLE,
  CASE_STUDIES_HUB_WP_SLUG,
} from '@/utils/case-study-hub';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import CaseStudiesContent from './CaseStudiesContent';

export default async function CaseStudiesPage() {
  const items = await getAllCaseStudies();
  const initialCaseStudies = items.map(mapCaseStudyToListingCard);

  return <CaseStudiesContent initialCaseStudies={initialCaseStudies} />;
}

export async function generateMetadata() {
  // Contento hub SERP 1247n70uwtz
  const url = canonicalForPath(CASE_STUDIES_HUB_PATH);
  const title = CASE_STUDIES_HUB_TITLE;
  const description = CASE_STUDIES_HUB_DESCRIPTION;

  try {
    const metadata = await getPageMetadataBySlug(CASE_STUDIES_HUB_WP_SLUG);

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        images: metadata.yoast_wpseo_og_image
          ? [
              {
                url: metadata.yoast_wpseo_og_image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [],
      },
      twitter: twitterFromOpenGraph(title, description),
    };
  } catch (error) {
    console.error('Error al generar metadatos de la página de casos de éxito:', error);
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
      },
      twitter: twitterFromOpenGraph(title, description),
    };
  }
}
