import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import {
  REUNION_PLAYFUL_SEO,
  REUNION_PLAYFUL_SLUG,
} from '@/cms/data/paginas-b4-payload';

export const REUNION_PLAYFUL_PUBLIC_PATH = `/${REUNION_PLAYFUL_SLUG}`;

export type PaginaCodigoYoastLike = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
};

export function buildReunionPlayfulMetadata(yoast?: PaginaCodigoYoastLike | null): Metadata {
  const title = yoast?.title?.trim() || REUNION_PLAYFUL_SEO.title;
  const description = yoast?.description?.trim() || REUNION_PLAYFUL_SEO.description;
  const canonical =
    yoast?.canonical?.trim() || canonicalForPath(REUNION_PLAYFUL_PUBLIC_PATH);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

export function generateReunionPlayfulMetadata(yoast?: PaginaCodigoYoastLike | null): Metadata {
  return buildReunionPlayfulMetadata(yoast);
}
