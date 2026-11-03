import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { qaFiltroRouteEnabled } from '@/lib/qa-filtro/constants';

export const metadata: Metadata = {
  title: 'QA filtro reunión — gracias (preview)',
  robots: { index: false, follow: false },
};

export default function QaFiltroGraciasPage() {
  if (!qaFiltroRouteEnabled()) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10" data-qa-page="gracias">
      <p>
        Tu reunión aún no está confirmada; el equipo revisa tus respuestas y te escribe
      </p>
    </div>
  );
}
