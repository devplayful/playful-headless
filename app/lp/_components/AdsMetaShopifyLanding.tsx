import { Suspense } from 'react';
import { getAllCaseStudies } from '@/services/wordpress';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import { toAdsLandingCaseCards } from '../_lib/ads-landing-cases';
import { DEFAULT_LP_META_ANGLE, DEFAULT_LP_META_MARKET } from '../agencia-shopify/variants';
import AdsMetaShopifyClient, { AdsMetaShopifyView } from './AdsMetaShopifyClient';
import AdsHeroArt, { ADS_HERO_ART_1X, ADS_HERO_ART_2X } from './AdsHeroArt';

export default async function AdsMetaShopifyLanding() {
  const casosDeExito = await getAllCaseStudies().catch(() => []);
  const caseCards = toAdsLandingCaseCards(casosDeExito);
  const hero1x = publicWebpIfPresent(ADS_HERO_ART_1X);
  const hero2x = publicWebpIfPresent(ADS_HERO_ART_2X);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={hero1x}
        imageSrcSet={`${hero1x} 552w, ${hero2x} 1104w`}
        imageSizes="(min-width: 1024px) 552px, calc(100vw - 2rem)"
      />
      <Suspense
        fallback={
          <AdsMetaShopifyView
            mkt={DEFAULT_LP_META_MARKET}
            ang={DEFAULT_LP_META_ANGLE}
            caseCards={caseCards}
            hero={<AdsHeroArt />}
          />
        }
      >
        <AdsMetaShopifyClient caseCards={caseCards} hero={<AdsHeroArt />} />
      </Suspense>
    </>
  );
}
