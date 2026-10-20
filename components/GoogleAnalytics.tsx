'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) return null

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var qa=/(?:^|[?&])qa=1(?:&|$)/.test(location.search)||/PlayfulQA\\/1\\.0/.test(navigator.userAgent);
              if(qa){window.__playfulQa=1;return;}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            })();
          `,
        }}
      />
    </>
  )
}
