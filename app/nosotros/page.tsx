import { getPageMetadataBySlug } from '@/services/wordpress';
import Image from 'next/image';

// --- COMPONENTE DE HISTORIA, MISIÓN Y VISIÓN ---
const HistorySection = () => {
  return (
    // Contenedor principal para la sección de Historia
    <section className="bg-[#E4FFF9] py-16 md:py-24 rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      {/* Sección superior: Imagen a la izquierda, texto a la derecha */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Columna izquierda - Imagen */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="/images/nosotros/playful-history.png"
                alt="Nuestra Historia"
                width={500}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          {/* Columna derecha - Texto */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#440099] mb-6">
              Historia
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                En Playful Agency, nos dimos cuenta de que muchas empresas no estaban aprovechando al máximo el potencial de herramientas clave como el SEO, los anuncios pagados (Ads) y el desarrollo web, lo que estaba limitando su crecimiento digital. A través de nuestra experiencia y crecimiento, hemos aprendido a implementar soluciones estratégicas en estas áreas, potenciando la presencia online de nuestros clientes y optimizando su rendimiento en los canales digitales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior: Dos columnas con tarjetas de imagen y párrafo */}
      <div className="bg-[#E4FFF9] px-6 py-16 md:py-20 rounded-3xl">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-16">
          
          {/* Tarjeta 1 */}
          <div className="bg-[#E9D7FF] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[200px] h-[200px] mb-6">
              <Image
                src="/images/nosotros/new-york-tip.png" // CAMBIA ESTA RUTA
                alt="Ilustración de estrategia digital"
                width={400}
                height={350}
                className="object-contain"
              />
            </div>
            <p className="text-gray-700 text-lg">
              Hemos aplicado este conocimiento para ofrecer servicios completos de SEO, campañas de Ads, y desarrollo web de alta calidad, diseñados para atraer tráfico de calidad, mejorar las tasas de conversión y asegurar que las plataformas digitales de nuestros clientes sean rápidas, seguras y eficientes.
            </p>
          </div>
          
          {/* Tarjeta 2 */}
          <div className="bg-[#E9D7FF] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[200px] h-[200px] mb-6">
              <Image
                src="/images/nosotros/ayudamos.png" // CAMBIA ESTA RUTA
                alt="Ilustración de crecimiento y optimización"
                width={400}
                height={350}
                className="object-contain"
              />
            </div>
            <p className="text-gray-700 text-lg">
              Es ayudar a empresas como la tuya a optimizar su presencia digital y alcanzar sus metas comerciales. Si buscas mejorar tu visibilidad en los motores de búsqueda, maximizar el retorno de la inversión en publicidad pagada o construir un sitio web que funcione como una herramienta de ventas eficaz, Playful Agency tiene la experiencia y las soluciones necesarias para ayudarte a crecer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE DE MISIÓN Y VISIÓN ---
const MissionVisionSection = () => {
  return (
    <section className="py-0 w-[calc(100%-20px)] max-w-[1200px] mx-auto my-8">
      <div className="text-center mb-12">
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tarjeta Misión */}
        <div className="bg-[#FFEFD1] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[200px] h-[200px] mb-6">
              <Image
                src="/images/nosotros/MISION.PNG" // CAMBIA ESTA RUTA
                alt="Ilustración de crecimiento y optimización"
                width={400}
                height={350}
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold text-[#453A53] mb-4 w-full text-left">MISIÓN</h3>
            <p className="text-gray-700 text-lg w-full text-left">
            Ayudar a 10,000 dueños de ecommerce que ya facturan entre $100,000 y $200,000 anuales a alcanzar su primer millón de dólares mensuales. Democratizar las ventas online, facilitando la digitalización de pequeños negocios y brindándoles herramientas para lograr sus primeras ventas sin complicaciones. Empoderar a estos emprendedores para que se conviertan en las futuras voces líderes del sector, llevando su conocimiento y experiencia a nuevas fronteras.
            </p>
          </div>
        
        {/* Tarjeta Visión */}
        <div className="bg-[#FFDBDB] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="relative w-full max-w-[200px] h-[200px] mb-6">
              <Image
                src="/images/nosotros/vision.png" // CAMBIA ESTA RUTA
                alt="Ilustración de crecimiento y optimización"
                width={400}
                height={350}
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold text-[#453A53] mb-4 w-full text-left">VISIÓN</h3>
            <p className="text-gray-700 text-lg w-full text-left">
            En 10 años, Playful será la empresa número 1 en ecommerce en Iberoamérica, habiendo influenciado y desarrollado las marcas más importantes del sector. A través de nuestra innovación y apoyo continuo, habremos ayudado a miles de emprendedores y empresarios a transformar sus negocios digitales, consolidándonos como el motor de crecimiento del ecommerce en la región.
            </p>
          </div>
      </div>
    </section>
  );
};

// --- COMPONENTE DE VALORES ---
const NuestrosValoresSection = () => {
  const valores = [
    {
      titulo: 'Innovación',
      descripcion: 'Buscamos constantemente nuevas formas de mejorar y revolucionar el comercio electrónico en la región.',
      imagen: '/images/nosotros/innovacion.png' // Asegúrate de tener esta imagen en la carpeta public
    },
    {
      titulo: 'Compromiso',
      descripcion: 'Estamos comprometidos con el éxito de cada uno de nuestros clientes y socios comerciales.',
      imagen: '/images/nosotros/compromiso.png'
    },
    {
      titulo: 'Excelencia',
      descripcion: 'Buscamos la excelencia en cada proyecto, ofreciendo soluciones de la más alta calidad.',
      imagen: '/images/nosotros/excelencia.png'
    },
    {
      titulo: 'Trabajo en Equipo',
      descripcion: 'Creemos en el poder de la colaboración y el trabajo en equipo para alcanzar grandes logros.',
      imagen: '/images/nosotros/equipo.png'
    },
    {
      titulo: 'Integridad',
      descripcion: 'Actuamos con honestidad, ética y transparencia en todas nuestras operaciones.',
      imagen: '/images/nosotros/integridad.png'
    },
    {
      titulo: 'Pasión',
      descripcion: 'Nos apasiona lo que hacemos y eso se refleja en cada proyecto que emprendemos.',
      imagen: '/images/nosotros/pasion.png'
    }
  ];

  return (
    <section className="py-12 w-[calc(100%-20px)] max-w-[1200px] mx-auto my-8">
      <h2 className="text-3xl font-bold text-[#453A53] mb-12 text-center">Nuestros Valores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {valores.map((valor, index) => (
          <div 
            key={index} 
            className="bg-[#E9D7FF] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center min-h-[500px] justify-center"
          >
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <div className="w-16 h-16 bg-[#F0E6FF] rounded-full flex items-center justify-center">
                <Image 
                  src={valor.imagen} 
                  alt={valor.titulo} 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#453A53] mb-3">{valor.titulo}</h3>
            <p className="text-gray-600">{valor.descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- COMPONENTE DE PROPUESTA DE VALOR ---
const ValuePropositionSection = () => {
  const statistics = [
    { id: '1', number: '100.000€', description: 'Facturaciones mensuales' },
    { id: '2', number: '35%', description: 'Aumento en Ingresos mensuales' },
    { id: '3', number: '0', description: 'Complicaciones y Dolores de Cabeza' },
  ];

  return (
    <section className="bg-[#440099] py-16 md:py-24 rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Propuesta de valor de Playful
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-[#E9D7FF] mb-12 md:mb-16">
            Ayudamos a dueños de comercios electrónicos que facturan más de 100.000€ al mes y están descontentos con su ecommerce actual, debido a la falta de escalabilidad y actualización de sus agencias anteriores. Con nuestra metodología abierta y ágil, les ayudamos a aumentar sus ingresos mensuales en un 35% sin las complicaciones y dolores de cabeza que conlleva un rediseño tradicional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {statistics.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.number}
                </p>
                <p className="text-lg text-[#E9D7FF]">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA "NOSOTROS" ---
export default async function Nosotros() {
  const metadata = await getPageMetadataBySlug('nosotros');
  
  return (
    <>
      {/* Sección Superior "Nosotros" */}
      <main className="min-h-[480px] bg-[#E9D7FF] flex items-center py-12">
        <div className="w-full">
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Columna Izquierda */}
              <div className="md:w-1/2 text-center md:text-left">
                <h1 className={`text-4xl md:text-[28px] font-paytone-one text-gray-900 mb-4 font-bold`}>
                  Playful Agency
                </h1>
                <h2 className="text-2xl md:text-[57px] font-bold text-[#440099] mb-6">
                  Nosotros
                </h2>
                <div className="prose md:text-[18px] text-gray-600 w-full max-w-none">
                  <p>Un breve texto que hable de quiénes somos como introducción a la sección, debe ser breve pero conciso.</p>
                </div>
              </div>
              
              {/* Columna Derecha */}
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-[412px] h-[350px]">
                  <Image
                    src="/images/nosotros/nosotros-img.png"
                    alt="Playful Agency"
                    width={412}
                    height={350}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sección "Propuesta de valor" */}
      <ValuePropositionSection />
      
      {/* Sección de Historia */}
      <HistorySection />
      
      {/* Sección de Misión y Visión */}
      <MissionVisionSection />
      <NuestrosValoresSection />
    </>
  );
}


// --- FUNCIÓN PARA METADATOS (SEO) ---
export async function generateMetadata() {
  try {
    const metadata = await getPageMetadataBySlug('nosotros');
    
    return {
      title: metadata?.yoast_wpseo_title || 'Sobre Nosotros',
      description: metadata?.yoast_wpseo_metadesc || 'Conoce más sobre nuestra empresa',
    };
  } catch (error) {
    return {
      title: 'Sobre Nosotros',
      description: 'Conoce más sobre nuestra empresa',
    };
  }
}