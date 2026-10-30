import { notFound } from 'next/navigation';
import {
  CMS_PAGINAS_B5_PREVIEW_HEADER,
  isCmsPaginasB5FromPayload,
  paginasB5PayloadPreviewAttrs,
} from './cms-paginas-b5-flag.ts';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from './cms-paginas-b5.ts';
import {
  paginasB5SeedBodyForSlug,
  type PaginasB5Slug,
} from '../cms/data/paginas-b5-payload.ts';

export async function ensurePaginasB5NotFoundRender(slug: PaginasB5Slug): Promise<void> {
  if (!isCmsPaginasB5FromPayload()) return;
  const expected = paginasB5SeedBodyForSlug(slug);
  const doc = await findPaginaCodigoBySlug(slug, { renderFromPayload: true });
  if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
    notFound();
  }
}

export async function resolveNotFoundPayloadPreviewAttrs(): Promise<
  Record<string, 'payload'> | undefined
> {
  if (process.env.VERCEL_ENV !== 'preview') return undefined;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const preview = h.get(CMS_PAGINAS_B5_PREVIEW_HEADER);
    if (preview !== 'not-found') return undefined;
    const expected = paginasB5SeedBodyForSlug('not-found');
    const doc = await findPaginaCodigoBySlug('not-found', { renderFromPayload: true });
    if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
      notFound();
    }
    return paginasB5PayloadPreviewAttrs();
  } catch {
    return undefined;
  }
}
