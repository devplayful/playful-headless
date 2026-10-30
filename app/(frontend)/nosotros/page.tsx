import { notFound } from 'next/navigation';
import NosotrosView, { EquipoSection } from '@/components/paginas-codigo/NosotrosView';
import {
  buildBreadcrumbListJsonLd,
  serializeServiceLandingJsonLd,
} from '@/utils/service-landing-jsonld';
import {
  NOSOTROS_SLUG,
  paginasB3SeedBodyForSlug,
} from '@/cms/data/paginas-b3-payload';
import { isCmsPaginasB3FromPayload } from '@/lib/cms-paginas-b3-flag';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b3';
import { generateNosotrosMetadata } from '@/lib/paginas-codigo/nosotros-metadata';

export async function generateMetadata() {
  if (isCmsPaginasB3FromPayload()) {
    const expected = paginasB3SeedBodyForSlug(NOSOTROS_SLUG);
    const doc = await findPaginaCodigoBySlug(NOSOTROS_SLUG, {
      renderFromPayload: true,
    });
    if (doc && paginaCodigoContentMatchesSeed(doc, expected.content)) {
      return generateNosotrosMetadata(doc.yoast);
    }
  }
  return generateNosotrosMetadata();
}

export default async function NosotrosPage() {
  if (isCmsPaginasB3FromPayload()) {
    const expected = paginasB3SeedBodyForSlug(NOSOTROS_SLUG);
    const doc = await findPaginaCodigoBySlug(NOSOTROS_SLUG, {
      renderFromPayload: true,
    });
    if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
      notFound();
    }
  }

  const { getAllCaseStudies } = await import('@/services/wordpress');
  const casosDeExito = await getAllCaseStudies();
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
      />
    </>
  );
}
