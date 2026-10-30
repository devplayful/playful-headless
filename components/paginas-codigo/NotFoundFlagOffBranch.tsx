import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import { CMS_PAGINAS_B5_PREVIEW_HEADER } from '@/lib/cms-paginas-b5-flag';

/**
 * Flag apagado: UI congelada sin cargar Payload en el grafo del not-found raíz.
 * Preview ?cms=1 (header B5) valida seed vía import dinámico.
 */
export default async function NotFoundFlagOffBranch() {
  if (process.env.VERCEL_ENV === 'preview') {
    const { headers } = await import('next/headers');
    const h = await headers();
    if (h.get(CMS_PAGINAS_B5_PREVIEW_HEADER) === 'not-found') {
      const { resolveNotFoundPayloadPreviewAttrs } = await import('@/lib/cms-paginas-b5-not-found');
      const cmsSourceAttrs = await resolveNotFoundPayloadPreviewAttrs();
      return <NotFoundView cmsSourceAttrs={cmsSourceAttrs} />;
    }
  }
  return <NotFoundView />;
}
