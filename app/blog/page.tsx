import BlogListingView from './blog-listing-view';
import { buildBlogListingMetadata } from '@/utils/blog-listing-query';
import { buildBlogListingBreadcrumbJsonLd, serializeJsonLd } from '@/lib/blog-editorial-meta';

export const revalidate = 300;

export function generateMetadata() {
  return buildBlogListingMetadata();
}

export default function BlogPage() {
  return (
    <>
      <script
        id="playful-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBlogListingBreadcrumbJsonLd()) }}
      />
      <BlogListingView currentPage={1} category="" searchQuery="" />
    </>
  );
}
