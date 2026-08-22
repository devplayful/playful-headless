import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPageBySlug, getPageMetadataBySlug } from '@/services/wordpress';

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
    <main className="min-h-screen bg-[#FEF7FF] text-[#4A4453]">
      <section className="max-w-[900px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <p className="text-sm uppercase tracking-wide text-[#2A0064] mb-3 font-semibold">Servicios</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A0064] mb-6">
          {page.title}
        </h1>
        {page.lead && (
          <p className="text-lg md:text-xl leading-relaxed mb-10">{page.lead}</p>
        )}
        <div className="space-y-6">
          {page.blocks
            .filter((block) => block.text !== page.lead)
            .map((block, index) =>
              block.type === 'heading' ? (
                <h2 key={index} className="text-2xl font-bold text-[#2A0064] pt-4">
                  {block.text}
                </h2>
              ) : (
                <p key={index} className="text-base md:text-lg leading-relaxed">
                  {block.text}
                </p>
              )
            )}
        </div>
        <div className="mt-12">
          <Link
            href="/contactar-agencia-de-marketing-digital"
            className="inline-flex items-center bg-[#4B0082] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#3D006B] transition-colors"
          >
            Hablar con Playful
          </Link>
        </div>
      </section>
    </main>
  );
}
