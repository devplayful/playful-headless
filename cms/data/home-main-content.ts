import {
  homePartnerLogos,
  homePartnerLogosHeading,
  homeTestimonials,
  homeTestimonialsHeading,
  homeTestimonialsSubheading,
  type HomeTestimonial,
} from './home-testimonials-data.ts';

export type HomeCardCopy = {
  icon: string;
  title: string;
  description: string;
};

export type HomeMainContent = {
  hero: {
    miga: string;
    h1: string;
    paragraph1Html: string;
    paragraph2Html: string;
    ctaLabel: string;
    ctaHref: string;
  };
  premiosCima: { variant: 'home' };
  problemas: {
    heading: string;
    introHtml: string;
    cards: HomeCardCopy[];
    ctaLabel: string;
  };
  soluciones: {
    heading: string;
    introHtml: string;
    cards: HomeCardCopy[];
    ctaLabel: string;
  };
  casosCarousel: {
    title: string;
    subtitle: string;
    title2: string;
  };
  testimonios: {
    heading: string;
    subheading: string;
    items: HomeTestimonial[];
    partnerLogos: readonly string[];
    logosHeading: string;
  };
  blog: {
    headingHtml: string;
    introHtml: string;
  };
  cta: {
    contentBgColor: string;
    imageUrl: string;
    imageAlt: string;
    title: string;
    subtitle: string;
    ctaTitle: string;
    buttonText: string;
    buttonLink: string;
  };
};

/** Bloques seed / Payload alineados con la Home de main (copy literal). */
export const HOME_SEED_BLOCK_IDS = [
  'hero',
  'premios-cima',
  'problemas',
  'soluciones',
  'casos',
  'testimonios',
  'blog',
  'cta',
] as const;

export type HomeSeedBlockId = (typeof HOME_SEED_BLOCK_IDS)[number];

export const HOME_MAIN_SLUG = 'main';

