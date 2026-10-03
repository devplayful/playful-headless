export const PRECIOS_META = {
  title: 'Shopify precios y planes 2026 | Playful Agency',
  description:
    'Shopify precios en España: planes, comisiones y el coste real de montar tu tienda. Reserva una reunión con Playful Agency.',
  jsonLdName: 'Shopify precios y planes | Playful Agency',
  path: '/shopify-precios',
  dateModified: '2026-10-03',
} as const;

export const CTA_LABEL = 'Reservar una reunión con Playful';

export { SERVICE_BOOKING_HREF } from '../../utils/booking.ts';

export const HERO = {
  h1: 'Shopify precios: lo que cuesta de verdad tu tienda',
  paragraphs: [
    'Si comparas Shopify precios y planes para tu tienda, la cuota mensual es solo una parte de lo que vas a pagar, porque a esa cuota se suman las comisiones de cada pedido, el tema, las apps y el trabajo de dejar la tienda lista para vender.',
    'Eso pesa igual en una marca con ventas online, en una tienda física que quiere abrir su canal en internet o en un proyecto que empieza de cero.',
    'Las cifras de esta página son los precios que Shopify publica para España en octubre de 2026. Shopify puede cambiarlos en cualquier momento, así que antes de contratar conviene comprobarlos en su [página oficial de precios](https://www.shopify.com/es-es/precios). Precios revisados el 3 de octubre de 2026.',
    'Si quieres poner números a tu caso, en una reunión de 30 a 40 minutos repasamos contigo qué plan encaja y qué más necesita tu tienda para funcionar.',
  ],
} as const;

export const PLANS = {
  h2: 'Qué incluye cada plan de Shopify y dónde mirar el precio oficial',
  intro:
    'Shopify tiene cuatro planes para una tienda online, que son Basic, Grow, Advanced y Plus. Los tres primeros se pueden pagar al mes o al año, y con el pago anual la cuota mensual baja. Plus parte de 2.100 € al mes y admite suscripciones de uno o tres años.',
  tableCaption: 'Planes de Shopify en España, octubre de 2026',
  headers: ['Plan', 'Con pago anual', 'Con pago mensual', 'Para quién lo presenta Shopify'],
  rows: [
    ['Basic', '24 €/mes', '32 €/mes', 'Emprendedores independientes'],
    ['Grow', '69 €/mes', '92 €/mes', 'Equipos pequeños'],
    ['Advanced', '289 €/mes', '384 €/mes', 'Operar a nivel global'],
    ['Plus', 'Desde 2.100 €/mes', 'Desde 2.100 €/mes', 'Negocios complejos'],
  ],
  after: [
    'Antes de pagar la cuota completa, Shopify ofrece una prueba gratis de 3 días y, después, la mayoría de los planes cuestan 1 € al mes durante los 3 primeros meses. Pasado ese periodo se aplica el precio estándar del plan, y en ningún plan hay tarifas de configuración.',
    'Todos los planes incluyen la tienda online con todas las funciones, productos ilimitados, alojamiento web, dominio propio y certificado SSL, que es el que cifra la conexión entre el navegador de tu cliente y tu tienda.',
    'También entran la venta en redes sociales y marketplaces, la recuperación de carritos abandonados, los códigos de descuento, la traducción de la tienda y la atención al cliente las 24 horas por chat.',
    'Lo que cambia de un plan a otro es, sobre todo, cuánta gente puede trabajar en la tienda y cuánto pagas por cada venta. Grow permite hasta 5 cuentas para empleados y Advanced hasta 15, mientras que en Plus son ilimitadas. Advanced añade además las tarifas de envío en tiempo real calculadas por terceros y la opción de adaptar la tienda a cada región.',
  ],
} as const;

