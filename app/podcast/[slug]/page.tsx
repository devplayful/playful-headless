import { getPodcastEpisodeBySlug } from '@/services/wordpress';
import { WordPressUnavailableError } from '@/services/wordpress-request.mjs';
import { canonicalForPath } from '@/utils/canonical';
import {
  episodeBreadcrumbJsonLd,
  episodeCanonicalUrl,
  stripEpisodeHtml,
} from '@/lib/podcast-episode-meta';
import EpisodePageClient from './EpisodePageClient';
import EpisodeUnavailable from './EpisodeUnavailable';
import EpisodeNotFound from './EpisodeNotFound';

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let episode;
  try {
    episode = await getPodcastEpisodeBySlug(slug);
  } catch (error) {
    if (error instanceof WordPressUnavailableError) {
      return <EpisodeUnavailable kind="unavailable" />;
    }
    return <EpisodeUnavailable kind="unexpected" />;
  }

  if (!episode) {
    return <EpisodeNotFound />;
  }

  const breadcrumbJsonLd = episodeBreadcrumbJsonLd(slug, episode.title.rendered);
  const episodeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: stripEpisodeHtml(episode.title.rendered),
    description: stripEpisodeHtml(episode.excerpt.rendered),
    datePublished: episode.date,
    url: episodeCanonicalUrl(slug),
    image: episode.featured_media_url || episode.yoast_head_json?.og_image?.[0]?.url,
    partOfSeries: {
      '@type': 'PodcastSeries',
      name: 'Bendita Web',
      url: canonicalForPath('/podcast'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Playful Agency',
      url: 'https://playfulagency.com/',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeJsonLd) }}
      />
      <EpisodePageClient episode={episode} />
    </>
  );
}
