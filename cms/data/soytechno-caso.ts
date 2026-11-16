/**
 * Tercer registro de Casos: SoyTechno.
 * Textos e imágenes copiados tal cual de components/soytechno/SoyTechnoCaseStudy.tsx
 * y de utils/public-case-study-overrides.ts. No hay copy inventado.
 */
import { getPublicCaseStudySeoOverride } from '../../utils/public-case-study-overrides.ts';
import { featuredTapaForSlug } from '../../lib/case-study-listing-image.ts';

export const SOYTECHNO_SLUG = 'soytechno-ecommerce-venezuela';
/** Id sintético local (no existe en WP). Coincide con PUBLIC_CASE_STUDIES. */
export const SOYTECHNO_LOCAL_WP_ID = -71001;

const seo = getPublicCaseStudySeoOverride(SOYTECHNO_SLUG);
const base = '/images/casos/soytechno';
const image = (name: string) => `${base}/images/${name}`;
const vector = (name: string) => `${base}/vectors/${name}`;

/** approvedCopy de SoyTechnoCaseStudy.tsx — carácter por carácter. */
export const soyTechnoApprovedCopy = {
  title: 'SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela',
  executiveChallenge: 'Tras su soft launch, SoyTechno debía consolidar su eCommerce en un mercado donde la industria asumía que el consumidor no confía y solo compra por WhatsApp. El reto 2025: demostrar que el venezolano sí transacciona masivamente online cuando se le brinda una infraestructura formal, segura y transparente.',
  insight: 'El venezolano no compra tecnología; la planifica. Con 67% de compras en divisas, BNPL creciendo +250% y 43% estirando cada dólar, el ganador no es el más barato: es quien ofrece catálogo, cuotas y autonomía. El consumidor no abandona por desinterés, sino por fricción logística y de pago.',
  idea: 'Mientras la categoría asumía que el venezolano vivía con miedo de comprar online, Soytechno asumió lo contrario —que estaba cansado de la informalidad— y lo trató como comprador real dándole un ecosistema con autonomía y transparencia, cuando la industria todavía lo trata como seguidor.',
  executiveResults: 'Alcanzamos 2,8 millones de usuarios activos y 5,2 millones de sesiones. Logramos una tasa de conversión del 2,57% sobre usuarios recurrentes —por encima del promedio global del eCommerce (1,5–2%)—, cerrando el año con 12.722 ventas, +65% vs 2024 y un ticket promedio de $450–$600.',
  challenge: 'En 2025, el eCommerce venezolano creció +125% (Cavecom-e), pero la industria seguía operando en la informalidad: ventas por mensaje directo, precios ocultos y un mercado con solo 18,5% de bancarización crediticia. El reto de SoyTechno no era tecnológico, era de confianza. Debía demostrar que el venezolano sí transacciona masivamente online cuando se le ofrece una infraestructura formal, segura y transparente, en un entorno donde la categoría asumía que el consumidor prefería el WhatsApp y donde las opciones de pago digital eran escasas o inexistentes.',
  audience: 'La audiencia son consumidores venezolanos de 18 a 45 años, hiperconectados, con acceso a smartphones y poder adquisitivo limitado: ya compraban tecnología en redes informales (Instagram, WhatsApp), enfrentando fricción de pagos multimoneda, desconfianza en envíos y exposición a estafas. Navegan en su mayoría desde dispositivos móviles con Android. Geográficamente está distribuida en 7 ciudades clave (Caracas, Valencia, Maracaibo, Barquisimeto, Guayana, Maracay, Barcelona). Su relevancia para SoyTechno es directa: es el segmento que ya existe digitalmente, que concentra la demanda real de tecnología en Venezuela y que ya estaba comprando online.',
  objectives: 'SoyTechno definió cinco objetivos para 2025: (1) Dar a conocer la plataforma a nivel nacional y posicionarla como opción moderna, segura y automatizada para comprar tecnología. (2) Educar al consumidor venezolano sobre el uso de métodos de pago digitales —bolívares, divisas y financiamiento en cuotas— para reducir la fricción y mejorar la conversión. (3) Incrementar las ventas online mediante optimización de la experiencia de usuario y cobertura de envíos en todo el país. (4) Fortalecer la reputación digital de la marca como referente confiable del sector tecnológico venezolano. (5) Automatizar la atención al cliente para escalar sin perder calidad de respuesta.',
  strategy: 'Con un enfoque trimestral (Q1: Reconocimiento, Q2: Expansión, Q3: Escalabilidad, Q4: Fidelización), SoyTechno consolidó un ecosistema Mobile-First basado en tres pilares. Autonomía Financiera: Primera integración nativa con Cashea en un eCommerce venezolano y Smart Checkout que elimina la fricción multimoneda. Transparencia Logística: Filtros dinámicos de MRW y rastreo en tiempo real, capitalizando la Semana Cosecha Cashea con picos de 31.000 usuarios diarios. Arquitectura de Confianza: Asistente IA entrenado con miles de consultas reales que absorbió picos de hasta 1.500 chats acumulados, reduciendo tiempos de respuesta de horas a segundos.',
  strategicResponse: 'El mercado asumía que el venezolano no compraba online por desconfianza. El insight real era otro: no le faltaba disposición, le faltaba una plataforma que lo tratara como comprador real. La respuesta fue diseñar un ecosistema Mobile-First que eliminó cada punto de fricción del comercio informal: precios publicados en múltiples monedas, financiamiento en cuotas disponible desde el mismo checkout, logística rastreable en tiempo real y atención automatizada disponible las 24 horas. No se le pidió al usuario que confiara primero. Se le dio la infraestructura para que la confianza fuera la consecuencia natural de cada interacción.',
  media: 'La plataforma fue el medio principal. SoyTechno.com concentró toda la experiencia de compra: un Smart Checkout con soporte multimoneda (bolívares y divisas) y la primera integración nativa de Cashea en un eCommerce venezolano para compras en cuotas. El módulo de rastreo MRW en tiempo real —con 816.000 vistas en el año— operó como herramienta de confianza postventa. Freshchat con inteligencia artificial Freddy AI gestionó la atención al cliente, absorbiendo picos de hasta 1.500 chats acumulados por jornada y reduciendo los tiempos de respuesta de horas a segundos. Todo dentro de un solo ecosistema digital, sin canales externos.',
  results: 'Los resultados validan la transformación del hábito de consumo. Alcanzamos 2,8 millones de usuarios activos (+711% de Q1 a Q3), 5,2 millones de sesiones y 7,6 millones de interacciones. Logramos una tasa de conversión global del 2,57% sobre los 495.000 usuarios recurrentes —por encima del promedio mundial del eCommerce (1,5–2%)—. La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  evidence: 'El indicador más contundente no es el volumen de tráfico, sino su origen: el 44,48% de las sesiones llegó de forma directa, sin publicidad. Los usuarios buscaban a SoyTechno por nombre. El tráfico orgánico, con una tasa de interacción del 66,54%, fue el canal de mayor intención de compra de todo el ecosistema. La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  baseline: 'SoyTechno arrancó diciembre de 2024 con 99.384 usuarios activos mensuales. En julio de 2025 registró 685.732: un crecimiento de ×6,9 en ocho meses. Cada objetivo declarado al inicio del año tuvo su respuesta en datos: la consolidación de marca se tradujo en 2,8 millones de usuarios activos y 2,7 millones de usuarios nuevos; la educación en métodos de pago se reflejó en una tasa de conversión del 2,57%, por encima del promedio mundial del eCommerce (1,5–2%); y la automatización de la atención permitió gestionar picos de hasta 1.500 chats acumulados por jornada sin escalar el equipo humano.',
  innovation: 'La innovación fue adaptar tecnología global a la hipercomplejidad venezolana. Desarrollamos un Smart Checkout propietario que resuelve la dualidad cambiaria y logramos la primera integración de Cashea en web. Implementamos Freshchat (Freshworks) con IA Freddy, entrenado con miles de consultas reales de visitantes, que gestionó picos de hasta 1.500 chats acumulados por jornada, reduciendo tiempos de respuesta de horas a segundos y liberando al equipo para cerrar ventas. Los filtros adaptativos bajaron el rebote a 11% en celulares. El aporte: SoyTechno demostró que el eCommerce formal, automatizado y de alta gama sí es viable en Venezuela.',
  resources: 'Se desarrolló un Smart Checkout propietario que resuelve la dualidad cambiaria venezolana, permitiendo al usuario pagar en bolívares o divisas desde una sola pantalla. Se logró la primera integración nativa de Cashea en un eCommerce venezolano, habilitando compras en cuotas directamente en el flujo de pago. Para la atención al cliente se implementó Freshchat de Freshworks con el motor de inteligencia artificial Freddy AI, entrenado con miles de consultas reales de visitantes de la plataforma. El resultado: gestión de picos de hasta 1.500 chats acumulados por jornada, con tiempos de respuesta reducidos de horas a segundos.',
  checkout: 'Desarrollamos un checkout propio para SoyTechno. En un mismo flujo, el usuario completa sus datos de facturación y su dirección de envío, y el checkout le asigna los métodos de envío que corresponden a su ubicación. El usuario elige la moneda en la que va a pagar, y el checkout le muestra los métodos de pago de esa moneda. Entre ellos están pago móvil, transferencia, TDC nacional, TDC BNC - SoyTechno, TDC internacional, Zelle, PayPal y BioPago. SoyTechno fue el primer ecommerce en implementar en Venezuela el Botón de Pago de Cashea para pagos en cuotas. Quien quiere financiar su compra elige Cashea en el mismo checkout, junto al resto de métodos de pago.',
  mobileShare: 'Más del 73% de los usuarios se conecta a través de sus dispositivos móviles para visitar la página de SoyTechno.',
  resultsIntro: 'El hábito de consumo cambió, y la escala lo confirma. Alcanzamos 2,8 millones de usuarios activos (+711% de Q1 a Q3), 5,2 millones de sesiones y 7,6 millones de interacciones. Logramos una tasa de conversión global del 2,57% sobre los 495.000 usuarios recurrentes, por encima del promedio mundial del eCommerce (1,5–2%). La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un 65% más que en 2024, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  contribution: 'SoyTechno demostró que el eCommerce formal, automatizado y de alta gama es viable en Venezuela. En un mercado donde la industria operaba por mensaje directo y sin precios publicados, la plataforma estableció un nuevo estándar: catálogo transparente, métodos de pago digitales accesibles y logística rastreable. Eso no solo benefició a SoyTechno, educó al consumidor venezolano sobre cómo comprar tecnología online con autonomía y seguridad. Cada transacción completada en la plataforma es una demostración práctica de que la informalidad no es una condición permanente del mercado venezolano, sino un problema de infraestructura que tiene solución.',
} as const;

