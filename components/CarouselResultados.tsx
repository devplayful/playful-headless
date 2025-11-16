"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSliderSettings } from "../hooks/useSliderSettings";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Fab,
} from "@mui/material";
import {
  ShoppingCart,
  TrendingUp,
  Palette,
  Speed,
  ArrowForward,
  Star,
} from "@mui/icons-material";

// Importación dinámica del Slider para asegurar que solo se cargue en el cliente
const Slider = dynamic(() => import("react-slick").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div>Cargando...</div>,
});

// Importar estilos de slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Componente CarouselResultados - Muestra un slider de casos de éxito con diseño responsivo
 * @param {string} [title="Soluciones Playful: Tecnología que se traduce en ventas"] - Título principal del componente
 * @param {string} [subtitle] - Subtítulo descriptivo
 * @param {Array<Object>} [cases=[]] - Array de objetos con los casos de éxito
 * @param {string} [buttonText="¡Crece como ellos!"] - Texto del botón principal
 * @param {Function} [onButtonClick] - Función que se ejecuta al hacer clic en el botón
 * @param {string} [className] - Clases CSS adicionales para el contenedor principal
 * @param {string} [backgroundColor="#5724AB"] - Color de fondo en formato hexadecimal
 * @param {string} [textColor="white"] - Color del texto principal
 * @param {string} [buttonTextColor="white"] - Color del texto del botón principal
 * @param {string} [buttonBgColor="#39DDCB"] - Color de fondo del botón principal
 * @param {string} [cardBgColor="white"] - Color de fondo de las cards
 * @param {string} [badgeColor="#7C3AED"] - Color del badge flotante
 * @param {string} [actionButtonColor="#2563EB"] - Color del botón de acción de las cards
 */

interface CaseStudy {
  id?: number;
  imageUrl?: string;
  badge: string;
  badgeText: string;
  title: string;
  tags: string[];
  description: string;
  buttonText: string;
  onCaseClick?: () => void;
}

interface CarouselResultadosProps {
  title?: string;
  subtitle?: string;
  cases?: CaseStudy[];
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  cardBgColor?: string;
  badgeColor?: string;
  actionButtonColor?: string;
}

const defaultCases: CaseStudy[] = [
  {
    imageUrl: "/images/mockup-laptop.jpg",
    badge: "+ 40%",
    badgeText: "Conversiones",
    title:
      "SOYTECHNO se transforma y genera un aumento del 40% en conversiones",
    tags: ["UI/UX Design", "E-commerce", "Analítica SEO"],
    description:
      "SoyTechno, una empresa de tecnología, necesitaba renovar su plataforma de ventas. Los usuarios se frustraban con la navegación y el proceso de compra era demasiado largo, lo que se traducía en ventas perdidas.",
    buttonText: "Ver caso completo",
  },
  {
    imageUrl: "/images/mockup-mobile.jpg",
    badge: "Innovación",
    badgeText: "Tecnológica",
    title:
      "Mercantil SFI se renueva e impulsa su presencia global en el sector Financiero",
    tags: ["UI/UX Design", "E-commerce", "Analítica SEO"],
    description:
      "Mercantil Servicios Financieros Internacional y la transformamos en una plataforma digital que impulsa su presencia global y mejora la interacción con sus clientes.",
    buttonText: "Explora la historia",
  },
  {
    imageUrl: "/images/mockup-dashboard.jpg",
    badge: "+ 65%",
    badgeText: "Engagement",
    title: "TechFlow optimiza su experiencia digital y aumenta el engagement",
    tags: ["UI/UX Design", "Dashboard", "Analítica"],
    description:
      "TechFlow necesitaba una plataforma más intuitiva para sus usuarios. Rediseñamos completamente su interfaz, mejorando la usabilidad y la experiencia del usuario.",
    buttonText: "Ver transformación",
  },
  {
    imageUrl: "/images/mockup-ecommerce.jpg",
    badge: "+ 80%",
    badgeText: "Ventas Online",
    title: "DigitalStore revoluciona su e-commerce con nuevas tecnologías",
    tags: ["E-commerce", "Mobile First", "Conversiones"],
    description:
      "DigitalStore transformó completamente su tienda online, implementando las últimas tecnologías para mejorar la experiencia de compra y aumentar las conversiones.",
    buttonText: "Descubre más",
  },
  {
    imageUrl: "/images/mockup-app.jpg",
    badge: "App",
    badgeText: "Innovadora",
    title: "StartupTech lanza su aplicación móvil con gran éxito",
    tags: ["Mobile App", "UI/UX Design", "Startup"],
    description:
      "StartupTech necesitaba una aplicación móvil que reflejara su innovación. Desarrollamos una app intuitiva que conecta perfectamente con su audiencia objetivo.",
    buttonText: "Ver aplicación",
  },
  {
    imageUrl: "/images/mockup-website.jpg",
    badge: "+ 120%",
    badgeText: "Tráfico Web",
    title: "WebCorp multiplica su tráfico web con estrategia digital integral",
    tags: ["SEO", "Marketing Digital", "Analítica"],
    description:
      "WebCorp logró multiplicar su tráfico web implementando una estrategia digital integral que incluye SEO, contenido optimizado y analítica avanzada.",
    buttonText: "Ver estrategia",
  },
  {
    imageUrl: "/images/mockup-platform.jpg",
    badge: "Plataforma",
    badgeText: "Escalable",
    title: "CloudTech desarrolla plataforma escalable para el futuro",
    tags: ["Cloud", "Escalabilidad", "Tecnología"],
    description:
      "CloudTech necesitaba una plataforma que creciera con su negocio. Desarrollamos una solución escalable que se adapta a sus necesidades futuras.",
    buttonText: "Conocer más",
  },
  {
    imageUrl: "/images/mockup-analytics.jpg",
    badge: "+ 200%",
    badgeText: "ROI",
    title: "DataCorp optimiza su ROI con analítica avanzada",
    tags: ["Analítica", "Big Data", "ROI"],
    description:
      "DataCorp transformó su toma de decisiones implementando analítica avanzada que les permitió optimizar su ROI y mejorar significativamente sus resultados.",
    buttonText: "Ver resultados",
  },
];

