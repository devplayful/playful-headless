import { getPageMetadataBySlug } from '@/services/wordpress';
import { canonicalForPath } from '@/utils/canonical';
import CaseStudiesContent from './CaseStudiesContent';

export default function CaseStudiesPage() {
  return (
    <>
      <h1 className="sr-only">Resultados que hablan por sí solos</h1>
      <CaseStudiesContent />
    </>
  );
}

export async function generateMetadata() {
  const url = canonicalForPath('/casos-de-exito-agencia-de-marketing-digital');
  try {
    const metadata = await getPageMetadataBySlug('casos-de-exito-agencia-de-marketing-digital');
    
    return {
      title: metadata.yoast_wpseo_title || 'Casos de Éxito - Playful Agency',
      description: metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
      alternates: { canonical: url },
      openGraph: {
        title: metadata.yoast_wpseo_og_title || 'Casos de Éxito - Playful Agency',
        description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
        type: 'website',
        url,
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
      alternates: { canonical: url },
      openGraph: { url },
    };
  }
}
