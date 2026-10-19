import {
  BLOG_COVER_FALLBACK,
  blogCoverForSlug,
  resolveBlogCoverAlt,
} from './blog-cover-image.ts';
import { ogJpegForPath } from './og-images.ts';
import { publicWebpIfPresent } from './public-webp-src.ts';
import {
  LINKS_BIO_FALLBACK_THUMB,
  linksBioArticleSlug,
  type LinksBioEntry,
} from './links-bio.ts';

export type LinksBioThumb = {
  src: string;
  alt: string;
  isFallback: boolean;
};

const FALLBACK_THUMB: LinksBioThumb = {
  src: LINKS_BIO_FALLBACK_THUMB,
  alt: '',
  isFallback: true,
};

/**
 * Blog: Magnific/local cover when the slug has one.
 * Service / static pages: production OG JPEG (portada).
 * Returns null when the href is a blog post that still needs WordPress
 * featured media.
 */
export function resolveLocalLinksBioThumbnail(
  entry: LinksBioEntry,
): LinksBioThumb | null {
  const slug = linksBioArticleSlug(entry.path);
  if (slug) {
    const override = blogCoverForSlug(slug);
    if (override) {
      return {
        src: publicWebpIfPresent(override),
        alt: resolveBlogCoverAlt(slug, ''),
        isFallback: false,
      };
    }
    return null;
  }

  const og = ogJpegForPath(entry.path);
  if (og) {
    return { src: og, alt: '', isFallback: false };
  }
  return FALLBACK_THUMB;
}

/**
 * Blog: Magnific override, then WordPress featured media.
 * Service pages: OG / portada. Playful logo only if nothing else exists.
 */
export async function resolveLinksBioThumbnail(
  entry: LinksBioEntry,
): Promise<LinksBioThumb> {
  const local = resolveLocalLinksBioThumbnail(entry);
  if (local) return local;

  const slug = linksBioArticleSlug(entry.path);
  if (!slug) return FALLBACK_THUMB;

  try {
    const { getBlogPostBySlug } = await import('../services/wordpress.ts');
    const post = await getBlogPostBySlug(slug);
    const src = post?.featured_media_url;
    if (src && src !== BLOG_COVER_FALLBACK) {
      return {
        src,
        alt: post.featured_media_alt || resolveBlogCoverAlt(slug, ''),
        isFallback: false,
      };
    }
  } catch {
    // WordPress down: OG for the post path, then logo.
  }

  const og = ogJpegForPath(entry.path);
  if (og) {
    return { src: og, alt: '', isFallback: false };
  }
  return FALLBACK_THUMB;
}

export async function resolveLinksBioThumbnails(
  entries: readonly LinksBioEntry[],
): Promise<LinksBioThumb[]> {
  return Promise.all(entries.map(resolveLinksBioThumbnail));
}
