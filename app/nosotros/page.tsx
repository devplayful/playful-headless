import { getPageMetadataBySlug, TeamMember, getTeamMembers, getLatestBlogPosts } from '@/services/wordpress';
import Image from 'next/image';
import PortfolioCarousel from '@/components/ui/PortfolioCarousel';
import Link from 'next/link';
import BlogPosts from '@/components/BlogPosts';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';

// --- COMPONENTE DE HISTORIA, MISIÓN Y VISIÓN ---
const HistorySection = () => {
  return (
    // Contenedor principal para la sección de Historia
    <section className="relative overflow-hidden bg-[#E4FFF9] py-0 rounded-3xl w-[calc(100%-80px)] max-w-[1200px] mx-auto my-0">
      {/* Overlay de confeti por encima del color */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat"></div>
      {/* Sección superior: Imagen a la izquierda, texto a la derecha */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
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
            <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[32px] leading-[40px] text-[#453A53] mb-6">
              Historia
            </h2>
            <div className="space-y-4">
              <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453] mx-auto max-w-[92%] min-[768px]:max-w-[700px] min-[1024px]:max-w-[820px]">
                En Playful Agency, nos dimos cuenta de que muchas empresas no estaban aprovechando al máximo el potencial de herramientas clave como el SEO, los anuncios pagados (Ads) y el desarrollo web, lo que estaba limitando su crecimiento digital. A través de nuestra experiencia y crecimiento, hemos aprendido a implementar soluciones estratégicas en estas áreas, potenciando la presencia online de nuestros clientes y optimizando su rendimiento en los canales digitales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior: Dos columnas con tarjetas de imagen y párrafo */}
      <div className="relative z-10 bg-transparent px-6 py-16 md:py-20 rounded-3xl">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-16">
          
          {/* Tarjeta 1 */}
          <div className="bg-[#E9D7FF] rounded-[32px] shadow-lg p-8 md:p-12 flex flex-col text-left min-h-[280px] w-full md:w-[480px] mx-auto">
            <div className="relative w-full max-w-[220px] h-[180px] mb-6 mx-auto">
              <Image
                src="/images/nosotros/new-york-tip.png"
                alt="Ilustración de estrategia digital"
                width={200}
                height={180}
                className="object-contain"
              />
            </div>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453]">
              Hemos aplicado este conocimiento para ofrecer servicios completos de SEO, campañas de Ads, y desarrollo web de alta calidad, diseñados para atraer tráfico de calidad, mejorar las tasas de conversión y asegurar que las plataformas digitales de nuestros clientes sean rápidas, seguras y eficientes.
            </p>
          </div>
          
          {/* Tarjeta 2 */}
          <div className="bg-[#E9D7FF] rounded-[32px] shadow-lg p-8 md:p-12 flex flex-col text-left min-h-[280px] w-full md:w-[480px] mx-auto">
            <div className="relative w-full max-w-[220px] h-[180px] mb-6 mx-auto">
              <Image
                src="/images/nosotros/ayudamos.png"
                alt="Ilustración de crecimiento y optimización"
                width={200}
                height={180}
                className="object-contain"
              />
            </div>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453]">
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
    <section className="rounded-3xl w-[calc(100%-80px)] max-w-[1200px] mx-auto my-8">
      <div className="px-0 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tarjeta Misión */}
          <div className="bg-[#FFEFD1] rounded-[32px] shadow-lg p-8 md:p-12 flex flex-col text-left">
              <div className="relative w-full max-w-[220px] h-[180px] mb-6 mx-auto">
                <Image
                  src="/images/nosotros/MISION.PNG"
                  alt="Ilustración de crecimiento y optimización"
                  width={200}
                  height={180}
                  className="object-contain"
                />
              </div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[32px] leading-[40px] text-[#453A53] mb-4">MISIÓN</h3>
              <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453]">
                Ayudar a 10,000 dueños de ecommerce que ya facturan entre $100,000 y $200,000 anuales a alcanzar su primer millón de dólares mensuales. Democratizar las ventas online, facilitando la digitalización de pequeños negocios y brindándoles herramientas para lograr sus primeras ventas sin complicaciones. Empoderar a estos emprendedores para que se conviertan en las futuras voces líderes del sector, llevando su conocimiento y experiencia a nuevas fronteras.
              </p>
            </div>
          
          {/* Tarjeta Visión */}
          <div className="bg-[#FFDBDB] rounded-[32px] shadow-lg p-8 md:p-12 flex flex-col text-left">
              <div className="relative w-full max-w-[220px] h-[180px] mb-6 mx-auto">
                <Image
                  src="/images/nosotros/vision.png"
                  alt="Ilustración de crecimiento y optimización"
                  width={200}
                  height={180}
                  className="object-contain"
                />
              </div>
              <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[32px] leading-[40px] text-[#453A53] mb-4">VISIÓN</h3>
              <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453]">
                En 10 años, Playful será la empresa número 1 en ecommerce en Iberoamérica, habiendo influenciado y desarrollado las marcas más importantes del sector. A través de nuestra innovación y apoyo continuo, habremos ayudado a miles de emprendedores y empresarios a transformar sus negocios digitales, consolidándonos como el motor de crecimiento del ecommerce en la región.
              </p>
            </div>
        </div>
      </div>
    </section>
  );
};

