import { ZELLE_VE_BLOG_SLUG } from '../lib/blog-body-overrides.ts';
import { COPY_UNSIGNED, ECOM_VE_FAQ_QUESTION } from './ecommerce-aeo-2810.ts';

type FaqItem = {
  name: string;
  text: string;
};

function faqPage(items: readonly FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.text,
      },
    })),
  };
}

export const SERVICE_FAQ_PAGES = Object.freeze({
  'agencia-e-commerce': faqPage([
    {
      name: '¿Qué hace una agencia e-commerce como Playful Agency?',
      text: 'Una agencia e-commerce como la nuestra se encarga de optimizar y personalizar tu tienda online para que sea fácil de usar, atractiva y visible para tus clientes. Desde estrategias de SEO hasta mejoras en la experiencia del usuario, te ayudamos a vender sin complicaciones.',
    },
    {
      name: '¿Cómo sé si mi negocio necesita una agencia e-commerce?',
      text: 'Si tu tienda online no recibe visitas, los clientes abandonan sus carritos o el sitio tarda una eternidad en cargar, puede ser hora de considerar una agencia e-commerce. Estamos aquí para resolver esos problemas y hacer que tu tienda funcione como debería.',
    },
    {
      name: '¿Qué diferencia a Playful Agency de otra agencia e-commerce?',
      text: 'En Playful, trabajamos directamente contigo y enfocamos cada estrategia en resolver problemas reales que afectan tus ventas. Nos importa que entiendas cada paso y veas resultados claros, sin complicaciones ni promesas exageradas.',
    },
    {
      name: '¿Cuánto tiempo tarda una agencia e-commerce en mostrar resultados?',
      text: 'Depende de los objetivos y las áreas a mejorar, pero en general, comenzamos a ver cambios en tráfico, rendimiento y ventas en un par de meses. Nuestro enfoque es hacer mejoras constantes para que siempre notes avances.',
    },
    {
      name: '¿Puedo trabajar con una agencia e-commerce si ya tengo una tienda en línea?',
      text: 'Si ya tienes una tienda online, te ayudamos a mejorar su rendimiento, aumentar la visibilidad y optimizar la experiencia de compra. No importa en qué etapa estés, siempre hay formas de hacer que funcione mejor.',
    },
    {
      name: ECOM_VE_FAQ_QUESTION,
      text: COPY_UNSIGNED,
    },
  ]),
  'agencia-seo': faqPage([
    {
      name: '¿Cuánto tiempo tarda en ver resultados con una estrategia de SEO?',
      text: 'El SEO es una estrategia a largo plazo y, generalmente, se pueden empezar a ver resultados significativos entre 3 y 6 meses después de implementar las optimizaciones. Sin embargo, los tiempos pueden variar según la competencia en tu sector, la calidad de tu sitio web y la eficacia de las estrategias aplicadas.',
    },
    {
      name: '¿Cómo sé qué palabras clave debo usar para mi negocio?',
      text: 'La elección de las palabras clave correctas comienza con una investigación exhaustiva. Utilizamos herramientas de análisis para identificar términos relevantes que tu audiencia objetivo busca en línea. Además, consideramos la intención de búsqueda, la competencia y el volumen de búsqueda.',
    },
    {
      name: '¿El SEO es una inversión única o necesita mantenimiento continuo?',
      text: 'El SEO no es una inversión única, sino un proceso continuo. Los algoritmos de los motores de búsqueda y las tendencias del mercado cambian constantemente, por lo que es necesario ajustar y optimizar regularmente tu sitio web para mantener y mejorar tu posicionamiento.',
    },
  ]),
  'agencia-sem': faqPage([
    {
      name: '¿Qué es el SEM y cómo funciona?',
      text: 'El SEM es una forma de publicidad en Internet donde pagas para que tu sitio web aparezca en los resultados de búsqueda de Google u otros buscadores. Funciona creando anuncios que se muestran cuando alguien busca ciertas palabras relacionadas con tu negocio. Solo pagas cuando alguien hace clic en tu anuncio.',
    },
    {
      name: '¿Cuál es la diferencia entre SEO y SEM?',
      text: 'El SEO es hacer cambios en tu sitio web para que aparezca en los resultados de búsqueda de manera gratuita, mientras que el SEM implica pagar por anuncios para que tu sitio aparezca en la parte superior de los resultados de búsqueda. El SEO tarda más en mostrar resultados, pero el SEM da visibilidad desde el primer día de campaña.',
    },
    {
      name: '¿Qué factores influyen en el rendimiento de una campaña SEM?',
      text: 'El éxito de una campaña SEM depende de elegir las palabras correctas, tener anuncios atractivos y asegurarse de que la página a la que lleva el anuncio sea útil para los visitantes. Además, mostrar tus anuncios a las personas correctas en el momento adecuado también es importante.',
    },
    {
      name: '¿Cómo se determina el costo de una campaña SEM?',
      text: 'El costo depende de cuánto estás dispuesto a pagar cada vez que alguien hace clic en tu anuncio. También varía según lo popular que sea la palabra que eliges para tu anuncio; si muchas personas están buscando esa palabra, el costo puede ser más alto. Puedes fijar un presupuesto diario.',
    },
  ]),
  'agencia-diseno-web': faqPage([
    {
      name: '¿Cuánto tiempo toma diseñar un sitio web?',
      text: 'El tiempo depende de la complejidad del proyecto, pero en general, un sitio web estándar puede tardar de 4 a 8 semanas desde la fase inicial de planificación hasta el lanzamiento.',
    },
    {
      name: '¿Qué debo considerar antes de rediseñar mi sitio web?',
      text: 'Antes de rediseñar tu sitio web, es importante definir tus objetivos, entender a tu audiencia y analizar lo que no está funcionando en tu sitio actual. También es útil pensar en el contenido que necesitarás, las funcionalidades que deseas incluir y cómo planeas mantener el sitio.',
    },
    {
      name: '¿Cómo afecta el diseño web al SEO?',
      text: 'El diseño web tiene un impacto significativo en el SEO. Un sitio bien diseñado mejora la experiencia del usuario, lo que puede reducir la tasa de rebote y aumentar el tiempo de permanencia, ambos factores que Google toma en cuenta para el posicionamiento.',
    },
    {
      name: '¿Necesito conocimientos técnicos para gestionar mi sitio web?',
      text: 'No necesitas ser un experto en tecnología para gestionar tu sitio web. En Playful, diseñamos sitios web con sistemas de gestión de contenido (CMS) fáciles de usar, como WordPress, para que puedas actualizar textos, imágenes y otros contenidos sin problemas técnicos.',
    },
    {
      name: '¿Por qué es importante tener un sitio web moderno?',
      text: 'Un sitio web actualizado no solo refleja la identidad actual de tu marca, sino que también mejora la experiencia del usuario y la seguridad. Un diseño moderno y funcional asegura que los visitantes tengan una buena impresión y puedan navegar fácilmente.',
    },
  ]),
  'agencia-ux-ui': faqPage([
    {
      name: '¿Qué hace exactamente una agencia UX UI como Playful Agency?',
      text: 'Nos encargamos de que tu página no solo se vea bien, sino que funcione de maravilla. Como agencia UX UI, diseñamos experiencias fáciles, rápidas y atractivas que mantienen a los usuarios navegando y comprando.',
    },
    {
      name: '¿Cuándo debería contratar una agencia UX UI para mi negocio?',
      text: 'Si tu sitio es lento, confuso o no está logrando enganchar a los usuarios, es hora de llamar a una agencia UX UI. Nosotros te ayudamos a que tu web fluya mejor y haga lo que debe: convertir visitas en clientes.',
    },
    {
      name: '¿Cuánto tiempo toma ver resultados al trabajar con una agencia UX UI?',
      text: 'Depende del proyecto, pero solemos ver mejoras en pocos meses. Ajustamos y optimizamos constantemente para que cada cambio tenga un impacto positivo en tus conversiones y la satisfacción de los usuarios.',
    },
    {
      name: '¿Cómo ayuda una agencia UX UI a aumentar mis conversiones?',
      text: 'Un buen diseño UX/UI hace que el camino al carrito de compra sea fácil y tentador. Diseñamos experiencias pensadas para que los usuarios naveguen sin esfuerzo y encuentren justo lo que buscan.',
    },
    {
      name: '¿Por qué elegir a Playful Agency como mi agencia UX UI?',
      text: 'Porque no solo nos importa el diseño, sino que logres tus objetivos. Trabajamos contigo para crear una web que responda a lo que necesitan tus usuarios y cumpla con lo que necesitas tú.',
    },
  ]),
} as const);

