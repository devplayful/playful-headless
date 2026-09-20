'use client';

import { useEffect } from 'react';

/**
 * SoyTechno page chrome: body flag for compact header + chat floater rules.
 * Chat: 48px max, 16px from edges, safe-area, no intro bubble, never cover text.
 */
export default function SoyTechnoChrome() {
  useEffect(() => {
    document.body.classList.add('soytechno-case');

    const fitChat = () => {
      const nodes = document.querySelectorAll<HTMLElement>(
        [
          '#lc_text-widget',
          '.lc_text-widget',
          '[id*="lc_text-widget"]',
          '[class*="lc_text-widget"]',
          'chat-widget',
          '[data-widget-id]',
        ].join(','),
      );
      nodes.forEach((node) => {
        if (node.tagName === 'SCRIPT') return;
        const style = node.style;
        style.setProperty('width', '48px', 'important');
        style.setProperty('height', '48px', 'important');
        style.setProperty('max-width', '48px', 'important');
        style.setProperty('max-height', '48px', 'important');
        style.setProperty('right', '16px', 'important');
        style.setProperty('bottom', 'calc(16px + env(safe-area-inset-bottom, 0px))', 'important');
        style.setProperty('left', 'auto', 'important');
        style.setProperty('z-index', '40', 'important');
      });
    };

    fitChat();
    const observer = new MutationObserver(fitChat);
    observer.observe(document.body, { childList: true, subtree: true });
    const t1 = window.setTimeout(fitChat, 800);
    const t2 = window.setTimeout(fitChat, 2400);

    return () => {
      document.body.classList.remove('soytechno-case');
      observer.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return null;
}
