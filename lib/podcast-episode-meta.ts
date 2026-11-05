import { withPlayfulTitleSuffix } from '@/lib/blog-title-suffix';
import { canonicalForPath } from '@/utils/canonical';
import { buildBreadcrumbTrailJsonLd } from '@/utils/service-landing-jsonld';
import type { PodcastEpisode } from '@/services/wordpress';

export function stripEpisodeHtml(text: string): string {
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function episodeMetaDescription(episode: PodcastEpisode): string {
  const yoast = episode.yoast_head_json?.description?.trim();
  if (yoast) {
    return yoast.length > 155 ? `${yoast.slice(0, 152)}…` : yoast;
  }
  const excerpt = stripEpisodeHtml(episode.excerpt?.rendered || '');
  if (excerpt) {
    return excerpt.length > 155 ? `${excerpt.slice(0, 152)}…` : excerpt;
  }
  const body = stripEpisodeHtml(episode.content?.rendered || '');
  const firstSentence = body.split(/[.!?]\s+/)[0]?.trim() || body;
  return firstSentence.length > 155 ? `${firstSentence.slice(0, 152)}…` : firstSentence;
}

export function episodeDocumentTitle(episode: PodcastEpisode): string {
  const yoastTitle = episode.yoast_head_json?.title?.trim();
  const base = stripEpisodeHtml(
    yoastTitle || episode.title?.rendered || 'Episodio',
  );
  return withPlayfulTitleSuffix(base);
}

export function episodeBreadcrumbJsonLd(slug: string, episodeTitle: string) {
  const name = stripEpisodeHtml(episodeTitle);
  return buildBreadcrumbTrailJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Podcast', path: '/podcast' },
    { name, path: `/podcast/${slug}` },
  ]);
}

export function episodeOgImage(episode: PodcastEpisode): string | undefined {
  return (
    episode.yoast_head_json?.og_image?.[0]?.url
    || episode.featured_media_url
    || undefined
  );
}

export function episodeCanonicalUrl(slug: string): string {
  return canonicalForPath(`/podcast/${slug}`);
}
