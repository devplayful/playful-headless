import { load } from 'cheerio';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import {
  applyPageDescriptionOverride,
  applyPageTitleOverride,
  pageSocialMetadata,
} from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import { isCmsServiciosFromPayload } from './cms-servicios-flag.ts';
import { hasRuntimeDatabase } from './cms-database.ts';

export type ServicioBlock = Record<string, unknown> & { blockType: string };

export type ServicioDoc = {
  id: number | string;
  titulo: string;
  slug: string;
  h1?: string | null;
  wpId?: number | null;
  bloques?: ServicioBlock[] | null;
  yoast?: {
    title?: string | null;
    description?: string | null;
    canonical?: string | null;
    ogImage?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeServicioDoc(doc: unknown): ServicioDoc | null {
  if (!isRecord(doc)) return null;
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  return {
    id: doc.id as number | string,
    titulo: typeof doc.titulo === 'string' ? doc.titulo : slug,
    slug,
    h1: typeof doc.h1 === 'string' ? doc.h1 : null,
    wpId: typeof doc.wpId === 'number' ? doc.wpId : null,
    bloques: Array.isArray(doc.bloques) ? (doc.bloques as ServicioBlock[]) : [],
    yoast: isRecord(doc.yoast) ? (doc.yoast as ServicioDoc['yoast']) : null,
  };
}

export async function findServicioBySlug(slug: string): Promise<ServicioDoc | null> {
  if (!isCmsServiciosFromPayload() || !hasRuntimeDatabase()) return null;
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'servicios',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    return normalizeServicioDoc(found.docs[0]);
  } catch {
    return null;
  }
}

export function extractH1FromElementorHtml(html: string): string | null {
  const $ = load(html);
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  return h1 || null;
}

export function servicioHasElementorBlock(doc: ServicioDoc): boolean {
  return Boolean(doc.bloques?.some((b) => b.blockType === 'elementor'));
}

export async function buildServicioMetadata(slug: string): Promise<Metadata | null> {
  const doc = await findServicioBySlug(slug);
  if (!doc) return null;
  const yoast = doc.yoast || {};
  const { title, ogTitle } = applyPageTitleOverride(
    slug,
    yoast.title || doc.titulo,
    yoast.ogTitle || yoast.title || doc.titulo,
  );
  const { description, ogDescription } = applyPageDescriptionOverride(
    slug,
    yoast.description || '',
    yoast.ogDescription || yoast.description || '',
  );
  const url = canonicalForPath(`/${slug}`);
  const jpeg = ogJpegForPath(`/${slug}`);
  const images = jpeg
    ? [ogJpegMeta(jpeg, title || 'Playful Agency')]
    : yoast.ogImage
      ? [{ url: yoast.ogImage }]
      : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    ...pageSocialMetadata({
      title: ogTitle,
      description: ogDescription,
      url,
      images,
      type: 'website',
    }),
  };
}

export function elementorBlockFromDoc(doc: ServicioDoc): {
  html: string;
  pageId: number;
  stylesheetIds: number[];
} | null {
  const block = doc.bloques?.find((b) => b.blockType === 'elementor');
  if (!block) return null;
  const html = typeof block.html === 'string' ? block.html : '';
  const pageId = typeof block.pageId === 'number' ? block.pageId : doc.wpId || 0;
  const rawIds = Array.isArray(block.stylesheetIds) ? block.stylesheetIds : [];
  const stylesheetIds = rawIds
    .map((entry) => {
      if (typeof entry === 'number') return entry;
      if (isRecord(entry) && typeof entry.id === 'number') return entry.id;
      return null;
    })
    .filter((id): id is number => id !== null);
  if (!html) return null;
  return { html, pageId, stylesheetIds: stylesheetIds.length ? stylesheetIds : [pageId] };
}
