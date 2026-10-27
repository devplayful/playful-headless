import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import ReunionPlayfulRedirect from './ReunionPlayfulRedirect';

export const metadata: Metadata = {
  title: 'Reservar reunión | Playful Agency',
  description: 'Agenda una reunión de diagnóstico con Playful Agency.',
  alternates: { canonical: canonicalForPath('/reunion-playful') },
  robots: { index: false, follow: true },
};

export default function ReunionPlayfulPage() {
  return <ReunionPlayfulRedirect />;
}
