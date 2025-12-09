"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BlogPost {
  id: number | string;
  imageUrl: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  link: string;
}

export default function NosotrosBlogSectionClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog-posts');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.posts) ? data.posts : []);
        setPosts(arr); // Obtener todos los posts
      } catch (e) {
        console.error('Error fetching blog posts', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const currentPosts = posts.slice(currentIndex * postsPerPage, (currentIndex + 1) * postsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section className="relative overflow-hidden bg-[#006A61] rounded-3xl p-8 md:p-12 w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-white font-[700] text-[45px] leading-[52px] mb-4">
          ¿Estás listo para dejar de perder y empezar a ganar?
        </h2>
        <p className="text-white text-base md:text-lg leading-relaxed mb-10">
          Visita nuestro blog para descubrir lo que esta empresa de soluciones digitales puede aportar a tu estrategia con
          consejos que hacen que todo parezca más fácil que un truco de magia. Es el momento de leer un poco
          (que no todo son videos de TikTok) y tomar nota para hacer que tu marca sea la estrella del espectáculo.
        </p>
      </div>

      {loading ? (
        <div className="relative z-10 text-center text-white">Cargando artículos…</div>
      ) : (
        <div className="relative z-10">
          {/* Controles del carrusel */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#440099] rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#440099] rounded-full p-3 shadow-lg transition-all hover:scale-110"
                aria-label="Siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Grid de posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-12">
            {currentPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <div className="relative h-48 bg-gray-100">
                {post.imageUrl ? (
                  <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mb-3">
                  {post.category}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-700 text-sm mb-6">{post.excerpt}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-xs text-gray-500">{post.date?.replace(/\//g, ' / ')}</span>
                  <Link href={post.link} className="bg-[#440099] hover:bg-[#330077] text-white font-semibold rounded-full px-4 py-2 text-sm transition-colors">
                    Leer más
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Indicadores de página */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a página ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative z-10 flex justify-center mt-12">
        <Link href="/blog" className="bg-[#85ECD9] hover:bg-[#60dbc1] text-[#0E5942] font-bold rounded-full px-8 py-3 text-base shadow-lg transition-colors">
          Ver más artículos
        </Link>
      </div>
    </section>
  );
}
