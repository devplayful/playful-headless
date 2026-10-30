import { getPayload } from 'payload';
import config from '@payload-config';
import { hasRuntimeDatabase } from './cms-database.ts';
import { shouldRenderPaginasB1FromPayload } from './cms-paginas-b1-flag.ts';
import { isPaginasB1Slug, type PaginasB1Slug } from '../cms/data/paginas-b1-payload.ts';
import { paginaCodigoContentMatchesSeed as paginaCodigoContentMatchesSeedCore } from './paginas-b1-seed-compare.ts';
import type { PaginaCodigoYoastLike } from './paginas-codigo/politica-privacidad-metadata.ts';

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

export async function findPaginaCodigoBySlug(
  slug: string,
  options?: { renderFromPayload?: boolean },
): Promise<PaginaCodigoDoc | null> {
  const enabled =
    options?.renderFromPayload ?? shouldRenderPaginasB1FromPayload(false);
  if (!enabled || !hasRuntimeDatabase()) return null;
  if (!isPaginasB1Slug(slug)) return null;
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'paginas-codigo',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    return normalizePaginaCodigoDoc(found.docs[0]);
  } catch {
    return null;
  }
}

export function paginaCodigoContentMatchesSeed(
  doc: PaginaCodigoDoc,
  expectedContent: Record<string, unknown>,
): boolean {
  return paginaCodigoContentMatchesSeedCore(doc, expectedContent);
}

export type { PaginasB1Slug };
