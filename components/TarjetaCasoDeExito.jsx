// components/TarjetaCasoDeExito.jsx

import React from 'react';

const TarjetaCasoDeExito = ({ titulo, descripcion, imagenSrc, tags, ctaTexto, ctaLink, colorFondo }) => {
  return (
    <div className="tarjeta-caso-de-exito">
      {/* Área de la imagen con el overlay/fondo */}
      <div className="tarjeta-imagen-contenedor" style={{ backgroundColor: colorFondo }}>
        {/* Aquí puedes usar el componente <Image> de Next.js para optimización */}
        {/* <Image src={imagenSrc} alt={titulo} layout="fill" objectFit="cover" /> */}
        <img src={imagenSrc} alt={titulo} className="tarjeta-imagen" />
        
        {/* El texto destacado de conversión/innovación */}
        <div className="tarjeta-overlay-texto">
          {/* Este texto puede variar, como el "+ 40% Conversiones" o "Innovación Tecnológica" */}
          {titulo.includes('%') ? (
            <span>{titulo}</span>
          ) : (
            <>
              {/* Para el caso de "Innovación Tecnológica" */}
              <span className="overlay-titulo">{titulo.split(' ')[0]}</span>
              <span className="overlay-subtitulo">{titulo.split(' ').slice(1).join(' ')}</span>
            </>
          )}
        </div>
      </div>

      {/* Contenido principal de la tarjeta */}
      <div className="tarjeta-contenido">
        <h2>{titulo}</h2>
        <p>{descripcion}</p>

        <div className="tarjeta-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>

        <a href={ctaLink} className="tarjeta-cta">
          {ctaTexto}
        </a>
      </div>
    </div>
  );
};

export default TarjetaCasoDeExito;