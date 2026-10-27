import type { AdsWarmLandingCopy } from '../_components/AdsWarmLandingPage';

export const LP_CALENTAMIENTO_META = {
  title: 'Calentamiento — landing ads (staging) | Playful',
  description: 'Landing de calentamiento para tráfico frío de Google Ads y Meta Ads. Copy pendiente de Contenido.',
  path: '/lp/calentamiento',
} as const;

export const LP_CALENTAMIENTO_COPY: AdsWarmLandingCopy = {
  hero: {
    h1: {
      tag: 'H1',
      note:
        'Titular para gerente/decisor D2C que ya vende online. Debe calentar antes de pedir reunión: problema claro, credibilidad Playful, sin prometer precio fijo.',
    },
    subtitle: {
      tag: 'subtítulo hero',
      note: '1–2 frases: qué hace Playful (ecommerce / operación US-ready) y para quién (marcas que ya facturan, no “emprende desde cero”).',
    },
    ctaSecondary: {
      tag: 'CTA secundario (scroll)',
      note: 'Texto de botón que invita a bajar y leer el dolor/solución antes de agendar. No debe decir “agendar reunión” todavía.',
    },
  },
  problem: {
    h2: {
      tag: 'H2 — dolor',
      note: 'Encabezado del bloque problema: tensión típica del tráfico frío (operación, pagos, ERP, crecimiento bloqueado, etc.).',
    },
    body: {
      tag: 'párrafo dolor',
      note: 'Desarrolla el dolor en lenguaje del gerente: cobrar desde EE. UU., integraciones, inventario, fricción operativa. Sin inventar cifras de cliente.',
    },
  },
  steps: {
    h2: {
      tag: 'H2 — cómo lo resolvemos',
      note: 'Título del bloque de 3 pasos del método Playful (diagnóstico → implementación → operación).',
    },
    items: [
      {
        tag: 'paso 1 — título',
        note: 'Primer paso concreto (ej. diagnóstico / auditoría de checkout, catálogo o integraciones).',
      },
      {
        tag: 'paso 2 — título',
        note: 'Segundo paso (implementación técnica, pasarela, ERP, Shopify/Woo, etc.).',
      },
      {
        tag: 'paso 3 — título',
        note: 'Tercer paso (lanzamiento, medición, handoff o acompañamiento).',
      },
    ],
  },
  proof: {
    h2: {
      tag: 'H2 — prueba social',
      note: 'Intro breve a casos Jumex, Odwalla y SoyTechno + premio CIMA. Reutilizar nombres reales del sitio.',
    },
  },
  afterCall: {
    h2: {
      tag: 'H2 — después de la llamada',
      note: 'Qué recibe el prospecto tras la reunión de 30–40 min (siguiente paso, no venta agresiva).',
    },
    items: [
      {
        tag: 'entregable 1',
        note: 'Primer entregable o resultado de la llamada (ej. lectura del estado actual).',
      },
      {
        tag: 'entregable 2',
        note: 'Segundo punto (ej. prioridades recomendadas o alcance preliminar).',
      },
      {
        tag: 'entregable 3',
        note: 'Tercer punto (ej. si encaja, propuesta formal con plazos — sin cifras inventadas aquí).',
      },
    ],
  },
  faq: {
    h2: {
      tag: 'H2 — FAQ',
      note: 'Título de sección preguntas frecuentes para objections de tráfico frío (tiempo, inversión, plataforma, geografía).',
    },
    items: [
      {
        question: {
          tag: 'FAQ 1 — pregunta',
          note: 'Pregunta sobre encaje (facturación mínima, tipo de marca, EE. UU. / LATAM).',
        },
        answer: {
          tag: 'FAQ 1 — respuesta',
          note: 'Respuesta honesta alineada con perfil Playful; sin prometer resultados numéricos.',
        },
      },
      {
        question: {
          tag: 'FAQ 2 — pregunta',
          note: 'Pregunta sobre proceso o duración del proyecto.',
        },
        answer: {
          tag: 'FAQ 2 — respuesta',
          note: 'Respuesta con plazos cualitativos; cifras solo si vienen de casos publicados.',
        },
      },
      {
        question: {
          tag: 'FAQ 3 — pregunta',
          note: 'Pregunta sobre inversión / cómo se cotiza.',
        },
        answer: {
          tag: 'FAQ 3 — respuesta',
          note: 'Explicar que el alcance se define en llamada; no poner precios en la landing.',
        },
      },
    ],
  },
  finalCta: {
    h2: {
      tag: 'H2 — CTA final',
      note: 'Titular de cierre que propone la reunión después del calentamiento.',
    },
    body: {
      tag: 'cuerpo CTA final',
      note: 'Refuerzo breve + mención de 30–40 min. El href va a /reunion-playful (UTM conservados por el sitio).',
    },
    button: {
      tag: 'botón CTA final',
      note: 'Label del botón (ej. “Agendar reunión con Playful”). Dispara cta_reunion_click.',
    },
  },
};
