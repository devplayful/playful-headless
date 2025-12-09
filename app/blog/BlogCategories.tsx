'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface BlogCategoriesProps {
  currentCategory: string;
}

const colorPalette = [
  'bg-[#FFB800]',
  'bg-[#FF6B9D]',
  'bg-[#00D4AA]',
  'bg-[#8B5CF6]',
  'bg-[#F59E0B]',
  'bg-[#EC4899]',
  'bg-[#10B981]',
  'bg-[#3B82F6]',
];

export default function BlogCategories({ currentCategory }: BlogCategoriesProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Categorías predefinidas
  const predefinedCategories = [
    { id: 1, name: 'E-commerce', slug: 'e-commerce', count: 0 },
    { id: 2, name: 'Email Marketing', slug: 'email-marketing', count: 0 },
    { id: 3, name: 'Más vistos', slug: 'mas-vistos', count: 0 },
    { id: 4, name: 'Otros', slug: 'otros', count: 0 },
    { id: 5, name: 'Pautas Digitales', slug: 'pautas-digitales', count: 0 },
    { id: 6, name: 'Seo', slug: 'seo', count: 0 },
    { id: 7, name: 'Tecnologia', slug: 'tecnologia', count: 0 },
  ];

  const [categories, setCategories] = useState<Array<Category & { color: string }>>([
    { id: 0, name: 'Todas', slug: '', count: 0, color: 'bg-white' },
  ] as Array<Category & { color: string }>);
  
  const [loading, setLoading] = useState(true);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset page to 1 when changing category
    params.delete('page');
    return params.toString();
  };

  useEffect(() => {
    const initializeCategories = async () => {
      try {
        // Mapear las categorías predefinidas con sus colores
        const categoriesWithColors = predefinedCategories.map((cat, index) => ({
          ...cat,
          color: colorPalette[index % colorPalette.length] + ' text-white'
        }));

        setCategories(prev => [
          prev[0], // Mantener la opción 'Todas' primero
          ...categoriesWithColors
        ]);
      } catch (error) {
        console.error('Error initializing categories:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#440099] py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-[#5a1cb3] animate-pulse rounded-full w-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A0064] rounded-full py-4 px-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog${cat.slug ? `?category=${cat.slug}` : ''}`}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentCategory === (cat.slug === '' ? '' : cat.slug)
                ? 'bg-[#72E3D8] text-[#2A0064] shadow-md'
                : 'bg-white text-[#2A0064] hover:bg-[#72E3D8] hover:text-[#2A0064]'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
