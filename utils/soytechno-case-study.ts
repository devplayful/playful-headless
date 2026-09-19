/**
 * Code-side SoyTechno case study. WordPress has no published post for this
 * slug; getSuccessStoryBySlug would 404 without this synthetic SuccessStory.
 *
 * Body copy is verbatim from the CIMA Doc (Versión 9). Do not rewrite.
 *
 * CIMA → ACF (Contento map 2026-09-19, slug José GO):
 *   hero title/h1     ← Título de la pieza
 *   hero primerap     ← §2 Idea
 *   seccion_a         ← §3 El Desafío y el Contexto Estratégico
 *   seccion_b         ← §2 Resumen Ejecutivo (Reto, Insight, Idea, Resultados)
 *   seccion_c         ← §4 Estrategia y Ejecución (entire section)
 *   seccion_d         ← empty
 *   seccion_e         ← §5 Resultados y KPIs
 *   seccion_f         ← §6 Innovación y Aporte
 * Images, SEO, CTA and sibling add-ons are left empty for later owners.
 */

export const SOYTECHNO_CASE_STUDY_SLUG = 'soytechno-ecommerce-venezuela';

export const SOYTECHNO_CASE_TITLE =
  'SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela';

const CIMA = {
  reto:
    'Tras su soft launch, SoyTechno debía consolidar su eCommerce en un mercado donde la industria asumía que el consumidor no confía y solo compra por WhatsApp. El reto 2025: demostrar que el venezolano sí transacciona masivamente online cuando se le brinda una infraestructura formal, segura y transparente.',
  insight:
    'El venezolano no compra tecnología; la planifica. Con 67% de compras en divisas, BNPL creciendo +250% y 43% estirando cada dólar, el ganador no es el más barato: es quien ofrece catálogo, cuotas y autonomía. El consumidor no abandona por desinterés, sino por fricción logística y de pago.',
  idea:
    'Mientras la categoría asumía que el venezolano vivía con miedo de comprar online, Soytechno asumió lo contrario —que estaba cansado de la informalidad— y lo trató como comprador real dándole un ecosistema con autonomía y transparencia, cuando la industria todavía lo trata como seguidor.',
  resultadosEjecutivo:
    'Alcanzamos 2,8 millones de usuarios activos y 5,2 millones de sesiones. Logramos una **tasa de conversión del 2,57%** sobre usuarios recurrentes —por encima del promedio global del eCommerce (1,5–2%)—, cerrando el año con 12.722 ventas, +65% vs 2024 y un ticket promedio de $450–$600.',
  panorama:
    'En 2025, el eCommerce venezolano creció +125% (Cavecom-e), pero la industria seguía operando en la informalidad: ventas por mensaje directo, precios ocultos y un mercado con solo 18,5% de bancarización crediticia. El reto de SoyTechno no era tecnológico, era de confianza. Debía demostrar que el venezolano sí transacciona masivamente online cuando se le ofrece una infraestructura formal, segura y transparente, en un entorno donde la categoría asumía que el consumidor prefería el WhatsApp y donde las opciones de pago digital eran escasas o inexistentes.',
  audiencia:
    'La audiencia son consumidores venezolanos de 18 a 45 años, hiperconectados, con acceso a smartphones y poder adquisitivo limitado: ya compraban tecnología en redes informales (Instagram, WhatsApp), enfrentando fricción de pagos multimoneda, desconfianza en envíos y exposición a estafas. Navegan en su mayoría desde dispositivos móviles con Android. Geográficamente está distribuida en 7 ciudades clave (Caracas, Valencia, Maracaibo, Barquisimeto, Guayana, Maracay, Barcelona). Su relevancia para SoyTechno es directa: es el segmento que ya existe digitalmente, que concentra la demanda real de tecnología en Venezuela y que ya estaba comprando online.',
  objetivos:
    'SoyTechno definió cinco objetivos para 2025: (1) Dar a conocer la plataforma a nivel nacional y posicionarla como opción moderna, segura y automatizada para comprar tecnología. (2) Educar al consumidor venezolano sobre el uso de métodos de pago digitales —bolívares, divisas y financiamiento en cuotas— para reducir la fricción y mejorar la conversión. (3) Incrementar las ventas online mediante optimización de la experiencia de usuario y cobertura de envíos en todo el país. (4) Fortalecer la reputación digital de la marca como referente confiable del sector tecnológico venezolano. (5) Automatizar la atención al cliente para escalar sin perder calidad de respuesta.',
  estrategia:
    'Con un enfoque trimestral (Q1: Reconocimiento, Q2: Expansión, Q3: Escalabilidad, Q4: Fidelización), SoyTechno consolidó un ecosistema Mobile-First basado en tres pilares. **(1) Autonomía Financiera:** Primera integración nativa con Cashea en un eCommerce venezolano y Smart Checkout que elimina la fricción multimoneda. **(2) Transparencia Logística:** Filtros dinámicos de MRW y rastreo en tiempo real, capitalizando la Semana Cosecha Cashea con picos de 31.000 usuarios diarios. **(3) Arquitectura de Confianza:** Asistente IA entrenado con miles de consultas reales que absorbió picos de hasta 1.500 chats acumulados, reduciendo tiempos de respuesta de horas a segundos.',
  comoIdeaEstrategica:
    'El mercado asumía que el venezolano no compraba online por desconfianza. El insight real era otro: no le faltaba disposición, le faltaba una plataforma que lo tratara como comprador real. La respuesta fue diseñar un ecosistema Mobile-First que eliminó cada punto de fricción del comercio informal: precios publicados en múltiples monedas, financiamiento en cuotas disponible desde el mismo checkout, logística rastreable en tiempo real y atención automatizada disponible las 24 horas. No se le pidió al usuario que confiara primero. Se le dio la infraestructura para que la confianza fuera la consecuencia natural de cada interacción.',
  mediosClaves:
    'La plataforma fue el medio principal. SoyTechno.com concentró toda la experiencia de compra: un Smart Checkout con soporte multimoneda (bolívares y divisas) y la primera integración nativa de Cashea en un eCommerce venezolano para compras en cuotas. El módulo de rastreo MRW en tiempo real —con 816.000 vistas en el año— operó como herramienta de confianza postventa. Freshchat con inteligencia artificial Freddy AI gestionó la atención al cliente, absorbiendo picos de hasta 1.500 chats acumulados por jornada y reduciendo los tiempos de respuesta de horas a segundos. Todo dentro de un solo ecosistema digital, sin canales externos.',
  resultadosPrueba:
    'Los resultados validan la transformación del hábito de consumo. Alcanzamos **2,8 millones de usuarios activos** (+711% de Q1 a Q3), 5,2 millones de sesiones y 7,6 millones de interacciones. Logramos una **tasa de conversión global del 2,57%** sobre los 495.000 usuarios recurrentes —por encima del promedio mundial del eCommerce (1,5–2%)—. La Semana Cosecha Cashea concentró **4.043 ventas en un solo mes, el 32% de las ventas totales del año**. Cerramos 2025 con **12.722 ventas**, un ticket promedio de **$450–$600** (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  comoSabe:
    'El indicador más contundente no es el volumen de tráfico, sino su origen: el 44,48% de las sesiones llegó de forma directa, sin publicidad. Los usuarios buscaban a SoyTechno por nombre. El tráfico orgánico, con una tasa de interacción del 66,54%, fue el canal de mayor intención de compra de todo el ecosistema. La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  relacionKpis:
    'SoyTechno arrancó diciembre de 2024 con 99.384 usuarios activos mensuales. En julio de 2025 registró 685.732: un crecimiento de ×6,9 en ocho meses. Cada objetivo declarado al inicio del año tuvo su respuesta en datos: la consolidación de marca se tradujo en 2,8 millones de usuarios activos y 2,7 millones de usuarios nuevos; la educación en métodos de pago se reflejó en una tasa de conversión del 2,57%, por encima del promedio mundial del eCommerce (1,5–2%); y la automatización de la atención permitió gestionar picos de hasta 1.500 chats acumulados por jornada sin escalar el equipo humano.',
  innovacion:
    'La innovación fue adaptar tecnología global a la hipercomplejidad venezolana. Desarrollamos un **Smart Checkout propietario** que resuelve la dualidad cambiaria y logramos la primera integración de Cashea en web. Implementamos **Freshchat (Freshworks) con IA Freddy**, entrenado con miles de consultas reales de visitantes, que gestionó picos de hasta 1.500 chats acumulados por jornada, reduciendo tiempos de respuesta de horas a segundos y liberando al equipo para cerrar ventas. Los filtros adaptativos bajaron el rebote a 11% en celulares. El aporte: SoyTechno demostró que el eCommerce formal, automatizado y de alta gama sí es viable en Venezuela.',
  recursos:
    'Se desarrolló un Smart Checkout propietario que resuelve la dualidad cambiaria venezolana, permitiendo al usuario pagar en bolívares o divisas desde una sola pantalla. Se logró la primera integración nativa de Cashea en un eCommerce venezolano, habilitando compras en cuotas directamente en el flujo de pago. Para la atención al cliente se implementó Freshchat de Freshworks con el motor de inteligencia artificial Freddy AI, entrenado con miles de consultas reales de visitantes de la plataforma. El resultado: gestión de picos de hasta 1.500 chats acumulados por jornada, con tiempos de respuesta reducidos de horas a segundos.',
  contribucion:
    'SoyTechno demostró que el eCommerce formal, automatizado y de alta gama es viable en Venezuela. En un mercado donde la industria operaba por mensaje directo y sin precios publicados, la plataforma estableció un nuevo estándar: catálogo transparente, métodos de pago digitales accesibles y logística rastreable. Eso no solo benefició a SoyTechno, educó al consumidor venezolano sobre cómo comprar tecnología online con autonomía y seguridad. Cada transacción completada en la plataforma es una demostración práctica de que la informalidad no es una condición permanente del mercado venezolano, sino un problema de infraestructura que tiene solución.',
} as const;

