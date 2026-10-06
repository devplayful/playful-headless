'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { isProductionAnalyticsHostname } from '@/lib/analytics/production-tags'

interface GoogleTagManagerProps {
  gtmId: string
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(isProductionAnalyticsHostname(window.location.hostname))
  }, [])

  if (!gtmId || !allowed) return null

  return (
    <>
      {/* Google Tag Manager — only after apex/www hostname check */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  )
}

// Componente para el noscript del body
export function GoogleTagManagerNoscript({ gtmId }: GoogleTagManagerProps) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(isProductionAnalyticsHostname(window.location.hostname))
  }, [])

  if (!gtmId || !allowed) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
