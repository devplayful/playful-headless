import { resolveImageAlt } from '@/lib/image-alt-overrides';

export const HERO_LCP_1X = '/images/agencia-shopify/hero-gORwV7MSXO@1x.webp';
export const HERO_LCP_PNG = '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';

const HERO_IMG_STYLE = {
  display: 'block',
  width: '100%',
  height: 352,
  objectFit: 'cover' as const,
};

/** Static 1x WebP with fetchpriority=high. Paints without JS. */
export default function HeroLcp() {
  return (
    <div data-illustration-slot="ads-hero" className="relative w-full">
      <img
        src={HERO_LCP_1X}
        width={552}
        height={360}
        alt={resolveImageAlt(HERO_LCP_PNG)}
        fetchPriority="high"
        decoding="sync"
        style={HERO_IMG_STYLE}
      />
    </div>
  );
}

export function HeroLcpPreload() {
  return <link rel="preload" as="image" href={HERO_LCP_1X} fetchPriority="high" />;
}
