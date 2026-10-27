'use client';

import { useEffect, useState } from 'react';
import { LP_META_PAIN_ORDER } from './copy';
import { caseOrderForMarket, parseLpMetaAngle, parseLpMetaMarket } from './variants';
import StickyCta from './StickyCta';

function applyVariant(search: string) {
  const params = new URLSearchParams(search);
  const mkt = parseLpMetaMarket(params.get('mkt'));
  const ang = parseLpMetaAngle(params.get('ang'), params.get('utm_content'));
  const root = document.querySelector<HTMLElement>('[data-lp-meta-shopify]');
  if (!root) return { mkt, ang };

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
    const position = painOrder.indexOf(index);
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
  return { mkt, ang };
}

/** Tiny island: apply mkt/ang from the query after first paint and mount the sticky CTA. */
export default function VariantBoot() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const raw = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;
    setSearch(raw);
    applyVariant(raw);
  }, []);

  return <StickyCta search={search} />;
}
