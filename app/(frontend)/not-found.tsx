import { isCmsPaginasB5FromPayload } from '@/lib/cms-paginas-b5-flag';
import NotFoundPayloadShell from '@/components/paginas-codigo/NotFoundPayloadShell';
import NotFoundFlagOffBranch from '@/components/paginas-codigo/NotFoundFlagOffBranch';
import type { PaginasB5Slug } from '@/cms/data/paginas-b5-payload';

type NotFoundProps = {
  /** Cuando global-not-found verifica el doc `global-not-found` con flag ON. */
  payloadSlug?: PaginasB5Slug;
};

export default function NotFound({ payloadSlug = 'not-found' }: NotFoundProps) {
  if (isCmsPaginasB5FromPayload()) {
    return <NotFoundPayloadShell slug={payloadSlug} />;
  }
  return <NotFoundFlagOffBranch />;
}
