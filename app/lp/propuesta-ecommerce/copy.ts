import type { AdsWarmLandingCopy } from '../_components/AdsWarmLandingPage';

export const LP_PROPUESTA_META = {
  title: 'Propuesta ecommerce — landing ads (staging) | Playful',
  description:
    'Landing P3 Compras | Proveedor, cotización y B2B. Keywords: precio desarrollo ecommerce, cotizar tienda online, tienda online b2b.',
  path: '/lp/propuesta-ecommerce',
} as const;

export const LP_PROPUESTA_COPY: AdsWarmLandingCopy = {
  hero: {
    h1: {
      tag: 'H1',
      note:
        'Ángulo proveedor formal que factura desde EE. UU. Keywords: precio desarrollo ecommerce, cotizar tienda online, desarrollo de tiendas virtuales. PROHIBIDO inventar precios o rangos en el H1.',
    },
    subtitle: {
      tag: 'intro hero',
      note:
        'Dejar claro que tras la llamada entregan propuesta con alcance y plazos. Mencionar B2B / tienda online b2b si encaja con el grupo de anuncios.',
    },
    ctaSecondary: {
      tag: 'CTA secundario (scroll)',
      note: 'CTA de exploración hacia el bloque de dolor (compras evaluando proveedores).',
    },
  },
  problem: {
    h2: {
      tag: 'H2 — dolor compras',
      note: 'Dolor de quien compra servicios: cotizaciones vagas, alcance difuso, proveedores sin operación US.',
    },
    body: {
      tag: 'párrafo dolor',
      note: 'Sin cifras inventadas. Enfatizar necesidad de propuesta formal post-llamada.',
    },
  },
  steps: {
    h2: {
      tag: 'H2 — cómo cotizamos',
      note: 'Tres pasos hacia propuesta con alcance y plazos.',
    },
    items: [
      {
        tag: 'paso 1 — descubrimiento',
        note: 'Llamada de diagnóstico (30–40 min).',
      },
      {
        tag: 'paso 2 — alcance',
        note: 'Definición de entregables, plataforma y dependencias.',
      },
      {
        tag: 'paso 3 — propuesta',
        note: 'Documento de propuesta — sin montos ficticios en la landing.',
      },
    ],
  },
  proof: {
    h2: {
      tag: 'H2 — prueba',
      note: 'Casos publicados + CIMA como respaldo de proveedor establecido.',
    },
  },
  afterCall: {
    h2: {
      tag: 'H2 — qué recibes',
      note: 'Lista de lo incluido en la propuesta formal (alcance, plazos, siguientes pasos).',
    },
    items: [
      {
        tag: 'entregable 1',
        note: 'Propuesta con alcance funcional y técnico.',
      },
      {
        tag: 'entregable 2',
        note: 'Cronograma por fases.',
      },
      {
        tag: 'entregable 3',
        note: 'Condiciones comerciales solo en documento privado — no en web.',
      },
    ],
  },
  faq: {
    h2: {
      tag: 'H2 — FAQ',
      note: 'Objeciones de compras: precio, B2B, facturación US, plazos.',
    },
    items: [
      {
        question: {
          tag: 'FAQ 1 — pregunta',
          note: '¿Cómo se cotiza el desarrollo ecommerce?',
        },
        answer: {
          tag: 'FAQ 1 — respuesta',
          note: 'Explicar proceso; PROHIBIDO poner cifras o “desde $X”.',
        },
      },
      {
        question: {
          tag: 'FAQ 2 — pregunta',
          note: '¿Hacen tiendas B2B?',
        },
        answer: {
          tag: 'FAQ 2 — respuesta',
          note: 'Alineado a capacidades reales de Playful.',
        },
      },
      {
        question: {
          tag: 'FAQ 3 — pregunta',
          note: '¿Facturan desde Estados Unidos?',
        },
        answer: {
          tag: 'FAQ 3 — respuesta',
          note: 'Hecho verificable (LLC US) sin exagerar.',
        },
      },
    ],
  },
  finalCta: {
    h2: {
      tag: 'H2 — CTA final',
      note: 'Invitación a reunión para recibir propuesta.',
    },
    body: {
      tag: 'cuerpo CTA final',
      note: 'Reforzar propuesta con alcance y plazos tras la llamada. Sin precios.',
    },
    button: {
      tag: 'botón CTA final',
      note: 'Label de agendado → /reunion-playful.',
    },
  },
};
