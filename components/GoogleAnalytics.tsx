'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { isProductionAnalyticsHostname } from '@/lib/analytics/production-tags'

interface GoogleAnalyticsProps {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(isProductionAnalyticsHostname(window.location.hostname))
  }, [])

  if (!gaId || !allowed) return null

  return (
    <>
      {/* Google Analytics gtag.js — only after apex/www hostname check */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
