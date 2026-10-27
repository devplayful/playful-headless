import { resolveImageAlt } from '@/lib/image-alt-overrides';

export const HERO_LCP_1X = '/images/agencia-shopify/hero-gORwV7MSXO@1x.webp';
export const HERO_LCP_2X = '/images/agencia-shopify/hero-gORwV7MSXO@2x.webp';
export const HERO_LCP_PNG = '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';

/** Route-local LCP: sized WebP, priority, raw img so the route hydrates less. */
export default function HeroLcp() {
  return (
    <div data-illustration-slot="ads-hero" className="relative w-full overflow-hidden rounded-[32px]">
      <img
        src={HERO_LCP_1X}
        srcSet={`${HERO_LCP_1X} 552w, ${HERO_LCP_2X} 1104w`}
        sizes="(min-width: 1024px) 552px, calc(100vw - 2rem)"
        width={552}
        height={360}
        alt={resolveImageAlt(HERO_LCP_PNG)}
        fetchPriority="high"
        decoding="async"
        className="h-auto w-full"
      />
    </div>
  );
}
