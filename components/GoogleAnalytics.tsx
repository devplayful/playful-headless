'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) return null

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
              window.dataLayer=window.dataLayer||[];
              if(qa){window.__playfulQa=1;window.dataLayer.push({traffic_type:'qa',bot_suspect:false});return;}
              var bot=!!navigator.webdriver||/HeadlessChrome|PhantomJS|Puppeteer|Playwright|Headless|Googlebot|bingbot|crawler|spider/i.test(navigator.userAgent||'');
              window.dataLayer.push({traffic_type:bot?'bot':'user',bot_suspect:bot});
              var s=document.createElement('script');
              s.async=true;
              s.src='https://www.googletagmanager.com/gtag/js?id=${gaId}';
              document.head.appendChild(s);
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                traffic_type: bot?'bot':'user',
                bot_suspect: bot
              });
            })();
          `,
      }}
    />
  )
}