const CarouselResultados: React.FC<CarouselResultadosProps> = ({
  title = "Soluciones Playful: Tecnología que se traduce en ventas",
  subtitle = "Somos más que una agencia de diseño web. Somos tus socios tecnológicos, dedicados a construir la base que tu negocio necesita para escalar.",
  cases = [],
  buttonText = "¡Crece como ellos!",
  onButtonClick,
  className = "",
  backgroundColor = "#5724AB",
  textColor = "white",
  buttonTextColor = "white",
  buttonBgColor = "#39DDCB",
  cardBgColor = "white",
  badgeColor = "#7C3AED",
  actionButtonColor = "#2563EB",
}) => {
  // Use provided cases or default ones
  const caseStudies = cases.length > 0 ? cases : defaultCases;
  const responsiveSettings = useSliderSettings();

  return (
    <section className={`${className} pb-[12rem]`}>
      <div
        className="w-full max-w-full flex flex-col gap-[25px]
         px-[4rem] mx-auto box-border md:p-[60px_40px] md:max-w-[720px] lg:p-[80px_90px]
          lg:max-w-[1000px] xl:max-w-[1200px] rounded-[68px] bg-[url('/images/background.webp')]
           text-center playful-contenedor-B3FFF3"
        style={{ backgroundColor: backgroundColor }}
      >
        {title && (
          <h2 className="playful-h2" style={{ color: textColor }}>
            {title}
          </h2>
        )}

        {subtitle && (
          <p className="playful-contenido-p" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}

        {/* Contenedor del carousel */}
        <div className="carousel-container" style={{ margin: "0 -24px" }}>
          <Slider
            {...{
              ...responsiveSettings,
              slidesToScroll: 1,
              autoplay: true,
              arrows: false,
            }}
            className="conversion-cards-wrapper"
          >
            {caseStudies.map((card, index) => (
              <div
                key={index}
                className="carousel-slide"
                style={{ padding: "0 24px" }}
              >
                <div
                  className="rounded-3xl overflow-hidden shadow-lg w-[90%] h-full flex flex-col"
                  style={{ backgroundColor: cardBgColor }}
                >
                  {/* Imagen del mockup */}
                  <div className="relative h-48 bg-gray-100">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-bold">
                          Mockup {index + 1}
                        </span>
                      </div>
                    )}

                    {/* Badge flotante */}
                    <div
                      className="absolute top-4 right-4 text-white px-4 py-2 rounded-2xl shadow-lg"
                      style={{ backgroundColor: badgeColor }}
                    >
                      <div className="text-lg font-bold">{card.badge}</div>
                      <div className="text-xs">{card.badgeText}</div>
                    </div>
                  </div>

                  {/* Contenido de la card */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Título */}
                    <h3 className="text-gray-900 font-bold text-lg mb-4 leading-tight">
                      {card.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Botón de acción */}
                    <button
                      className="hover:opacity-90 text-white text-sm font-medium py-3 px-6 rounded-full transition-all w-full"
                      style={{ backgroundColor: actionButtonColor }}
                      onClick={card.onCaseClick}
                    >
                      {card.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="text-center mt-12">
          <button
            className="conversion-cta-button"
            onClick={onButtonClick}
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            <span role="img" aria-label="emoji-star">
              ✨
            </span>{" "}
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CarouselResultados;
