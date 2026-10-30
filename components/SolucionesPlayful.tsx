import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HOME_MAIN_CONTENT } from "@/cms/data/home-main-content";
import type { HomeMainContent } from "@/cms/data/home-main-content";

type SolucionesCopy = HomeMainContent["soluciones"];

const defaultCopy = HOME_MAIN_CONTENT.soluciones;

export default function SolucionesPlayful({
  className,
  copy = defaultCopy,
}: {
  className?: string;
  copy?: SolucionesCopy;
}) {
  return (
    <section data-cta-section="soluciones" className={`${className} pb-[1rem]`}>
      <div className="playful-contenedor playful-contenedor-B3FFF3 ">
        <h2 className="playful-h2 max-w-3xl mx-auto">{copy.heading}</h2>
        <p
          className="playful-contenido-p max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: copy.introHtml }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {copy.cards.map((card, index) => (
            <div key={index} className="conversion-card flex flex-col">
              <div className="card-icon flex-shrink-0 mb-4 w-[200px] h-[200px] relative mx-auto">
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <h3 className="playful-h3 flex-shrink-0 mb-3">{card.title}</h3>
              <p className="playful-contenido-p flex-1">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/contactar-agencia-de-marketing-digital"
            className="conversion-cta-button font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 inline-block !text-[14px] !leading-[18px] md:!text-base md:!leading-normal"
          >
            {copy.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
