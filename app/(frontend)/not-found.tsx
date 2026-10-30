import NotFoundView from '@/components/paginas-codigo/NotFoundView';
import { isCmsPaginasB5FromPayload } from '@/lib/cms-paginas-b5-flag';

type PaginasB5Slug = 'not-found' | 'global-not-found';

type NotFoundProps = {
  payloadSlug?: PaginasB5Slug;
};

async function NotFoundFromPayload({ slug }: { slug: PaginasB5Slug }) {
  const { default: NotFoundPayloadShell } = await import(
    '@/components/paginas-codigo/NotFoundPayloadShell'
  );
  return <NotFoundPayloadShell slug={slug} />;
}

/** Preview ?cms=1 → middleware reescribe a /_not-found con header B5 (no usa global-not-found). */
async function NotFoundPreviewCmsAttrs() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return <NotFoundView />;
  }
  const { headers } = await import('next/headers');
  const { CMS_PAGINAS_B5_PREVIEW_HEADER } = await import('@/lib/cms-paginas-b5-flag');
  const h = await headers();
  if (h.get(CMS_PAGINAS_B5_PREVIEW_HEADER) !== 'not-found') {
    return <NotFoundView />;
  }
  const { resolveNotFoundPayloadPreviewAttrs } = await import('@/lib/cms-paginas-b5-not-found');
  const cmsSourceAttrs = await resolveNotFoundPayloadPreviewAttrs();
  return <NotFoundView cmsSourceAttrs={cmsSourceAttrs} />;
}

export default function NotFound({ payloadSlug = 'not-found' }: NotFoundProps) {
  if (isCmsPaginasB5FromPayload()) {
    return <NotFoundFromPayload slug={payloadSlug} />;
  }
  return <NotFoundPreviewCmsAttrs />;
}