export const HOME_MAIN_CONTENT: HomeMainContent = {
  hero: {
    miga: 'Playful Agency:',
    h1: '¿Tu e-commerce está perdiendo dinero sin que lo sepas? ',
    paragraph1Html:
      'Tu sitio web no es solo un escaparate digital; es tu motor de ventas más crucial. Pero si tu web es lenta, confusa o se ve anticuada, no solo estás perdiendo clientes, sino que estás <b>dejando dinero sobre la mesa</b>.',
    paragraph2Html:
      'En <b>Playful Agency</b>, somos una <b>Agencia de E-commerce</b> que va más allá del diseño. Nos especializamos en transformar plataformas mediocres en<b> máquinas de conversión de alto rendimiento</b>. No creamos webs bonitas por hacer; desarrollamos tecnología que se traduce en <b>ventas consistentes y crecimiento real</b>.',
    ctaLabel: 'Completa el formulario y cuéntanos tu idea',
    ctaHref: '/contactar-agencia-de-marketing-digital',
  },
  premiosCima: { variant: 'home' },
  problemas: {
    heading: 'Lo que realmente está matando tus conversiones online',
    introHtml:
      'El problema rara vez es tu producto. Es la <b>mala experiencia de usuario </b>la que ahuyenta a tus compradores.',
    cards: [
      {
        icon: '/images/diseno-confuso-obsoleto.png',
        title: 'Diseño obsoleto o confuso:',
        description:
          'Un sitio web que se ve viejo o es difícil de navegar genera desconfianza. En el mundo del e-commerce, una mala impresión equivale a un cliente que se va para no volver.',
      },
      {
        icon: '/images/velocidad-carga-lenta.png',
        title: 'Velocidad de carga lenta:',
        description:
          'Cada segundo que tu web tarda en cargar es una oportunidad de venta perdida. Un sitio lento frustra y reduce la confianza, afectando directamente tu tasa de conversión.',
      },
      {
        icon: '/images/errores-tecnicos-bugs.png',
        title: 'Errores técnicos y bugs:',
        description:
          'Un checkout que falla, botones que no funcionan o problemas de visualización móvil hacen que tus clientes abandonen el carrito y que nunca más regresen.',
      },
    ],
    ctaLabel: 'Escríbenos para conversar sobre tu página web.',
  },
  soluciones: {
    heading: 'Soluciones Playful: Tecnología de E-commerce para Escalar',
    introHtml:
      'Somos la <b>Agencia de E-commerce </b>que necesitas para dejar de remendar y empezar a dominar. Somos tus socios tecnológicos, dedicados a construir la base digital que tu negocio requiere para competir y crecer.',
    cards: [
      {
        icon: '/images/desarrollo-web-a-medida.png',
        title: 'Desarrollo y diseño web a medida:',
        description:
          'Creamos tiendas online optimizadas, ultrarrápidas y visualmente impactantes que capturan la atención y convierten visitantes en clientes leales.',
      },
      {
        icon: '/images/optimizacion-experiencia-usuario.png',
        title: 'Optimización de la experiencia de usuario (UX/UI):',
        description:
          'Diseñamos flujos de compra tan intuitivos y atractivos que el proceso de pago se siente natural e inevitable.',
      },
      {
        icon: '/images/seo-integrado.png',
        title: 'SEO integrado:',
        description:
          'No solo construimos tu plataforma; la optimizamos desde el código fuente. Nos aseguramos de que tu sitio no solo funcione de maravilla, sino que sea altamente visible para los motores de búsqueda, atrayendo tráfico cualificado sin depender solo de la publicidad.',
      },
    ],
    ctaLabel: 'Escríbenos para conversar sobre tu página web.',
  },
  casosCarousel: {
    title: 'Nuestros Clientes: La Prueba de que Sabemos de E-commerce',
    subtitle:
      'Nuestros clientes han logrado resultados impactantes gracias a nuestras estrategias innovadoras y personalizadas. Hemos ayudado a empresas a alcanzar sus metas y a crecer de forma exponencial.',
    title2: '¿Quieres ser el próximo?',
  },
  testimonios: {
    heading: homeTestimonialsHeading,
    subheading: homeTestimonialsSubheading,
    items: [...homeTestimonials],
    partnerLogos: homePartnerLogos,
    logosHeading: homePartnerLogosHeading,
  },
  blog: {
    headingHtml:
      '¿Tendencias? ¿Dudas? <strong class="font-bold">Estrategias y Novedades del Sector</strong>',
    introHtml:
      'Explora nuestro blog para obtener información valiosa y mantenerte al día con las últimas estrategias de <strong class="font-bold">UX/UI, E-commerce y desarrollo tecnológico</strong>. Aquí compartimos análisis, guías prácticas y todo lo que necesitas para tomar decisiones informadas en el entorno digital.',
  },
  cta: {
    contentBgColor: '#B3FFF3',
    imageUrl: '/images/imagen-nueva-cta-home.png',
    imageAlt:
      'Ilustración de un equipo revisando gráficas de crecimiento y conversión en una pantalla grande',
    title: '¡Es Hora de Dejar de Perder y Empezar a Vender Más!',
    subtitle:
      'Deja de arreglar tu web con parches y evita perder clientes por fallas que no puedes ver.',
    ctaTitle: '¡Contáctanos y hagamos que tu tienda online trabaje realmente para ti!',
    buttonText: 'Llena el formulario y hablemos sobre tu web',
    buttonLink: '/reunion-playful',
  },
};

export function homeContentBlockSnapshot(
  content: HomeMainContent,
  blockId: HomeSeedBlockId,
): unknown {
  switch (blockId) {
    case 'hero':
      return content.hero;
    case 'premios-cima':
      return content.premiosCima;
    case 'problemas':
      return content.problemas;
    case 'soluciones':
      return content.soluciones;
    case 'casos':
      return content.casosCarousel;
    case 'testimonios':
      return content.testimonios;
    case 'blog':
      return content.blog;
    case 'cta':
      return content.cta;
    default:
      return null;
  }
}
