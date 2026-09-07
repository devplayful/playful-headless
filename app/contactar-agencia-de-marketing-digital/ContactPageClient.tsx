'use client';

import CarouselResultados from '@/components/CarouselResultados';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import ContactLeadForm from '@/components/ContactLeadForm';

interface ContactPageClientProps {
  casosDeExito: any[];
  previewSimulation: boolean;
}

function ContactForm({ casosDeExito, previewSimulation }: ContactPageClientProps) {
  return (
    <main className="min-h-screen bg-cover bg-center">
      {/* Sección principal con dos columnas según el diseño */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Columna Izquierda: textos e ilustración */}
          <div className="flex flex-col justify-center items-start text-left">
            <h1 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-normal text-[20px] text-[#453A53] mb-2">Playful Agency</h1>
            <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[45px] leading-[52px] text-[#440099] mb-2">Hablemos de tu próximo proyecto</h2>
            <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[28px] leading-[36px] text-[#453A53] mb-2">¡Explícanos tu caso!</h3>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-normal text-[16px] leading-[24px] text-[#4A4453] max-w-[600px]">
            ¿Tienes un proyecto en la mira o una pregunta técnica que necesita respuesta? Estamos listos para escuchar. Completa el formulario o escríbenos directamente. Analizaremos tu necesidad y nos pondremos en contacto contigo lo antes posible. <strong className="font-bold">Empecemos a planificar tus resultados.</strong>
            </p>
            <div className="mt-8 hidden lg:block">
              <img src="/images/contacto-imagen.png" alt="Ilustración de contacto" className="w-full max-w-[620px] h-auto object-contain" />
            </div>
          </div>

          <ContactLeadForm previewSimulation={previewSimulation} />
        </div>
      </section>
      
      {/* Sección Casos de Éxito - Carrusel */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <CarouselResultados casosDeExito={casosDeExito} />
        </div>
      </section>

      {/* Secciones importadas desde Nosotros */}
      <BlogRelatedPostsSection />
      
      {/* CTA Section */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 mb-20">
        <TwoColumnCtaSection />
      </section>
    </main>
  );
}

// Componente principal
export default function ContactPageClient({ casosDeExito, previewSimulation }: ContactPageClientProps) {
  return <ContactForm casosDeExito={casosDeExito} previewSimulation={previewSimulation} />;
}
