import React from "react";
import Link from "next/link";
import Image from "next/image";

const cardData = [
  {
    icon: "/images/diseno-confuso-obsoleto.png",
    title: "Diseño obsoleto o confuso:",
    description:
      "Un sitio web que se ve viejo o es difícil de navegar genera desconfianza. En el mundo del e-commerce, una mala impresión equivale a un cliente que se va para no volver.",
  },
  {
    icon: "/images/velocidad-carga-lenta.png",
    title: "Velocidad de carga lenta:",
    description:
      "Cada segundo que tu web tarda en cargar es una oportunidad de venta perdida. Un sitio lento frustra y reduce la confianza, afectando directamente tu tasa de conversión.",
  },
  {
    icon: "/images/errores-tecnicos-bugs.png",
    title: "Errores técnicos y bugs:",
    description:
      "Un checkout que falla, botones que no funcionan o problemas de visualización móvil hacen que tus clientes abandonen el carrito y que nunca más regresen.",
  },
];

export default function MaterialServicesSection({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="playful-contenedor playful-contenedor-FFEFD1">
        <h2 className="playful-h2 max-w-3xl mx-auto">
        Lo que realmente está matando tus conversiones online
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
        El problema rara vez es tu producto. Es la <b>mala experiencia de usuario </b>la que ahuyenta a tus compradores.
        </p>

        {/* Grid de 3 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {cardData.map((card, index) => (
            <div
              key={index}
              className="conversion-card flex flex-col"
            >
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
          <Link href="/contactar-agencia-de-marketing-digital" className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
          Escríbenos para conversar sobre tu página web.
          </Link>
        </div>
      </div>
    </section>
  );
}
