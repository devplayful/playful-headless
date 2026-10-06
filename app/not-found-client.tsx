'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';

export function NotFoundHeaderHider() {
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  return null;
}

export function NotFoundSearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form className="relative" onSubmit={handleSearch}>
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Por ejemplo: Estrategia SEO, Diseño de Tiendas..."
        className="w-full px-6 py-4 pr-14 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700 placeholder-gray-400 shadow-sm"
        aria-label="Campo de búsqueda"
      />
      <button 
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
        aria-label="Buscar"
      >
        🔍
      </button>
    </form>
  );
}
