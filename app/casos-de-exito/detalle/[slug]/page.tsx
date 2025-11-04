import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { CaseStudy } from '@/app/casos-de-exito-agencia-de-marketing-digital/CaseStudiesContent';

// This function fetches a single case study by slug
async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const response = await fetch(`https://endpoint.playfulagency.com/wp-json/wp/v2/casos-de-exito?slug=${slug}&_embed`);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data || data.length === 0) return null;
    
    const item = data[0];
    
    // Transform the data to match our CaseStudy interface
    return {
      id: item.id,
      title: item.title?.rendered || 'Sin título',
      slug: item.slug || `caso-${item.id}`,
      description: item.content?.rendered || 'Descripción no disponible',
      tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : [],
      badge: item.acf?.badge || '',
      badgeColor: item.acf?.badge_color || 'bg-purple-600',
      buttonText: item.acf?.button_text || 'Ver más',
      buttonColor: item.acf?.button_color || 'bg-blue-600 hover:bg-blue-700',
      image: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
    };
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const caseStudy = await getCaseStudy(params.slug);
  
  if (!caseStudy) {
    return {
      title: 'Caso de estudio no encontrado | Playful Agency',
      description: 'El caso de estudio que buscas no existe o ha sido eliminado.',
    };
  }

  return {
    title: `${caseStudy.title} | Caso de éxito | Playful Agency`,
    description: caseStudy.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
    openGraph: {
      title: caseStudy.title,
      description: caseStudy.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
      images: caseStudy.image ? [caseStudy.image] : [],
    },
  };
}

export default async function CaseStudyDetail({ params }: { params: { slug: string } }) {
  const caseStudy = await getCaseStudy(params.slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${caseStudy.image}')`,
        }}
      >
        <div className="text-center text-white px-4">
          <div className="inline-block mb-4">
            <span className={`${caseStudy.badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
              {caseStudy.badge}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{caseStudy.title}</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {caseStudy.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: caseStudy.description }} />
        
        <div className="mt-12 text-center">
          <Link 
            href="/casos-de-exito" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a todos los casos de éxito
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // This function is used for static generation of pages at build time
  // For now, we'll return an empty array and rely on server-side rendering
  // In production, you might want to fetch all case study slugs here
  return [];
}