export const ZELLE_FAQ_PAGE = faqPage([
  {
    name: '¿Qué es Zelle?',
    text: 'Zelle es un sistema de pago interbancario que permite enviar y recibir dinero entre cuentas bancarias de Estados Unidos. Funciona dentro de la app o la plataforma web del banco participante.',
  },
  {
    name: '¿Es posible aceptar Zelle en Venezuela?',
    text: 'Sí, pero Zelle opera exclusivamente dentro del sistema bancario de Estados Unidos. No existe un Zelle venezolano ni hay bancos en Venezuela afiliados a la red. Los comercios que ya tienen una cuenta bancaria en Estados Unidos afiliada a Zelle pueden recibirlo.',
  },
  {
    name: '¿Playful Agency abre cuentas Zelle?',
    text: 'No. Playful Agency no abre, no crea y no gestiona cuentas Zelle. Somos una agencia de ecommerce que integra métodos de pago en tiendas online. Si necesitas abrir una cuenta Zelle, esa relación es directamente entre tu y tu banco en Estados Unidos.',
  },
]);

export type ServiceFaqSlug = keyof typeof SERVICE_FAQ_PAGES;

export function getServiceFaqJsonLd(slug: string): Record<string, unknown> | null {
  return Object.prototype.hasOwnProperty.call(SERVICE_FAQ_PAGES, slug)
    ? SERVICE_FAQ_PAGES[slug as ServiceFaqSlug]
    : null;
}

export function getBlogFaqJsonLd(slug: string): Record<string, unknown> | null {
  return slug === ZELLE_VE_BLOG_SLUG ? ZELLE_FAQ_PAGE : null;
}
