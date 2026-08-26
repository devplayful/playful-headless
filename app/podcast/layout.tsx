import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';

const PODCAST_URL = canonicalForPath('/podcast');

export const metadata: Metadata = {
  alternates: { canonical: PODCAST_URL },
  openGraph: { url: PODCAST_URL },
};

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return children;
}
