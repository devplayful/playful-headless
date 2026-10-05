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
  const steps = [
    {
      item: diseno,
      body: diseno.body.map((paragraph) => (
        <p key={paragraph} className="playful-contenido-p mb-3 last:mb-0 text-left">
          {paragraph}
        </p>
      )),
    },
    {
      item: desarrollo,
      body: (
        <>
          <p className="playful-contenido-p mb-3 text-left">
            {desarrollo.body[0]}
            <Link
              href={HOME_METODO.ecommerceHref}
              className="font-medium text-[#440099] underline"
            >
              {HOME_METODO.ecommerceAnchor}
            </Link>
            {HOME_METODO.ecommerceDespues}
          </p>
          <p className="playful-contenido-p mb-3 text-left">
            {desarrollo.body[1]}
          </p>
          <p className="playful-contenido-p mb-3 text-left">
            {HOME_METODO.pagosAntes}
            <Link
              href={HOME_METODO.pagosHref}
              className="font-medium text-[#440099] underline"
            >
              {HOME_METODO.pagosAnchor}
            </Link>
            {HOME_METODO.pagosDespues}
          </p>
          <p className="playful-contenido-p text-left">
            {HOME_METODO.migracion}
          </p>
        </>
      ),
    },
    {
      item: entrega,
      body: entrega.body.map((paragraph) => (
        <p key={paragraph} className="playful-contenido-p mb-3 last:mb-0 text-left">
          {paragraph}
        </p>
      )),
    },
  ];

  return (
    <section className={`${className} pb-[1rem]`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .home-metodo-paso-num::before {
              content: attr(data-n);
            }
          `,
        }}
      />
      <div className="playful-contenedor playful-contenedor-B3FFF3 ">
        <h2 className="playful-h2 max-w-3xl mx-auto">
          {HOME_METODO.h2}
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
          {HOME_METODO.intro}
        </p>

        <div className="flex flex-col gap-6 md:gap-8 mt-12 w-full">
          {steps.map(({ item, body }, index) => (
            <article
              key={item.h3}
              className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full text-left flex flex-col md:flex-row md:items-start md:gap-10"
            >
              <div className="md:w-[34%] md:flex-shrink-0 mb-5 md:mb-0">
                <span
                  className="playful-h2 home-metodo-paso-num mb-3 block"
                  data-n={String(index + 1).padStart(2, "0")}
                  aria-hidden="true"
                />
                <div className="card-icon flex-shrink-0 mb-4 w-24 h-24 relative">
                  <Image
                    src={item.icon}
                    alt=""
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <h3 className="playful-h3">{item.h3}</h3>
              </div>
              <div className="md:flex-1 min-w-0">
                {body}
              </div>
            </article>
          ))}
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
