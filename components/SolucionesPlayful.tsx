import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HOME_METODO } from "@/app/home-copy";

export default function SolucionesPlayful({
  className,
}: {
  className?: string;
}) {
  const [diseno, desarrollo, entrega] = HOME_METODO.items;

  return (
    <section className={`${className} pb-[1rem]`}>
      <div className="playful-contenedor playful-contenedor-B3FFF3 ">
        <h2 className="playful-h2 max-w-3xl mx-auto">
          {HOME_METODO.h2}
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
          {HOME_METODO.intro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          <div className="conversion-card flex flex-col">
            <div className="card-icon flex-shrink-0 mb-4 w-[200px] h-[200px] relative mx-auto">
              <Image
                src={diseno.icon}
                alt=""
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="playful-h3 flex-shrink-0 mb-3">{diseno.h3}</h3>
            {diseno.body.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p flex-1 mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="conversion-card flex flex-col">
            <div className="card-icon flex-shrink-0 mb-4 w-[200px] h-[200px] relative mx-auto">
              <Image
                src={desarrollo.icon}
                alt=""
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="playful-h3 flex-shrink-0 mb-3">{desarrollo.h3}</h3>
            {desarrollo.body.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p flex-1 mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
            <p className="playful-contenido-p flex-1 mb-3">
              {HOME_METODO.ecommerceAntes}
              <Link
                href={HOME_METODO.ecommerceHref}
                className="font-medium text-[#440099] underline"
              >
                {HOME_METODO.ecommerceAnchor}
              </Link>
              {HOME_METODO.ecommerceDespues}
            </p>
            <p className="playful-contenido-p flex-1 mb-3">
              {HOME_METODO.pagosAntes}
              <Link
                href={HOME_METODO.pagosHref}
                className="font-medium text-[#440099] underline"
              >
                {HOME_METODO.pagosAnchor}
              </Link>
              {HOME_METODO.pagosDespues}
            </p>
            <p className="playful-contenido-p flex-1">
              {HOME_METODO.migracion}
            </p>
          </div>

          <div className="conversion-card flex flex-col">
            <div className="card-icon flex-shrink-0 mb-4 w-[200px] h-[200px] relative mx-auto">
              <Image
                src={entrega.icon}
                alt=""
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="playful-h3 flex-shrink-0 mb-3">{entrega.h3}</h3>
            {entrega.body.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p flex-1 mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a href={HOME_METODO.ctaHref} className="conversion-cta-button font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 inline-block !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
            {HOME_METODO.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
