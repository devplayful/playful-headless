import type { Metadata } from 'next';
import './qa-filtro.css';
import QaFiltroRoot from './QaFiltroRoot';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function QaFiltroLayout({ children }: { children: React.ReactNode }) {
  return <QaFiltroRoot>{children}</QaFiltroRoot>;
}
