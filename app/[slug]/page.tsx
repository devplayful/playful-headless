import { notFound } from 'next/navigation';
import { canonicalForPath } from '@/utils/canonical';
import { getPageBySlug, getPageMetadataBySlug } from '@/services/wordpress';
import { applyPageTitleOverride, applyPageDescriptionOverride, twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import ElementorPageContent from '@/components/ElementorPageContent';
import {
  AGENCIA_UX_UI_SLUG,
  buildAgenciaUxUiJsonLd,
  serializeServiceLandingJsonLd,
} from '@/utils/service-landing-jsonld';

export const revalidate = 300;
// Unknown slugs must not enter this page: generateMetadata+notFound()
// still ships the empty __next_error__ shell. dynamicParams=false makes
// a miss the same prerendered 404 as /a/b/c, with the H1 in the HTML.
export const dynamicParams = false;

const SERVICE_SLUGS = [
  'agencia-e-commerce',
  'marketing-internacional',
  'agencia-ux-ui',
  'seo-expertos',
  'seo-vigo',
];

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const slug = resolved.slug;
  // notFound() here (not only in the page) so Next paints app/not-found.tsx
  // as HTML. A successful generateMetadata + later notFound() leaves the
  // empty __next_error__ shell.
  const page = await getPageBySlug(slug);
  if (!page) {
    notFound();
  }
  const url = canonicalForPath(`/${slug}`);
  const metadata = await getPageMetadataBySlug(slug);
  const { title, ogTitle } = applyPageTitleOverride(
    slug,
    metadata.yoast_wpseo_title,
    metadata.yoast_wpseo_og_title,
  );
  const { description, ogDescription } = applyPageDescriptionOverride(
    slug,
    metadata.yoast_wpseo_metadesc,
    metadata.yoast_wpseo_og_description,
  );
  const jpeg = ogJpegForPath(`/${slug}`);
  const images = jpeg
    ? [ogJpegMeta(jpeg, ogTitle || title || 'Playful Agency')]
    : metadata.yoast_wpseo_og_image
      ? [metadata.yoast_wpseo_og_image]
      : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(slug === 'gracias' ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      images,
    },
    twitter: {
      ...twitterFromOpenGraph(ogTitle, ogDescription),
      ...(jpeg ? { images: [jpeg] } : {}),
    },
  };
}

export default async function WordPressPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const uxUiJsonLd = slug === AGENCIA_UX_UI_SLUG
    ? buildAgenciaUxUiJsonLd(
        applyPageDescriptionOverride(
          slug,
          (await getPageMetadataBySlug(slug)).yoast_wpseo_metadesc,
          undefined,
        ).description,
      )
    : null;

  return (
    <>
      {uxUiJsonLd ? (
        <>
          <script
            id="playful-service"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(uxUiJsonLd.service) }}
          />
          <script
            id="playful-breadcrumb"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(uxUiJsonLd.breadcrumb) }}
          />
        </>
      ) : null}
      <ElementorPageContent
        html={page.html}
        pageId={page.id}
        stylesheetIds={page.stylesheetIds}
        slug={slug}
      />
    </>
  );
}
