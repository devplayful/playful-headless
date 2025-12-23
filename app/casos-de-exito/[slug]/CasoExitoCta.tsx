"use client";

import React from 'react';

interface CasoExitoCtaProps {
  title: string;
  description: string;
  title2?: string;
  paragraph2?: string;
  imageUrl?: string;
}

const CasoExitoCta: React.FC<CasoExitoCtaProps> = ({
  title,
  description,
  title2,
  paragraph2,
  imageUrl = "/images/caso-de-exito-imagen-cta.png"
}) => {
  return (
    <div className="w-full mb-[80px] max-w-[1200px] mx-auto px-6 rounded-[36px] relative overflow-hidden" style={{
      backgroundColor: "#B3FFF3",
      backgroundImage: "url(/images/background.webp)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#B3FFF340" }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-4 py-4">
        {/* Columna izquierda - Imagen */}
        <div className="lg:w-[40%] mb-12 lg:mb-0 flex justify-center lg:justify-end items-center">
          <div className="relative rounded-2xl overflow-hidden w-full max-w-[450px] h-[300px] sm:h-[400px] lg:w-[450px] lg:h-[500px]">
            <img
              src={imageUrl}
              alt="CTA Casos de Éxito"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Columna derecha - Contenido */}
        <div className="w-full lg:w-[60%] h-full min-h-[300px] lg:min-h-[500px] relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 lg:p-12">
            <h2 className="text-3xl md:text-4xl text-center font-normal mb-6 leading-tight text-[#453A53]">
              {title}
            </h2>

            <p className="text-lg text-[#453A53] text-center mb-8">
              {description}
            </p>

            {title2 && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="flex items-center">
                  <h2 className="text-[28px] font-normal text-center text-[#453A53] mb-6 leading-tight max-w-[600px] mx-auto">
                    {title2}
                  </h2>
                </div>
              </div>
            )}

            {paragraph2 && (
              <p className="text-lg text-[#453A53] text-center mb-8">
                {paragraph2}
              </p>
            )}

            <div className="w-full flex justify-center px-5 py-5 md:p-0">
              <a
                href="/contactar-agencia-de-marketing-digital"
                className="mt-0 md:mt-8 bg-[#440099] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 no-underline text-center !text-[14px] !leading-[18px] md:!text-base md:!leading-normal"
              >
                ¡Hablemos de tu proyecto!
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasoExitoCta;
