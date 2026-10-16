import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';

const LINKS_URL = canonicalForPath('/links');

export const metadata: Metadata = {
  title: 'Playful Agency | Enlaces',
  description: 'Enlaces oficiales de Playful Agency en Instagram.',
  alternates: { canonical: LINKS_URL },
  robots: { index: false, follow: false },
};

export default function LinksBioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
