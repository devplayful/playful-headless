import Link from 'next/link';
import { blogListingPath } from '@/utils/blog-url';

/**
 * Server-rendered pagination anchors so crawlers can reach category pages > 1.
 * Visible pagination stays client-only (`BlogListingPagination`).
 */
export default function BlogListingCrawlNav({
  currentPage,
  totalPages,
  category = '',
}: {
  currentPage: number;
  totalPages: number;
  category?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="sr-only" aria-label="Paginación rastreable del blog">
      <ul>
        {pages.map((page) => (
          <li key={page}>
            <Link
              href={blogListingPath({ page, category: category || undefined })}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
