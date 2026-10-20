import { getPodcastEpisodes, type PodcastEpisode } from '@/services/wordpress';
import { loadPodcastEpisodesState } from '@/services/podcast-loader.mjs';
import PodcastHubContent from './PodcastHubContent';

const EPISODES_PER_PAGE = 9;

export default async function PodcastPage() {
  const initialState = await loadPodcastEpisodesState<PodcastEpisode>(
    getPodcastEpisodes,
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