// Componente para mostrar la tarjeta de un miembro del equipo
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg transition-shadow duration-300 hover:shadow-2xl">
      <div className="flex flex-col items-center">
        <div className="relative mb-4 h-28 w-28">
          <Image
            src={member.acf.imagen.url}
            alt={member.acf.imagen.alt}
            width={112}
            height={112}
            className="rounded-full object-cover"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{member.acf.nombre}</h3>
        {member.acf.cargo && member.acf.cargo.trim() !== '' && (
          <p className="mb-2 w-full rounded-lg bg-[#440099] px-0 py-2 text-center text-sm font-semibold text-white">
            {member.acf.cargo}
          </p>
        )}
        {member.acf.habilidades.length > 0 && (
          <div className="mb-6 w-full">
            <div className={`grid ${member.acf.habilidades.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2 w-full`}>
              {member.acf.habilidades.map((habilidad, index) => (
                <div 
                  key={index}
                  className="w-full rounded-lg bg-[#E9D7FF] px-4 py-2 text-center text-sm font-medium text-[#440099] whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {habilidad}
                </div>
              ))}
            </div>
          </div>
        )}
        {member.acf.descripcion && member.acf.descripcion.trim() !== '' && (
          <p className="mb-0 flex-grow text-gray-600">{member.acf.descripcion}</p>
        )}
        
        {/* Solo el ícono de LinkedIn */}
        <div className="mt-4">
          <a 
            href={member.acf.linkedin_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block p-2 text-gray-400 hover:text-[#0077b5] transition-colors"
            aria-label={`LinkedIn de ${member.acf.nombre}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE EQUIPO ---
const EquipoSection = async () => {
  // Obtener los miembros del equipo desde WordPress
  const teamMembers = await getTeamMembers();
  
  // Separar fundadores del resto del equipo
  const fundadores = teamMembers.filter(member => 
    member.acf.cargo?.toLowerCase().includes('fundador') || 
    member.acf.cargo?.toLowerCase().includes('fundadora')
  );
  
  const equipo = teamMembers.filter(member => 
    member.acf.cargo && 
    !member.acf.cargo.toLowerCase().includes('fundador') && 
    !member.acf.cargo.toLowerCase().includes('fundadora')
  );
  
  return (
    <section className="relative overflow-hidden bg-[#E4FFF9] py-10 md:py-0 rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      {/* Overlay de confeti sobre el color */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[45px] leading-[40px] text-[#453A53] mb-12 text-center">
          Nuestro Equipo
        </h2>
        
        <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453] text-center max-w-3xl mx-auto mb-12">
          Conoce al talentoso equipo detrás de Playful Agency. Nuestros expertos combinan creatividad y experiencia para ofrecerte las mejores soluciones digitales.
        </p>
        
        {/* Sección de Fundadores */}
        {fundadores.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {fundadores.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
        
        {/* Sección del Equipo */}
        {equipo.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipo.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
        
        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Próximamente más información sobre nuestro equipo.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- COMPONENTE DE NUESTROS VALORES ---
const NuestrosValoresSection = () => {
  const valores = [
    {
      id: 1,
      titulo: 'Aprendizaje',
      descripcion: 'Nos comprometemos a desarrollar nuevas habilidades y mejorarnos constantemente, manteniendo una mentalidad abierta y enfocada en el crecimiento.',
      imagen: '/images/nosotros/aprendizaje.png'
    },
    {
      id: 2,
      titulo: 'Franqueza',
      descripcion: 'Fomentamos una comunicación sincera y clara, expresándonos con honestidad para construir relaciones basadas en la confianza.',
      imagen: '/images/nosotros/franqueza.png'
    },
    {
      id: 3,
      titulo: 'Honestidad',
      descripcion: 'Actuamos con total congruencia entre lo que decimos y lo que hacemos, evitando la mentira a toda costa,',
      imagen: '/images/nosotros/honestidad.png'
    },
    {
      id: 4,
      titulo: 'Independencia',
      descripcion: 'Valoramos nuestra capacidad para pensar y actuar de manera autónoma, tomando decisiones con criterio propio.',
      imagen: '/images/nosotros/independencia.png'
    },
    {
      id: 5,
      titulo: 'Puntualidad',
      descripcion: 'Cumplimos con los compromisos y llegamos a tiempo, impulsados por el respeto y la responsabilidad hacia los demás.',
      imagen: '/images/nosotros/puntualidad.png'
    },
    {
      id: 6,
      titulo: 'Servicio',
      descripcion: 'Estamos siempre disponibles para ayudar a otros de manera desinteresada, buscando el bienestar común.',
      imagen: '/images/nosotros/servicios.png'
    }
  ];

  return (
    <section className="py-12 md:py-16 w-[calc(100%-80px)] max-w-[1200px] mx-auto px-0">
      <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[32px] leading-[40px] text-[#453A53] text-center mb-12">
        Nuestros Valores
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {valores.map((valor) => (
          <div key={valor.id} className="flex flex-col items-center text-center p-8 md:p-12 bg-[#FEF7FF] rounded-[32px] shadow-lg hover:shadow-xl transition-shadow min-h-[500px]">
            <div className="mb-6 h-[180px] w-[200px] relative mx-auto">
              <Image
                src={valor.imagen}
                alt={valor.titulo}
                width={200}
                height={180}
                className="object-contain"
              />
            </div>
            <h3 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[700] text-[24px] leading-[30px] text-[#453A53] mb-3">
              {valor.titulo}
            </h3>
            <p className="[font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#4A4453]">
              {valor.descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// -- COMPONENTE DE NUESTRA PALABRA -- //
const NuestraPalabraSection = () => {
  return (
    <section className="bg-[#440099] py-16 md:py-24 rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            No confíes solo en nuestra palabra, mira los resultados.
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-[#E9D7FF] mb-12 md:mb-4">
            Nuestros clientes han logrado resultados impactantes gracias a nuestras estrategias innovadoras y personalizadas. Hemos ayudado a empresas a alcanzar sus metas y a crecer de forma exponencial.
          </p>
          <PortfolioCarousel />
        </div>
      </div>
    </section>
  );
};

// --- COMPONENTE DE BLOG ---
const BlogSection = async () => {
  const blogPosts = await getLatestBlogPosts(3);

  return (
    <section className="bg-[#006A61] rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      <BlogPosts /> 
    </section>
  );
};

// --- COMPONENTE CTA ---
const CTASection = ({
  imagePath = "/images/nosotros/cta-illustration.png",
  imageAlt = "Ilustración de crecimiento digital"
}: {
  imagePath?: string;
  imageAlt?: string;
}) => {
  return (
    <section className="relative overflow-hidden mt-12 mb-0 pb-16 w-[calc(100%-40px)] max-w-[1200px] mx-auto">
      {/* Overlay de confeti para la sección CTA */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-stretch">
        {/* Sección de Imagen */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6 bg-transparent">
          <div className="w-[452px] h-[557px] flex items-center justify-center">
            <img
              src={imagePath}
              alt={imageAlt}
              width={452}
              height={557}
              className="w-full h-full object-contain"
              style={{
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Sección de Contenido */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-8 md:p-10 bg-[#B3FFF3] rounded-3xl">
          <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[#453A53] font-[700] text-[45px] leading-[52px] mb-6">
            No esperes más para empezar a ganar
          </h2>
          <p className="[font-family:var(--font-dm-sans),sans-serif] font-normal text-[16px] leading-[24px] text-[#453A53] max-w-[92%] min-[768px]:max-w-[620px] min-[1024px]:max-w-[680px] mt-2">
            Deja de arreglar tu web con parches y dejas de perder clientes por fallas que no puedes ver.
            Es hora de invertir en una solución profesional.
          </p>
          <p className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[600] text-[28px] leading-[36px] text-[#453A53] mt-6">
            ¡Contáctanos y hagamos que tu sitio web trabaje para ti!
          </p>
          <a
            href="/contacto"
            className="inline-block bg-[#7c23ce] hover:bg-[#a99cec] text-white rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-5"
          >
            ¡Empieza ya!
          </a>
        </div>
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
    <section className="relative overflow-hidden bg-[#440099] py-16 md:py-24 rounded-3xl w-[calc(100%-40px)] max-w-[1200px] mx-auto my-16">
      {/* Overlay de confeti sobre el fondo morado */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-white font-[700] text-[45px] leading-[52px] mb-6">
            Propuesta de valor de Playful
          </h2>
          <p className="mx-auto max-w-[92%] min-[768px]:max-w-[820px] min-[1024px]:max-w-[900px] [font-family:var(--font-dm-sans),sans-serif] font-medium text-[16px] leading-[24px] text-[#E9D7FF] mb-12 min-[768px]:mb-16">
            Ayudamos a dueños de comercios electrónicos que facturan más de 100.000€ al mes y están descontentos con su ecommerce actual, debido a la falta de escalabilidad y actualización de sus agencias anteriores. Con nuestra metodología abierta y ágil, les ayudamos a aumentar sus ingresos mensuales en un 35% sin las complicaciones y dolores de cabeza que conlleva un rediseño tradicional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {statistics.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-5xl md:text-6xl font-bold text-white mb-2 ">
                  {stat.number}
                </p>
                <p className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-normal leading-[141%] text-[22px] text-[#E9D7FF] line-clamp-2 mx-auto max-w-[80%] min-[768px]:max-w-[260px] min-[1024px]:max-w-[300px]">
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


// --- COMPONENTE HERO PERSONALIZADO ---
const HeroSection = ({
  title,
  subtitle,
  description,
  imagePath,
  imageAlt,
  bgColor = 'bg-[#E9D7FF]',
  textColor = 'text-[#440099]',
  textSecondaryColor = 'text-gray-600'
}: {
  title: string;
  subtitle: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  bgColor?: string;
  textColor?: string;
  textSecondaryColor?: string;
}) => {
  return (
    <section className={`min-h-[480px] ${bgColor} flex items-center py-12`}>
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Columna Izquierda */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className={`[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-normal leading-[1.1] text-[20px] sm:text-[24px] lg:text-[28px] ${textColor} mb-4`}>
                {title}
              </h1>
              <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-normal leading-[1.1] text-[38px] sm:text-[56px] lg:text-[72px] text-[#440099] mb-6">
                {subtitle}
              </h2>
              <div className={`prose [font-family:var(--font-dm-sans),sans-serif] font-normal leading-[1.5] text-[14px] sm:text-[16px] ${textSecondaryColor} w-full max-w-none`}>
                <p>{description}</p>
              </div>
            </div>
            
            {/* Columna Derecha */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-[412px] h-[350px]">
                <Image
                  src={imagePath}
                  alt={imageAlt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
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
    <div className="bg-[#E9D7FF] bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat w-full">
      {/* Sección Superior "Nosotros" */}
      <HeroSection 
        title="Playful Agency"
        subtitle="Nosotros"
        description="Un breve texto que hable de quiénes somos como introducción a la sección, debe ser breve pero conciso."
        imagePath="/images/nosotros/nosotros-img.png"
        imageAlt="Playful Agency"
        textColor="text-[#4A4453]"
      />

      {/* Sección "Propuesta de valor" */}
      <ValuePropositionSection />
      
      {/* Sección de Historia */}
      <HistorySection />
      
      {/* Sección de Misión y Visión */}
      <MissionVisionSection />
      
      {/* Sección Nuestros Valores */}
      <NuestrosValoresSection />
      
      {/* Sección Nuestro Equipo */}
      <EquipoSection />

      { /* Seccion Nuestra Palabra */}
      <NuestraPalabraSection />      

      {/* Sección del Blog */} 
      <BlogSection />

      {/* Sección CTA */}
      <CTASection 
        imagePath="/images/nosotros/cta-illustration.png"
        imageAlt="Ilustración de crecimiento digital"
      />
    </div>
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