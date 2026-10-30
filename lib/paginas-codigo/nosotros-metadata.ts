import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import {
  NOSOTROS_SEO,
  NOSOTROS_SLUG,
} from '@/cms/data/paginas-b3-payload';

export const NOSOTROS_PUBLIC_PATH = `/${NOSOTROS_SLUG}`;

export type PaginaCodigoYoastLike = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
};

export function buildNosotrosMetadata(yoast?: PaginaCodigoYoastLike | null): Metadata {
  const title = yoast?.title?.trim() || NOSOTROS_SEO.title;
  const description = yoast?.description?.trim() || NOSOTROS_SEO.description;
  const canonical = yoast?.canonical?.trim() || canonicalForPath(NOSOTROS_PUBLIC_PATH);
  const ogTitle = yoast?.ogTitle?.trim() || title;
  const ogDescription = yoast?.ogDescription?.trim() || description;
  const ogPath = NOSOTROS_PUBLIC_PATH;
  const defaultOg = ogJpegForPath(ogPath);
  const ogImage = yoast?.ogImage?.trim() || defaultOg;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      ...(ogImage ? { images: [ogJpegMeta(ogImage, ogTitle)] } : {}),
    },
    twitter: {
      ...twitterFromOpenGraph(ogTitle, ogDescription),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export async function generateNosotrosMetadata(
  yoast?: PaginaCodigoYoastLike | null,
): Promise<Metadata> {
  return buildNosotrosMetadata(yoast);
}
