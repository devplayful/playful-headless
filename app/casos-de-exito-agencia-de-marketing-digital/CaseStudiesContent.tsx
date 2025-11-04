"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BlogPosts from "@/components/BlogPosts";

// Componente para la tarjeta de caso de estudio
const CaseStudyCard = ({ caseStudy }: { caseStudy: CaseStudy }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = caseStudy.image && !imageError;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
      <Link href={`/casos-de-exito/detalle/${caseStudy.slug}`} className="block h-full">
        {/* Imagen */}
        <div className="relative h-56 bg-gray-200 overflow-hidden group">
          {hasImage ? (
            <img
              src={caseStudy.image}
              alt={caseStudy.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}
          
          {/* Badge sobre la imagen */}
          {caseStudy.badge && (
            <div
              className={`absolute bottom-4 left-4 ${caseStudy.badgeColor} text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg`}
            >
              {caseStudy.badge}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {caseStudy.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {caseStudy.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">
            {caseStudy.description}
          </p>

          {/* Botón alineado a la derecha */}
          <div className="flex justify-end">
            <button
              className={`${caseStudy.buttonColor} text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              {caseStudy.buttonText}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Importación dinámica para evitar problemas de hidratación
const TestimonialsSection = dynamic(() => import("./TestimonialsSection"), {
  ssr: false,
});

// Interfaz para los casos de éxito de la API
interface WPCaseStudy {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  excerpt: {
    rendered: string;
  };
  acf: {
    tags: string[];
    badge: string;
    badge_color: string;
    button_text: string;
    button_color: string;
    imagen_destacada: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

// Interfaz para los casos de estudio transformados
export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  badge: string;
  badgeColor: string;
  buttonText: string;
  buttonColor: string;
  image: string;
}

export default function CaseStudiesContent() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await fetch('https://endpoint.playfulagency.com/wp-json/wp/v2/casos-de-exito?_embed');
        if (!response.ok) {
          throw new Error('Error al cargar los casos de éxito');
        }
        const data = await response.json();
        
        // Transformar los datos de la API al formato esperado por el componente
        const transformedData: CaseStudy[] = data.map((item: any) => {
          // Extraer título
          const title = item.title?.rendered || 'Sin título';
          
          // Extraer descripción y limpiar HTML
          let description = '';
          if (item.excerpt?.rendered) {
            description = item.excerpt.rendered
              .replace(/<[^>]*>?/gm, '') // Eliminar etiquetas HTML
              .replace(/\[\/?(p|br|strong|em|h[1-6])\]/g, '') // Eliminar etiquetas cortas restantes
              .trim();
          } else if (item.content?.rendered) {
            description = item.content.rendered
              .replace(/<[^>]*>?/gm, '')
              .substring(0, 200) + '...';
          }
          
          // Extraer imagen destacada
          let image = '';
          if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            image = item._embedded['wp:featuredmedia'][0].source_url;
          } else if (item.featured_media_url) {
            image = item.featured_media_url;
          }
          
          return {
            id: item.id,
            title: title,
            slug: item.slug || `caso-${item.id}`,
            description: description || 'Descripción no disponible',
            tags: item.tags ? 
              (Array.isArray(item.tags) ? item.tags : [item.tags]) : 
              (item.acf?.tags || []),
            badge: item.acf?.badge || item.meta?._case_study_badge || '',
            badgeColor: item.acf?.badge_color || item.meta?._case_study_badge_color || 'bg-purple-600',
            buttonText: item.acf?.button_text || 'Ver más',
            buttonColor: item.acf?.button_color || 'bg-blue-600 hover:bg-blue-700',
            image: image
          };
        });
        
        setCaseStudies(transformedData);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError('No se pudieron cargar los casos de estudio. Por favor, intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  // All available tags from the case studies
  const allTags = Array.from(
    new Set(caseStudies.flatMap((study) => study.tags))
  );

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Toggle filter on/off
  const toggleFilter = (filter: string) => {
    setActiveFilters(
      (prev) =>
        prev.includes(filter)
          ? prev.filter((f) => f !== filter) // Remove filter if it's active
          : [...prev, filter] // Add filter if it's not active
    );
  };

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  // Filter case studies based on active filters
  const filteredCaseStudies =
    activeFilters.length === 0
      ? caseStudies
      : caseStudies.filter((study) =>
          activeFilters.some((filter) => study.tags.includes(filter))
        );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error al cargar los casos de estudio</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5724AB] bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat bg-blend-overlay py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-white text-lg font-semibold">
            Home / <span className="font-bold">Casos de éxito</span>
          </p>
        </div>

        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Text */}
          <div>
            <h1 className="text-[50px] lg:text-[57px] font-bold text-white mb-6 leading-tight">
              Resultados que hablan por sí solos
            </h1>
            <p className="text-white text-lg leading-relaxed opacity-90">
              Detrás de cada proyecto hay una historia de transformación.
              Nuestro trabajo se centra en identificar los puntos de dolor de tu
              negocio para luego aplicar la tecnología y la creatividad
              necesarias para generar resultados que no sólo resuelvan un
              problema, sino que impulsen tu crecimiento de manera sostenible.
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/images/Playful-Agency-tu-agencia-de-marketing-digital.webp"
                alt="Playful Agency - Casos de éxito"
                className="w-full max-w-md lg:max-w-lg"
              />
            </div>
          </div>
        </div>

        {/* Bottom Text Section */}
        <div className="lg:text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            No confíes solo en nuestra palabra, mira los resultados.
          </h2>
          <p className="text-white text-lg opacity-90 max-w-4xl mx-auto">
            Nuestros clientes han logrado resultados impactantes gracias a
            nuestras estrategias innovadoras y personalizadas. Hemos ayudado a
            empresas a alcanzar sus metas y a crecer de forma exponencial.
          </p>
        </div>

        {/* CTA Text */}
        <div className="text-center mb-8">
          <h3 className="text-2xl lg:text-3xl font-bold text-white">
            ¿Quieres ser el próximo?
          </h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="w-full bg-gradient-to-r from-teal-100 to-purple-100 rounded-3xl lg:rounded-full px-6 py-6 flex flex-col gap-4">
          {/* <h3 className="text-base font-medium text-gray-900">Filtrar por</h3> */}

          {/* Filtros disponibles */}
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilters.includes(tag)
                    ? "bg-white text-teal-600 shadow-sm"
                    : "bg-white/80 text-gray-700 hover:bg-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Filtros activos */}
          {activeFilters.length > 0 && (
            <div className="mt-2">
              {/* <div className="text-sm text-gray-500 mb-2">
                Filtros aplicados:
              </div> */}
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-2 bg-white text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {filter}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFilter(filter);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={`Eliminar filtro ${filter}`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setActiveFilters([])}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-2"
                >
                  Limpiar todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de casos de éxito */}
      <div className="bg-[#E4FFF9] playful-Grid-CasosExito rounded-3xl mx-auto my-8 w-[71%]">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {filteredCaseStudies.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-white mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-white/80">
                Intenta con otros filtros o{" "}
                <button
                  onClick={() => setActiveFilters([])}
                  className="text-white font-medium underline hover:text-teal-200"
                >
                  limpiar todos los filtros
                </button>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCaseStudies.map((caseStudy) => (
                <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Testimonios */}
      <TestimonialsSection textColor="#ffffff" />
      <BlogPosts />

      {/* Sección de dos columnas */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:space-x-12">
            {/* Columna izquierda - Imagen */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/images/logos/Playful Agency Conectemos.png"
                  alt="Agencia de Marketing Digital"
                  className="w-[100%] h-auto object-cover"
                />
              </div>
            </div>

            {/* Columna derecha - Contenido */}
            <div className="lg:w-[708px] h-full min-h-[500px] rounded-2xl relative overflow-hidden">
              <div
                className="absolute inset-0 w-full h-full bg-[#FFEFD1]"
                style={{
                  backgroundImage: "url(/images/background.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 bg-[#FFEFD1]/[0.6]"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 lg:p-12">
                <h2 className="text-3xl md:text-4xl text-center font-bold mb-6 leading-tight text-[#453A53]">
                  No esperes más para empezar a ganar
                </h2>
                <p className="text-lg text-[#453A53] text-center mb-8">
                  Deja de arreglar tu web con parches y dejas de perder clientes
                  por fallas que no puedes ver. Es hora de invertir en una
                  solución profesional.
                </p>
                <div className="space-y-4 flex flex-col items-center">
                  <div className="flex items-center">
                    <h2 className="text-[28px] font-bold text-center text-[#453A53] mb-6 leading-tight max-w-[600px] mx-auto">
                      ¡Contáctanos y hagamos que tu sitio web trabaje para ti!
                    </h2>
                  </div>
                </div>
                <button className="mt-8 bg-[#440099] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                  ¡Empieza ya!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
