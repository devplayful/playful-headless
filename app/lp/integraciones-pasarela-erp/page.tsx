import type { Metadata } from 'next';
import AdsWarmLandingPage from '../_components/AdsWarmLandingPage';
import { LP_INTEGRACIONES_COPY, LP_INTEGRACIONES_META } from './copy';

export const metadata: Metadata = {
  title: LP_INTEGRACIONES_META.title,
  description: LP_INTEGRACIONES_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_INTEGRACIONES_META.path },
};

export default function LpIntegracionesPasarelaErpPage() {
  return <AdsWarmLandingPage copy={LP_INTEGRACIONES_COPY} />;
}
