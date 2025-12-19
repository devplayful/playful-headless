'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WPPost } from '@/services/wordpress';

interface MostViewedArticlesProps {
  posts: WPPost[];
}

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

export default function MostViewedArticles({ posts }: MostViewedArticlesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Número de posts visibles según el tamaño de pantalla
  const postsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(posts.length - postsPerView.desktop, prev + 1));
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Encabezado con título y flechas */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#440099]">
            Artículos Más Vistos
          </h2>
          
          {/* Flechas de navegación */}
          {posts.length > postsPerView.desktop && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#440099] text-white hover:bg-[#5500BB] shadow-lg'
                }`}
                aria-label="Anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex >= posts.length - postsPerView.desktop}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentIndex >= posts.length - postsPerView.desktop
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#440099] text-white hover:bg-[#5500BB] shadow-lg'
                }`}
                aria-label="Siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Carrusel de artículos */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out gap-6"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / postsPerView.desktop)}%)` 
            }}
          >
            {posts.map((post) => (
              <article 
                key={post.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Imagen del artículo */}
                <Link href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`}>
                  <div className="relative h-48 bg-gradient-to-br from-[#E9D7FF] to-[#D4F1F4]">
                    {post.featured_media_url ? (
                      <Image
                        src={post.featured_media_url}
                        alt={post.featured_media_alt || post.title.rendered}
                        fill
                        className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Contenido del artículo */}
                <div className="p-5">
                  {/* Badge de categoría */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="mb-3">
                      <span className="inline-block bg-[#F0E6FF] text-[#440099] px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {post.categories[0].name}
                      </span>
                    </div>
                  )}

                  {/* Título */}
                  <Link 
                    href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`}
                    className="block mb-3"
                  >
                    <h3 className="text-lg font-bold text-[#440099] line-clamp-2 leading-tight hover:text-[#5500BB] transition-colors">
                      {post.title.rendered}
                    </h3>
                  </Link>

                  {/* Fecha */}
                  <p className="text-sm text-gray-500 mb-4">
                    {formatDate(post.date)}
                  </p>

                  {/* Botón Leer Más */}
                  <Link 
                    href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`}
                    className="inline-block w-full bg-[#440099] text-white text-center px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#5500BB] transition-all shadow-md hover:shadow-lg"
                  >
                    LEER MÁS
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Indicadores de página (opcional) */}
        {posts.length > postsPerView.desktop && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(posts.length / postsPerView.desktop) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * postsPerView.desktop)}
                className={`w-3 h-3 rounded-full transition-all ${
                  Math.floor(currentIndex / postsPerView.desktop) === i
                    ? 'bg-[#440099] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a página ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
