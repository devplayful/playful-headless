/** Deferred GHL chat loader: interaction or real scroll only, 15s after load. */

export const CHAT_LOAD_FALLBACK_MS = 15_000;

export type ChatDeferredLoadHandle = {
  cancel: () => void;
};

/**
 * Calls `load` on pointerdown/keydown/touchstart, or after wheel/touchmove when scrollY > 0.
 * Fallback: fixed delay after window `load` (not idle callback — that fires too early in LH).
 */
export function attachChatWidgetDeferredLoad(load: () => void): ChatDeferredLoadHandle {
  if (typeof window === 'undefined') {
    return { cancel: () => {} };
  }

  let loaded = false;
  let fallbackTimer = 0;
  let scrollIntent = false;

  const run = () => {
    if (loaded) return;
    loaded = true;
    detach();
    load();
  };

  const onScroll = () => {
    if (!scrollIntent) return;
    if (window.scrollY > 0) run();
  };

  const onScrollIntent = () => {
    scrollIntent = true;
    onScroll();
  };

  const interactionEvents = ['pointerdown', 'keydown', 'touchstart'] as const;

  const detach = () => {
    interactionEvents.forEach((type) => window.removeEventListener(type, run));
    window.removeEventListener('wheel', onScrollIntent, true);
    window.removeEventListener('touchmove', onScrollIntent, true);
    window.removeEventListener('scroll', onScroll, true);
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }
    window.removeEventListener('load', scheduleFallback);
  };

  const scheduleFallback = () => {
    if (loaded) return;
    fallbackTimer = window.setTimeout(run, CHAT_LOAD_FALLBACK_MS);
  };

  interactionEvents.forEach((type) => {
    window.addEventListener(type, run, { once: true, passive: true });
  });
  window.addEventListener('wheel', onScrollIntent, { passive: true, capture: true });
  window.addEventListener('touchmove', onScrollIntent, { passive: true, capture: true });
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });

  if (document.readyState === 'complete') {
    scheduleFallback();
  } else {
    window.addEventListener('load', scheduleFallback, { once: true });
  }

  return { cancel: detach };
}
