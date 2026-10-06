import React from "react";
import Image from "next/image";
import { HOME_PROBLEMAS } from "@/app/home-copy";

export default function MaterialServicesSection({
  className,
}: {
  className?: string;
}) {
  return (
    <section data-cta-section="problemas" className={className}>
      <div className="playful-contenedor playful-contenedor-FFEFD1">
        <h2 className="playful-h2 max-w-3xl mx-auto">
          {HOME_PROBLEMAS.h2}
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
          {HOME_PROBLEMAS.intro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {HOME_PROBLEMAS.items.map((card) => (
            <div
              key={card.h3}
              className="conversion-card flex flex-col"
            >
              <div className="card-icon flex-shrink-0 mb-4 w-[200px] h-[200px] relative mx-auto">
                <Image
                  src={card.icon}
                  alt=""
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="playful-h3 flex-shrink-0 mb-3">{card.h3}</h3>
              {card.body.map((paragraph) => (
                <p key={paragraph} className="playful-contenido-p flex-1 mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href={HOME_PROBLEMAS.ctaHref} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
            {HOME_PROBLEMAS.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