export const FEES = {
  h2: 'Comisiones, Shopify Payments y lo que se paga por pedido',
  intro:
    'La cuota es fija, pero las comisiones crecen con cada pedido. Por eso, a medida que tu tienda vende más, conviene mirarlas con la misma atención que el plan.',
  payments:
    'Shopify Payments es la pasarela de pago propia de Shopify, la que procesa dentro de tu tienda los cobros con tarjeta y con otros métodos. Estas son las tarifas que publica para España en cada plan:',
  tableCaption: 'Tarifas de Shopify Payments en España, octubre de 2026',
  headers: ['Tarifa', 'Basic', 'Grow', 'Advanced', 'Plus'],
  rows: [
    ['Tarjeta estándar online', '2,1 % + 0,30 €', '1,8 % + 0,30 €', '1,6 % + 0,30 €', '1,3 % + 0,30 €'],
    ['Tarjeta Amex online', '3,2 % + 0,30 €', '2,9 % + 0,30 €', '2,7 % + 0,30 €', '2,3 % + 0,30 €'],
    ['Tarjeta internacional online', '3,2 % + 0,30 €', '2,9 % + 0,30 €', '2,7 % + 0,30 €', '2,3 % + 0,30 €'],
    ['Bizum', '0,9 % + 0,20 €', '0,9 % + 0,20 €', '0,9 % + 0,20 €', '0,8 % + 0,20 €'],
    ['Klarna', '4,99 % + 0,35 €', '4,99 % + 0,35 €', '4,99 % + 0,35 €', '3,99 % + 0,35 €'],
    ['Tarjeta en persona', '1,7 % + 0,00 €', '1,5 % + 0,00 €', '1,4 % + 0,00 €', '1,3 % + 0,00 €'],
    ['Cargo por usar un proveedor de pago externo', '2 %', '1 %', '0,6 %', '0,2 %'],
  ],
  after: [
    'Conviene fijarse en la última fila. Si en lugar de Shopify Payments cobras con un proveedor de pago externo, Shopify aplica ese porcentaje por transacción según tu plan, y va aparte de lo que te cobre el propio proveedor.',
    'Hay otro detalle que cambia la cuenta fuera de España. Shopify Payments solo está disponible en determinados países, de modo que los precios y las opciones de pago pueden variar según dónde esté tu negocio. Mostrar precios en monedas locales, aceptar métodos de pago locales y usar el análisis de fraude integrado también requieren Shopify Payments. Si tu empresa factura desde otro país, la cifra que vale es la que Shopify publica para ese país.',
    'En Shopify trabajamos con métodos de pago internacionales. Si tu tienda vende en Venezuela y necesita cobrar con métodos de pago locales, esa parte no la resolvemos en Shopify, sino en WooCommerce, que es la plataforma sobre la que está [SoyTechno](https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela).',
  ],
} as const;

export const EXTRAS = {
  h2: 'Tema, apps y lo que no entra en la suscripción',
  paragraphs: [
    'Todos los planes incluyen temas y plantillas, así que tu tienda puede arrancar sin comprar un diseño. Si prefieres uno de los temas de pago de la tienda de temas de Shopify, ese precio va aparte, y la página de planes no lo recoge.',
    'Con las apps pasa lo mismo. Shopify indica que puedes integrar miles de apps, pero cada una tiene el precio que fija quien la desarrolla, y ese coste no aparece en la tabla de planes. Las reseñas de producto, los filtros avanzados del catálogo o la conexión con tu sistema de gestión pueden depender de una app, así que merece la pena sumar lo que cuestan antes de elegir plan.',
    'Hay otros costes que la propia página de Shopify menciona fuera de la cuota:',
  ],
  items: [
    '**POS Pro**, el complemento de punto de venta para tiendas físicas, cuesta 79 € al mes por sucursal en Basic, Grow y Advanced. Añade roles y permisos ilimitados para el personal, gestión de inventario en la tienda y recogida en tienda.',
    '**La plataforma de impuestos avanzada** es un complemento en todos los planes. Los cálculos automáticos de impuestos y la validación del IVA (impuesto sobre el valor añadido) sí van incluidos.',
    '**Las campañas de SMS** (mensajes de texto al móvil) se pagan por envío.',
    '**La sincronización con marketplaces** es gratis hasta 50 pedidos al mes. A partir de ahí, Shopify cobra un 1 % con un máximo de 99 dólares al mes, una cifra que publica en dólares también en su página de España.',
    '**El dominio** puede ser uno que ya tengas o uno nuevo, y toda tienda incluye además una dirección gratuita en myshopify.com.',
  ],
} as const;

