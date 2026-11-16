/**
 * Recuento endpoint en payload hub /podcast (preview H2).
 *   CMS_BLOB_IMAGES=1 node scripts/audit-podcast-hub-endpoint.ts
 */
import { applyBlobImagesToUrl } from '../lib/blob-image-render.ts';
import {
  countEndpointInPodcastHubState,
  sanitizePodcastEpisodeForHubClient,
} from '../lib/podcast-client-payload.ts';

const AUDIT_ENV = { ...process.env, CMS_BLOB_IMAGES: '1' } as NodeJS.ProcessEnv;
const WP = 'https://endpoint.playfulagency.com/wp-json';

async function fetchHubEpisodes(page: number, perPage: number) {
  const res = await fetch(
    `${WP}/wp/v2/podcast?_embed=wp:featuredmedia,wp:term&per_page=${perPage}&page=${page}&_fields=id,date,slug,title,excerpt,content,featured_media,categoria,etiqueta,yoast_head,yoast_head_json,_links,_embedded`,
    { headers: { 'User-Agent': 'PlayfulQA/1.0', Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = await res.json();
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
  const episodes = items.map((episode: any) => {
    const featuredMedia = episode._embedded?.['wp:featuredmedia']?.[0];
    const withMedia = {
      ...episode,
      featured_media_url: applyBlobImagesToUrl(featuredMedia?.source_url || null, AUDIT_ENV) || null,
      featured_media_alt: featuredMedia?.alt_text || '',
    };
    return sanitizePodcastEpisodeForHubClient(withMedia, AUDIT_ENV);
  });
  return { episodes, totalPages };
}

async function main() {
  const { episodes, totalPages } = await fetchHubEpisodes(1, 9);
  const state = { status: 'ready' as const, episodes, totalPages };
  const count = countEndpointInPodcastHubState(state);
  console.log(
    JSON.stringify(
      {
        episodeCount: episodes.length,
        totalPages,
        endpointRefsInHubPayload: count,
      },
      null,
      2,
    ),
  );
  if (count > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
