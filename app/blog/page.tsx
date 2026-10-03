import BlogListingView from './blog-listing-view';
import {
  BLOG_LISTING_REVALIDATE_SECONDS,
  buildBlogListingMetadata,
} from '@/utils/blog-listing-query';

export const revalidate = BLOG_LISTING_REVALIDATE_SECONDS;

export function generateMetadata() {
  return buildBlogListingMetadata();
}

export default function BlogPage() {
  return <BlogListingView currentPage={1} category="" searchQuery="" />;
}
