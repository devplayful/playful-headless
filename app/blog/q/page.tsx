import { notFound } from 'next/navigation';
import BlogListingView from '../blog-listing-view';
import {
  buildBlogListingMetadata,
  parseBlogListingSearchParams,
} from '@/utils/blog-listing-query';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const parsed = parseBlogListingSearchParams(await searchParams);
  if (parsed.invalidPage) {
    notFound();
  }
  return buildBlogListingMetadata(await searchParams);
}

export default async function BlogListingQueryPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const parsed = parseBlogListingSearchParams(await searchParams);
  if (parsed.invalidPage) {
    notFound();
  }

  return (
    <BlogListingView
      currentPage={parsed.page}
      category={parsed.category}
      searchQuery={parsed.searchQuery}
    />
  );
}
