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

  // Cerrar menú al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen || isServicesOpen) {
        setIsMenuOpen(false)
        setIsServicesOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMenuOpen, isServicesOpen])

  // Datos de los servicios
  const services = [
    { title: 'Agencia E-commerce', slug: 'agencia-e-commerce' },
    { title: 'Diseño Web', slug: 'agencia-diseno-web' },
    { title: 'Marketing Internacional', slug: 'marketing-internacional' },
    { title: 'SEO', slug: 'agencia-seo' },
    { title: 'UX/UI', slug: 'agencia-ux-ui' },
    { title: 'SEM', slug: 'agencia-sem' },
    { title: 'SEO Expertos', slug: 'seo-expertos' },
    { title: 'SEO Vigo', slug: 'seo-vigo' }
  ]

  const { headerColor } = useTheme();

  return (
    <header className={`playful-header sticky top-0 z-50 transition-colors duration-300 overflow-x-hidden ${headerColor}`}>
      <nav className="max-w-7xl mx-auto md:px-6 lg:px-8 w-full">
        {/* Mobile Layout - Pantallas >= 400px */}
        <div className="lg:hidden hidden min-[400px]:flex items-center justify-between px-4 py-3 w-full max-w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/playful-LogoV.svg"
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
                src="/images/logos/playful-LogoV.svg"
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
        <div className="hidden lg:flex items-center h-16 justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logos/playful-LogoV.svg"
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
                  className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  SERVICIOS
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${isServicesOpen ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isServicesOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 py-2">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/${service.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
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
          <div className="lg:hidden bg-white rounded-3xl mt-3 mx-3 shadow-2xl overflow-hidden">
            <div className="py-4 space-y-2">
              <Link 
                href="/" 
                className="block px-6 py-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-semibold transition-all text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                INICIO
              </Link>
              
              <div>
                <button
                  onClick={toggleServices}
                  className="w-full text-left px-6 py-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-semibold transition-all flex justify-between items-center text-base"
                >
                  <span>SERVICIOS</span>
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
                  <div className="bg-gray-50 py-2 space-y-1">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/${service.slug}`}
                        className="block px-8 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all text-sm font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                href="/nosotros" 
                className="block px-6 py-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-semibold transition-all text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                NOSOTROS
              </Link>
              
              <Link 
                href="/casos-de-exito-agencia-de-marketing-digital" 
                className="block px-6 py-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-semibold transition-all text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                CASOS DE ÉXITO
              </Link>
              
              <Link 
                href="/blog" 
                className="block px-6 py-3 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-semibold transition-all text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                BLOG
              </Link>
              
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
