'use client';

import { useEffect, useState } from 'react';

const HERO_BOX = {
  position: 'absolute' as const,
  inset: 0,
  width: '100%',
  height: '100%',
};

/**
 * Same box as the SSR poster. Lottie (first frame = poster webp) mounts
 * after load/idle so it cannot become the LCP. Opacity 0 until DOMLoaded
 * keeps CLS at 0 and the pixels unchanged.
 */
export default function HomeHeroLottie() {
  const [Player, setPlayer] = useState<typeof import('lottie-react').default | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const load = () => {
      Promise.all([
        import('lottie-react'),
        import('@/lib/lottie/home-hero.json'),
      ]).then(([lottie, json]) => {
        if (cancelled) return;
        setPlayer(() => lottie.default);
        setAnimationData((json as { default?: object }).default ?? json);
      }).catch(() => {});
    };

    const start = () => {
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(load, { timeout: 2500 });
      } else {
        timeoutId = window.setTimeout(load, 1);
      }
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
      if (idleId !== undefined && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!Player || !animationData) return null;

  return (
    <Player
      animationData={animationData}
      loop
      autoplay
      onDOMLoaded={() => setReady(true)}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
      style={{
        ...HERO_BOX,
        opacity: ready ? 1 : 0,
        pointerEvents: 'none',
        background: 'transparent',
      }}
      aria-hidden
    />
  );
}