export type SoyTechnoApprovedCopy = typeof soyTechnoApprovedCopy;

/** Textos de UI que no están en approvedCopy (JSX de SoyTechnoCaseStudy). */
export const soyTechnoChrome = {
  introH2: 'El desafío no era tecnológico, era de confianza',
  strategyH2: 'Una estrategia trimestral para construir autonomía y confianza',
  strategyIntro:
    'Con un enfoque trimestral, SoyTechno consolidó un ecosistema Mobile-First basado en tres pilares: el ecosistema digital como medio principal; medios clave: Cashea, MRW y checkout; e innovación y aporte más allá de la interfaz.',
  quarters: [
    { label: 'Q1', name: 'Reconocimiento' },
    { label: 'Q2', name: 'Expansión' },
    { label: 'Q3', name: 'Escalabilidad' },
    { label: 'Q4', name: 'Fidelización' },
  ],
  pillars: [
    'El ecosistema digital como medio principal',
    'Medios clave: Cashea, MRW y checkout',
    'Innovación y aporte más allá de la interfaz',
  ],
  insightResponseH2: 'Cómo la estrategia respondió al insight',
  toolsH2: 'Herramientas para resolver la complejidad local',
  checkoutSectionTitle: 'Autonomía financiera: checkout propio y Botón de Pago de Cashea',
  checkoutSubTitle: 'Facturación, envío y pago en un mismo flujo de compra',
  trustSectionTitle: 'Arquitectura de confianza: una experiencia Mobile-First',
  kpisSectionTitle: 'Resultados frente a los KPIs iniciales',
  resultsH2: 'Resultados que cambiaron la categoría',
  testimonial: {
    name: 'Eva Cristina Luciani',
    role: 'e-Commerce Manager de Soytechno.com',
    quote:
      '“Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más. No sólo se quedaron con la idea de vender el producto, sino que también buscaron más soluciones, como agregar un comparador de productos para que la gente pueda verlo.”',
  },
  cta: {
    title: '¿Listo para convertir la complejidad en una mejor experiencia de compra?',
    description: 'Diseñemos un eCommerce preparado para pagos, logística y atención a la escala de tu negocio.',
    href: '/reunion-playful',
    label: 'Agenda una reunión',
  },
} as const;

