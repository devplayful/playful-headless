"use client";

/*
EJEMPLO DE USO:

<TwoColumnCtaSection
  // Configuración de la imagen (izquierda)
  imageUrl="/ruta/a/tu/imagen.jpg"
  imageAlt="Descripción de la imagen"

  // Estilo del contenido (derecha)
  contentBgColor="#E0F2FE"

  // Contenido principal
  title="Transforma tu presencia digital"
  subtitle="Descubre cómo nuestras soluciones pueden impulsar tu negocio al siguiente nivel con estrategias personalizadas."
  
  // Llamada a la acción
  ctaTitle="¿Listo para comenzar?"
  buttonText="Solicitar cotización"
  buttonLink="/contacto"
  
  // Evento opcional al hacer clic
  onButtonClick={() => {
    // Ejemplo de seguimiento de evento
    console.log('CTA clickeado');
    // window.gtag('event', 'contacto_iniciado');
  }}
/>

VARIANTES RÁPIDAS:

1. Fondo oscuro:
contentBgColor="#1E293B"

2. Sin evento de clic:
onButtonClick={undefined}

3. Imagen con enlace externo:
imageUrl="https://ejemplo.com/imagen.jpg"

4. Botón con acción personalizada:
buttonLink="#"
onButtonClick={() => {
  // Tu lógica personalizada aquí
}}
*/

import React from 'react';

interface TwoColumnCtaSectionProps {
  imageUrl?: string;
  imageAlt?: string;
  contentBgColor?: string;
  title?: string;
  subtitle?: string;
  ctaTitle?: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

const TwoColumnCtaSection: React.FC<TwoColumnCtaSectionProps> = ({
  imageUrl = "/images/logos/Playful Agency Conectemos.png",
  imageAlt = "Agencia de Marketing Digital",
  contentBgColor = "#FFEFD1",
  title = "No esperes más para empezar a ganar",
  subtitle = "Deja de arreglar tu web con parches y dejas de perder clientes por fallas que no puedes ver. Es hora de invertir en una solución profesional.",
  ctaTitle = "¡Contáctanos y hagamos que tu sitio web trabaje para ti!",
  buttonText = "¡Empieza ya!",
  buttonLink = "#",
  onButtonClick,
}) => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:space-x-12">
          {/* Columna izquierda - Imagen */}
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-[100%] h-auto object-cover"
              />
            </div>
          </div>

          {/* Columna derecha - Contenido */}
          <div className="lg:w-[708px] h-full min-h-[500px] rounded-2xl relative overflow-hidden">
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundColor: contentBgColor,
                backgroundImage: "url(/images/background.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-0" style={{ backgroundColor: `${contentBgColor}40` }}></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 lg:p-12">
              <h2 className="text-3xl md:text-4xl text-center font-bold mb-6 leading-tight text-[#453A53]">
                {title}
              </h2>
              <p className="text-lg text-[#453A53] text-center mb-8">
                {subtitle}
              </p>
              <div className="space-y-4 flex flex-col items-center">
                <div className="flex items-center">
                  <h2 className="text-[28px] font-bold text-center text-[#453A53] mb-6 leading-tight max-w-[600px] mx-auto">
                    {ctaTitle}
                  </h2>
                </div>
              </div>
              <a href={buttonLink} onClick={onButtonClick} className="mt-8 bg-[#440099] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 no-underline">
                {buttonText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnCtaSection;
