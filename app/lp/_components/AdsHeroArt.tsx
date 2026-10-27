import Image from 'next/image';
import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { publicWebpIfPresent } from '@/lib/public-webp-src';

export const ADS_HERO_ART_1X = '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';
export const ADS_HERO_ART_2X = '/images/agencia-shopify/hero-gORwV7MSXO@2x.png';

/** Same slot as /agencia-shopify; reused so LCP is a sized, prioritized image. */
export default function AdsHeroArt() {
  const src = publicWebpIfPresent(ADS_HERO_ART_1X);
  return (
    <div
      data-illustration-slot="ads-hero"
      className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px]"
    >
      <Image
        src={src}
        alt={resolveImageAlt(ADS_HERO_ART_1X)}
        width={552}
        height={360}
        priority
        fetchPriority="high"
        sizes="(min-width: 1024px) 552px, calc(100vw - 2rem)"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
