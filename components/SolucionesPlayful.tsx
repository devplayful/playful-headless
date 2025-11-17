"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSliderSettings } from "../hooks/useSliderSettings";

// Importación dinámica del Slider para asegurar que solo se cargue en el cliente
const Slider = dynamic(() => import("react-slick").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div>Cargando...</div>,
});

// Importar estilos de slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Estilos CSS para line-clamp
const cardStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-wrap: break-word;
  }
  .line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-wrap: break-word;
  }
  .conversion-cards-wrapper .slick-slide {
    height: auto;
  }
  .conversion-cards-wrapper .slick-slide > div {
    height: 100%;
  }
  .conversion-cards-wrapper .slick-track {
    display: flex;
    align-items: stretch;
  }
`;

const cardData = [
  {
    icon: "❌", // Puedes usar un componente de ícono real o una imagen
    title: "Diseño obsoleto o confuso:",
    description:
      "Un sitio web que se ve viejo o es difícil de navegar ahuyenta a los clientes. Piensa en tu web como tu tienda física: si la entrada es un laberinto, nadie va a entrar.",
  },
  {
    icon: "🚀",
    title: "Velocidad de carga lenta:",
    description:
      "Cada segundo que tu web tarda en cargar es un cliente que se va. Un sitio lento genera frustración y poca confianza.",
  },
  {
    icon: "🐞",
    title: "Errores técnicos y bugs:",
    description:
      "¿Tu checkout falla? ¿Los botones no funcionan? Estos pequeños fallos hacen que tus clientes abandonen el carrito y que nunca más regresen.",
  },
  {
    icon: "📱",
    title: "No es responsive:",
    description:
      "Más del 60% de los usuarios navegan desde móvil. Si tu web no se adapta a todos los dispositivos, estás perdiendo la mayoría de tus clientes.",
  },
  {
    icon: "🔍",
    title: "Mala optimización SEO:",
    description:
      "Si no te encuentran en Google, no existes. Una web sin SEO es como tener una tienda en el medio del desierto.",
  },
  {
    icon: "💳",
    title: "Proceso de pago complicado:",
    description:
      "Cuanto más pasos agregues al checkout, más clientes abandonan. La simplicidad es la clave de la conversión.",
  },
];

export default function SolucionesPlayful({
  className,
}: {
  className?: string;
}) {
  const responsiveSettings = useSliderSettings();
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cardStyles }} />
      <section className={`${className} pb-[5rem]`}>
        <div className="playful-contenedor playful-contenedor-B3FFF3 ">
        <h2 className="playful-h2 max-w-3xl mx-auto">
          Soluciones Playful: Tecnología que se traduce en ventas
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
          Somos más que una agencia de diseño web. Somos tus socios
          tecnológicos, dedicados a construir la base que tu negocio necesita
          para escalar.
        </p>

        {/* Contenedor del carousel */}
        <div className="carousel-container md:mx-0 mx-[-1rem]">
          <Slider
            {...{
              ...responsiveSettings,
              slidesToScroll: 1,
              autoplay: true,
              arrows: false,
              dots: false,
            }}
            className="conversion-cards-wrapper"
          >
            {cardData.map((card, index) => (
              <div
                key={index}
                className="carousel-slide md:px-6 h-full"
              >
                <div className="conversion-card h-[400px] flex flex-col">
                  <div className="card-icon flex-shrink-0">{card.icon}</div>
                  <h3 className="playful-h3 flex-shrink-0 line-clamp-2 h-16 flex items-center">{card.title}</h3>
                  <p className="playful-contenido-p flex-1 line-clamp-4 overflow-hidden">{card.description}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="text-center mt-12">
          <button className="conversion-cta-button font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
            ¡Crece como ellos!
          </button>
        </div>
        </div>
      </section>
    </>
  );
}
