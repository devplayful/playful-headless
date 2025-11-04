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
    <header className={`playful-header sticky top-0 z-50 transition-colors duration-300 ${headerColor}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-lg mt-2 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                INICIO
              </Link>
              
              <div className="border-b border-gray-100">
                <button
                  onClick={toggleServices}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors flex justify-between items-center"
                >
                  <span>SERVICIOS</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${isServicesOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isServicesOpen && (
                  <div className="pl-6 py-2 space-y-1">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/${service.slug}`}
                        className="block px-4 py-2 text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm"
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
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                NOSOTROS
              </Link>
              
              <Link 
                href="/casos-de-exito-agencia-de-marketing-digital" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                CASOS DE ÉXITO
              </Link>
              
              <Link 
                href="/blog" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                BLOG
              </Link>
              
              <Link 
                href="/contactar-agencia-de-marketing-digital" 
                className="block px-4 py-3 text-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                CONTACTO
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
