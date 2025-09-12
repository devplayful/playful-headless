import AnimatedButton from '@/components/AnimatedButton'

export default function Servicios() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="title-large text-4xl md:text-5xl lg:text-6xl text-purple-900">
                Nuestros Servicios
              </h1>
              <p className="subtitle text-xl text-purple-700 max-w-3xl mx-auto">
                Soluciones completas de marketing digital diseñadas para hacer crecer 
                tu negocio y conectar auténticamente con tu audiencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* E-commerce Development */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-teal-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="title-medium text-2xl text-purple-900">Desarrollo E-commerce</h3>
              </div>
              <p className="body-text text-purple-700 text-lg">
                Creamos tiendas online que no solo se ven increíbles, sino que convierten 
                visitantes en clientes. Desde el diseño hasta la configuración de pagos.
              </p>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Diseño responsive y optimizado para móviles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Integración de métodos de pago seguros</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Optimización SEO para e-commerce</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Panel de administración intuitivo</span>
                </li>
              </ul>
              <div className="pt-4">
                <AnimatedButton variant="primary" href="/contacto">
                  SOLICITAR COTIZACIÓN
                </AnimatedButton>
              </div>
            </div>

            {/* Digital Marketing Strategy */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="title-medium text-2xl text-purple-900">Estrategia Digital</h3>
              </div>
              <p className="body-text text-purple-700 text-lg">
                Desarrollamos estrategias de marketing digital personalizadas que 
                conectan tu marca con la audiencia correcta en el momento perfecto.
              </p>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Análisis de mercado y competencia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Definición de buyer personas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Plan de contenidos estratégico</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>KPIs y métricas de seguimiento</span>
                </li>
              </ul>
              <div className="pt-4">
                <AnimatedButton variant="secondary" href="/contacto">
                  COMENZAR ESTRATEGIA
                </AnimatedButton>
              </div>
            </div>

            {/* Social Media Management */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="title-medium text-2xl text-purple-900">Redes Sociales</h3>
              </div>
              <p className="body-text text-purple-700 text-lg">
                Gestionamos tus redes sociales con contenido que genera engagement 
                real y construye una comunidad leal alrededor de tu marca.
              </p>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Creación de contenido visual y copywriting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Programación y publicación automatizada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Community management y atención al cliente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Análisis de métricas y reportes mensuales</span>
                </li>
              </ul>
              <div className="pt-4">
                <AnimatedButton variant="success" href="/contacto">
                  GESTIONAR REDES
                </AnimatedButton>
              </div>
            </div>

            {/* SEO & SEM */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="title-medium text-2xl text-purple-900">SEO & SEM</h3>
              </div>
              <p className="body-text text-purple-700 text-lg">
                Hacemos que tu negocio sea encontrado por las personas correctas 
                a través de posicionamiento orgánico y campañas de publicidad pagada.
              </p>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Optimización SEO on-page y off-page</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Campañas Google Ads y Facebook Ads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Investigación de palabras clave</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Reportes de posicionamiento y ROI</span>
                </li>
              </ul>
              <div className="pt-4">
                <AnimatedButton variant="rocket" href="/contacto">
                  AUMENTAR VISIBILIDAD
                </AnimatedButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h2 className="title-medium text-3xl md:text-4xl text-purple-900">
              Nuestro Proceso
            </h2>
            <p className="subtitle text-xl text-purple-700 max-w-3xl mx-auto">
              Un enfoque estructurado que garantiza resultados excepcionales en cada proyecto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-teal-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Descubrimiento</h3>
              <p className="body-text text-purple-700">
                Analizamos tu negocio, objetivos y audiencia para crear una estrategia personalizada.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Estrategia</h3>
              <p className="body-text text-purple-700">
                Desarrollamos un plan detallado con objetivos claros, métricas y cronograma.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-pink-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Ejecución</h3>
              <p className="body-text text-purple-700">
                Implementamos la estrategia con precisión, creatividad y atención al detalle.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="title-medium text-xl text-purple-900">Optimización</h3>
              <p className="body-text text-purple-700">
                Monitoreamos resultados y optimizamos continuamente para maximizar el ROI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h2 className="title-medium text-3xl md:text-4xl text-purple-900">
              Planes y Precios
            </h2>
            <p className="subtitle text-xl text-purple-700 max-w-3xl mx-auto">
              Soluciones flexibles que se adaptan a las necesidades y presupuesto de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 border-2 border-transparent hover:border-teal-400 transition-colors">
              <div className="text-center space-y-4">
                <h3 className="title-medium text-2xl text-purple-900">Starter</h3>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-teal-500">$299</p>
                  <p className="text-purple-700">por mes</p>
                </div>
              </div>
              <ul className="space-y-3 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Gestión de 2 redes sociales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>10 publicaciones mensuales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Reporte mensual básico</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-500">✓</span>
                  <span>Soporte por email</span>
                </li>
              </ul>
              <AnimatedButton variant="primary" href="/contacto" className="w-full justify-center">
                COMENZAR
              </AnimatedButton>
            </div>

            {/* Professional Plan */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  MÁS POPULAR
                </span>
              </div>
              <div className="text-center space-y-4">
                <h3 className="title-medium text-2xl text-purple-900">Professional</h3>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-purple-500">$599</p>
                  <p className="text-purple-700">por mes</p>
                </div>
              </div>
              <ul className="space-y-3 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Gestión de 4 redes sociales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>20 publicaciones mensuales</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Campañas publicitarias básicas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Reporte detallado mensual</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-500">✓</span>
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <AnimatedButton variant="secondary" href="/contacto" className="w-full justify-center">
                ELEGIR PLAN
              </AnimatedButton>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 space-y-6 border-2 border-transparent hover:border-pink-400 transition-colors">
              <div className="text-center space-y-4">
                <h3 className="title-medium text-2xl text-purple-900">Enterprise</h3>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-pink-500">$999</p>
                  <p className="text-purple-700">por mes</p>
                </div>
              </div>
              <ul className="space-y-3 text-purple-700">
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Gestión ilimitada de redes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Contenido ilimitado</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Campañas publicitarias avanzadas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Reportes personalizados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-500">✓</span>
                  <span>Account manager dedicado</span>
                </li>
              </ul>
              <AnimatedButton variant="rocket" href="/contacto" className="w-full justify-center">
                CONTACTAR
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="title-medium text-3xl md:text-4xl text-white">
            ¿Listo para transformar tu presencia digital?
          </h2>
          <p className="subtitle text-xl text-purple-100">
            Agenda una consulta gratuita y descubre cómo podemos hacer crecer tu negocio.
          </p>
          <AnimatedButton variant="primary" href="/contacto">
            AGENDAR CONSULTA GRATUITA
          </AnimatedButton>
        </div>
      </section>
    </div>
  )
}
