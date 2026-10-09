import { canonicalForPath } from './canonical.ts';
import { shouldNoindexBlogListing } from './blog-listing-robots.ts';
import { twitterFromOpenGraph } from './page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '../lib/og-images.ts';

export const BLOG_LISTING_REVALIDATE_SECONDS = 300;
export const BLOG_LISTING_PER_PAGE = 10;
export const BLOG_LISTING_QUERY_PATH = '/blog/q';

export type BlogListingSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type ParsedBlogListingQuery = {
  page: number;
  category: string;
  searchQuery: string;
  invalidPage: boolean;
};

export function parseBlogListingSearchParams(
  searchParams?: BlogListingSearchParams | null,
): ParsedBlogListingQuery {
  const pageRaw = searchParams?.page;
  let page = 1;
  let invalidPage = false;

  if (pageRaw !== undefined) {
    if (typeof pageRaw !== 'string' || !/^\d+$/.test(pageRaw)) {
      invalidPage = true;
    } else {
      page = Number.parseInt(pageRaw, 10);
      if (page < 1) {
        invalidPage = true;
      }
    }
  }

  return {
    page: invalidPage ? 1 : page,
    category: typeof searchParams?.category === 'string' ? searchParams.category : '',
    searchQuery: typeof searchParams?.search === 'string' ? searchParams.search : '',
    invalidPage,
  };
}

export function isBareBlogListingPath(pathname: string, search = ''): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return path === '/blog' && (search === '' || search === '?');
}

export function buildBlogListingMetadata(searchParams?: BlogListingSearchParams | null) {
  const noindexFollow = shouldNoindexBlogListing(searchParams);
  const url = canonicalForPath('/blog');
  return {
    title: 'Blog - Playful Agency',
    description: 'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog.',
    alternates: { canonical: url },
    ...(noindexFollow ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: 'Blog - Playful Agency',
      description: 'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog.',
      url,
      images: [
        ogJpegMeta(
          ogJpegForPath('/blog') || '/images/og/home.jpg',
          'Blog - Playful Agency',
        ),
      ],
    },
    twitter: twitterFromOpenGraph(
      'Blog - Playful Agency',
      'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog.',
      ogJpegForPath('/blog') || '/images/og/home.jpg',
    ),
  };
}
