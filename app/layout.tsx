import type { Metadata } from 'next'
import { Paytone_One, Montserrat, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BodyClassManager } from '@/components/BodyClassManager';
import { ThemeProvider } from '@/contexts/ThemeContext'
import { getHomePageMetadata } from '@/services/wordpress';

const paytoneOne = Paytone_One({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-paytone-one'
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans'
})

export async function generateMetadata(): Promise<Metadata> {
  /* console.log('=== Iniciando generación de metadatos ==='); */
  
  try {
    const yoastData = await getHomePageMetadata();
    
    const metadata: Metadata = {
      title: yoastData.yoast_wpseo_title || 'Playful Agency - Marketing Digital',
      description: yoastData.yoast_wpseo_metadesc || 'La agencia de marketing digital que va a volar tu cabeza',
      metadataBase: new URL('https://playfulagency.com'),
      openGraph: {
        title: yoastData.yoast_wpseo_og_title || yoastData.yoast_wpseo_title || 'Playful Agency - Marketing Digital',
        description: yoastData.yoast_wpseo_og_description || yoastData.yoast_wpseo_metadesc || 'La agencia de marketing digital que va a volar tu cabeza',
        type: 'website',
        locale: 'es_ES',
        url: yoastData.yoast_wpseo_canonical || 'https://playfulagency.com',
        siteName: 'Playful Agency',
      },
      twitter: {
        card: 'summary_large_image',
        title: yoastData.yoast_wpseo_og_title || yoastData.yoast_wpseo_title || 'Playful Agency - Marketing Digital',
        description: yoastData.yoast_wpseo_og_description || yoastData.yoast_wpseo_metadesc || 'La agencia de marketing digital que va a volar tu cabeza',
      },
    };

    // Añadir imagen solo si existe
    if (yoastData.yoast_wpseo_og_image) {
      metadata.openGraph!.images = [{
        url: yoastData.yoast_wpseo_og_image,
        width: 1200,
        height: 630,
        alt: yoastData.yoast_wpseo_og_title || 'Playful Agency',
      }];
      
      metadata.twitter = {
        ...metadata.twitter,
        images: [yoastData.yoast_wpseo_og_image],
      };
    }

    // Añadir URL canónica
    if (yoastData.yoast_wpseo_canonical) {
      metadata.alternates = {
        canonical: yoastData.yoast_wpseo_canonical,
      };
    }

    /* console.log('=== Metadatos generados correctamente ===');
    console.log(JSON.stringify(metadata, null, 2)); */
    
    return metadata;
    
  } catch (error) {
    console.error('=== Error generando metadatos ===');
    console.error(error);
    
    return {
      title: 'Playful Agency - Marketing Digital',
      description: 'La agencia de marketing digital que va a volar tu cabeza',
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${paytoneOne.variable} ${montserrat.variable} ${dmSans.variable} font-sans`}>
        <ThemeProvider>
          <BodyClassManager />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
