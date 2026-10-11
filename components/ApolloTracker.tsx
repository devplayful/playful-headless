'use client'

import Script from 'next/script'

interface ApolloTrackerProps {
  appId: string
}

/**
 * Official Apollo website visitor tracker. The snippet is async+defer, so
 * afterInteractive keeps it off the critical path and avoids extra TBT from
 * beforeInteractive. Preview and staging omit the appId via
 * productionAnalyticsIds().
 */
export default function ApolloTracker({ appId }: ApolloTrackerProps) {
  if (!appId) return null

  return (
    <Script
      id="apollo-tracker"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"${appId}"})},document.head.appendChild(o)}initApollo();`,
      }}
    />
  )
}
