import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import {
  ensurePaginasB5NotFoundRender,
  resolveNotFoundPayloadPreviewAttrs,
} from '@/lib/cms-paginas-b5-not-found';

export default async function NotFound() {
  await ensurePaginasB5NotFoundRender('not-found');
  const cmsSourceAttrs = await resolveNotFoundPayloadPreviewAttrs();
  return <NotFoundView cmsSourceAttrs={cmsSourceAttrs} />;
}
