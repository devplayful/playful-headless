'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LP_META_PAIN_ORDER } from './copy';
import { caseOrderForMarket, parseLpMetaAngle, parseLpMetaMarket } from './variants';
import StickyCta from './StickyCta';

/** Tiny island: apply mkt/ang from the query and mount the sticky CTA. */
export default function VariantBoot() {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const mkt = parseLpMetaMarket(searchParams.get('mkt'));
  const ang = parseLpMetaAngle(searchParams.get('ang'), searchParams.get('utm_content'));

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-lp-meta-shopify]');
    if (!root) return;
    root.setAttribute('data-lp-mkt', mkt);
    root.setAttribute('data-lp-ang', ang);

    root.querySelectorAll<HTMLElement>('[data-lp-when-ang]').forEach((node) => {
      node.hidden = node.getAttribute('data-lp-when-ang') !== ang;
    });
    root.querySelectorAll<HTMLElement>('[data-lp-when-mkt]').forEach((node) => {
      const allow = (node.getAttribute('data-lp-when-mkt') || '').split(' ');
      node.hidden = !allow.includes(mkt);
    });

    const painOrder = LP_META_PAIN_ORDER[ang];
    root.querySelectorAll<HTMLElement>('[data-lp-pain-index]').forEach((node) => {
      const index = Number(node.getAttribute('data-lp-pain-index'));
      const position = painOrder.indexOf(index as 0 | 1 | 2);
      node.style.order = String(position < 0 ? index : position);
      node.setAttribute('data-lp-pain-position', String(position < 0 ? index : position));
    });

    caseOrderForMarket(mkt).forEach((slug, index) => {
      const node = root.querySelector<HTMLElement>(`[data-lp-case="${slug}"]`);
      if (node) node.style.order = String(index);
    });

    root.querySelectorAll<HTMLAnchorElement>('[data-lp-meta-booking]').forEach((anchor) => {
      const next = search ? `/reunion-playful/ir?${search}` : '/reunion-playful/ir';
      if (anchor.getAttribute('href') !== next) anchor.setAttribute('href', next);
    });
    root.querySelectorAll<HTMLAnchorElement>('[data-lp-keep-search]').forEach((anchor) => {
      const base = anchor.getAttribute('data-lp-keep-search') || anchor.getAttribute('href') || '';
      const next = search ? `${base.split('?')[0]}?${search}` : base.split('?')[0];
      if (anchor.getAttribute('href') !== next) anchor.setAttribute('href', next);
    });
  }, [ang, mkt, search]);

  return <StickyCta search={search} />;
}
