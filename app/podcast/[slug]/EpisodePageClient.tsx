'use client';

import type { PodcastEpisode } from '@/services/wordpress';
import {
  episodeCanonicalUrl,
  stripEpisodeHtml,
} from '@/lib/podcast-episode-meta';

function EpisodeContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function EpisodePageClient({ episode }: { episode: PodcastEpisode }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const titleText = stripEpisodeHtml(episode.title.rendered);
  const excerptText = stripEpisodeHtml(episode.excerpt.rendered);
  const episodeUrl = episodeCanonicalUrl(episode.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm font-normal text-gray-500">
            <a href="/" className="hover:text-gray-700">Inicio</a>
            <span>›</span>
            <a href="/podcast" className="hover:text-gray-700">Podcast</a>
            <span>›</span>
            <span className="text-gray-900 truncate">{titleText}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Podcast Bendita Web
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: episode.title.rendered }}
            />

            <div className="text-lg text-gray-600 mb-6">
              Publicado el {formatDate(episode.date)}
            </div>

            {episode.featured_media_url && (
              <div className="mb-8">
                <img
                  src={episode.featured_media_url}
                  alt={episode.featured_media_alt || titleText}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-4 mb-12 p-6 bg-white rounded-lg shadow-sm">
          <a
            href="https://benditaweb.buzzsprout.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Escuchar en Buzzsprout
          </a>

          <button
            type="button"
            onClick={() => navigator.share && navigator.share({
              title: titleText,
              text: excerptText,
              url: episodeUrl,
            })}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Compartir
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <EpisodeContent content={episode.content.rendered} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ¿Te gustó este episodio?
            </h2>
            <p className="text-gray-600 mb-6">
              Descubre más episodios de Bendita Web y mantente al día con las últimas tendencias en marketing digital.
            </p>
            <a
              href="/podcast"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ver todos los episodios
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
