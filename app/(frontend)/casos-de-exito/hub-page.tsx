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
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import CaseStudiesContent from './CaseStudiesContent';
import { buildCaseStudiesHubBreadcrumbJsonLd } from '@/utils/case-study-jsonld';
import { serializeServiceLandingJsonLd } from '@/utils/service-landing-jsonld';
import {
  casosPayloadPreviewAttrs,
  shouldRenderCasosFromPayload,
} from '@/lib/cms-casos-flag';
import { getAllCaseStudiesFromPayload } from '@/lib/cms-casos';

/** ISR + CDN cache for case-study hub (TTFB). */
export const revalidate = 3600;

type HubOptions = {
  renderFromPayload: boolean;
};

export async function renderCaseStudiesHub(options: HubOptions) {
  const items = options.renderFromPayload
    ? await getAllCaseStudiesFromPayload({ renderFromPayload: true })
    : await getAllCaseStudies();
  const initialCaseStudies = items.map(mapCaseStudyToListingCard);
  const previewAttrs =
    options.renderFromPayload && process.env.VERCEL_ENV === 'preview'
      ? casosPayloadPreviewAttrs()
      : {};

  return (
    <>
      <script
        id="playful-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeServiceLandingJsonLd(buildCaseStudiesHubBreadcrumbJsonLd()),
        }}
      />
      <div {...previewAttrs}>
        <CaseStudiesContent initialCaseStudies={initialCaseStudies} />
      </div>
    </>
  );
}

export async function generateCaseStudiesHubMetadata() {
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
        images: (() => {
          const jpeg = ogJpegForPath(CASE_STUDIES_HUB_PATH);
          if (jpeg) return [ogJpegMeta(jpeg, title)];
          return metadata.yoast_wpseo_og_image
            ? [
                {
                  url: metadata.yoast_wpseo_og_image,
                  width: 1200,
                  height: 630,
                  alt: title,
                },
              ]
            : [];
        })(),
      },
      twitter: {
        ...twitterFromOpenGraph(title, description),
        ...(ogJpegForPath(CASE_STUDIES_HUB_PATH)
          ? { images: [ogJpegForPath(CASE_STUDIES_HUB_PATH)] }
          : {}),
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
      twitter: twitterFromOpenGraph(title, description),
    };
  }
}

export function defaultHubRenderFromPayload(): boolean {
  return shouldRenderCasosFromPayload(false);
}
