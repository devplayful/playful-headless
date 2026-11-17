import type { Metadata } from 'next';
import type { PodcastEpisode } from '@/services/wordpress';
import { decodeHtmlEntities, wordpressSeoText } from '@/lib/blog-editorial-meta';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ORGANIZATION_SCHEMA } from '@/utils/organization-schema.mjs';

/** og:image del hub — asset ya en /wp-media del podcast (snapshot). */
export const PODCAST_HUB_OG_IMAGE_PATH =
  '/wp-media/wp-content/uploads/2022/03/Banner-BenditaWeb_Podcast_Playful_750x750-560x560.png';

const PLAYFUL_SUFFIX = ' | Playful';
const TITLE_SEGMENT_MAX = 70;
const META_MIN = 120;
const META_MAX = 155;

const PODCAST_SERIES_NAME = 'Bendita Web';

const HUB_DESCRIPTION_SOURCE =
  'Tu podcast sobre marketing digital, SEO, desarrollo web y e-commerce. Hablamos de tu activo más importante: tu página web, con episodios de Bendita Web.';

function stripHtml(html: string): string {
  const withoutEmbeds = (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ');
  return wordpressSeoText(withoutEmbeds).replace(/\s+/g, ' ').trim();
}

function absolutePlayfulUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed.split('?')[0];
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return canonicalForPath(path);
}

const HANGING_TITLE_END = /[\s:–\-,;!?¡¿]+$/;
const DANGLING_END_WORD =
  /^(vs\.?|en|a|de|el|la|los|las|y|o|con|para|por|del|al|un|una|tu|tu)$/i;

function hasUnclosedSpanishPunctuation(text: string): boolean {
  const openQ = (text.match(/¿/g) || []).length;
  const closeQ = (text.match(/\?/g) || []).length;
  const openEx = (text.match(/¡/g) || []).length;
  const closeEx = (text.match(/!/g) || []).length;
  if (openQ > closeQ) return true;
  if (openEx > closeEx) return true;
  if (/¿[^?]*$/.test(text)) return true;
  if (/¡[^!]*$/.test(text)) return true;
  return false;
}

function trimDanglingTitleSegment(segment: string): string {
  let out = segment.trim();
  for (let guard = 0; guard < 24; guard += 1) {
    const prev = out;
    out = out.replace(HANGING_TITLE_END, '').trim();
    if (hasUnclosedSpanishPunctuation(out)) {
      const qIdx = out.lastIndexOf('¿');
      const exIdx = out.lastIndexOf('¡');
      const cut = Math.max(qIdx, exIdx);
      if (cut >= 0) {
        out = out.slice(0, cut).replace(HANGING_TITLE_END, '').trim();
        continue;
      }
    }
    const parts = out.split(/\s+/).filter(Boolean);
    const last = parts[parts.length - 1] ?? '';
    if (last && DANGLING_END_WORD.test(last)) {
      parts.pop();
      out = parts.join(' ').trim();
      continue;
    }
  if (prev === out) break;
  }
  return out;
}

export function formatPlayfulDocumentTitle(segment: string): string {
  let clean = decodeHtmlEntities(segment)
    .replace(/\s*[-–|]\s*Playful Agency.*$/i, '')
    .replace(/\s*\|\s*Playful\s*$/i, '')
    .trim();
  if (clean.length > TITLE_SEGMENT_MAX) {
    let trimmed = clean.slice(0, TITLE_SEGMENT_MAX).replace(/\s+\S*$/, '').trim();
    trimmed = trimDanglingTitleSegment(trimmed.replace(HANGING_TITLE_END, '').trim());
    if (!trimmed) {
      trimmed = trimDanglingTitleSegment(
        clean.slice(0, TITLE_SEGMENT_MAX).replace(HANGING_TITLE_END, '').trim(),
      );
    }
    clean = trimmed;
  }
  return `${clean}${PLAYFUL_SUFFIX}`;
}