/**
 * Secciones A–F: mismos textos e imágenes que el CaseStudy actual,
 * en el shape que ya esperan SoyTechnoSectionA–F.
 */
export const soyTechnoSeccionesAF = {
  seccion_a: {
    titulo_de_esta_seccion_a: 'El ecosistema digital como medio principal',
    imagen_izquierda: {
      url: image('giffycanvas-01-sin-solape.webp'),
      alt: 'Ficha de producto y ofertas de SoyTechno en iPad',
    },
    titulo_1: 'Una audiencia hiperconectada',
    parrafo1:
      'La audiencia son consumidores venezolanos de 18 a 45 años, hiperconectados, con acceso a smartphones y poder adquisitivo limitado: ya compraban tecnología en redes informales (Instagram, WhatsApp), enfrentando fricción de pagos multimoneda, desconfianza en envíos y exposición a estafas.',
    titulo_2: 'Compra móvil en siete ciudades',
    parrafo2:
      'Navegan en su mayoría desde dispositivos móviles con Android. Geográficamente está distribuida en 7 ciudades clave (Caracas, Valencia, Maracaibo, Barquisimeto, Guayana, Maracay, Barcelona). Su relevancia para SoyTechno es directa: es el segmento que ya existe digitalmente, que concentra la demanda real de tecnología en Venezuela y que ya estaba comprando online.',
    titulo_3: 'Educación y conversión',
    parrafo3:
      'SoyTechno definió cinco objetivos para 2025: (1) Dar a conocer la plataforma a nivel nacional y posicionarla como opción moderna, segura y automatizada para comprar tecnología. (2) Educar al consumidor venezolano sobre el uso de métodos de pago digitales —bolívares, divisas y financiamiento en cuotas— para reducir la fricción y mejorar la conversión.',
    titulo_4: 'Escala, reputación y atención',
    parrafo4:
      '(3) Incrementar las ventas online mediante optimización de la experiencia de usuario y cobertura de envíos en todo el país. (4) Fortalecer la reputación digital de la marca como referente confiable del sector tecnológico venezolano. (5) Automatizar la atención al cliente para escalar sin perder calidad de respuesta.',
  },
  seccion_b: {
    titulo_de_la_seccion_b: 'Medios clave: Cashea, MRW y checkout',
    imagenes_collage: {
      imagen_1: { url: vector('shipping-national.svg'), alt: 'Envíos nacionales' },
      imagen_2: { url: vector('payment-methods.svg'), alt: 'Métodos de pago' },
      imagen_3: { url: vector('delivery-caracas.svg'), alt: 'Entrega rápida' },
      imagen_4: { url: image('circuito.png'), alt: 'Elemento gráfico Circuito' },
      imagen_del_telefono: { url: image('iphone-mockup.gif'), alt: 'Interfaz móvil de SoyTechno' },
      imagen_del_logo: { url: image('soytechno-logo-white.png'), alt: 'SoyTechno' },
    },
    titulo_1: 'La plataforma como medio principal',
    parrafo1:
      'La plataforma fue el medio principal. SoyTechno.com concentró toda la experiencia de compra: un Smart Checkout con soporte multimoneda (bolívares y divisas) y la primera integración nativa de Cashea en un eCommerce venezolano para compras en cuotas.',
    titulo_2: 'Confianza después de la compra',
    parrafo2:
      'El módulo de rastreo MRW en tiempo real —con 816.000 vistas en el año— operó como herramienta de confianza postventa. Freshchat con inteligencia artificial Freddy AI gestionó la atención al cliente, absorbiendo picos de hasta 1.500 chats acumulados por jornada y reduciendo los tiempos de respuesta de horas a segundos. Todo dentro de un solo ecosistema digital, sin canales externos.',
    titulo_3: 'Transparencia logística',
    parrafo3:
      'Autonomía Financiera: Primera integración nativa con Cashea en un eCommerce venezolano y Smart Checkout que elimina la fricción multimoneda. Transparencia Logística: Filtros dinámicos de MRW y rastreo en tiempo real, capitalizando la Semana Cosecha Cashea con picos de 31.000 usuarios diarios.',
  },
  seccion_c: {
    titulo_de_la_seccion_c: 'Innovación y aporte más allá de la interfaz',
    imagen_izquierda: {
      url: image('giffycanvas-01-sin-solape.webp'),
      alt: 'Catálogo, ficha y especificaciones de producto de SoyTechno en iPad',
    },
    titulo_1: 'Tecnología adaptada a Venezuela',
    parrafo1:
      'La innovación fue adaptar tecnología global a la hipercomplejidad venezolana. Desarrollamos un Smart Checkout propietario que resuelve la dualidad cambiaria y logramos la primera integración de Cashea en web.',
    titulo_2: 'IA y filtros que reducen la fricción',
    parrafo2:
      'Implementamos Freshchat (Freshworks) con IA Freddy, entrenado con miles de consultas reales de visitantes, que gestionó picos de hasta 1.500 chats acumulados por jornada, reduciendo tiempos de respuesta de horas a segundos y liberando al equipo para cerrar ventas. Los filtros adaptativos bajaron el rebote a 11% en celulares. El aporte: SoyTechno demostró que el eCommerce formal, automatizado y de alta gama sí es viable en Venezuela.',
    titulo_3: 'Herramientas para resolver la complejidad local',
    parrafo3:
      'Se desarrolló un Smart Checkout propietario que resuelve la dualidad cambiaria venezolana, permitiendo al usuario pagar en bolívares o divisas desde una sola pantalla. Se logró la primera integración nativa de Cashea en un eCommerce venezolano, habilitando compras en cuotas directamente en el flujo de pago.',
    subtitulo_ingenieria: 'Autonomía financiera: checkout propio y Botón de Pago de Cashea',
    parrafo_ingenieria:
      'Desarrollamos un checkout propio para SoyTechno. En un mismo flujo, el usuario completa sus datos de facturación y su dirección de envío, y el checkout le asigna los métodos de envío que corresponden a su ubicación.',
  },
  seccion_d: {
    titulo_de_la_seccion_d: 'Autonomía financiera: checkout propio y Botón de Pago de Cashea',
    imagen_derecha: { url: image('giffycanvas-02.webp'), alt: 'Integración Cashea' },
    titulo_1: 'Facturación, envío y pago en un mismo flujo de compra',
    parrafo1:
      'Desarrollamos un checkout propio para SoyTechno. En un mismo flujo, el usuario completa sus datos de facturación y su dirección de envío, y el checkout le asigna los métodos de envío que corresponden a su ubicación.',
    titulo_2: 'Métodos de pago según la moneda',
    parrafo2:
      'El usuario elige la moneda en la que va a pagar, y el checkout le muestra los métodos de pago de esa moneda. Entre ellos están pago móvil, transferencia, TDC nacional, TDC BNC - SoyTechno, TDC internacional, Zelle, PayPal y BioPago.',
    titulo_3: 'Cuotas con Cashea',
    parrafo3:
      'SoyTechno fue el primer ecommerce en implementar en Venezuela el Botón de Pago de Cashea para pagos en cuotas. Quien quiere financiar su compra elige Cashea en el mismo checkout, junto al resto de métodos de pago.',
  },
  seccion_e: {
    titulo_de_la_seccion_e: 'Arquitectura de confianza: una experiencia Mobile-First',
    imagen_izquierda: {
      url: image('ipad-mockup-01.png'),
      alt: 'Formulario del checkout multistep de SoyTechno',
    },
    parrafo: soyTechnoApprovedCopy.mobileShare,
    titulo_1: 'Cómo la estrategia respondió al insight',
    parrafo1:
      'La respuesta fue diseñar un ecosistema Mobile-First que eliminó cada punto de fricción del comercio informal: precios publicados en múltiples monedas, financiamiento en cuotas disponible desde el mismo checkout, logística rastreable en tiempo real y atención automatizada disponible las 24 horas.',
    titulo_2: '',
    parrafo2: soyTechnoApprovedCopy.idea,
  },
  seccion_f: {
    titulo_de_la_seccion_f: 'Resultados frente a los KPIs iniciales',
    imagen_derecha: {
      url: image('logistics-composition.png'),
      alt: 'Sistema de envíos y rastreo MRW de SoyTechno',
    },
    parrafo:
      'El indicador más contundente no es el volumen de tráfico, sino su origen: el 44,48% de las sesiones llegó de forma directa, sin publicidad. Los usuarios buscaban a SoyTechno por nombre. El tráfico orgánico, con una tasa de interacción del 66,54%, fue el canal de mayor intención de compra de todo el ecosistema.',
    titulo_1: 'El hábito de consumo cambió',
    parrafo1:
      'Los resultados validan la transformación del hábito de consumo. Alcanzamos 2,8 millones de usuarios activos (+711% de Q1 a Q3), 5,2 millones de sesiones y 7,6 millones de interacciones.',
    titulo_2: 'La Semana Cosecha Cashea',
    parrafo2:
      'La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  },
} as const;

export function soyTechnoPayloadData() {
  return {
    titulo: soyTechnoApprovedCopy.title,
    slug: SOYTECHNO_SLUG,
    wpId: SOYTECHNO_LOCAL_WP_ID,
    estado: 'publish',
    contentHtml: '',
    url_video: null,
    acf: {
      categoria1: 'E-commerce',
      h1: soyTechnoApprovedCopy.title,
      primerap: soyTechnoApprovedCopy.executiveChallenge,
      template: 'soytechno_case_study',
      soytechno: {
        copy: soyTechnoApprovedCopy,
        chrome: soyTechnoChrome,
        ...soyTechnoSeccionesAF,
      },
    },
    yoast: {
      title: seo?.title ?? soyTechnoApprovedCopy.title,
      description: seo?.description ?? null,
      canonical: `https://playfulagency.com/casos-de-exito/${SOYTECHNO_SLUG}`,
      ogImage: '/images/og/casos-de-exito-soytechno-ecommerce-venezuela.jpg',
      ogTitle: seo?.title ?? soyTechnoApprovedCopy.title,
      ogDescription: seo?.description ?? null,
    },
    featuredTapa: featuredTapaForSlug(SOYTECHNO_SLUG),
  };
}
