import { notFound } from 'next/navigation';
import PoliticaPrivacidadView from '@/components/paginas-codigo/PoliticaPrivacidadView';
import {
  POLITICA_PRIVACIDAD_SLUG,
  paginasB1SeedBodyForSlug,
} from '@/cms/data/paginas-b1-payload';
import { isCmsPaginasB1FromPayload } from '@/lib/cms-paginas-b1-flag';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b1';
import { generatePoliticaPrivacidadMetadata } from '@/lib/paginas-codigo/politica-privacidad-metadata';

export async function generateMetadata() {
  if (isCmsPaginasB1FromPayload()) {
    const expected = paginasB1SeedBodyForSlug(POLITICA_PRIVACIDAD_SLUG);
    const doc = await findPaginaCodigoBySlug(POLITICA_PRIVACIDAD_SLUG, {
      renderFromPayload: true,
    });
    if (doc && paginaCodigoContentMatchesSeed(doc, expected.content)) {
      return generatePoliticaPrivacidadMetadata(doc.yoast);
    }
  }
  return generatePoliticaPrivacidadMetadata();
}

export default async function PoliticaDePrivacidadPage() {
  if (isCmsPaginasB1FromPayload()) {
    const expected = paginasB1SeedBodyForSlug(POLITICA_PRIVACIDAD_SLUG);
    const doc = await findPaginaCodigoBySlug(POLITICA_PRIVACIDAD_SLUG, {
      renderFromPayload: true,
    });
    if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
      notFound();
    }
  }

  return <PoliticaPrivacidadView />;
}
