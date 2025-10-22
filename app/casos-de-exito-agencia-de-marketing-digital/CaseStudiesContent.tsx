"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BlogPosts from "@/components/BlogPosts";

// Importación dinámica para evitar problemas de hidratación
const TestimonialsSection = dynamic(() => import("./TestimonialsSection"), {
  ssr: false,
});

// Datos de ejemplo de casos de éxito
const caseStudies = [
  {
    id: 1,
    title:
      "SOYTECHNO se transforma y genera un aumento del 40% en conversiones",
    slug: "soytechno",
    description:
      "SoyTechno, una empresa de tecnología, necesitaba mejorar su estrategia digital. Nos encargamos de frustrarse con la navegación y el proceso de compra era demasiado largo, lo que se traducía en ventas perdidas",
    tags: ["UX/UI Desing", "E-commerce", "Analítica SEO"],
    badge: "+ 40% en Ventas",
    badgeColor: "bg-purple-600",
    buttonText: "Ver caso completo",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
  {
    id: 2,
    title:
      "Mercantil SFI se renueva e impulsa su presencia global en el sector Financiero",
    slug: "mercantil-sfi",
    description:
      "Mercantil Servicios Financieros Internacional y la transformamos en una plataforma moderna que impulsa su presencia global y mejora la relación con sus clientes.",
    tags: ["UX/UI Desing", "Analítica SEO"],
    badge: "Innovación Technológica",
    badgeColor: "bg-purple-600",
    buttonText: "Explora la Historia",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
  {
    id: 3,
    title: "Banco Venezolano de crédito estrategias de posicionamiento clave",
    slug: "banco-venezolano",
    description:
      "Banco Venezolano de Crédito Optimiza su plataforma y busca posicionarse para que más usuarios puedan encontrar más rápido en el sector financiero.",
    tags: ["Analítica SEO", "E-commerce", "SEO Técnico"],
    badge: "Estrategia de Posicionamiento",
    badgeColor: "bg-teal-600",
    buttonText: "Explora la Historia",
    buttonColor: "bg-teal-700 hover:bg-teal-800",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
  {
    id: 4,
    title: "Odwalla se actualiza y entra con Canto al ecommerce",
    slug: "odwalla",
    description:
      "Odwalla, se renueva y se entra en el mundo de ecommerce con Shopify para ganar más paquete conversión y facilidad.",
    tags: ["E-commerce", "Shopify", "Analítica SEO", "E-commerce"],
    badge: "",
    badgeColor: "",
    buttonText: "Juzgaste conversiones",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
  {
    id: 5,
    title: "Jumex se transforma y genera un aumento del 40 % en conversiones",
    slug: "jumex",
    description:
      "Diseñamos un sistema de reservas intuitivo para reducir el abandono del carrito y mejorar la experiencia de usuario.",
    tags: ["E-commerce", "Shopify", "Analítica SEO", "E-commerce"],
    badge: "+ 40% Conversiones",
    badgeColor: "bg-orange-500",
    buttonText: "Transformacionque convierte",
    buttonColor: "bg-green-600 hover:bg-green-700",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
  {
    id: 6,
    title: "Venemergencia, potenciando el servicio centrado enel usuario",
    slug: "venemergencia",
    description:
      "Grupo Venemergencia, una empresa de servicios de salud, necesitaba renovar su plataforma de ventas. Los usuarios se frustraban con la navegación y el proceso de compra era demasiado largo, lo que se traducía en ventas perdidas",
    tags: ["SEO", "Web development", "Analítica SEO"],
    badge: "",
    badgeColor: "",
    buttonText: "Ver caso completo",
    buttonColor: "bg-indigo-900 hover:bg-indigo-950",
    image: "/images/Playful-Agency-tu-agencia-de-marketing-digital.webp",
  },
];

export default function CaseStudiesContent() {
  // All available tags from the case studies
  const allTags = Array.from(
    new Set(caseStudies.flatMap((study) => study.tags))
  );

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="text-center mb-12">
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
                <div
                  key={caseStudy.id}
                  className="bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Imagen */}
                  <div className="relative h-56 bg-gray-200 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <img
                        src={caseStudy.image}
                        alt={caseStudy.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/placeholder-case-study.jpg";
                        }}
                      />
                    </div>
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
                  <div className="p-6 flex-1 flex flex-col transition-all duration-300 group-hover:bg-white/95">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Testimonios */}
      <TestimonialsSection textColor="#ffffff"/>
       <BlogPosts/>    

      {/* Sección de dos columnas */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:space-x-12">
            {/* Columna izquierda - Imagen */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative rounded-2xl overflow-hidden ">
                <img
                  src="/images/Playful-Agency-tu-agencia-de-marketing-digital.webp"
                  alt="Agencia de Marketing Digital"
                  className="w-[80%] h-auto object-cover"
                />
              </div>
            </div>

            {/* Columna derecha - Contenido */}
            <div className="lg:w-1/2 h-full min-h-[600px] rounded-2xl relative overflow-hidden ">
              <div 
                className="absolute inset-0 w-full h-full bg-[#FFEFD1]"
                style={{
                  backgroundImage: 'url(/images/background.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div className="absolute inset-0 bg-[#FFEFD1]/[0.6]"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-[#453A53]">
                  No esperes más para empezar a ganar
                </h2>
                <p className="text-lg text-[#453A53] mb-8">
                  Deja de arreglar tu web con parches y dejas de perder clientes
                  por fallas que no puedes ver. Es hora de invertir en una
                  solución profesional.
                </p>
                <div className="space-y-4 flex flex-col items-center">
                  <div className="flex items-center">
                    <h2 className="text-[28px] font-bold text-[#453A53] mb-6 leading-tight max-w-[600px] mx-auto">
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
