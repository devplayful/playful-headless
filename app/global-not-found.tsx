/**
 * 404 global (Next 15, experimental.globalNotFound).
 *
 * En ramas con layout raíz único reutiliza app/layout.tsx y el not-found
 * de la web pública para que URLs sin ruta pinten el 404 completo.
 */
import type { Metadata } from 'next';
import RootLayout, { generateMetadata as layoutMetadata } from './layout';
import NotFound from './(frontend)/not-found';

export async function generateMetadata(): Promise<Metadata> {
  return layoutMetadata();
}

export default function GlobalNotFound() {
  return (
    <RootLayout>
      <NotFound />
    </RootLayout>
  );
}
