import Link from 'next/link';
import type { BlogCategoryNavItem } from '@/services/wordpress';
import { blogListingPath } from '@/utils/blog-url';

interface BlogCategoriesProps {
  currentCategory: string;
  categories: BlogCategoryNavItem[];
}

export default function BlogCategories({ currentCategory, categories }: BlogCategoriesProps) {
  const items = [{ id: 0, name: 'Todas', slug: '' }, ...categories];

  return (
    <nav aria-label="Categorías del blog" className="bg-[#2A0064] rounded-full py-4 px-6 overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide sm:flex-nowrap sm:justify-start lg:flex-wrap lg:justify-center whitespace-nowrap">
        {items.map((cat) => {
          const isActive = currentCategory === cat.slug;
          const className = `px-6 py-2.5 rounded-full text-sm font-bold transition-all flex-shrink-0 ${
            isActive
              ? 'bg-[#72E3D8] text-[#2A0064] shadow-md'
              : 'bg-white text-[#2A0064] hover:bg-[#72E3D8] hover:text-[#2A0064]'
          }`;
          return (
            <Link
              key={cat.id}
              href={cat.slug ? blogListingPath({ category: cat.slug }) : '/blog'}
              className={className}
              aria-current={isActive ? 'page' : undefined}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
