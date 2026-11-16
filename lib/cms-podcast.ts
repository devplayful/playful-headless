import { getPayload } from 'payload';
import config from '@payload-config';
import type { PodcastEpisode } from '@/services/wordpress';
import {
  getPodcastEpisodeBySlug,
  getPodcastEpisodes,
} from '@/services/wordpress';
import { hasRuntimeDatabase } from './cms-database.ts';
import { withPayloadOrSnapshot } from './cms-fallback.ts';
import { shouldRenderPodcastFromPayload } from './cms-podcast-flag.ts';
import { applyBlobImagesToUrl } from './blob-image-render.ts';

function mapPodcast(doc: Record<string, unknown>): PodcastEpisode | null {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  let featured = '';
  if (doc.imagenDestacada && typeof doc.imagenDestacada === 'object') {
    const media = doc.imagenDestacada as Record<string, unknown>;
    if (typeof media.url === 'string') featured = applyBlobImagesToUrl(media.url);
  }
  return {
    id: typeof doc.wpId === 'number' ? doc.wpId : 0,
    slug,
    date: typeof doc.wpDate === 'string' ? doc.wpDate : '',
    title: { rendered: typeof doc.titulo === 'string' ? doc.titulo : slug },
    excerpt: { rendered: typeof doc.extracto === 'string' ? doc.extracto : '' },
    content: { rendered: typeof doc.contentHtml === 'string' ? doc.contentHtml : '' },
    featured_media_url: featured,
    featured_media_alt: '',
    yoast_head_json: (doc.yoast as PodcastEpisode['yoast_head_json']) ?? {},
  } as PodcastEpisode;
}

export async function getPodcastEpisodesWithCms(
  page = 1,
  perPage = 9,
  options: { renderFromPayload?: boolean } = {},
): Promise<{ episodes: PodcastEpisode[]; totalPages: number }> {
  const usePayload = options.renderFromPayload ?? shouldRenderPodcastFromPayload(false);
  return withPayloadOrSnapshot(
    usePayload,
    async () => {
      if (!hasRuntimeDatabase()) return { episodes: [], totalPages: 0 };
      const payload = await getPayload({ config });
      const found = await payload.find({
        collection: 'podcast-episodios',
        limit: perPage,
        page,
        depth: 2,
      });
      const episodes = found.docs
        .map((d) => mapPodcast(d as unknown as Record<string, unknown>))
        .filter((e): e is PodcastEpisode => Boolean(e));
      return {
        episodes,
        totalPages: Math.max(1, found.totalPages ?? 1),
      };
    },
    () => getPodcastEpisodes(page, perPage),
  );
}

export async function getPodcastEpisodeBySlugWithCms(
  slug: string,
  options: { renderFromPayload?: boolean } = {},
): Promise<PodcastEpisode | null> {
  const usePayload = options.renderFromPayload ?? shouldRenderPodcastFromPayload(false);
  return withPayloadOrSnapshot(
    usePayload,
    async () => {
      if (!hasRuntimeDatabase()) return null;
      const payload = await getPayload({ config });
      const found = await payload.find({
        collection: 'podcast-episodios',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });
      const doc = found.docs[0];
      return doc ? mapPodcast(doc as unknown as Record<string, unknown>) : null;
    },
    () => getPodcastEpisodeBySlug(slug),
  );
}