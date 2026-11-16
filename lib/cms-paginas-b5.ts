import { getPayload } from 'payload';
import config from '@payload-config';
import { hasRuntimeDatabase } from './cms-database.ts';
import { isCmsPaginasB5FromPayload } from './cms-paginas-b5-flag.ts';
import {
  isPaginasB5Slug,
  type PaginasB5Slug,
} from '../cms/data/paginas-b5-payload.ts';
import { paginaCodigoContentMatchesSeed as paginaCodigoContentMatchesSeedCore } from './paginas-b1-seed-compare.ts';

export type PaginaCodigoDoc = {
  id: number | string;
  titulo: string;
  slug: string;
  bloque: string;
  content: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizePaginaCodigoDoc(doc: unknown): PaginaCodigoDoc | null {
  if (!isRecord(doc)) return null;
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  return {
    id: doc.id as number | string,
    titulo: typeof doc.titulo === 'string' ? doc.titulo : slug,
    slug,
    bloque: typeof doc.bloque === 'string' ? doc.bloque : '',
    content: isRecord(doc.content) ? doc.content : {},
  };
}

export async function findPaginaCodigoBySlug(
  slug: string,
  options?: { renderFromPayload?: boolean },
): Promise<PaginaCodigoDoc | null> {
  const enabled = options?.renderFromPayload ?? isCmsPaginasB5FromPayload();
  if (!enabled || !hasRuntimeDatabase()) return null;
  if (!isPaginasB5Slug(slug)) return null;
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

export type { PaginasB5Slug };
