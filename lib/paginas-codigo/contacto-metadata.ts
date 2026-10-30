import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import {
  CONTACT_SEO,
  CONTACT_SLUG,
} from '@/cms/data/paginas-b4-payload';

export const CONTACT_PUBLIC_PATH = `/${CONTACT_SLUG}`;

export type PaginaCodigoYoastLike = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
};

export function buildContactoMetadata(yoast?: PaginaCodigoYoastLike | null): Metadata {
  const title = yoast?.title?.trim() || CONTACT_SEO.title;
  const description = yoast?.description?.trim() || CONTACT_SEO.description;
  const canonical = yoast?.canonical?.trim() || canonicalForPath(CONTACT_PUBLIC_PATH);
  const ogTitle = yoast?.ogTitle?.trim() || title;
  const ogDescription = yoast?.ogDescription?.trim() || description;
  const ogPath = CONTACT_PUBLIC_PATH;
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
      images: ogImage ? [ogJpegMeta(ogImage, ogTitle)] : undefined,
    },
    twitter: {
      ...twitterFromOpenGraph(ogTitle, ogDescription),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function generateContactoMetadata(yoast?: PaginaCodigoYoastLike | null): Metadata {
  return buildContactoMetadata(yoast);
}
