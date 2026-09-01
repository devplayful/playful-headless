export type PodcastEpisodesState<T> =
  | { status: 'ready'; episodes: T[]; totalPages: number }
  | { status: 'unavailable' | 'unexpected'; episodes: null; totalPages: null };

export function loadPodcastEpisodesState<T>(
  fetchEpisodes: (page: number, perPage: number) => Promise<{ episodes: T[]; totalPages: number }>,
  page: number,
  perPage: number,
): Promise<PodcastEpisodesState<T>>;

export function resolvePodcastEpisodesView(input: {
  loading: boolean;
  error: 'unavailable' | 'unexpected' | null;
  episodes: unknown[];
}): 'loading' | 'error' | 'episodes' | 'empty';