export function fitPodcastMetaDescription(source: string): string {
  const plain = stripHtml(source);
  if (!plain) return '';
  let trimmed =
    plain.length <= META_MAX
      ? plain
      : plain.slice(0, META_MAX).replace(/\s+\S*$/, '').trim();
  if (trimmed.length < META_MIN && plain.length > trimmed.length) {
    trimmed = plain.slice(0, META_MAX).replace(/\s+\S*$/, '').trim();
  }
  if (!trimmed.endsWith('.') && trimmed.length < META_MAX) {
    const withDot = `${trimmed}.`;
    trimmed = withDot.length <= META_MAX ? withDot : trimmed;
  }
  if (trimmed.length > META_MAX) {
    trimmed = trimmed.slice(0, META_MAX).replace(/\s+\S*$/, '').trim();
  }
  return trimmed;
}

function episodePlainExcerpt(episode: PodcastEpisode): string {
  const fromYoast =
    typeof episode.yoast_head_json?.description === 'string'
      ? stripHtml(episode.yoast_head_json.description)
      : '';
  const fromExcerpt = stripHtml(episode.excerpt?.rendered || '');
  let base = fromYoast || fromExcerpt;
  if (base.length >= META_MIN) return base;

  const rendered = episode.content?.rendered || '';
  const paragraphs: string[] = [];
  const paragraphRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let paragraphMatch: RegExpExecArray | null;
  while ((paragraphMatch = paragraphRe.exec(rendered))) {
    const plain = stripHtml(paragraphMatch[1]);
    if (plain.length > 30) paragraphs.push(plain);
  }
  for (const paragraph of paragraphs) {
    const combined = base ? `${base.trim()} ${paragraph.trim()}` : paragraph.trim();
    if (combined.length >= META_MIN) {
      return combined;
    }
    if (!base) base = paragraph;
  }
  return base;
}

function episodeOgImage(episode: PodcastEpisode): string | undefined {
  const fromYoast = episode.yoast_head_json?.og_image?.[0]?.url;
  const fromFeatured = episode.featured_media_url;
  const raw = fromYoast || fromFeatured;
  if (!raw) return undefined;
  return absolutePlayfulUrl(raw);
}

export function buildPodcastHubMetadata(): Metadata {
  const url = canonicalForPath('/podcast');
  const title = formatPlayfulDocumentTitle('Bendita Web Podcast');
  const description = fitPodcastMetaDescription(HUB_DESCRIPTION_SOURCE);
  const ogImage = absolutePlayfulUrl(PODCAST_HUB_OG_IMAGE_PATH);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: ogImage, alt: 'Bendita Web Podcast — Playful Agency' }],
    },
    twitter: twitterFromOpenGraph(title, description, ogImage),
  };
}

export function buildPodcastEpisodeMetadata(episode: PodcastEpisode): Metadata {
  const url = canonicalForPath(`/podcast/${episode.slug}`);
  const titleSegment =
    stripHtml(episode.title?.rendered || episode.slug) || episode.slug;
  const title = formatPlayfulDocumentTitle(titleSegment);
  const description = fitPodcastMetaDescription(episodePlainExcerpt(episode));
  const ogImage = episodeOgImage(episode);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage, alt: titleSegment }] } : {}),
    },
    twitter: twitterFromOpenGraph(title, description, ogImage),
  };
}

export function buildPodcastEpisodeJsonLd(
  episode: PodcastEpisode,
): Record<string, unknown> {
  const url = canonicalForPath(`/podcast/${episode.slug}`);
  const name = decodeHtmlEntities(stripHtml(episode.title?.rendered || ''));
  const description = fitPodcastMetaDescription(episodePlainExcerpt(episode));
  const image = episodeOgImage(episode);
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name,
    url,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: PODCAST_SERIES_NAME,
      url: canonicalForPath('/podcast'),
    },
    publisher: { '@id': ORGANIZATION_SCHEMA['@id'] },
  };
  if (description) json.description = description;
  if (episode.date) json.datePublished = episode.date;
  if (image) json.image = image;
  return json;
}

export function podcastEpisodeHeadlineHtml(episode: PodcastEpisode): string {
  return episode.title?.rendered || episode.slug;
}