function cimaHtml(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Section B renders plain text, not HTML. Keep CIMA words; drop markdown markers. */
function cimaPlain(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

export function isSoyTechnoCaseStudySlug(slug: string): boolean {
  return slug === SOYTECHNO_CASE_STUDY_SLUG;
}

export function getSoyTechnoSyntheticStory() {
  return {
    id: 9602026,
    date: '2024-11-01T00:00:00',
    slug: SOYTECHNO_CASE_STUDY_SLUG,
    link: '',
    title: { rendered: SOYTECHNO_CASE_TITLE },
    excerpt: { rendered: CIMA.idea },
    content: { rendered: '' },
    status: 'publish',
    type: 'casos-de-exito',
    acf: {
      categoria1: '',
      categoria2: '',
      categoria3: '',
      categoria4: '',
      categoria5: '',
      h1: SOYTECHNO_CASE_TITLE,
      primerap: cimaHtml(CIMA.idea),
      imagenbanner: false,
      primerh2: '',
      segundap: '',
      imagenminuta1: false,
      imagenminuta2: false,
      imagenminuta3: false,
      segundoh2: '',
      tercerap: '',
      cuartap: '',
      quintap: '',
      sextap: '',
      septimap: '',
      octavap: '',
      novenap: '',
      desafioimagen1: false,
      desafioimagen2: false,
      desafioimagen3: false,
      desafioimagen4: false,
      tercerh2: '',
      decima: '',
      template: 'soytechno_extended' as const,
      soytechno: {
        seccion_a: {
          titulo_de_esta_seccion_a:
            'El Desafío y el Contexto Estratégico (La Misión)',
          titulo_1:
            '¿Cuál era el panorama del mercado y la competencia antes de iniciar el proyecto? ¿Cuál era el desafío a superar?',
          parrafo1: cimaHtml(CIMA.panorama),
          titulo_2:
            '¿Cuál era la audiencia objetivo y por qué es relevante para la marca?',
          parrafo2: cimaHtml(CIMA.audiencia),
          titulo_3: '¿Cuáles eran los objetivos de negocio medibles?',
          parrafo3: cimaHtml(CIMA.objetivos),
        },
        seccion_b: {
          titulo_de_la_seccion_b: 'Resumen Ejecutivo',
          titulo_1: 'Reto',
          parrafo1: cimaPlain(CIMA.reto),
          titulo_2: 'Insight',
          parrafo2: cimaPlain(CIMA.insight),
          titulo_3: 'Idea',
          parrafo3: cimaPlain(CIMA.idea),
          titulo_4: 'Resultados',
          parrafo4: cimaPlain(CIMA.resultadosEjecutivo),
        },
        seccion_c: {
          titulo_de_la_seccion_c: 'Estrategia y Ejecución (La Solución)',
          parrafo1: cimaHtml(CIMA.estrategia),
          titulo_2:
            '¿Como su idea estratégica abordó directamente el insight y el desafío planteado?',
          parrafo2: cimaHtml(CIMA.comoIdeaEstrategica),
          titulo_3: 'Por favor mencione cuáles fueron sus medios claves.',
          parrafo3: cimaHtml(CIMA.mediosClaves),
        },
        seccion_e: {
          titulo_de_la_seccion_e: 'Resultados y KPIs (La Prueba del Éxito)',
          parrafo: cimaHtml(CIMA.resultadosPrueba),
          titulo_1: '¿Cómo sabe que la estrategia funcionó?',
          parrafo1: cimaHtml(CIMA.comoSabe),
          titulo_2:
            '¿Cómo se relacionaron estos resultados con sus KPIs y cómo cambiaron frente a los datos iniciales?',
          parrafo2: cimaHtml(CIMA.relacionKpis),
        },
        seccion_f: {
          titulo_de_la_seccion_f:
            'Innovación y Aporte (Técnica y Trascendencia)',
          parrafo: cimaHtml(CIMA.innovacion),
          titulo_1:
            '¿Qué recursos creativos, técnicas o herramientas especiales usaron en este caso? Si usó AI, mencione las herramientas específicas y cómo ayudaron a alcanzar los objetivos de la campaña.',
          parrafo1: cimaHtml(CIMA.recursos),
          titulo_2:
            '¿Cómo ha contribuido su estrategia al mercado o a la sociedad en general?',
          parrafo2: cimaHtml(CIMA.contribucion),
        },
      },
    },
  };
}

export function appendSoyTechnoCaseStudy<T extends { slug?: string }>(
  stories: T[],
): T[] {
  if (stories.some((story) => story.slug === SOYTECHNO_CASE_STUDY_SLUG)) {
    return stories;
  }
  return [...stories, getSoyTechnoSyntheticStory() as unknown as T];
}
