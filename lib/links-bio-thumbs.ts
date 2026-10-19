import {
  BLOG_COVER_FALLBACK,
  blogCoverForSlug,
  resolveBlogCoverAlt,
} from './blog-cover-image.ts';
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
 * Logo for non-articles; Magnific/local cover when the slug has one.
 * Returns null when the href is a blog post that still needs WordPress
 * featured media.
 */
export function resolveLocalLinksBioThumbnail(
  entry: LinksBioEntry,
): LinksBioThumb | null {
  const slug = linksBioArticleSlug(entry.path);
  if (!slug) return FALLBACK_THUMB;

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

/**
 * Same cover the blog uses: Magnific override, then WordPress featured
 * media. Playful logo if the href is not an article or has no portada.
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
    // WordPress down: logo, same as a missing cover.
  }

  return FALLBACK_THUMB;
}

export async function resolveLinksBioThumbnails(
  entries: readonly LinksBioEntry[],
): Promise<LinksBioThumb[]> {
  return Promise.all(entries.map(resolveLinksBioThumbnail));
}
