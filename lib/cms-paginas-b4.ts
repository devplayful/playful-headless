import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { hasRuntimeDatabase } from './cms-database.ts';
import { isCmsPaginasB4FromPayload } from './cms-paginas-b4-flag.ts';
import { isPaginasB4Slug, type PaginasB4Slug } from '../cms/data/paginas-b4-payload.ts';
import { paginaCodigoContentMatchesSeed as paginaCodigoContentMatchesSeedCore } from './paginas-b1-seed-compare.ts';
import type { PaginaCodigoYoastLike } from './paginas-codigo/contacto-metadata.ts';

export type PaginaCodigoDoc = {
  id: number | string;
  titulo: string;
  slug: string;
  bloque: string;
  content: Record<string, unknown>;
  yoast?: PaginaCodigoYoastLike;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizePaginaCodigoDoc(doc: unknown): PaginaCodigoDoc | null {
  if (!isRecord(doc)) return null;
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  const yoastRaw = isRecord(doc.yoast) ? doc.yoast : null;
  const yoast: PaginaCodigoYoastLike | undefined = yoastRaw
    ? {
        title: typeof yoastRaw.title === 'string' ? yoastRaw.title : undefined,
        description:
          typeof yoastRaw.description === 'string' ? yoastRaw.description : undefined,
        canonical:
          typeof yoastRaw.canonical === 'string' ? yoastRaw.canonical : undefined,
        ogTitle: typeof yoastRaw.ogTitle === 'string' ? yoastRaw.ogTitle : undefined,
        ogDescription:
          typeof yoastRaw.ogDescription === 'string' ? yoastRaw.ogDescription : undefined,
        ogImage: typeof yoastRaw.ogImage === 'string' ? yoastRaw.ogImage : undefined,
      }
    : undefined;
  return {
    id: doc.id as number | string,
    titulo: typeof doc.titulo === 'string' ? doc.titulo : slug,
    slug,
    bloque: typeof doc.bloque === 'string' ? doc.bloque : '',
    content: isRecord(doc.content) ? doc.content : {},
    yoast,
  };
}

const loadPaginaCodigoDocFromDb = cache(async function loadPaginaCodigoDocFromDb(
  slug: string,
): Promise<PaginaCodigoDoc | null> {
  if (!hasRuntimeDatabase()) return null;
  if (!isPaginasB4Slug(slug)) return null;
  let payload: Awaited<ReturnType<typeof getPayload>> | null = null;
  try {
    payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'paginas-codigo',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    return normalizePaginaCodigoDoc(found.docs[0]);
  } catch {
    return null;
  } finally {
    if (payload && process.env.NEXT_PHASE === 'phase-production-build') {
      await payload.destroy().catch(() => undefined);
    }
  }
});

export async function findPaginaCodigoBySlug(
  slug: string,
  options?: { renderFromPayload?: boolean },
): Promise<PaginaCodigoDoc | null> {
  const enabled = options?.renderFromPayload ?? isCmsPaginasB4FromPayload();
  if (!enabled) return null;
  return loadPaginaCodigoDocFromDb(slug);
}

export function paginaCodigoContentMatchesSeed(
  doc: PaginaCodigoDoc,
  expectedContent: Record<string, unknown>,
): boolean {
  return paginaCodigoContentMatchesSeedCore(doc, expectedContent);
}

export type { PaginasB4Slug };
