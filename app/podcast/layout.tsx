import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const PODCAST_URL = canonicalForPath('/podcast');
const PODCAST_TITLE = 'Bendita Web Podcast: SEO y ecommerce para marcas | Playful';
const PODCAST_DESCRIPTION =
  'El podcast de Playful Agency sobre SEO, diseño web y ecommerce para marcas que ya venden. Escucha todos los episodios de Bendita Web.';

const social = pageSocialMetadata({
  title: PODCAST_TITLE,
  description: PODCAST_DESCRIPTION,
  url: PODCAST_URL,
  type: 'website',
});

export const metadata: Metadata = {
  title: { absolute: PODCAST_TITLE },
  description: PODCAST_DESCRIPTION,
  alternates: { canonical: PODCAST_URL },
  openGraph: social.openGraph,
  twitter: social.twitter,
  robots: { index: false, follow: true },
};

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return children;
}
