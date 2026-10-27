import { resolveImageAlt } from '@/lib/image-alt-overrides';

export const HERO_LCP_1X = '/images/agencia-shopify/hero-gORwV7MSXO@1x.webp';
export const HERO_LCP_PNG = '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';

/** Route-local LCP: single 1x WebP, fetchPriority high, no lazy, sync decode. */
export default function HeroLcp() {
  return (
    <div data-illustration-slot="ads-hero" className="relative w-full overflow-hidden rounded-[32px]">
      <img
        src={HERO_LCP_1X}
        width={552}
        height={360}
        alt={resolveImageAlt(HERO_LCP_PNG)}
        fetchPriority="high"
        decoding="sync"
        className="h-[22rem] w-full object-cover lg:h-auto"
      />
    </div>
  );
}
