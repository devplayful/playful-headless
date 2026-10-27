import type { Metadata } from 'next';
import AdsWarmLandingPage from '../_components/AdsWarmLandingPage';
import { LP_CALENTAMIENTO_COPY, LP_CALENTAMIENTO_META } from './copy';

export const metadata: Metadata = {
  title: LP_CALENTAMIENTO_META.title,
  description: LP_CALENTAMIENTO_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_CALENTAMIENTO_META.path },
};

export default function LpCalentamientoPage() {
  return <AdsWarmLandingPage copy={LP_CALENTAMIENTO_COPY} />;
}
