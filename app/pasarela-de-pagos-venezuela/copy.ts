export const PAGE_META = {
  title: 'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  description:
    '¿Eres dueño de un E-commerce con empresa constituida? Crea/Optimiza tus métodos de pago online con Playful Agency ¡Mejora la experiencia del cliente!',
  path: '/pasarela-de-pagos-venezuela',
} as const;

export const HERO = {
  eyebrow: 'Agencia e-commerce',
  h1: '¡Crea o Mejora los Pagos Online de tu E-commerce!',
  body: 'Si eres un dueño de E-commerce con una empresa constituida y estás buscando mejorar tus métodos, acabas de encontrar a tu socio ideal. En Playful Agency entendemos que cada clic cuenta, y optimizamos tus opciones de pagos online para que tus clientes puedan comprar fácil, rápido y con confianza.',
  cta: 'Agendar Reunión con Playful',
  button: '¡Quiero mejorar mis pagos online!',
  subline: 'Una llamada de 30 a 40 minutos para revisar tu tienda, sin compromiso.',
} as const;

export const INTRO_BAND = {
  h2: 'Pagos online optimizados para un E-commerce sólido',
  body: 'Somos el equipo que trabajará para integrar las mejores plataformas de pago online, adaptadas a las necesidades de tu negocio y las expectativas de tus clientes.',
} as const;

/** Único bloque SiTef de la landing. Copy firmado 2f133f8. */
export const SITEF_BLOCK = {
  h2: 'Cómo integrar SiTef en tu tienda online en Venezuela',
  paragraphs: [
    'SiTef de Venezuela se presenta como representante exclusivo en el país de Software Express, la empresa brasileña que desarrolla la plataforma SiTef. Para una tienda online, lo que interesa es su botón de pago web, que su ficha llama E-Sitef Botón de Pago.',
    'Ese botón se instala en la web o en la app de tu tienda y, según SiTef, acepta tarjetas de crédito nacionales y tarjetas de débito y crédito internacionales. SiTef lo describe como compatible con cualquier plataforma web.',
    'Además del botón, SiTef ofrece otras soluciones que conviene no confundir con la integración del checkout. El link de pago sirve para cobrar por chat y no se integra con la web. La verificación de Pago Móvil permite que el cliente reporte su pago y que SiTef responda si fue aprobado o no. El vuelto digital sirve para devolver un remanente por Pago Móvil, y Merchant Sitef está pensado para el piso de venta y el punto de venta físico, no para la tienda online.',
    'Sobre la liquidación, las preguntas frecuentes de SiTef dicen que recibes tu dinero directamente en tu cuenta bancaria asignada, sin intermediarios, en menos de 24 horas. Esa misma página no detalla qué bancos participan ni en qué moneda se liquida cada operación, así que la moneda de procesamiento y los plazos dependen del acuerdo entre tu comercio y SiTef.',
    'SiTef también afirma tener plugins para WordPress, PrestaShop, WooCommerce y Odoo, aunque no publica dónde descargarlos ni sus versiones. La API REST que aparece documentada en internet es la del fabricante en Brasil, y no hemos encontrado un documento que confirme que esos mismos accesos estén habilitados para comercios venezolanos.',
    'En Playful integramos SiTef en tiendas WooCommerce para que el botón funcione en el checkout y el pedido quede marcado como pagado cuando llega la confirmación. Lo que no hacemos es procesar el cobro ni gestionar tu afiliación, porque esa relación es entre tu comercio y SiTef.',
  ],
  closeLead: 'Si tu checkout combina SiTef con cuotas, en nuestra guía de ',
  closeLinkLabel: 'Cashea para comercios',
  closeHref: '/blog/tecnologia/cashea-para-comercios',
  closeTail: ' explicamos cómo convive con el resto de métodos.',
} as const;

export const BENEFITS = {
  h2: 'Beneficios que te traerá tener variedad de Pagos Online',
  items: [
    {
      title: 'Integración funcional de métodos de pago',
      body: 'Desde plataformas globales hasta soluciones locales, conectamos tu tienda online con opciones que tus clientes agradecerán.',
      cta: '¡Quiero integración ya!',
      slot: 'beneficio-integracion',
    },
    {
      title: 'Seguridad para pagar sin pensar',
      body: 'Hacemos que tu E-commerce tengan métodos de pago seguros como una bóveda bancaria. Tus clientes y sus datos se sentirán seguros contigo.',
      cta: '¡Quiero pagos seguros!',
      slot: 'beneficio-seguridad',
    },
    {
      title: 'Experiencia de pago que fluye sin complicaciones',
      body: 'Nada de pasos confusos, ni instrucciones encriptadas. Diseñamos experiencias simples y efectivas para mantener a tus clientes felices.',
      cta: 'Optimiza mis pagos ¡Lo necesito!',
      slot: 'beneficio-experiencia',
    },
  ],
} as const;

