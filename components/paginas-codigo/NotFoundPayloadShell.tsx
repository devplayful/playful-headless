import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import {
  ensurePaginasB5NotFoundRender,
  resolveNotFoundPayloadPreviewAttrs,
} from '@/lib/cms-paginas-b5-not-found';
import type { PaginasB5Slug } from '@/cms/data/paginas-b5-payload';

type NotFoundPayloadShellProps = {
  slug: PaginasB5Slug;
};

export default async function NotFoundPayloadShell({ slug }: NotFoundPayloadShellProps) {
  await ensurePaginasB5NotFoundRender(slug);
  const cmsSourceAttrs = await resolveNotFoundPayloadPreviewAttrs();
  return <NotFoundView cmsSourceAttrs={cmsSourceAttrs} />;
}
