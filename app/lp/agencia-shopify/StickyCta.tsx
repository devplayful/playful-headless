'use client';

import { useEffect, useState } from 'react';
import { unsignedLabel } from '../_lib/unsigned-copy';
import { LP_META_CTA_STICKY } from './copy';
import BookingCta from './BookingCta';

const STICKY_CLASS =
  'inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#440099] px-8 py-3 text-center text-sm font-semibold text-white no-underline hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099] md:w-auto md:text-base';

export default function StickyCta({ search = '' }: { search?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('problema');
    if (!target) return undefined;
    const update = () => {
      setVisible(target.getBoundingClientRect().top < window.innerHeight);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      data-lp-meta-sticky
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E9D7FF] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(68,0,153,0.08)]"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-center">
        <BookingCta dataCta="lp-meta-sticky" className={STICKY_CLASS} search={search}>
          {unsignedLabel(LP_META_CTA_STICKY.tag)}
        </BookingCta>
      </div>
    </div>
  );
}
