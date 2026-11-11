import type { Metadata } from 'next';
import ReunionPlayfulRedirect from './ReunionPlayfulRedirect';

export const metadata: Metadata = {
  title: 'Reservar reunión | Playful Agency',
  description: 'Agenda una reunión de diagnóstico con Playful Agency.',
  robots: { index: false, follow: true },
};

export default function ReunionPlayfulPage() {
  return <ReunionPlayfulRedirect />;
}
