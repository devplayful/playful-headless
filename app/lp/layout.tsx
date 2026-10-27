import type { Metadata } from 'next';
import VisitaCalificadaTracker from './_components/VisitaCalificadaTracker';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdsLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitaCalificadaTracker />
      {children}
    </>
  );
}
