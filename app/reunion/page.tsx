import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { CALIFICACION_PUBLIC_ROUTE } from '@/lib/calificacion/constants';
import ReunionCalificacionClient from './ReunionCalificacionClient';

export const metadata: Metadata = {
  title: 'Solicitar reunión | Playful Agency',
  description: 'Cuéntanos tu proyecto y solicita una reunión de diagnóstico con Playful Agency.',
  alternates: { canonical: canonicalForPath(CALIFICACION_PUBLIC_ROUTE) },
  robots: { index: false, follow: true },
};

export default function ReunionPage() {
  const previewSimulation = process.env.VERCEL_ENV === 'preview';
  return <ReunionCalificacionClient previewSimulation={previewSimulation} />;
}
