import type { AdsWarmLandingCopy } from '../_components/AdsWarmLandingPage';

export const LP_INTEGRACIONES_META = {
  title: 'Integraciones pasarela y ERP — landing ads (staging) | Playful',
  description:
    'Landing P2 Gerente | Integraciones ERP y pagos. Keywords: integrar pasarela de pago, pasarela de pago shopify, integración ERP ecommerce.',
  path: '/lp/integraciones-pasarela-erp',
} as const;

export const LP_INTEGRACIONES_COPY: AdsWarmLandingCopy = {
  hero: {
    h1: {
      tag: 'H1',
      note:
        'Debe incluir las expresiones «integrar» y «pasarela de pago». Dejar claro que es para tiendas D2C que ya venden (no proyecto desde cero). Público: gerente de marca con ~100k–250k USD/mes.',
    },
    subtitle: {
      tag: 'intro hero',
      note:
        'Intro que nombra cobro desde EE. UU., pasarela conectada al ERP y al inventario. Keywords naturales: integrar pasarela de pago, pasarela de pago shopify, integración ERP ecommerce.',
    },
    ctaSecondary: {
      tag: 'CTA secundario (scroll)',
      note: 'Invita a leer el dolor de integración antes de agendar. Sin “reunión” en el label si José prefiere otro verbo de exploración.',
    },
  },
  problem: {
    h2: {
      tag: 'H2 — dolor integraciones',
      note: 'Dolor del gerente: pagos US, desfase ERP–tienda, conciliación manual, stock incorrecto tras cada venta.',
    },
    body: {
      tag: 'párrafo dolor',
      note: 'Amplía con escenarios reales (Shopify/Woo + ERP). Mencionar que ya facturan; rango 100k–250k USD/mes solo si José lo aprueba en copy final.',
    },
  },
  steps: {
    h2: {
      tag: 'H2 — cómo integramos',
      note: 'Título del método en 3 pasos orientado a pasarela + ERP + inventario.',
    },
    items: [
      {
        tag: 'paso 1 — diagnóstico',
        note: 'Mapeo de flujo de pago, ERP y fuentes de verdad de inventario.',
      },
      {
        tag: 'paso 2 — integración',
        note: 'Implementación de pasarela y conectores (sin nombrar vendors no usados por Playful).',
      },
      {
        tag: 'paso 3 — operación',
        note: 'Pruebas, conciliación y handoff al equipo del cliente.',
      },
    ],
  },
  proof: {
    h2: {
      tag: 'H2 — casos y CIMA',
      note: 'Puente a Jumex, Odwalla, SoyTechno como marcas que ya operan ecommerce con Playful.',
    },
  },
  afterCall: {
    h2: {
      tag: 'H2 — después de la llamada',
      note: 'Qué obtiene el gerente tras la sesión (mapa de integración, siguientes pasos).',
    },
    items: [
      {
        tag: 'entregable 1',
        note: 'Resumen de gaps entre pasarela, tienda y ERP.',
      },
      {
        tag: 'entregable 2',
        note: 'Priorización de integraciones y riesgos.',
      },
      {
        tag: 'entregable 3',
        note: 'Si procede, propuesta con alcance y plazos — sin cifras inventadas.',
      },
    ],
  },
  faq: {
    h2: {
      tag: 'H2 — FAQ',
      note: 'FAQs sobre ERPs, pasarelas US, Shopify, tiempos de integración.',
    },
    items: [
      {
        question: {
          tag: 'FAQ 1 — pregunta',
          note: '¿Trabajan con mi pasarela / ERP actual?',
        },
        answer: {
          tag: 'FAQ 1 — respuesta',
          note: 'Respuesta basada en stack real de Playful; no prometer integraciones no hechas.',
        },
      },
      {
        question: {
          tag: 'FAQ 2 — pregunta',
          note: '¿Cuánto tarda una integración típica?',
        },
        answer: {
          tag: 'FAQ 2 — respuesta',
          note: 'Rangos cualitativos; sin SLA inventado.',
        },
      },
      {
        question: {
          tag: 'FAQ 3 — pregunta',
          note: '¿Qué pasa con el inventario en tiempo real?',
        },
        answer: {
          tag: 'FAQ 3 — respuesta',
          note: 'Explicar enfoque Playful sin garantías absolutas.',
        },
      },
    ],
  },
  finalCta: {
    h2: {
      tag: 'H2 — CTA final',
      note: 'Cierre orientado a reunión técnica con gerente / operaciones.',
    },
    body: {
      tag: 'cuerpo CTA final',
      note: 'Mencionar revisión de pasarela + ERP en la llamada. Link a /reunion-playful.',
    },
    button: {
      tag: 'botón CTA final',
      note: 'Ej. “Agendar reunión con Playful”.',
    },
  },
};
