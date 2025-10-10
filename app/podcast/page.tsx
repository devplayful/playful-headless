'use client';

import { Suspense, useEffect, useState } from 'react';
import { getPodcastPageMetadata, getPodcastEpisodes, PodcastEpisode, YoastMetaData } from '@/services/wordpress';
import { Metadata } from 'next';
import Head from 'next/head';

// Componente de loading
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Componente para mostrar un episodio
function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cleanExcerpt = (excerpt: string) => {
    return excerpt.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '');
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {episode.featured_media_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={episode.featured_media_url}
            alt={episode.featured_media_alt || episode.title.rendered}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-2">
          {formatDate(episode.date)}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <a 
            href={`/podcast/${episode.slug}`}
            className="hover:text-blue-600 transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: episode.title.rendered }}
          />
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {cleanExcerpt(episode.excerpt.rendered)}
        </p>
        
        <a
          href={`/podcast/${episode.slug}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Escuchar episodio
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
}

// Componente de paginación
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number'}
          className={`px-3 py-2 rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : typeof page === 'number'
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-transparent text-gray-500 cursor-default'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
}

export default function PodcastPage() {
  const [metadata, setMetadata] = useState<YoastMetaData | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const episodesPerPage = 9;

  // Cargar metadatos de la página
  useEffect(() => {
    async function loadMetadata() {
      try {
        const meta = await getPodcastPageMetadata();
        setMetadata(meta);
      } catch (error) {
        console.error('Error cargando metadatos:', error);
      }
    }
    loadMetadata();
  }, []);

  // Cargar episodios
  useEffect(() => {
    async function loadEpisodes() {
      setEpisodesLoading(true);
      try {
        const result = await getPodcastEpisodes(currentPage, episodesPerPage);
        setEpisodes(result.episodes);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error cargando episodios:', error);
      } finally {
        setEpisodesLoading(false);
        setLoading(false);
      }
    }
    loadEpisodes();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // No renderizar hasta tener metadatos para SEO
  if (!metadata) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>{metadata.yoast_wpseo_title}</title>
        <meta name="description" content={metadata.yoast_wpseo_metadesc} />
        {metadata.yoast_wpseo_canonical && (
          <link rel="canonical" href={metadata.yoast_wpseo_canonical} />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={metadata.yoast_wpseo_og_title || metadata.yoast_wpseo_title} />
        <meta property="og:description" content={metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc} />
        <meta property="og:type" content="website" />
        {metadata.yoast_wpseo_canonical && (
          <meta property="og:url" content={metadata.yoast_wpseo_canonical} />
        )}
        {metadata.yoast_wpseo_og_image && (
          <meta property="og:image" content={metadata.yoast_wpseo_og_image} />
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.yoast_wpseo_og_title || metadata.yoast_wpseo_title} />
        <meta name="twitter:description" content={metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc} />
        {metadata.yoast_wpseo_og_image && (
          <meta name="twitter:image" content={metadata.yoast_wpseo_og_image} />
        )}
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Bendita Web Podcast
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Tu podcast sobre marketing digital, SEO, desarrollo web y más. 
                Donde hablamos de tu activo más importante: tu página web.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Episodios */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Episodios Recientes
                </h2>
                
                {episodesLoading ? (
                  <LoadingSpinner />
                ) : episodes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {episodes.map((episode) => (
                      <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                      No hay episodios disponibles en este momento.
                    </p>
                  </div>
                )}
              </div>

              {/* Paginación */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {/* Sección de suscripción */}
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¡No te pierdas ningún episodio!
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Suscríbete a nuestro podcast en tu plataforma favorita y mantente al día 
                con las últimas tendencias en marketing digital.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://benditaweb.buzzsprout.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Buzzsprout
                </a>
                
                <a
                  href="#"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Apple Podcasts
                </a>
                
                <a
                  href="#"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Spotify
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
