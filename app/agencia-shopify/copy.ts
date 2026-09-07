export const SHOPIFY_META = {
  title: 'Agencia Shopify para marcas que ya venden | Playful Agency',
  description:
    'Agencia Shopify para marcas que ya venden: implementamos y migramos tu tienda para un checkout optimizado y mejor conversión. Agenda una llamada.',
  path: '/agencia-shopify',
} as const;

export const HERO = {
  h1: 'Agencia Shopify. Playful Agency, expertos en ecommerce',
  body: 'Somos una agencia Shopify para marcas que ya venden y quieren un canal propio, donde el catálogo y el pago sean suyos y no de un tercero. Implementamos tu tienda desde cero o migramos la que ya tienes, y dejamos las colecciones, las páginas de producto y el checkout listos para que tus clientes encuentren lo que buscan y terminen la compra sin fricción. Si ya vendes y quieres ordenar ese canal antes de hacerlo crecer, reservamos 30 a 40 minutos para revisar tu web contigo y proponerte por dónde empezar.',
  cta: '¿Hablamos?',
  subline: 'Una llamada de 30 a 40 minutos para revisar tu tienda, sin compromiso.',
} as const;

export const SERVICES = {
  h2: 'Qué hacemos en tu tienda Shopify',
  intro:
    'Trabajamos los dos frentes que deciden una venta: que el comprador navegue el catálogo sin perderse y que cierre la compra en tu propia tienda.',
  items: [
    {
      title: 'Diseño de tu tienda para móvil y escritorio',
      body: 'Diseñamos páginas de producto que muestran las imágenes y la información que tu comprador necesita para decidir, con la misma solidez en escritorio y en el móvil, donde hoy ocurre buena parte de las compras. El objetivo es que quien entra reconozca el producto, entienda por qué le conviene y llegue al pago sin dudar por el camino.',
      slot: 'servicio-diseno',
    },
    {
      title: 'Desarrollo de tu tienda en Shopify',
      body: 'Construimos tu tienda dentro de Shopify aprovechando lo que la plataforma ya resuelve: colecciones y variantes para ordenar tus productos, plantillas de producto para presentar cada artículo, y un flujo de compra probado que gestiona inventario, impuestos y pagos. Así, cualquiera que llegue a tu web puede navegar el catálogo y pagarte en un canal que es tuyo, sin depender de un tercero.',
      slot: 'servicio-desarrollo',
    },
    {
      title: 'Catálogo y productos de tu ecommerce',
      body: 'Si vienes de otra plataforma o de una hoja de cálculo, lo que más pesa es mover el catálogo sin que se pierda nada por el camino, y esa es la parte que ordenamos contigo. Pasamos productos, colecciones y variantes revisando que cada precio, cada existencia y cada foto queden donde tienen que quedar, para que el comprador vaya del listado al producto correcto en pocos pasos. Y si tu negocio hoy vive fuera de línea y te preocupa subir el inventario por primera vez, lo montamos de manera que después actualices el inventario tú mismo, sin depender de un proveedor externo.',
      slot: 'servicio-catalogo',
    },
    {
      title: 'Checkout Shopify para cerrar la venta',
      body: 'El checkout de Shopify es de los que mejor convierten del mercado, porque quita fricción justo en el momento de pagar, que es donde más compradores se caen. Deja disponibles métodos de un toque como Shop Pay y las carteras del móvil, de modo que quien ya decidió comprar no tenga que teclear sus datos otra vez ni ir a buscar la tarjeta. Si hoy vendes por Instagram, por WhatsApp o incluso fuera de línea, ese comprador que ya te eligió termina en un pago pensado para no perderlo, y los datos de cada pedido se quedan de tu lado.',
      slot: 'servicio-checkout',
    },
    {
      title: 'Operar tu tienda día a día',
      body: 'Una tienda se pone a prueba el día que hay que cambiar una variante, subir un precio o revisar un pago que no cuadró. El panel de Shopify está pensado justo para eso, porque desde el mismo administrador gestionas productos, pedidos y contenido sin tocar código, y cuando el cambio es grande exportas el catálogo a CSV para revisarlo con calma o actualizar cientos de referencias de una vez. Montamos tu tienda para que esa operación sea tuya, sin montajes frágiles que solo entiende quien los construyó, y en la llamada vemos si prefieres que además te acompañemos en el día a día.',
      slot: 'servicio-operar',
    },
    {
      title: 'Consultoría para migrar o montar en Shopify',
      body: 'En 30 a 40 minutos revisamos tu web y te decimos qué conviene hacer, ya sea migrar a Shopify la tienda que ya tienes o construir una desde cero. Sales de esa conversación con una lectura clara de qué merece la pena conservar y qué conviene rehacer.',
      slot: null,
    },
  ],
} as const;

