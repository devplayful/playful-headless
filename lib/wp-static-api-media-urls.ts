/**
 * URLs de imagen servidas desde campos ACF/API (fuera del HTML renderizado / OG).
 * Espejo preview → public/wp-static cuando no hay entrada en blob-migration-map.
 */
import { CASO_ACF_IMAGE_FIELDS } from '../cms/collections/casos-acf-fields.ts';
import { canonicalWordPressUploadUrl } from './blob-image-url.ts';

export const WP_ENDPOINT_ORIGIN = 'https://endpoint.playfulagency.com';
export const WP_JSON = `${WP_ENDPOINT_ORIGIN}/wp-json`;

export const API_MEDIA_ACF_FIELDS = [...CASO_ACF_IMAGE_FIELDS, 'challenge_logos'] as const;

const UA = 'PlayfulQA/1.0';

export function collectEndpointUploadUrlsFromValue(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    const trimmed = value.trim().split('?')[0];
    if (trimmed.includes('endpoint.playfulagency.com/wp-content/uploads/')) {
      out.add(trimmed);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectEndpointUploadUrlsFromValue(item, out);
    return;
  }
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    if (typeof rec.url === 'string') collectEndpointUploadUrlsFromValue(rec.url, out);
    if (typeof rec.source_url === 'string') collectEndpointUploadUrlsFromValue(rec.source_url, out);
  }
}

export function urlsNeedingWpStaticMirror(
  urls: Iterable<string>,
  blobMap: Record<string, string>,
): string[] {
  const need = new Set<string>();
  for (const raw of Array.from(urls)) {
    const key = raw.split('?')[0];
    if (blobMap[key]) continue;
    const canonical = canonicalWordPressUploadUrl(key);
    if (canonical && blobMap[canonical]) continue;
    need.add(key);
  }
  return Array.from(need).sort();
}

async function wpCollection(path: string): Promise<any[]> {
  const res = await fetch(`${WP_JSON}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) return [];
  return res.json();
}

async function wpAllPodcastEpisodes(): Promise<any[]> {
  const out: any[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(
      `${WP_JSON}/wp/v2/podcast?per_page=100&page=${page}&_embed=wp:featuredmedia`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    );
    if (!res.ok) break;
    totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const rows = await res.json();
    out.push(...rows);
    page += 1;
  }
  return out;
}

/** Imágenes endpoint en equipo, casos (ACF + featured) y podcast (featured). */
export async function collectApiMediaSeedUrls(blobMap: Record<string, string>): Promise<string[]> {
  const urls = new Set<string>();

  const team = await wpCollection('/wp/v2/equipo?_embed=wp:featuredmedia&per_page=100');
  for (const member of team) {
    collectEndpointUploadUrlsFromValue(
      member._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      urls,
    );
    collectEndpointUploadUrlsFromValue(member.acf?.imagen, urls);
  }

  const casos = await wpCollection(
    '/wp/v2/casos-de-exito?status=publish&per_page=50&acf_format=standard&_embed=wp:featuredmedia',
  );
  for (const caso of casos) {
    collectEndpointUploadUrlsFromValue(
      caso._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      urls,
    );
    if (caso.acf && typeof caso.acf === 'object') {
      for (const field of API_MEDIA_ACF_FIELDS) {
        collectEndpointUploadUrlsFromValue(caso.acf[field], urls);
      }
      collectEndpointUploadUrlsFromValue(caso.acf.imagen_destacada, urls);
    }
  }

  const episodes = await wpAllPodcastEpisodes();
  for (const ep of episodes) {
    collectEndpointUploadUrlsFromValue(
      ep._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      urls,
    );
  }

  return urlsNeedingWpStaticMirror(urls, blobMap);
}
