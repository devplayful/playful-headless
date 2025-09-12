import AnimatedButton from '@/components/AnimatedButton'

export default function Nosotros() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="title-large text-4xl md:text-5xl lg:text-6xl text-purple-900">
                Conoce a Playful Agency
              </h1>
              <p className="subtitle text-xl text-purple-700 max-w-3xl mx-auto">
                Somos un equipo apasionado de creativos, estrategas y desarrolladores 
                que transformamos ideas en experiencias digitales extraordinarias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="title-medium text-3xl md:text-4xl text-purple-900">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-purple-800">
                <p className="body-text text-lg">
                  Playful Agency nació de una simple pero poderosa idea: el marketing digital 
                  no tiene que ser aburrido. Creemos que las mejores estrategias surgen cuando 
                  combinamos creatividad, datos y una pizca de diversión.
                </p>
                <p className="body-text text-lg">
                  Desde nuestros inicios, hemos ayudado a más de 200 marcas a encontrar su 
                  voz digital y conectar auténticamente con su audiencia. No somos solo una 
                  agencia, somos tus compañeros de aventura en el mundo digital.
                </p>
                <p className="body-text text-lg">
                  Cada proyecto es una oportunidad para innovar, experimentar y crear algo 
                  verdaderamente memorable. Porque creemos que el marketing excepcional 
                  comienza con personas excepcionales.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-96 bg-gradient-to-br from-teal-200 to-purple-300 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <p className="title-medium text-2xl text-white">
                    +200 Proyectos
                  </p>
                  <p className="subtitle text-white">
                    Exitosos completados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h2 className="title-medium text-3xl md:text-4xl text-purple-900">
              Nuestros Valores
            </h2>
            <p className="subtitle text-xl text-purple-700 max-w-3xl mx-auto">
              Los principios que guían cada decisión y cada proyecto que emprendemos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Creatividad</h3>
              <p className="body-text text-purple-700">
                Pensamos fuera de la caja para crear soluciones únicas que destaquen 
                en un mundo digital saturado.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Resultados</h3>
              <p className="body-text text-purple-700">
                Cada estrategia está respaldada por datos y métricas que demuestran 
                el impacto real en tu negocio.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Colaboración</h3>
              <p className="body-text text-purple-700">
                Trabajamos codo a codo contigo, porque los mejores resultados 
                surgen de la colaboración auténtica.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Agilidad</h3>
              <p className="body-text text-purple-700">
                Nos adaptamos rápidamente a los cambios del mercado y las 
                necesidades de nuestros clientes.
              </p>
            </div>

            {/* Value 5 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Precisión</h3>
              <p className="body-text text-purple-700">
                Cada acción tiene un propósito claro y está alineada con tus 
                objetivos de negocio.
              </p>
            </div>

            {/* Value 6 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center space-y-4 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Diversión</h3>
              <p className="body-text text-purple-700">
                Creemos que el trabajo excepcional surge cuando disfrutas lo que haces. 
                ¡Y eso se nota en los resultados!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="title-medium text-3xl md:text-4xl text-white">
            ¿Listo para trabajar con nosotros?
          </h2>
          <p className="subtitle text-xl text-purple-100">
            Conversemos sobre cómo podemos hacer crecer tu negocio juntos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedButton 
              variant="primary" 
              href="/servicios"
            >
              VER NUESTROS SERVICIOS
            </AnimatedButton>
            <AnimatedButton 
              variant="secondary" 
              href="/contacto"
            >
              CONTACTANOS AHORA
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
