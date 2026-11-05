import type { Metadata } from 'next';
import { getPodcastEpisodeBySlug } from '@/services/wordpress';
import {
  episodeCanonicalUrl,
  episodeDocumentTitle,
  episodeMetaDescription,
  episodeOgImage,
} from '@/lib/podcast-episode-meta';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = episodeCanonicalUrl(slug);
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) {
    return {
      alternates: { canonical: url },
      openGraph: { url },
      robots: { index: true, follow: true },
    };
  }

  const title = episodeDocumentTitle(episode);
  const description = episodeMetaDescription(episode);
  const image = episodeOgImage(episode);
  const twitter = twitterFromOpenGraph(title, description);

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
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      ...twitter,
      card: 'summary_large_image',
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function PodcastEpisodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
