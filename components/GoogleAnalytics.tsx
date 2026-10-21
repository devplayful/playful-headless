'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) return null

  // QA (?qa=1 / PlayfulQA/1.0): GA4 still loads, hits carry
  // traffic_type=internal. GTM (Ads/Meta tags) stays skipped for QA.
  // Do not pass `src` to next/script: the App Router prerender emits
  // <link rel="preload" href="gtag/js?id=G-…"> and the Google tag sends
  // page_view before the QA IIFE can skip gtag('config').
  return (
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            (function(){
              var qa=/(?:^|[?&])qa=1(?:&|$)/.test(location.search)||/PlayfulQA\\/1\\.0/.test(navigator.userAgent);
              if(qa){window.__playfulQa=1;}
              var s=document.createElement('script');
              s.async=true;
              s.src='https://www.googletagmanager.com/gtag/js?id=${gaId}';
              document.head.appendChild(s);
              gtag('js', new Date());
              var cfg={page_path: window.location.pathname};
              if(qa){cfg.traffic_type='internal';}
              gtag('config', '${gaId}', cfg);
            })();
          `,
      }}
    />
  )
}
