'use client';

import { useRouter } from 'next/navigation';
import { blogListingPath } from '@/utils/blog-url';

interface BlogListingPaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
}

export default function BlogListingPagination({
  currentPage,
  totalPages,
  category = '',
}: BlogListingPaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    router.push(blogListingPath({ page, category: category || undefined }));
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div
      className="mt-12 mb-10 flex justify-center items-center gap-4"
      role="navigation"
      aria-label="Paginación del blog"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={prevDisabled}
        aria-label="Página anterior"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          prevDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-[#440099] hover:bg-[#440099] hover:text-white'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="text-lg font-bold text-[#440099]" aria-live="polite">
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={nextDisabled}
        aria-label="Página siguiente"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          nextDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#440099] text-white hover:bg-[#5500BB]'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
