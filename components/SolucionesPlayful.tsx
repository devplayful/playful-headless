import React from "react";
import Link from "next/link";
import Image from "next/image";

const cardData = [
  {
    icon: "/images/desarrollo-web-a-medida.png",
    title: "Desarrollo y diseño web a medida:",
    description:
      "Creamos tiendas online optimizadas, ultrarrápidas y visualmente impactantes que capturan la atención y convierten visitantes en clientes leales.",
  },
  {
    icon: "/images/optimizacion-experiencia-usuario.png",
    title: "Optimización de la experiencia de usuario (UX/UI):",
    description:
      "Diseñamos flujos de compra tan intuitivos y atractivos que el proceso de pago se siente natural e inevitable.",
  },
  {
    icon: "/images/seo-integrado.png",
    title: "SEO integrado:",
    description:
      "No solo construimos tu plataforma; la optimizamos desde el código fuente. Nos aseguramos de que tu sitio no solo funcione de maravilla, sino que sea altamente visible para los motores de búsqueda, atrayendo tráfico cualificado sin depender solo de la publicidad.",
  },
];

export default function SolucionesPlayful({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={`${className} pb-[1rem]`}>
      <div className="playful-contenedor playful-contenedor-B3FFF3 ">
        <h2 className="playful-h2 max-w-3xl mx-auto">
        Soluciones Playful: Tecnología de E-commerce para Escalar
        </h2>
        <p className="playful-contenido-p max-w-3xl mx-auto">
        Somos la <b>Agencia de E-commerce </b>que necesitas para dejar de remendar y empezar a dominar. Somos tus socios tecnológicos, dedicados a construir la base digital que tu negocio requiere para competir y crecer.
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
          <Link href="/contactar-agencia-de-marketing-digital" className="conversion-cta-button font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 inline-block !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
          Escríbenos para conversar sobre tu página web.
          </Link>
        </div>
      </div>
    </section>
  );
}
