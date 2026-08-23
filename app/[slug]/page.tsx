import { notFound } from 'next/navigation';
import { getPageBySlug, getPageMetadataBySlug } from '@/services/wordpress';
import ElementorPageContent from '@/components/ElementorPageContent';

export const revalidate = 300;
export const dynamicParams = true;

const SERVICE_SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'marketing-internacional',
  'agencia-ux-ui',
  'seo-expertos',
  'seo-vigo',
];

export async function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolved = await params;
  const slug = resolved.slug;
  const metadata = await getPageMetadataBySlug(slug);
  return {
    title: metadata.yoast_wpseo_title,
    description: metadata.yoast_wpseo_metadesc,
    openGraph: {
      title: metadata.yoast_wpseo_og_title || metadata.yoast_wpseo_title,
      description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc,
      images: metadata.yoast_wpseo_og_image ? [metadata.yoast_wpseo_og_image] : undefined,
    },
  };
}

export default async function WordPressPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <ElementorPageContent
      html={page.html}
      pageId={page.id}
      stylesheetIds={page.stylesheetIds}
    />
  );
}
