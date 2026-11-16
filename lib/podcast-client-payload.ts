import { applyBlobImagesToHtml, applyBlobImagesToUrl } from './blob-image-render.ts';
import { isBlobImagesEnabled } from './blob-image-url.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';
import type { PodcastEpisode } from '@/services/wordpress';

/** Episodio mínimo para el hub /podcast (cliente + RSC). Sin yoast, _links, _embedded ni content. */
export function sanitizePodcastEpisodeForHubClient(
  episode: PodcastEpisode,
  env: NodeJS.ProcessEnv = process.env,
): PodcastEpisode {
  if (!isBlobImagesEnabled(env)) return episode;

  const slug = episode.slug || '';
  const pagePath = `/podcast/${slug}`;
  const featured_media_url =
    applyBlobImagesToUrl(episode.featured_media_url || null, env) || null;

  return {
    id: episode.id,
    date: episode.date,
    slug,
    title: {
      rendered: applyBlobImagesToHtml(
        rewriteInSitePageHrefs(episode.title?.rendered || '', pagePath),
        env,
      ),
    },
    excerpt: {
      rendered: applyBlobImagesToHtml(
        rewriteInSitePageHrefs(episode.excerpt?.rendered || '', pagePath),
        env,
      ),
    },
    content: { rendered: '' },
    featured_media_url,
    featured_media_alt: episode.featured_media_alt || '',
  };
}

export function countEndpointHostRefs(text: string): number {
  if (!text) return 0;
  return (text.match(/endpoint\.playfulagency\.com/gi) || []).length;
}

/** Serializa el estado inicial del hub como en RSC (JSON). */
export function countEndpointInPodcastHubState(
  state: { episodes: PodcastEpisode[] | null; status: string },
): number {
  return countEndpointHostRefs(JSON.stringify(state));
}
