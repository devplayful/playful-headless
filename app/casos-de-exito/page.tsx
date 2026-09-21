import { getPageMetadataBySlug } from '@/services/wordpress';
import { canonicalForPath } from '@/utils/canonical';
import {
  CASE_STUDIES_HUB_DESCRIPTION,
  CASE_STUDIES_HUB_PATH,
  CASE_STUDIES_HUB_TITLE,
  CASE_STUDIES_HUB_WP_SLUG,
} from '@/utils/case-study-hub';
import CaseStudiesContent from './CaseStudiesContent';

export default function CaseStudiesPage() {
  return <CaseStudiesContent />;
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
    };
  }
}
