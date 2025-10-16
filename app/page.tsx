import Link from 'next/link'
import AnimatedButton from '@/components/AnimatedButton'
import MaterialServicesSection from '@/components/MaterialServicesSection'
import SolucionesPlayful from '@/components/SolucionesPlayful'
import TestimonialsSection from '@/components/TestimonialsSectionClient'

export default function Home() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="playful-miga-pan">Playful Agency:</p>
                <h1 className="playful-h1">
                ¿Tu web está costándole dinero a tu negocio?                </h1>
              </div>
              
              <div className="space-y-4 text-purple-800">
                <p className="playful-contenido-p">
                Tu sitio web no es solo tu carta de presentación; es tu motor de ventas. Pero si tu web es lenta, confusa o se ve anticuada, no solo estás perdiendo clientes, sino que estás <b>dejando dinero sobre la mesa</b>.
                </p>
                <p className="playful-contenido-p">
                En <b>Playful Agency</b>, somos expertos en transformar sitios web mediocres en <b>máquinas de conversión</b>. No hacemos diseños bonitos por hacer; creamos tecnología que se traduce en <b>ventas y crecimiento real</b>.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="playful-boton">
                    ¡Quiero saber más! 
                    </button>
                </div>
              </div>
            </div>

            {/* Right Illustration Area */}
            <div className="relative">
                <img src="../images/Playful-Agency-tu-agencia-de-marketing-digital.webp" alt="" />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </section>

      {/* Material UI Services Section */}
      <MaterialServicesSection />
      <br></br>
      <SolucionesPlayful />

      <TestimonialsSection />

    </div>
  )
}
