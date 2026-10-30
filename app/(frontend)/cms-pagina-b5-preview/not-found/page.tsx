import { notFound } from 'next/navigation';
import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import { paginasB5SeedBodyForSlug } from '@/cms/data/paginas-b5-payload';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b5';
import { paginasB5PayloadPreviewAttrs } from '@/lib/cms-paginas-b5-flag';
import { generateMetadata as layoutMetadata } from '../../layout';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  const expected = paginasB5SeedBodyForSlug('not-found');
  const doc = await findPaginaCodigoBySlug('not-found', { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }
  const base = await layoutMetadata();
  return {
    ...base,
    robots: 'noindex',
  };
}

export default async function CmsPaginaB5PreviewNotFoundPage() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  const expected = paginasB5SeedBodyForSlug('not-found');
  const doc = await findPaginaCodigoBySlug('not-found', { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }
  return <NotFoundView cmsSourceAttrs={paginasB5PayloadPreviewAttrs()} />;
}
