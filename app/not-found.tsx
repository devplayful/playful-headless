'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Ocultar el header solo en esta página
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    // Restaurar el header cuando se desmonte el componente
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Confetti Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Confetti decorativo */}
        <div className="absolute top-10 left-10 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-pink-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-40 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-cyan-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 right-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '3.5s' }}></div>
        
        {/* Círculos outline */}
        <div className="absolute top-32 right-1/4 w-8 h-8 border-2 border-pink-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-6 h-6 border-2 border-cyan-300 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 right-10 w-10 h-10 border-2 border-yellow-300 rounded-full opacity-40"></div>
        
        {/* Líneas decorativas */}
        <div className="absolute top-24 left-1/3 w-12 h-1 bg-purple-300 opacity-30 rotate-45"></div>
        <div className="absolute bottom-24 right-1/3 w-16 h-1 bg-pink-300 opacity-30 -rotate-45"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        
        {/* Título Principal */}
        <h1 className="text-center mb-12 md:mb-16" style={{ fontSize: 'clamp(44px, 8vw, 150px)', fontFamily: 'var(--font-paytone-one)', lineHeight: '1.01', color: '#440099' }}>
          Página no encontrada
        </h1>

        {/* Contenedor Grid 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-20">
          
          {/* Columna 1: Texto y Botón */}
          <div className="space-y-6">
            <h2 className="playful-h2" style={{ color: '#440099' }}>
              Parece que esta página se perdió
            </h2>
            
            <div className="space-y-4">
              <p className="playful-contenido-p">
                Buscábamos una experiencia de usuario fluida aquí, pero esta URL se ha quedado sin inventario por el momento. No te preocupes, en el mundo del E-commerce (y en la web) los desvíos ocurren.
              </p>
              
              <p className="playful-contenido-p">
                Mientras encontramos el error, puedes volver a nuestra página principal o cómo optimizamos ventas, rediseñamos tiendas o simplemente para retomar el camino hacia la conversión.
              </p>
            </div>

            <Link 
              href="/" 
              className="playful-boton inline-block"
              aria-label="Volver a la página principal"
            >
              Inicio
            </Link>
          </div>

          {/* Columna 2: Ilustración */}
          <div className="flex justify-center lg:justify-end">
            <img 
              src="/images/imagen-error-404.png" 
              alt="Error 404 - Página no encontrada" 
              className="w-full max-w-md"
            />
          </div>
        </div>

        {/* Section de Botones de Navegación */}
        <div className="text-center space-y-8">
          <h2 className="playful-h2 px-4" style={{ color: '#440099' }}>
            Mientras reponemos el stock de esta página, aprovecha el desvío:
          </h2>

          {/* Botones con colores específicos - Primera fila */}
          <div className="flex flex-col items-center gap-6">
            {/* Primera fila: 3 botones */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
              <Link 
                href="/casos-de-exito-agencia-de-marketing-digital"
                className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#5724AB' }}
                aria-label="Ver casos de éxito"
              >
                Casos de éxito
              </Link>

              <Link 
                href="/posicionamiento-seo"
                className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-[#2A0064] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#72E3D8' }}
                aria-label="Conocer servicios de posicionamiento SEO"
              >
                Posicionamiento SEO
              </Link>

              <Link 
                href="/publicidad-para-vender"
                className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-[#2A0064] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#FFB4A2' }}
                aria-label="Ver servicios de publicidad para vender"
              >
                Publicidad para vender
              </Link>
            </div>

            {/* Segunda fila: 2 botones centrados */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link 
                href="/diseno-e-commerce"
                className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-[#2A0064] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#C9B4FF' }}
                aria-label="Ver servicios de diseño E-commerce"
              >
                Diseño E-commerce
              </Link>

              <Link 
                href="/blog"
                className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-[#2A0064] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#FFE066' }}
                aria-label="Leer nuestro blog"
              >
                Nuestro Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Section de búsqueda (opcional, similar a la imagen) */}
        <div className="mt-16 md:mt-20 text-center space-y-6">
          <h2 className="playful-h2 px-4" style={{ color: '#440099' }}>
            No dejes que un error te detenga
          </h2>
          <p className="playful-contenido-p max-w-2xl mx-auto">
            Dinos qué buscabas y lo rescatamos del inventario por ti:
          </p>
          
          <div className="max-w-2xl mx-auto">
            <form className="relative" onSubmit={handleSearch}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Por ejemplo: Estrategia SEO, Diseño de Tiendas..."
                className="w-full px-6 py-4 pr-14 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700 placeholder-gray-400 shadow-sm"
                aria-label="Campo de búsqueda"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
                aria-label="Buscar"
              >
                🔍
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
