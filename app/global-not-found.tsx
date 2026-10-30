/**
 * 404 global (Next 15.5, experimental.globalNotFound).
 *
 * Con Payload la app tiene dos layouts raíz ((frontend) y (payload)) y ya no
 * existe app/layout.tsx, así que las URLs que no casan con ninguna ruta no
 * tendrían layout. Este archivo reutiliza tal cual el layout y el not-found
 * de la web pública para que el 404 se vea igual que hoy.
 *
 * Con flag B5 apagado no importamos app/(frontend)/not-found.tsx (evita Payload/async
 * en el grafo de global-not-found, que en Preview Vercel servía __next_error__).
 */
import type { Metadata } from 'next';
import RootLayout, { generateMetadata as layoutMetadata } from './(frontend)/layout';
import NotFound from './(frontend)/not-found';
import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import { isCmsPaginasB5FromPayload } from '@/lib/cms-paginas-b5-flag';

export async function generateMetadata(): Promise<Metadata> {
  return layoutMetadata();
}

export default function GlobalNotFound() {
  return (
    <RootLayout>
      {isCmsPaginasB5FromPayload() ? (
        <NotFound payloadSlug="global-not-found" />
      ) : (
        <NotFoundView />
      )}
    </RootLayout>
  );
}
