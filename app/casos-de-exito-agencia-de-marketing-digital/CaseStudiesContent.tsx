"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

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
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
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
        <div className="w-full bg-gradient-to-r from-teal-100 to-purple-100 rounded-full px-8 py-6 flex items-center gap-4 flex-wrap">
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                Filtros:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                >
                  <svg
                    className="w-4 h-4 text-teal-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={`Eliminar filtro ${filter}`}
                  >
                    <svg
                      className="w-4 h-4"
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
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Available filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  activeFilters.includes(tag)
                    ? "bg-white text-purple-700 border-purple-300 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de casos de éxito */}
      <div className="bg-[#E4FFF9] rounded-3xl mx-auto my-8 w-[71%]">
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

                    {/* Botón */}
                    <button
                      className={`w-full ${caseStudy.buttonColor} text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg`}
                    >
                      {caseStudy.buttonText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Testimonios */}
      <TestimonialsSection />

      {/* Sección de dos columnas */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:space-x-12">
            {/* Columna izquierda - Imagen */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/images/Playful-Agency-tu-agencia-de-marketing-digital.webp"
                  alt="Agencia de Marketing Digital"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Columna derecha - Contenido */}
            <div className="lg:w-1/2 bg-[#FFEFD1] p-12 rounded-2xl text-center">
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
                  <div className="w-2 h-2 bg-[#453A53]  mr-3"></div>
                  <h2 className="text-[28px] font-bold text-[#453A53] mb-6 leading-tight max-w-[600px] mx-auto">
                    ¡Contáctanos y hagamos que tu sitio web trabaje para ti!
                  </h2>
                </div>
              </div>
              <button className="mt-8 bg-[#6D28D9] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                Comenzar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-[#2A0064] h-[334px] rounded-3xl w-[1200px] mx-auto mt-[80px] mb-[80px] flex justify-around items-center">

        <div className="redesSociales rounded-3xl bg-[#FFFFFF] h-[453px] w-[342px] ml-[83px] flex items-center flex-col justify-evenly">
          <div className="logo">
            <img src="/images/logos/Playful-LogoV.svg" alt="logo Playful Agency" className=" w-[214px] h-[50px]" />
          </div>
          <div className="redes">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 text-[#2A0064]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-[#2A0064]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-[#2A0064]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 text-[#2A0064]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="contacto">
          <Link
                href="/contacto"
                className="inline-block bg-teal-400 hover:bg-teal-500 text-[#2A0064] px-6 py-2 rounded-full font-bold transition-colors shadow-md hover:shadow-lg"
              >
                Contáctanos
              </Link>
          </div>
        </div>

        <div className="infoFooter w-full">
          <div className="flex justify-evenly">
            {/* Nosotros */}
            <div>
              <h3 className="subtitle text-lg font-semibold mb-4 text-white">
                NOSOTROS
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/sobre-playful"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Sobre Playful
                  </Link>
                </li>
                <li>
                  <Link
                    href="/casos-de-exito"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Casos de éxito
                  </Link>
                </li>
                <li>
                  <Link
                    href="/nuestro-blog"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Nuestro Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Servicios */}
            <div>
              <h3 className="subtitle text-lg font-semibold mb-4 text-white">
                SERVICIOS
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/servicio-de-seo"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Servicio de SEO
                  </Link>
                </li>
                <li>
                  <Link
                    href="/servicio-de-sem"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Servicio de SEM
                  </Link>
                </li>
                <li>
                  <Link
                    href="/servicio-de-diseno-web"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Servicio de Diseño Web
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal y Contacto */}
            <div>
              <h3 className="subtitle text-lg font-semibold mb-4 text-white">
                LEGAL
              </h3>
              <ul className="space-y-3 mb-6">
                <li>
                  <Link
                    href="/politica-de-privacidad"
                    className="body-text text-white/80 hover:text-white transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>

              <Link
                href="/contacto"
                className="inline-block bg-teal-400 hover:bg-teal-500 text-[#2A0064] px-6 py-2 rounded-full font-bold transition-colors shadow-md hover:shadow-lg"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
