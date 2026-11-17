import type { Metadata } from 'next';
import type { PodcastEpisode } from '@/services/wordpress';
import { getPodcastEpisodesWithCms } from '@/lib/cms-podcast';
import { loadPodcastEpisodesState } from '@/services/podcast-loader.mjs';
import { buildPodcastHubMetadata } from '@/lib/podcast-editorial-meta';
import PodcastHubContent from './PodcastHubContent';

const EPISODES_PER_PAGE = 9;

export async function generateMetadata(): Promise<Metadata> {
  return buildPodcastHubMetadata();
}

export default async function PodcastPage() {
  const initialState = await loadPodcastEpisodesState<PodcastEpisode>(
    async (page, perPage) => {
      const { episodes, totalPages } = await getPodcastEpisodesWithCms(page, perPage);
      return { episodes, totalPages };
    },
    1,
    EPISODES_PER_PAGE,
  );

  return (
    <PodcastHubContent
      initialState={initialState}
      episodesPerPage={EPISODES_PER_PAGE}
    />
  );
}
