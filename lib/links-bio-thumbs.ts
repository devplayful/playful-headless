import { CONTACT_HREF } from '../utils/booking.ts';
import {
  BLOG_COVER_FALLBACK,
  blogCoverForSlug,
  resolveBlogCoverAlt,
} from './blog-cover-image.ts';
import { CASOS_DE_EXITO_FEATURED_TAPAS } from './case-study-listing-image.ts';
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
  objectFit: 'contain' | 'cover';
  collage?: readonly string[];
};

const FALLBACK_THUMB: LinksBioThumb = {
  src: LINKS_BIO_FALLBACK_THUMB,
  alt: '',
  isFallback: true,
  objectFit: 'contain',
};

const CASOS_COLLAGE = Object.values(CASOS_DE_EXITO_FEATURED_TAPAS);

/** Destination covers: listing tapas, approved landing art, contact illustration. */
export const LINKS_BIO_DESTINATION_COVERS: Record<
  string,
  Omit<LinksBioThumb, 'isFallback'>
> = {
  '/casos-de-exito': {
    src: CASOS_COLLAGE[0],
    alt: '',
    objectFit: 'cover',
    collage: CASOS_COLLAGE,
  },
  '/agencia-e-commerce': {
    src: '/images/og/agencia-e-commerce.jpg',
    alt: '',
    objectFit: 'cover',
  },
  '/agencia-shopify': {
    src: publicWebpIfPresent('/images/agencia-shopify/hero-gORwV7MSXO@2x.png'),
    alt: '',
    objectFit: 'cover',
  },
  [CONTACT_HREF]: {
    src: '/images/contacto-imagen.png',
    alt: '',
    objectFit: 'contain',
  },
};

/**
 * Logo only when nothing else exists. Articles use Magnific/local cover.
 * Destinations use the approved tapa/cover/illustration — never the logo.
 */
export function resolveLocalLinksBioThumbnail(
  entry: LinksBioEntry,
): LinksBioThumb | null {
  const destination = LINKS_BIO_DESTINATION_COVERS[entry.path];
  if (destination) {
    return { ...destination, isFallback: false };
  }

  const slug = linksBioArticleSlug(entry.path);
  if (!slug) return FALLBACK_THUMB;

  const override = blogCoverForSlug(slug);
  if (override) {
    return {
      src: publicWebpIfPresent(override),
      alt: resolveBlogCoverAlt(slug, ''),
      isFallback: false,
      objectFit: 'cover',
    };
  }

  return null;
}

/**
 * Same cover the blog uses: Magnific override, then WordPress featured
 * media. Destination covers for non-articles. Logo only as last resort.
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
        objectFit: 'cover',
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
