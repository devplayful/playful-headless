import Link from 'next/link'
import AnimatedButton from '@/components/AnimatedButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="subtitle text-purple-600 text-lg">Playful Agency:</p>
                <h1 className="title-large text-4xl md:text-5xl lg:text-6xl text-purple-900">
                  La Agencia de Marketing Digital que va a volar tu cabeza
                </h1>
                <p className="subtitle text-purple-700 text-xl">
                  (de sorpresa, claro)
                </p>
              </div>
              
              <div className="space-y-4 text-purple-800">
                <p className="body-text text-lg">
                  Tu tienda online no es solo una vitrina digital, es tu mejor vendedor. Pero si 
                  nadie la encuentra o el proceso de compra es un caos, las ventas no llegan. 
                  Ahí es donde entramos nosotros.
                </p>
                <p className="body-text text-lg">
                  Ayudamos a marcas a vender en línea, diseñamos tu tienda, la maquetamos 
                  SEO Friendly e incluso configuramos todos tus métodos de pago.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="title-medium text-2xl md:text-3xl text-purple-900">
                  ¡Descubre cómo podemos hacer magia con tu estrategia de marketing digital!
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatedButton 
                    variant="primary" 
                    href="/servicios"
                  >
                    HABLEMOS SOBRE TU E-COMMERCE
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="rocket" 
                    href="/nosotros"
                  >
                    CONOCE NUESTRO EQUIPO
                  </AnimatedButton>
                </div>
              </div>
            </div>

            {/* Right Illustration Area */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Background circles */}
                <div className="absolute inset-0">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200 rounded-full opacity-60"></div>
                  <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-40"></div>
                </div>
                
                {/* Main illustration placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Character placeholder */}
                    <div className="w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl">
                      <div className="text-white text-6xl">🚀</div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div className="absolute top-1/2 -right-8 w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg">✨</span>
                    </div>
                  </div>
                </div>

                {/* Decorative waves */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 400 100" className="w-full h-20 text-teal-200 opacity-60">
                    <path d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </section>

      {/* Features Section */}


      {/* Latest Posts Preview */}


      {/* CTA Section */}

    </div>
  )
}
