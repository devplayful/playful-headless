'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false)
    setIsServicesOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleServices = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsServicesOpen(!isServicesOpen)
  }

  // Servicios simplificados
  const services = [
    { title: 'SEO', url: 'https://playfulagency.com/agencia-seo/' },
    { title: 'SEM', url: 'https://playfulagency.com/agencia-sem/' },
    { title: 'Diseño Web', url: 'https://playfulagency.com/agencia-diseno-web/' }
  ]

  const { headerColor } = useTheme();

  return (
    <header className={`playful-header sticky top-0 z-[9999] transition-colors duration-300 overflow-visible`}>
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
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                INICIO
              </Link>
              
              <Link 
                href="/casos-de-exito-agencia-de-marketing-digital" 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                CASOS DE ÉXITO
              </Link>

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
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>

              <Link 
                href="/nosotros" 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                NOSOTROS
              </Link>
              
              <Link 
                href="/blog" 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
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
            <div className="w-80 max-w-[85%] h-full bg-[#3C009C] text-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logos/playful-logov.svg"
                    alt="Playful Agency Logo"
                    width={100}
                    height={35}
                    className="h-8 w-auto"
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-white hover:text-[#0FF] transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1">
                  <Link 
                    href="/" 
                    className="block px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>

                  <div>
                    <button
                      onClick={toggleServices}
                      className="w-full text-left px-6 py-3 text-sm font-semibold flex justify-between items-center hover:bg-white/10 transition-colors"
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
                      <div className="bg-[#2A0070] py-1 space-y-1">
                        {services.map((service, index) => (
                          <a
                            key={index}
                            href={service.url}
                            className="block px-8 py-2 text-sm hover:bg-white/10 transition-colors"
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
                    className="block px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nosotros
                  </Link>

                  <Link 
                    href="/casos-de-exito-agencia-de-marketing-digital" 
                    className="block px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Casos de éxito
                  </Link>

                  <Link 
                    href="/blog" 
                    className="block px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>

                  <Link 
                    href="/contactar-agencia-de-marketing-digital" 
                    className="block px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
