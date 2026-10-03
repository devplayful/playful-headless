import BlogListingView from './blog-listing-view';
import { buildBlogListingMetadata } from '@/utils/blog-listing-query';

export const revalidate = 300;

export function generateMetadata() {
  return buildBlogListingMetadata();
}

export default function BlogPage() {
  return <BlogListingView currentPage={1} category="" searchQuery="" />;
}
