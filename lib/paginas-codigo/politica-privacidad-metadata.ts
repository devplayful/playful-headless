import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import {
  POLITICA_PRIVACIDAD_SEO,
  POLITICA_PRIVACIDAD_SLUG,
} from '@/cms/data/paginas-b1-payload';

export const POLITICA_PRIVACIDAD_PUBLIC_PATH = `/${POLITICA_PRIVACIDAD_SLUG}`;

export type PaginaCodigoYoastLike = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
};

/** Metadatos públicos de /politica-de-privacidad (canonical siempre la URL pública, no preview). */
export function buildPoliticaPrivacidadMetadata(
  yoast?: PaginaCodigoYoastLike | null,
): Metadata {
  const title = yoast?.title?.trim() || POLITICA_PRIVACIDAD_SEO.title;
  const description =
    yoast?.description?.trim() || POLITICA_PRIVACIDAD_SEO.description;
  const canonical =
    yoast?.canonical?.trim() || canonicalForPath(POLITICA_PRIVACIDAD_PUBLIC_PATH);
  const ogTitle = yoast?.ogTitle?.trim() || title;
  const ogDescription = yoast?.ogDescription?.trim() || description;
  const ogPath = POLITICA_PRIVACIDAD_PUBLIC_PATH;
  const defaultOg = ogJpegForPath(ogPath) || '/images/og/home.jpg';
  const ogImage = yoast?.ogImage?.trim() || defaultOg;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: [ogJpegMeta(ogImage, ogTitle)],
    },
    twitter: {
      ...twitterFromOpenGraph(ogTitle, ogDescription),
      images: [ogImage],
    },
  };
}

export async function generatePoliticaPrivacidadMetadata(
  yoast?: PaginaCodigoYoastLike | null,
): Promise<Metadata> {
  return buildPoliticaPrivacidadMetadata(yoast);
}
