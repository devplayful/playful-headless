import Image from 'next/image';
import HomeHeroLottie from '@/components/HomeHeroLottie';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import { resolveImageAlt } from '@/lib/image-alt-overrides';

export const HOME_HERO_POSTER_PNG = '/images/playful-imagen-banner.png';
export const HOME_HERO_WIDTH = 2048;
export const HOME_HERO_HEIGHT = 2048;

/** LCP href for preload links (webp sibling when present). */
export function homeHeroLcpHref(): string {
  return publicWebpIfPresent(HOME_HERO_POSTER_PNG);
}

/** SSR poster (webp, priority) + deferred Lottie of the same first frame. */
export default function HomeHeroArt() {
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${HOME_HERO_WIDTH} / ${HOME_HERO_HEIGHT}` }}
    >
      <Image
        src={publicWebpIfPresent(HOME_HERO_POSTER_PNG)}
        alt={resolveImageAlt(HOME_HERO_POSTER_PNG)}
        width={HOME_HERO_WIDTH}
        height={HOME_HERO_HEIGHT}
        priority
        fetchPriority="high"
        sizes="(min-width: 1024px) 560px, 100vw"
        className="w-full h-auto"
      />
      <HomeHeroLottie />
    </div>
  );
}
