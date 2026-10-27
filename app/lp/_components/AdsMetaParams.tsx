'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DEFAULT_LP_META_ANGLE,
  DEFAULT_LP_META_MARKET,
  parseLpMetaAngle,
  parseLpMetaMarket,
  type LpMetaAngle,
  type LpMetaMarket,
} from '../agencia-shopify/variants';

export type AdsMetaParamsValue = {
  mkt: LpMetaMarket;
  ang: LpMetaAngle;
  search: string;
};

const AdsMetaParamsContext = createContext<AdsMetaParamsValue>({
  mkt: DEFAULT_LP_META_MARKET,
  ang: DEFAULT_LP_META_ANGLE,
  search: '',
});

export function AdsMetaParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const value = useMemo<AdsMetaParamsValue>(() => {
    const search = searchParams.toString();
    return {
      mkt: parseLpMetaMarket(searchParams.get('mkt')),
      ang: parseLpMetaAngle(searchParams.get('ang'), searchParams.get('utm_content')),
      search,
    };
  }, [searchParams]);

  return <AdsMetaParamsContext.Provider value={value}>{children}</AdsMetaParamsContext.Provider>;
}

export function useAdsMetaParams(): AdsMetaParamsValue {
  return useContext(AdsMetaParamsContext);
}