export const PLUS = {
  h2: 'Shopify Plus: cuándo tiene sentido',
  intro:
    'Shopify Plus cuesta desde 2.100 € al mes, y si eliges una suscripción de uno o tres años, puedes cancelarla cuando termina ese periodo de compromiso. La tarifa online con tarjeta estándar baja a 1,3 % + 0,30 €, y el cargo por usar un proveedor de pago externo se queda en el 0,2 %.',
  lead: 'El salto a Plus se justifica por necesidades concretas que los otros planes no cubren:',
  items: [
    'Personalización completa del pago, frente a la personalización limitada de Basic, Grow y Advanced.',
    'Catálogos B2B (venta entre empresas) ilimitados, cuando el resto de planes llega a 3.',
    'Hasta 200 sucursales de inventario en lugar de 10, y POS Pro con 20 sucursales incluidas, ampliables a 200 con Shopify Payments.',
    'Hasta 9 tiendas adicionales gratis, algo útil si llevas varias marcas o varios países.',
    'Cuentas de empleado ilimitadas y atención prioritaria por teléfono las 24 horas.',
  ],
  close:
    'Si tu tienda vende en un solo mercado, con un catálogo y un equipo pequeños, Basic o Grow cubren el catálogo, el pago y los pedidos. Plus empieza a tener sentido cuando gestionas varias tiendas, vendes a empresas con muchos catálogos o tienes una red de locales que comparte inventario con la web.',
} as const;

export const LAUNCH = {
  h2: 'El coste de poner la tienda en marcha, más allá del plan',
  paragraphs: [
    'El plan de Shopify te da la plataforma, pero no deja la tienda lista para vender, así que alguien tiene que ordenar el catálogo en colecciones y variantes, preparar las fichas de producto, configurar pagos, envíos e impuestos y adaptar el diseño a tu marca en el móvil y en el ordenador. Si vienes de otra plataforma, además hay que trasladar los productos y las direcciones web que Google ya conoce, para no perder el posicionamiento que tienes.',
    'Ese trabajo lo puedes hacer tú, un freelance o una agencia, y su coste depende sobre todo de tres cosas.',
    'La primera es el tamaño del catálogo y cuántas variantes tiene cada producto. La segunda son los sistemas con los que la tienda tiene que hablar, porque conectar el inventario y la facturación con tu ERP (el sistema de gestión donde llevas el stock y las facturas), aunque lo haya desarrollado tu propio equipo, es una fase del proyecto con su propio entregable y no un añadido de última hora. La tercera es si partes de cero o rehaces una tienda que ya existe.',
    'El plazo, por su parte, depende de cuándo esté listo lo que la tienda necesita de ti. Antes de empezar conviene tener a mano lo siguiente:',
  ],
  readyItems: [
    'El catálogo con precios y existencias, en una hoja de cálculo o exportado de tu sistema actual.',
    'Las fotos y los textos de cada producto.',
    'El acceso a tu dominio.',
    'La cuenta con la que cobras, sea Shopify Payments u otro proveedor.',
    'Las condiciones de envío y devolución y los textos legales.',
  ],
  after: [
    'Si ya has intentado lanzar tu tienda dos o tres veces y no ha llegado a salir, antes de elegir plan merece la pena revisar qué frenó cada intento, porque una cuota más alta no arregla un catálogo sin preparar ni un cobro sin definir.',
    'Trabajamos en Shopify y WooCommerce. En Shopify montamos tiendas desde cero y migramos las que ya existen, y antes de construir te presentamos 2 propuestas visuales para que elijas la dirección del diseño. Después de la entrega, tu tienda tiene una garantía de 30 días que cubre cualquier error.',
    'El precio de la implementación depende de tu catálogo y de tus integraciones, así que lo vemos en la reunión con tu caso delante. Cómo trabajamos el catálogo, el checkout y la migración lo tienes en nuestra página de [implementación de tiendas en Shopify](https://playfulagency.com/agencia-shopify).',
    'Puedes ver el resultado en dos casos de Shopify publicados. En [el caso de Jumex](https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce) ordenamos un catálogo de bebidas por categorías, colecciones y variantes, con fichas de producto y vistas para escritorio y móvil. En [el caso de Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce) las fichas incluyen además la información nutricional de cada producto.',
  ],
} as const;

