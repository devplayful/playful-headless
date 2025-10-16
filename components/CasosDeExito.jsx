// components/CasosDeExito.jsx

import React from 'react';
import TarjetaCasoDeExito from './TarjetaCasoDeExito';
// Si usas Next.js, puedes usar <Image> en TarjetaCasoDeExito
// import Image from 'next/image'; 

const casosDeEstudio = [
  {
    id: 1,
    // Nota: El título se usa para el texto del overlay en el ejemplo
    titulo: "+ 40% Conversiones", 
    subtitulo: "SOYTECHNO se transforma y genera un aumento del 40 % en conversiones",
    descripcion: "SoyTechno, una empresa de tecnología, necesitaba renovar su plataforma de ventas. Los usuarios se frustraban con la navegación y el proceso de compra era demasiado largo, lo que se traducía en ventas perdidas",
    tags: ["UI/UX Desing", "E-commerce", "Analítica SEO"],
    ctaTexto: "Ver caso completo",
    ctaLink: "#",
    // Aquí puedes poner la URL real de la imagen, yo usaré un placeholder
    imagenSrc: "/images/soyt_tech_mockup.png", 
    colorFondo: 'rgba(74, 53, 172, 0.8)', // Un morado semi-transparente
  },
  {
    id: 2,
    titulo: "Innovación Tecnológica", 
    subtitulo: "Mercantil SFI se renueva e impulsa su presencia global en el sector Financiero",
    descripcion: "Mercantil Servicios Financieros Internacional y la transformamos en una plataforma digital que impulsa su presencia global y mejora la interacción con sus clientes.",
    tags: ["UI/UX Desing", "SEO", "Analítica SEO"],
    ctaTexto: "Explora la historia",
    ctaLink: "#",
    imagenSrc: "/images/mercantil_mockup.png",
    colorFondo: 'rgba(74, 53, 172, 0.8)',
  },
  {
    id: 3,
    titulo: "Es Posiciona", // O el texto que aparece en la imagen
    subtitulo: "Banco Venezolano de Crédito estratégico de posicionamiento",
    descripcion: "Banco Venezolano de Crédito necesitaba mejorar su plataforma y busca posicionamiento de usuario de valor se encuentra en sector financiero.",
    tags: ["Analítica SEO", "E-comm"],
    ctaTexto: "Ver caso",
    ctaLink: "#",
    imagenSrc: "/images/bvc_mockup.png",
    colorFondo: 'rgba(0, 150, 136, 0.8)', // Un verde semi-transparente
  },
];

const CasosDeExito = () => {
  return (
    <section className="casos-de-exito-seccion">
      {/* Texto superior del encabezado */}
      <div className="header-texto">
        <h1>No confíes solo en nuestra palabra, mira los resultados.</h1>
        <p>Nuestros clientes han logrado resultados impactantes gracias a nuestras estrategias innovadoras y personalizadas. Hemos ayudado a empresas a alcanzar sus metas y a crecer de forma exponencial.</p>
        <h2>¿Quieres ser el próximo?</h2>
      </div>

      {/* Contenedor de las tarjetas */}
      <div className="tarjetas-contenedor">
        {casosDeEstudio.map((caso) => (
          <TarjetaCasoDeExito 
            key={caso.id}
            titulo={caso.titulo}
            descripcion={caso.descripcion}
            imagenSrc={caso.imagenSrc}
            tags={caso.tags}
            ctaTexto={caso.ctaTexto}
            ctaLink={caso.ctaLink}
            colorFondo={caso.colorFondo}
          />
        ))}
      </div>
      
      {/* CTA final */}
      <div className="cta-final">
        <button className="cta-button">
            {/* Aquí puedes usar un icono de emoji o un SVG */}
            😀 ¡Crece como ellos!
        </button>
      </div>
    </section>
  );
};

export default CasosDeExito;