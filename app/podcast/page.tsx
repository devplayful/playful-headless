import { getPodcastEpisodes, type PodcastEpisode } from '@/services/wordpress';
import { loadPodcastEpisodesState } from '@/services/podcast-loader.mjs';
import PodcastHubContent from './PodcastHubContent';
import PodcastSitemapEpisodeNav from './PodcastSitemapEpisodeNav';

/** One SSR page lists every published episode (18 in sitemap). */
const EPISODES_PER_PAGE = 24;

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const initialPage = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1);

  const initialState = await loadPodcastEpisodesState<PodcastEpisode>(
    getPodcastEpisodes,
    initialPage,
    EPISODES_PER_PAGE,
  );

  return (
    <>
      <PodcastHubContent
        initialState={initialState}
        episodesPerPage={EPISODES_PER_PAGE}
        initialPage={initialPage}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <PodcastSitemapEpisodeNav />
      </div>
    </>
  );
}
