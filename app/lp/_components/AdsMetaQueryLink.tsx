'use client';

import type { ReactNode } from 'react';
import { lpMetaHrefWithSearch } from '@/utils/lp-meta-booking';
import { useAdsMetaParams } from './AdsMetaParams';

type AdsMetaQueryLinkProps = {
  href: string;
  dataCta: string;
  className?: string;
  children: ReactNode;
};

export default function AdsMetaQueryLink({ href, dataCta, className, children }: AdsMetaQueryLinkProps) {
  const { search } = useAdsMetaParams();
  return (
    <a href={lpMetaHrefWithSearch(href, search ? `?${search}` : '')} data-cta={dataCta} className={className}>
      {children}
    </a>
  );
}
