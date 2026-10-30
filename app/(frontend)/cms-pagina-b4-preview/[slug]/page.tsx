import { notFound } from 'next/navigation';
import ContactPageClient from '@/app/(frontend)/contactar-agencia-de-marketing-digital/ContactPageClient';
import ReunionPlayfulRedirect from '@/app/(frontend)/reunion-playful/ReunionPlayfulRedirect';
import {
  CONTACT_SLUG,
  REUNION_PLAYFUL_SLUG,
  paginasB4SeedBodyForSlug,
  isPaginasB4Slug,
} from '@/cms/data/paginas-b4-payload';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b4';
import { paginasB4PayloadPreviewAttrs } from '@/lib/cms-paginas-b4-flag';
import { generateContactoMetadata } from '@/lib/paginas-codigo/contacto-metadata';
import { generateReunionPlayfulMetadata } from '@/lib/paginas-codigo/reunion-playful-metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  const { slug } = await params;
  if (!isPaginasB4Slug(slug)) {
    notFound();
  }
  const expected = paginasB4SeedBodyForSlug(slug);
  const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
  const yoast = doc && paginaCodigoContentMatchesSeed(doc, expected.content) ? doc.yoast : undefined;
  if (slug === CONTACT_SLUG) {
    return generateContactoMetadata(yoast);
  }
  return generateReunionPlayfulMetadata(yoast);
}

export default async function CmsPaginaB4PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPaginasB4Slug(slug)) notFound();

  const expected = paginasB4SeedBodyForSlug(slug);
  const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }

  const cmsSourceAttrs = paginasB4PayloadPreviewAttrs();

  if (slug === CONTACT_SLUG) {
    const casosDeExito = await (await import('@/services/wordpress')).getAllCaseStudies();
    const previewSimulation =
      process.env.VERCEL_ENV === 'preview'
      && process.env.PREVIEW_CONTACT_SIMULATOR_ENABLED === 'true';
    return (
      <div {...cmsSourceAttrs}>
        <ContactPageClient casosDeExito={casosDeExito} previewSimulation={previewSimulation} />
      </div>
    );
  }

  if (slug === REUNION_PLAYFUL_SLUG) {
    return (
      <div {...cmsSourceAttrs}>
        <ReunionPlayfulRedirect />
      </div>
    );
  }

  notFound();
}
