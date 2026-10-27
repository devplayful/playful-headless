import type { Metadata } from 'next';
import AdsWarmLandingPage from '../_components/AdsWarmLandingPage';
import { LP_PROPUESTA_COPY, LP_PROPUESTA_META } from './copy';

export const metadata: Metadata = {
  title: LP_PROPUESTA_META.title,
  description: LP_PROPUESTA_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_PROPUESTA_META.path },
};

export default function LpPropuestaEcommercePage() {
  return <AdsWarmLandingPage copy={LP_PROPUESTA_COPY} />;
}