export const MIGRATION = {
  h2: 'Migración a Shopify',
  body: 'Si ya vendes y tienes tráfico que llega a tu web, migrar a Shopify no es empezar de nuevo, sino planear la mudanza con método para no perder lo que ya te funciona, vengas de otra tienda online, de un marketplace o de vender por Instagram, WhatsApp y fuera de línea. Antes de mover nada, hacemos una lista de lo que hay que preservar, y lo primero son las URLs que Google ya conoce y el catálogo que tus clientes ya navegan. Toda migración tiene un momento de cambio, así que planificamos el cutover para que la interrupción sea la mínima y sepas de antemano cuándo se hace el salto de una plataforma a la otra. Cuando terminamos, tu tienda vive en Shopify con el posicionamiento que traías, y lo que queda de tu lado es lo que de verdad te pertenece, los datos de tus compradores y la atribución de cada venta, porque la plataforma se alquila pero esos datos son tuyos.',
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

export const WHY_US = {
  h2: 'Por qué elegir nuestra agencia Shopify',
  items: [
    {
      lead: 'Trabajamos donde publicamos.',
      body: 'Los casos que puedes ver en nuestro portafolio (https://playfulagency.com/agencia-e-commerce) son implementaciones reales de ecommerce en Shopify, con catálogo, colecciones, variantes y vistas de escritorio y móvil. No son maquetas ni demos.',
    },
    {
      lead: 'Somos para quien ya vende.',
      body: 'Nuestro servicio está pensado para marcas con ventas que quieren un canal propio en Shopify, o que necesitan rehacer el que tienen. Trabajamos igual de bien con un gran comercio que vende mucho en tienda física y nunca ha estado online. Si todavía no has vendido por ningún canal, evaluamos el proyecto con cuidado antes de decidir si podemos trabajar juntos, y te lo decimos con claridad en la llamada.',
    },
    {
      lead: 'Preservamos lo que ya funciona.',
      body: 'Antes de construir o migrar, listamos las URLs y el catálogo que no se pueden perder, porque tu posicionamiento y tu histórico no deberían perderse por una mudanza.',
    },
    {
      lead: 'Te dejamos una tienda que puedes operar.',
      body: 'Cuando publicamos, tú cambias un precio, sumas una variante o revisas un pago sin depender de nosotros para lo básico. Un montaje que no puedes tocar no te sirve.',
    },
    {
      lead: 'Primero la llamada, después el presupuesto.',
      body: 'En 30 a 40 minutos miramos tu web y te decimos el alcance. El precio lo hablamos en esa misma conversación, con tu caso delante.',
    },
  ],
} as const;

export const FAQ_ITEMS = [
  {
    question: '¿Qué es Shopify?',
    answer:
      'Shopify es la plataforma de ecommerce sobre la que construimos o migramos tu tienda. Es un sistema alojado que se encarga del hosting, de la seguridad del pago y de las actualizaciones, así que tú te concentras en vender. Ahí viven el catálogo, las páginas de producto, las variantes y el flujo de compra, y el pedido se cierra en un canal que es tuyo. El día a día, como cambiar un precio o revisar un pago, también se resuelve en esa misma tienda.',
  },
  {
    question: '¿Qué hace una agencia Shopify como Playful?',
    answer:
      'Una agencia Shopify diseña, implementa y migra tiendas dentro de la plataforma para que tu marca venda en un canal propio. En nuestro caso, montamos el catálogo, las páginas de producto y el checkout, y te dejamos la tienda lista para que la operes tú. Empezamos siempre por una llamada corta para entender qué ya tienes y qué falta.',
  },
  {
    question: '¿Puedo migrar mi tienda a Shopify sin perder lo que ya funciona?',
    answer:
      'Sí. El trabajo empieza por listar qué hay que preservar, sobre todo las URLs que Google ya indexa y el catálogo que tus clientes navegan. Solo después movemos la estructura a Shopify. Toda migración tiene una ventana de cambio, así que la planificamos para que la interrupción sea la mínima y sepas de antemano cuándo se hace el salto.',
  },
  {
    question: '¿Shopify sirve para mi marca si ya vendo?',
    answer:
      'Trabajamos sobre todo con marcas que ya tienen ventas y necesitan un canal propio en Shopify, o que quieren rehacer el que ya tienen. Eso incluye a un gran comercio que factura en tienda física y nunca ha vendido online: ahí Shopify suele encajar muy bien. Si todavía no vendes por ningún canal, evaluamos el proyecto con cuidado en la llamada antes de decidir si podemos trabajar juntos, y en cualquier caso sales con una lectura clara de por dónde empezar.',
  },
  {
    question: '¿Trabajan con marcas fuera de España?',
    answer:
      'Sí. Playful es una empresa venezolana, con el equipo en Venezuela, y además estamos constituidos legalmente en Estados Unidos a través de una LLC, así que podemos facturar y contratar con marcas de fuera sin fricción. Hoy trabajamos con clientes en Venezuela, España y México, y las marcas de toda Latinoamérica son bienvenidas; la llamada la hacemos por videollamada estés donde estés. La plataforma y el método son los mismos, lo que cambia es tu catálogo y tu mercado, y eso lo miramos en tu caso.',
  },
  {
    question: '¿Qué pasa en la llamada de 30 a 40 minutos?',
    answer:
      'Miramos tu web y tu canal de venta contigo, ya sea un carrito a medias, una tienda que quieres migrar o un negocio que hoy vende en tienda física y quiere dar el salto a internet. Te decimos qué construiríamos o moveríamos a Shopify y qué conviene preservar. Sales con una lectura clara del alcance y sin compromiso de seguir.',
  },
  {
    question: '¿Dónde puedo ver su trabajo en Shopify?',
    answer:
      'Puedes ver dos implementaciones publicadas. El caso de Odwalla está en https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce y el de Jumex en https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce. En las dos páginas encuentras catálogo, colecciones, variantes y las vistas de escritorio y móvil de cada tienda en Shopify, para que juzgues el trabajo por lo que está publicado y no por lo que te contamos.',
  },
] as const;

export const FAQ = {
  h2: 'Preguntas frecuentes sobre Shopify',
  items: FAQ_ITEMS,
} as const;

export const CTA = {
  h2: 'Conversemos sobre tu tienda Shopify',
  body: 'Reserva 30 a 40 minutos y miramos tu web juntos. Sales con una lectura clara de qué habría que construir o migrar a Shopify para que venda mejor, sin compromiso de seguir con nosotros.',
  question: '¿Quieres que revisemos si tu web deja comprar a quien ya te eligió?',
  cta: '¿Hablamos?',
  formButton: 'Agenda tu llamada de 30 a 40 minutos',
} as const;

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