export const PAIN_POINTS = {
  h2: '¿Tus pagos online son un dolor de cabeza?',
  intro:
    'Sabemos lo frustrante que es perder ventas por problemas técnicos o falta de opciones de pago. Por eso, nos esforzamos para crear propuestas para que empresas constituidas puedan ofrecer mejores métodos de pago y experiencias de compra.',
  band: 'Tenemos la medicina para estas dolencias',
  items: [
    {
      quote:
        '«Los errores técnicos espantan a mis clientes. Los métodos de pago que tengo actualmente pasan mucho tiempo fuera de línea, lo que me impide completar compras»',
      answer: 'Te ayudamos a mantener una plataforma estable y funcional.',
    },
    {
      quote:
        '«Invierto mucho dinero en publicidad, por lo que muchas personas entran a mi tienda, incluso añaden productos al carrito pero, no completan la compra porque los métodos de pago son límitado e incompatibles con los clientes a los que quiero llegar.»',
      answer: 'Ofrecemos soluciones globales y locales para que nadie se quede sin comprar.',
    },
    {
      quote:
        '«Nadie me compra, porque el poceso de pago es lento, confuso, y tarda considerables lapsos de tiempos en dar respuesta a los clientes.»',
      answer: 'Diseñamos experiencias rápidas y sencillas que tus clientes amarán.',
    },
  ],
} as const;

export const SOCIAL_PROOF = {
  h2: 'Con la confianza de marcas que ya venden',
  cases: [
    {
      name: 'Odwalla',
      line: 'Odwalla — implementación de ecommerce en Shopify. Ver el caso:',
      href: 'https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce',
    },
    {
      name: 'Jumex',
      line: 'Jumex — implementación de ecommerce en Shopify. Ver el caso:',
      href: 'https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce',
    },
  ],
  quote:
    'Personalmente me siento mucho más seguro desde que trabajo con ustedes. Me han quitado una carga de trabajo importante y el proceso ha sido cero estresante.',
  attribution: 'Federico Vera, e-Commerce Consultant de Odwalla.',
} as const;

export const FAQ_ITEMS = [
  {
    question: '¿Qué incluye nuestro servicio de Pagos Online para Ecommerce?',
    answer:
      'Aunque cada cliente es diferente, y por la tanto debemos estudiar cada caso para dar una respuesta personalizada. En grandes rasgos, te ayudamos con la integración, optimización y soporte de las mejores pasarelas de pago globales para que ofrezcas las mejores opciones a tus clientes según el país donde te encuentres.',
  },
  {
    question: '¿Qué tipo de E-commerce puede beneficiarse de nuestro trabajo?',
    answer:
      'En Playful Agency, solo trabajamos con empresas constituidas que buscan optimizar y modernizar sus métodos de pago.',
  },
  {
    question: '¿Cuánto tiempo toma la integración?',
    answer:
      '¡Nuevamente! Depende del caso y las necesidades específicas de su negocio. Nos aseguramos de hacer integraciones óptimas por lo que no solo cuentan las horas de programación, sino también las de prueba en diferentes ambientes para asegurarnos de su funcionamiento. ¡Ten esto en cuenta!',
  },
  {
    question: '¿Por qué elegir a Playful Agency?',
    answer:
      'Somos un equipo joven, proactivo y ambicioso. Nos encantan los retos y nos esforzamos por mejorar con cada proyecto. Ofrecemos servicios de optimización de pagos online porque hemos notado que muchos E-commerce suelen enfocarse en el diseño, dejando de lado la pasarela de pago. Esto puede generar una experiencia de compra incómoda y frustrante para los clientes. Creemos que hay una manera mejor de hacerlo. Nuestra propuesta está diseñada para transformar las tiendas online constituidas, mejorando la experiencia de usuario desde el primer clic hasta el pago final. Tenemos la experiencia, sabemos lo que funciona, y estamos listos para ayudarte a dar ese gran salto.',
  },
  {
    question: '¿Dónde puedo ver casos de éxito?',
    answer: 'Mira nuestros resultados aquí: https://playfulagency.com/casos-de-exito. Spoiler: son impresionantes.',
  },
] as const;

export const FAQ = {
  h2: 'Te dejamos algunas preguntas sobre Pagos Online que puedes hacerte',
  items: FAQ_ITEMS,
} as const;

export const CTA = {
  h2: '¡Es Hora de actuar y cambiar tu futuro digital! (sin necesidad de magia negra)',
  body: 'No esperes más para dar el siguiente paso. ¡Hablemos! Ya sea que tengas preguntas, o de entrada quieras comprobar cómo nuestra empresa de marketing digital puede tranformar tu marca en internet, estamos listos para comenzar. Tu próxima gran campaña arranca aquí, ¡y va en serio! No esperes más: tu próxima gran campaña comienza con una conversación.',
  question: '¿Quieres que revisemos si tu checkout deja cobrar a quien ya te eligió?',
  cta: 'Agendar Reunión con Playful',
} as const;

export { BOOKING_HREF, CONTACT_HREF } from '../../utils/booking.ts';

export const PLAYFUL_URL_RE = /(https:\/\/playfulagency\.com\/[^\s).,;]+)/g;

export function buildFaqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
