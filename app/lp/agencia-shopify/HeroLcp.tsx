import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { HERO_LCP_DATA_URI } from './hero-lcp-data';

export const HERO_LCP_1X = '/images/agencia-shopify/hero-gORwV7MSXO@1x.webp';
export const HERO_LCP_PNG = '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';

const HERO_IMG_STYLE = {
  display: 'block',
  width: '100%',
  height: 352,
  objectFit: 'cover' as const,
  opacity: 1,
  visibility: 'visible' as const,
};

/** Route-local LCP: inlined 1x WebP, visible box without waiting for CSS. */
export default function HeroLcp() {
  return (
    <div data-illustration-slot="ads-hero" className="relative w-full">
      <img
        src={HERO_LCP_DATA_URI}
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
