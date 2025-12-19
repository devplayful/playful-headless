import { getPageMetadataBySlug } from '@/services/wordpress';
import CaseStudiesContent from './CaseStudiesContent';

export default async function CaseStudiesPage() {
  return <CaseStudiesContent />;
}

export async function generateMetadata() {
  try {
    const metadata = await getPageMetadataBySlug('casos-de-exito-agencia-de-marketing-digital');
    
    return {
      title: metadata.yoast_wpseo_title || 'Casos de Éxito - Playful Agency',
      description: metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
      openGraph: {
        title: metadata.yoast_wpseo_og_title || 'Casos de Éxito - Playful Agency',
        description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
        type: 'website',
        url: 'https://playfulagency.com/casos-de-exito-agencia-de-marketing-digital',
        images: metadata.yoast_wpseo_og_image ? [{
          url: metadata.yoast_wpseo_og_image,
          width: 1200,
          height: 630,
          alt: 'Casos de Éxito - Playful Agency',
        }] : [],
      },
    };
  } catch (error) {
    console.error('Error al generar metadatos de la página de casos de éxito:', error);
    return {
      title: 'Casos de Éxito - Playful Agency',
      description: 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
    };
  }
}
