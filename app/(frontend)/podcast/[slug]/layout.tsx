import type { Metadata } from 'next';
import { getPodcastEpisodeBySlugWithCms } from '@/lib/cms-podcast';
import {
  buildPodcastEpisodeJsonLd,
  buildPodcastEpisodeMetadata,
  podcastEpisodeHeadlineHtml,
} from '@/lib/podcast-editorial-meta';
import { serializeJsonLd } from '@/lib/blog-editorial-meta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlugWithCms(slug);
  if (!episode) {
    return { title: 'Episodio no encontrado | Playful' };
  }
  return buildPodcastEpisodeMetadata(episode);
}

export default async function PodcastEpisodeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlugWithCms(slug);

  if (!episode) {
    return children;
  }

  const jsonLd = buildPodcastEpisodeJsonLd(episode);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
          dangerouslySetInnerHTML={{ __html: podcastEpisodeHeadlineHtml(episode) }}
        />
      </div>
      {children}
    </>
  );
}