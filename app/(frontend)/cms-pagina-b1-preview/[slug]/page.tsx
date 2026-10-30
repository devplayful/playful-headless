import { notFound } from 'next/navigation';
import PoliticaPrivacidadView from '@/components/paginas-codigo/PoliticaPrivacidadView';
import { POLITICA_PRIVACIDAD_SLUG } from '@/cms/data/paginas-b1-payload';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b1';
import { paginasB1SeedBodyForSlug, isPaginasB1Slug } from '@/cms/data/paginas-b1-payload';
import { paginasB1PayloadPreviewAttrs } from '@/lib/cms-paginas-b1-flag';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ slug: POLITICA_PRIVACIDAD_SLUG }];
}

export default async function CmsPaginaB1PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPaginasB1Slug(slug)) notFound();

  const expected = paginasB1SeedBodyForSlug(slug);
  const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }

  if (slug === POLITICA_PRIVACIDAD_SLUG) {
    return (
      <PoliticaPrivacidadView cmsSourceAttrs={paginasB1PayloadPreviewAttrs()} />
    );
  }

  notFound();
}
