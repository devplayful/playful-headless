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
    <div className="mx-auto max-w-xl px-4 pb-10 md:pb-10" data-qa-page="gracias" data-qa-filtro-content>
      <h1 className="mb-4 text-2xl font-semibold text-[#453A53]">Solicitud recibida</h1>
      <p>
        Tu reunión aún no está confirmada: el equipo revisa tus respuestas y te escribe en 1 día laborable.
      </p>
    </div>
  );
}
