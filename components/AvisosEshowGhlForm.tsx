'use client';

import Script from 'next/script';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AVISOS_ESHOW_GHL_FORM_EMBED_SCRIPT,
  AVISOS_ESHOW_GHL_FORM_ID,
  AVISOS_ESHOW_GHL_FORM_IFRAME_SRC,
} from '@/lib/avisos-eshow';
import { buildGhlFormIframeSrc } from '@/utils/ghl-form-embed';

const IFRAME_ID = `inline-${AVISOS_ESHOW_GHL_FORM_ID}`;

export default function AvisosEshowGhlForm() {
  const searchParams = useSearchParams();
  const search = useMemo(() => {
    if (!searchParams) return '';
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }, [searchParams]);

  const iframeSrc = buildGhlFormIframeSrc(AVISOS_ESHOW_GHL_FORM_IFRAME_SRC, search);

  return (
    <div className="w-full min-h-[480px] rounded-[32px] bg-[#E9D7FF] p-4 md:p-6 shadow-lg">
      <iframe
        src={iframeSrc}
        id={IFRAME_ID}
        title="Formulario eShow"
        className="w-full min-h-[440px] border-0 rounded-2xl bg-white"
        data-form-id={AVISOS_ESHOW_GHL_FORM_ID}
        data-layout-iframe-id={IFRAME_ID}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
      />
      <Script src={AVISOS_ESHOW_GHL_FORM_EMBED_SCRIPT} strategy="lazyOnload" />
    </div>
  );
}
