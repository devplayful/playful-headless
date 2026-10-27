import type { ReactNode } from 'react';
import { lpMetaHrefWithSearch } from '../_lib/meta-booking-href';

type QueryLinkProps = {
  href: string;
  dataCta: string;
  className?: string;
  children: ReactNode;
  search?: string;
};

/** Server-safe secondary link. VariantBoot stamps the live query onto data-lp-keep-search. */
export default function QueryLink({ href, dataCta, className, children, search = '' }: QueryLinkProps) {
  const q = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return (
    <a
      href={lpMetaHrefWithSearch(href, q)}
      data-cta={dataCta}
      data-lp-keep-search={href}
      className={className}
    >
      {children}
    </a>
  );
}
