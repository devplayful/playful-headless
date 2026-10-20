import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = canonicalForPath(`/podcast/${slug}`);
  return {
    alternates: { canonical: url },
    openGraph: { url },
    // Hub layout is noindex; published episodes are live WP content and must be indexable.
    robots: { index: true, follow: true },
  };
}

export default function PodcastEpisodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
