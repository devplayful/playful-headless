import { WordPressUnavailableError } from './wordpress-request.mjs';

/** Convert the podcast collection call into an explicit UI state. */
export async function loadPodcastEpisodesState(fetchEpisodes, page, perPage) {
  try {
    const result = await fetchEpisodes(page, perPage);
    return {
      status: 'ready',
      episodes: result.episodes,
      totalPages: result.totalPages,
    };
  } catch (error) {
    return {
      status: error instanceof WordPressUnavailableError ? 'unavailable' : 'unexpected',
      episodes: null,
      totalPages: null,
    };
  }
}

export function resolvePodcastEpisodesView({ loading, error, episodes }) {
  if (loading) return 'loading';
  if (error) return 'error';
  return episodes.length > 0 ? 'episodes' : 'empty';
}
