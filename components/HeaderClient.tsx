'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

interface CaseStudy {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
}

interface HeaderClientProps {
  caseStudies: CaseStudy[];
}

export default function HeaderClient({ caseStudies }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isCasesOpen, setIsCasesOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false)
    setIsServicesOpen(false)
    setIsCasesOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleServices = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsServicesOpen(!isServicesOpen)
  }

  const toggleCases = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCasesOpen(!isCasesOpen)
  }

  // Servicios simplificados
  const services = [
    { title: 'SEO', url: 'https://old.playfulagency.com/agencia-seo/' },
    { title: 'SEM', url: 'https://old.playfulagency.com/agencia-sem/' },
    { title: 'Diseño Web', url: 'https://old.playfulagency.com/agencia-diseno-web/' }
  ]

  const { headerColor } = useTheme();

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  }

  // Clase para enlaces activos
  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors";
    const activeClass = "text-purple-600";
    const inactiveClass = "text-gray-700 hover:text-purple-600";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent pointer-events-none transition-colors duration-300">
      <div className="playful-header pointer-events-auto">
        <nav className="max-w-7xl mx-auto md:px-6 lg:px-8 w-full relative">
        {/* Mobile Layout - Pantallas >= 400px */}
        <div className="lg:hidden hidden min-[400px]:flex items-center justify-between px-4 py-3 w-full max-w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/playful-logov.svg"
                alt="Playful Agency Logo"
                width={100}
                height={35}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Contact Button - Centered (visible >= 400px) */}
          <div className="flex-1 flex justify-center px-2 min-w-0">
            <Link 
              href="/contactar-agencia-de-marketing-digital" 
              className="playful-boton-header px-3 py-2 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs min-[450px]:text-sm min-[450px]:px-5 max-w-full"
            >
              <svg className="w-3.5 h-3.5 min-[450px]:w-4 min-[450px]:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Contáctanos
            </Link>
          </div>

          {/* Menu Button */}
          <div className="flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 p-2"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout Small - Pantallas < 400px (sin botón centrado) */}
        <div className="min-[400px]:hidden lg:hidden flex items-center justify-between px-3 py-3 w-full max-w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/playful-logov.svg"
                alt="Playful Agency Logo"
                width={90}
                height={32}
                priority
                className="h-7 w-auto"
              />
            </Link>
          </div>

          {/* Menu Button */}
          <div className="flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 p-2"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center h-16 justify-between relative px-5">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/playful-logov.svg"
                alt="Playful Agency Logo"
                width={120}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center ml-auto">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <Link 
                href="/" 
                className={getLinkClass('/')}
              >
                INICIO
              </Link>
              
              {/* Casos de Éxito con submenú */}
              <div className="relative group">
                <button
                  onClick={toggleCases}
                  className={`flex items-center ${getLinkClass('/casos-de-exito')} cursor-pointer md:pointer-events-none`}
                >
                  CASOS DE ÉXITO
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform md:group-hover:rotate-180 ${isCasesOpen ? 'rotate-180 md:rotate-0' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-2xl transition-all duration-200 z-[99999] py-2 border border-gray-100 max-h-96 overflow-y-auto ${isCasesOpen ? 'opacity-100 visible md:opacity-0 md:invisible' : 'opacity-0 invisible'} md:group-hover:opacity-100 md:group-hover:visible`}>
                  <Link
                    href="/casos-de-exito-agencia-de-marketing-digital"
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold border-b border-gray-100"
                  >
                    Ver todos los casos
                  </Link>
                  {caseStudies.map((caseStudy) => {
                    // Extraer solo el nombre antes de los dos puntos
                    const title = caseStudy.title.rendered;
                    const displayName = title.includes(':') ? title.split(':')[0].trim() : title;
                    
                    return (
                      <Link
                        key={caseStudy.id}
                        href={`/casos-de-exito/${caseStudy.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-sm uppercase"
                      >
                        {displayName}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={toggleServices}
                  className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition-colors cursor-pointer md:pointer-events-none"
                >
                  SERVICIOS
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform md:group-hover:rotate-180 ${isServicesOpen ? 'rotate-180 md:rotate-0' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-2xl transition-all duration-200 z-[99999] py-2 border border-gray-100 ${isServicesOpen ? 'opacity-100 visible md:opacity-0 md:invisible' : 'opacity-0 invisible'} md:group-hover:opacity-100 md:group-hover:visible`}>
                  {services.map((service, index) => (
                    <a
                      key={index}
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>

              <Link 
                href="/nosotros" 
                className={getLinkClass('/nosotros')}
              >
                NOSOTROS
              </Link>
              
              <Link 
                href="/blog" 
                className={getLinkClass('/blog')}
              >
                BLOG
              </Link>
              
              <Link 
                href="/contactar-agencia-de-marketing-digital" 
                className="playful-boton-header px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Contáctanos
              </Link>
            </div>
          </div>

        </div>
  
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay */}
            <button
              className="flex-1 bg-black/40"
              aria-label="Cerrar menú"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="mobile-menu w-80 max-w-[85%] h-full bg-[#4B0082] text-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo-blanco-playful.png"
                    alt="Playful Agency Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto brightness-0 invert"
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-white hover:opacity-70 transition-opacity"
                  aria-label="Cerrar menú"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                <div className="space-y-0">
                  <Link 
                    href="/" 
                    className={`block px-6 py-4 text-lg font-normal hover:bg-white/5 transition-colors border-b border-white/10 ${isActive('/') ? 'text-[#2CD5C4] bg-white/10' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>

                  {/* Casos de Éxito con submenú */}
                  <div>
                    <button
                      onClick={toggleCases}
                      className={`w-full text-left px-6 py-4 text-lg font-normal flex justify-between items-center hover:bg-white/5 transition-colors border-b border-white/10 ${pathname.includes('/casos-de-exito') ? 'text-[#2CD5C4] bg-white/10' : ''}`}
                    >
                      <span>Casos de éxito</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${isCasesOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isCasesOpen && (
                      <div className="bg-[#3D006B] border-b border-white/10">
                        <Link
                          href="/casos-de-exito-agencia-de-marketing-digital"
                          className="block px-10 py-3 text-sm hover:bg-white/5 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Nuestros Servicios
                        </Link>
                        {caseStudies.map((caseStudy) => {
                          const title = caseStudy.title.rendered;
                          const displayName = title.includes(':') ? title.split(':')[0].trim() : title;
                          
                          return (
                            <Link
                              key={caseStudy.id}
                              href={`/casos-de-exito/${caseStudy.slug}`}
                              className="block px-10 py-3 text-sm hover:bg-white/5 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {displayName}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={toggleServices}
                      className="w-full text-left px-6 py-4 text-lg font-normal flex justify-between items-center hover:bg-white/5 transition-colors border-b border-white/10"
                    >
                      <span>Servicios</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${isServicesOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isServicesOpen && (
                      <div className="bg-[#3D006B] border-b border-white/10">
                        {services.map((service, index) => (
                          <a
                            key={index}
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-10 py-3 text-sm hover:bg-white/5 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {service.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link 
                    href="/nosotros" 
                    className={`block px-6 py-4 text-lg font-normal hover:bg-white/5 transition-colors border-b border-white/10 ${isActive('/nosotros') ? 'text-[#2CD5C4] bg-white/10' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nosotros
                  </Link>

                  <Link 
                    href="/blog" 
                    className={`block px-6 py-4 text-lg font-normal hover:bg-white/5 transition-colors border-b border-white/10 ${isActive('/blog') ? 'text-[#2CD5C4] bg-white/10' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>

                  <Link 
                    href="/contactar-agencia-de-marketing-digital" 
                    className="block px-6 py-4 text-lg font-normal hover:bg-white/5 transition-colors border-b border-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>

              {/* Footer del drawer */}
              <div className="mobile-menu-footer border-t border-white/10 px-6 py-6 bg-[#3D006B]">
                <p className="text-xs text-white/80 mb-4 leading-relaxed">
                  ©2024 Playful Agency. Todos los Derechos reservados.{' '}
                  <Link href="/politica-de-privacidad" className="underline hover:text-white" onClick={() => setIsMenuOpen(false)}>
                    Políticas de Privacidad
                  </Link>
                </p>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/playfulagency" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#39DDCB] transition-colors" aria-label="Facebook">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/playfulagency" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#39DDCB] transition-colors" aria-label="Instagram">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/playfulagency" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#39DDCB] transition-colors" aria-label="LinkedIn">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@playfulagency" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#39DDCB] transition-colors" aria-label="YouTube">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      </div>
    </header>
  )
}