export const CHOOSE = {
  h2: 'Cómo elegir el plan para tu tienda',
  intro: [
    'El plan se elige por cómo cobras, con qué sistemas tiene que conectarse la tienda y quién la administra cada día, más que por el que suena más completo.',
    'Una tienda fácil de administrar es la que tu equipo puede actualizar sin depender de nadie. En Shopify, cambiar un precio, añadir una variante o revisar un pedido se hace desde el mismo panel en cualquier plan, así que la diferencia entre planes está en las comisiones, las cuentas de empleado y lo que necesitas para vender fuera.',
  ],
  profiles: [
    {
      h3: 'Si tu tienda empieza desde cero',
      body: 'Basic cubre la tienda completa, los productos ilimitados y el pago, con una tarifa de 2,1 % + 0,30 € por cobro con tarjeta estándar. Si todavía estás decidiendo cómo montar tu primera tienda, en [qué hay que saber para crear un e-commerce](https://playfulagency.com/blog/tecnologia/crear-un-e-commerce) repasamos los elementos que no pueden faltar.',
    },
    {
      h3: 'Si tienes una tienda física y quieres vender online',
      body: [
        'Todos los planes permiten ventas en persona ocasionales en puestos temporales y eventos, con una tarifa de tarjeta en persona del 1,7 % en Basic, del 1,5 % en Grow y del 1,4 % en Advanced, sin importe fijo por cobro.',
        'Si vendes cada día en uno o varios locales, POS Pro añade la gestión de inventario en la tienda, los permisos del personal y la recogida en tienda por 79 € al mes por sucursal. Basic, Grow y Advanced admiten 10 sucursales de inventario, de modo que puedes llevar en el mismo sitio el stock de cada local y el de la web.',
      ],
    },
    {
      h3: 'Si tu tienda ya vende online y tiene equipo',
      body: 'Grow suma hasta 5 cuentas para empleados y baja la tarjeta estándar a 1,8 % + 0,30 €. Cuando el número de pedidos crece, la diferencia de comisión entre Basic y Grow puede pesar más que la diferencia de cuota, así que compensa hacer la cuenta con tus pedidos reales.',
    },
    {
      h3: 'Si vendes en varios países',
      body: [
        'Advanced añade las tarifas de envío en tiempo real calculadas por terceros, la personalización de la tienda por región y hasta 15 cuentas para empleados. Ten en cuenta que mostrar precios en moneda local y aceptar métodos de pago locales requiere Shopify Payments, que no está disponible en todos los países.',
        'Si todavía dudas entre Shopify y WooCommerce, nuestra [agencia de e-commerce](https://playfulagency.com/agencia-e-commerce) trabaja con las dos plataformas, y en la reunión vemos cuál encaja con tu forma de cobrar. Shopify, además, permite cancelar o cambiar la suscripción en cualquier momento, y en Plus con suscripción de uno o tres años la cancelación llega al terminar el compromiso, así que el plan que elijas hoy no te ata.',
      ],
    },
  ],
} as const;

