import { notFound } from 'next/navigation';
import NosotrosView, { EquipoSection } from '@/components/paginas-codigo/NosotrosView';
import { NOSOTROS_SLUG } from '@/cms/data/paginas-b3-payload';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b3';
import { paginasB3SeedBodyForSlug, isPaginasB3Slug } from '@/cms/data/paginas-b3-payload';
import { paginasB3PayloadPreviewAttrs } from '@/lib/cms-paginas-b3-flag';
import { generateNosotrosMetadata } from '@/lib/paginas-codigo/nosotros-metadata';
import {
  buildBreadcrumbListJsonLd,
  serializeServiceLandingJsonLd,
} from '@/utils/service-landing-jsonld';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ slug: NOSOTROS_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  const { slug } = await params;
  if (!isPaginasB3Slug(slug)) {
    notFound();
  }
  if (slug === NOSOTROS_SLUG) {
    const expected = paginasB3SeedBodyForSlug(slug);
    const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
    if (doc && paginaCodigoContentMatchesSeed(doc, expected.content)) {
      return generateNosotrosMetadata(doc.yoast);
    }
  }
  return generateNosotrosMetadata();
}

export default async function CmsPaginaB3PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPaginasB3Slug(slug)) notFound();

  const expected = paginasB3SeedBodyForSlug(slug);
  const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }

  const { getAllCaseStudies } = await import('@/services/wordpress');
  const casosDeExito = await getAllCaseStudies();

  if (slug === NOSOTROS_SLUG) {
    const breadcrumb = buildBreadcrumbListJsonLd({ name: 'Nosotros', path: '/nosotros' });
    return (
      <>
        <script
          id="playful-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(breadcrumb) }}
        />
        <NosotrosView
          casosDeExito={casosDeExito}
          equipoSection={<EquipoSection />}
          cmsSourceAttrs={paginasB3PayloadPreviewAttrs()}
        />
      </>
    );
  }

  notFound();
}
