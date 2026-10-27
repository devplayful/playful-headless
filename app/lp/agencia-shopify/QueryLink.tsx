import type { ReactNode } from 'react';

type QueryLinkProps = {
  href: string;
  dataCta: string;
  className?: string;
  children: ReactNode;
  featured?: boolean;
};

/** Server secondary link. The route-local script appends location.search after paint. */
export default function QueryLink({ href, dataCta, className, children, featured }: QueryLinkProps) {
  return (
    <a
      href={href}
      data-cta={dataCta}
      data-lp-keep-search={href}
      data-lp-featured={featured ? '1' : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