export const FAQ_ITEMS = [
  {
    question: '¿Cuánto te cobra Shopify por vender?',
    answer:
      'Además de la cuota del plan, con Shopify Payments pagas una tarifa por cada cobro online con tarjeta estándar, que va del 2,1 % + 0,30 € en Basic al 1,3 % + 0,30 € en Plus, según los precios publicados para España en octubre de 2026. Si cobras con un proveedor de pago externo, Shopify añade un cargo por transacción del 2 % en Basic, del 1 % en Grow, del 0,6 % en Advanced y del 0,2 % en Plus.',
  },
  {
    question: '¿Es Shopify gratis?',
    answer:
      'No. Shopify ofrece una prueba gratuita de 3 días sin tarjeta de crédito y, después, la mayoría de los planes cuestan 1 € al mes durante los 3 primeros meses, antes de pasar al precio estándar. También existe Agentic, a 0 € al mes, pensado para vender en canales de inteligencia artificial, con comisiones de tarjeta desde 2,1 % + 0,30 € por venta online.',
  },
  {
    question: '¿Cuál es el plan más barato de Shopify?',
    answer:
      'Basic, a 24 € al mes con pago anual o a 32 € al mes con pago mensual. Incluye la tienda online completa, productos ilimitados y la venta en redes sociales y marketplaces.',
  },
  {
    question: '¿Sale más barato pagar Shopify al año?',
    answer:
      'Sí. Con pago anual, Basic cuesta 24 € al mes en lugar de 32 €, Grow cuesta 69 € en lugar de 92 € y Advanced cuesta 289 € en lugar de 384 €.',
  },
  {
    question: '¿Qué es Shopify?',
    answer:
      'Shopify es una plataforma de comercio electrónico alojada que te permite crear una tienda online, cobrar y vender en redes sociales y en persona desde un mismo panel, sin programar. El alojamiento, el certificado de seguridad y el ancho de banda van incluidos en el plan.',
  },
  {
    question: '¿Merece la pena Shopify para tu tienda?',
    answer:
      'Depende de cómo cobras y de lo que tiene que conectar tu tienda. Shopify encaja cuando vendes con métodos de pago internacionales y quieres una tienda que tu equipo administre sin tocar código. Si necesitas cobrar con métodos locales de Venezuela, la vía es WooCommerce. En la reunión revisamos tu caso y te decimos qué plataforma y qué plan tienen sentido.',
  },
] as const;

export const FAQ = {
  h2: 'Preguntas frecuentes sobre los precios de Shopify',
  items: FAQ_ITEMS,
} as const;

export const CLOSING = {
  h2: 'Repasa con nosotros lo que cuesta tu tienda',
  body: 'En 30 a 40 minutos miramos tu catálogo, tu forma de cobrar y los sistemas que tiene que conectar tu tienda. Sales con una idea clara del plan de Shopify que te conviene y de lo que hace falta para ponerla en marcha.',
} as const;

export const HERO_SLOT = {
  id: 'hero',
  width: 552,
  height: 360,
  src1x: '/images/shopify-precios/hero@1x.png',
  src2x: '/images/shopify-precios/hero@2x.png',
} as const;

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

export function splitMarkdownLinks(text: string): Array<{ type: 'text' | 'link'; value: string; href?: string }> {
  const parts: Array<{ type: 'text' | 'link'; value: string; href?: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(MARKDOWN_LINK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'link', value: match[1], href: match[2] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}

const BOLD_RE = /\*\*([^*]+)\*\*/g;

export function splitBold(text: string): Array<{ type: 'text' | 'strong'; value: string }> {
  const parts: Array<{ type: 'text' | 'strong'; value: string }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(BOLD_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'strong', value: match[1] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}

export function toInternalHref(href: string): string {
  if (href === 'https://api.playfulagency.com/widget/bookings/reunion-playful') {
    return '/reunion-playful';
  }
  if (href.startsWith('https://playfulagency.com')) {
    return href.replace('https://playfulagency.com', '') || '/';
  }
  return href;
}

export function isExternalHref(href: string): boolean {
  return href.startsWith('http') && !href.startsWith('https://playfulagency.com');
}

export function buildShopifyPreciosJsonLd(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: PRECIOS_META.jsonLdName,
        description: PRECIOS_META.description,
        inLanguage: 'es-ES',
        dateModified: PRECIOS_META.dateModified,
        isPartOf: { '@type': 'WebSite', url: 'https://playfulagency.com' },
        publisher: { '@type': 'Organization', name: 'Playful Agency', url: 'https://playfulagency.com' },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}
