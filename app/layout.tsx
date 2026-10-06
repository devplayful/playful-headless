import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Paytone_One, Montserrat, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'
import { BodyClassManager } from '@/components/BodyClassManager';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { getHomePageMetadata } from '@/services/wordpress';
import GoogleTagManager, { GoogleTagManagerNoscript } from '@/components/GoogleTagManager';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AnalyticsSpaPageView from '@/components/AnalyticsSpaPageView';
import CtaClickTracker from '@/components/CtaClickTracker';
import AttributionCapture from '@/components/AttributionCapture';
import BookingQueryPropagator from '@/components/BookingQueryPropagator';
import BookingWidgetAttribution from '@/components/BookingWidgetAttribution';
import { productionAnalyticsIds } from '@/lib/analytics/production-tags';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';

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

export const viewport: Viewport = {
  themeColor: '#440099',
};

export async function generateMetadata(): Promise<Metadata> {
  // Valores por defecto explícitos (fuente de verdad para OG)
  const defaultTitle = 'Playful Agency - Agencia de E-commerce | Marketing Digital';
  const defaultDescription = '¿Tu e-commerce está perdiendo dinero sin que lo sepas? En Playful Agency transformamos plataformas mediocres en máquinas de conversión de alto rendimiento.';
  const defaultOgImage = ogJpegForPath('/') || '/images/og/home.jpg';
  
  try {
    const yoastData = await getHomePageMetadata();
    
    const metadata: Metadata = {
      title: yoastData.yoast_wpseo_title || defaultTitle,
      description: yoastData.yoast_wpseo_metadesc || defaultDescription,
      metadataBase: new URL('https://playfulagency.com'),
      openGraph: {
        title: yoastData.yoast_wpseo_og_title || yoastData.yoast_wpseo_title || defaultTitle,
        description: yoastData.yoast_wpseo_og_description || yoastData.yoast_wpseo_metadesc || defaultDescription,
        type: 'website',
        locale: 'es_ES',
        siteName: 'Playful Agency',
        images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      },
      twitter: {
        card: 'summary_large_image',
        title: yoastData.yoast_wpseo_og_title || yoastData.yoast_wpseo_title || defaultTitle,
        description: yoastData.yoast_wpseo_og_description || yoastData.yoast_wpseo_metadesc || defaultDescription,
        images: [defaultOgImage],
      },
    };
    
    return metadata;
    
  } catch (error) {
    console.error('Error generando metadatos:', error);
    
    // Fallback con metadata completa
    return {
      title: defaultTitle,
      description: defaultDescription,
      metadataBase: new URL('https://playfulagency.com'),
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        type: 'website',
        locale: 'es_ES',
        siteName: 'Playful Agency',
        images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description: defaultDescription,
        images: [defaultOgImage],
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { gtmId, gaId } = productionAnalyticsIds();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </head>
      <body className={`${paytoneOne.variable} ${montserrat.variable} ${dmSans.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <BodyClassManager />
          <Suspense fallback={null}>
            <AnalyticsSpaPageView />
          </Suspense>
          <CtaClickTracker />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ChatWidget />
          <AttributionCapture />
          <Suspense fallback={null}>
            <BookingQueryPropagator />
            <BookingWidgetAttribution />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
