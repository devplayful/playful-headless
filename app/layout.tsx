import type { Metadata } from 'next'
import { Paytone_One, Montserrat, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'
import { BodyClassManager } from '@/components/BodyClassManager';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { getHomePageMetadata } from '@/services/wordpress';
import GoogleTagManager from '@/components/GoogleTagManager';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MetaPixel from '@/components/MetaPixel';
import ApolloTracker from '@/components/ApolloTracker';
import AnalyticsSpaPageView from '@/components/AnalyticsSpaPageView';
import CtaClickTracker from '@/components/CtaClickTracker';
import AttributionCapture from '@/components/AttributionCapture';
import BookingQueryPropagator from '@/components/BookingQueryPropagator';
import BookingWidgetAttribution from '@/components/BookingWidgetAttribution';
import { productionAnalyticsIds } from '@/lib/analytics/production-tags';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';
import { ORGANIZATION_JSON_LD } from '@/utils/organization-schema.mjs';
import { HIGHLEVEL_CHAT_WIDGET_LOADER } from '@/lib/highlevel/external-tracking';

const paytoneOne = Paytone_One({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-paytone-one',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  // Valores por defecto explícitos (fuente de verdad para OG)
  const defaultTitle = 'Playful Agency - Agencia de E-commerce | Marketing Digital';
  const defaultDescription = '¿Tu e-commerce está perdiendo dinero sin que lo sepas? En Playful Agency transformamos plataformas mediocres en máquinas de conversión de alto rendimiento.';
  const defaultOgImage = ogJpegForPath('/') || '/images/og/home.jpg';
  
  try {
    const yoastData = await getHomePageMetadata();
    
    const title = yoastData.yoast_wpseo_title || defaultTitle;
    const description = yoastData.yoast_wpseo_metadesc || defaultDescription;
    const social = pageSocialMetadata({
      title,
      description,
      images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      type: 'website',
    });
    const metadata: Metadata = {
      title,
      description,
      metadataBase: new URL('https://playfulagency.com'),
      openGraph: {
        ...social.openGraph,
        locale: 'es_ES',
        siteName: 'Playful Agency',
      },
      twitter: social.twitter,
    };
    
    return metadata;
    
  } catch (error) {
    console.error('Error generando metadatos:', error);
    
    // Fallback con metadata completa
    const social = pageSocialMetadata({
      title: defaultTitle,
      description: defaultDescription,
      images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      type: 'website',
    });
    return {
      title: defaultTitle,
      description: defaultDescription,
      metadataBase: new URL('https://playfulagency.com'),
      openGraph: {
        ...social.openGraph,
        locale: 'es_ES',
        siteName: 'Playful Agency',
      },
      twitter: social.twitter,
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { gtmId, gaId, apolloAppId, metaPixelId } = productionAnalyticsIds();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {gaId ? (
          <script
            id="gtag-data-layer-stub"
            dangerouslySetInnerHTML={{
              __html:
                'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;',
            }}
          />
        ) : null}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
        {apolloAppId && <ApolloTracker appId={apolloAppId} />}
        <script
          id="playful-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSON_LD }}
        />
        <link rel="dns-prefetch" href="https://widgets.leadconnectorhq.com" />
        <link rel="preload" as="script" href={HIGHLEVEL_CHAT_WIDGET_LOADER} />
      </head>
      <body className={`${paytoneOne.variable} ${montserrat.variable} ${dmSans.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <BodyClassManager />
          <AnalyticsSpaPageView />
          <CtaClickTracker />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ChatWidget />
          <AttributionCapture />
          <BookingQueryPropagator />
          <BookingWidgetAttribution />
        </ThemeProvider>
      </body>
    </html>
  )
}
