'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function QaFiltroRootInner({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const hidePanel = params.get('panel') === '0';

  return (
    <div
      data-qa-filtro-root
      data-qa-panel-hidden={hidePanel ? '1' : '0'}
      className="qa-filtro-root"
    >
      {children}
    </div>
  );
}

export default function QaFiltroRoot({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div data-qa-filtro-root className="qa-filtro-root">{children}</div>}>
      <QaFiltroRootInner>{children}</QaFiltroRootInner>
    </Suspense>
  );
}
