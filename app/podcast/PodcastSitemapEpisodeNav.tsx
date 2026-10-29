import Link from 'next/link';
import { SITEMAP_PODCAST_PATHS } from '@/utils/apex-sitemap';

/**
 * Crawlable links for every sitemap episode (CEO 27 oct 13:00).
 * Visible list so orphans are not only in the paginated grid.
 */
export default function PodcastSitemapEpisodeNav() {
  return (
    <nav
      aria-label="Todos los episodios del podcast"
      className="mt-12 border-t border-gray-200 pt-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Todos los episodios
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto text-sm">
        {SITEMAP_PODCAST_PATHS.map((path) => {
          const slug = path.replace(/^\/podcast\//, '');
          return (
            <li key={path}>
              <Link
                href={path}
                className="text-blue-700 hover:text-blue-900 hover:underline"
              >
                {slug}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
