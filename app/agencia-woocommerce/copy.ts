import type { AgencyLandingCopy } from '@/lib/agency-copy-landing';

export const WOOCOMMERCE_META = {
  title: 'Agencia WooCommerce: tienda y cobros | Playful Agency',
  description:
    'Agencia WooCommerce para montar, conectar y mejorar tu tienda en WordPress, con Redsys y Bizum en España y pagos automáticos en Venezuela. Reserva reunión.',
  path: '/agencia-woocommerce',
  serviceName: 'Agencia WooCommerce',
} as const;

export const CTA_LABEL = 'Reserva una reunión de 30 a 40 minutos';

export const WOOCOMMERCE_COPY: AgencyLandingCopy = {
  meta: WOOCOMMERCE_META,
  ctaLabel: CTA_LABEL,
  hero: {
    h1: 'Agencia WooCommerce para montar, conectar y mejorar tu tienda online',
    paragraphs: [
      'Si buscas una agencia WooCommerce, lo normal es que tengas una tienda en WordPress que quieres montar, conectar con tu inventario o mejorar porque se ha quedado atrás. En Playful somos una agencia WooCommerce que diseña la tienda, la conecta con tu cobro y con tus sistemas, y la mantiene después de la entrega.',
      'Conectamos el cobro con el banco con el que ya trabajas en España, y en Venezuela WooCommerce es la plataforma con la que integramos los pagos locales de forma automática. Trabajamos con tiendas que ya funcionan, con tiendas físicas que dan el paso a internet y con proyectos que empiezan desde cero.',
    ],
  },
  sections: [
    {
      h2: 'Qué hacemos en tu tienda WooCommerce',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Diseñamos la tienda para el móvil y el ordenador, con fichas que enseñan lo que el comprador necesita para decidir. Cuando el proyecto incluye diseño, te presentamos 2 propuestas visuales y eliges sobre ellas, como contamos en nuestra página de [agencia de diseño web](https://playfulagency.com/agencia-diseno-web).',
        },
        {
          type: 'p',
          text: 'Desarrollamos el catálogo, las variantes y el checkout dentro de WooCommerce, y dejamos el panel fácil de administrar para que tu equipo cambie precios, suba productos y revise pedidos sin depender de nosotros.',
        },
        {
          type: 'p',
          text: 'Si tu proyecto va más allá de la tienda, en nuestra página de [agencia de e-commerce](https://playfulagency.com/agencia-e-commerce) tienes todo lo que hacemos alrededor.',
        },
      ],
    },
    {
      h2: 'Mejora y mantenimiento de tu tienda WooCommerce',
      variant: 'mint',
      blocks: [
        {
          type: 'p',
          text: 'Muchas tiendas WooCommerce funcionan, pero con plugins que nadie actualiza, un tema que se ha quedado viejo o un buscador que no encuentra los productos. Si ya tienes la tienda, partimos de ella y la mejoramos sin empezar de cero.',
        },
        {
          type: 'p',
          text: 'Revisamos el tema y los plugins, los actualizamos con orden y comprobamos que el checkout, el envío y los cobros siguen funcionando después de cada cambio. También corregimos los fallos que más molestan al comprador, como un filtro que no responde o un formulario de envío que pierde datos.',
        },
        {
          type: 'p',
          text: 'Cuando la tienda pide más, la hacemos evolucionar con funciones nuevas, como un comparador de productos o un club de puntos. Trabajamos sobre la tienda en marcha, para que tus clientes sigan comprando mientras tanto.',
        },
      ],
    },
    {
      h2: 'Conectamos WooCommerce con tu inventario y tu facturación',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Hay equipos que tienen el inventario y la facturación en un ERP propio, o en un programa contable que no siempre cuadra con lo que pasa en la tienda. Conectar la tienda con ese sistema es una fase del proyecto, con su propio entregable.',
        },
        {
          type: 'p',
          text: 'Cualquier software que tenga API o webhooks nos permite conectarnos, y si no los tiene, construimos lo necesario. Así el stock que ve el comprador sale del mismo sitio donde tu equipo lo carga, y cada pedido llega a facturación sin copiarlo a mano.',
        },
      ],
    },
    {
      h2: '¿WordPress se te queda corto?',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'Hay quien piensa que WordPress es más fácil de montar, pero que se queda corto frente a plataformas como Magento. WordPress es el gestor de contenidos y la tienda la pone WooCommerce, que es la plataforma de ecommerce de código abierto para WordPress, con el núcleo gratuito.',
        },
        {
          type: 'p',
          text: 'Por eso elegimos plataforma por las integraciones, el catálogo y la forma de cobro. Si WooCommerce tiene los conectores que necesitas, te da control del código y de tus datos, y lo que no te guste del panel se ajusta durante el proyecto. Si quieres entender primero qué es WordPress, lo explicamos en [qué es WordPress y por qué usarlo](https://playfulagency.com/blog/tecnologia/que-es-wordpress-por-que-tengo-que-usarlo).',
        },
      ],
    },
    {
      h2: 'Cobros en WooCommerce: Redsys y Bizum en España, pagos automáticos en Venezuela',
      variant: 'purple',
      blocks: [
        {
          type: 'p',
          text: 'En España, para conectar WooCommerce con Redsys usamos la pasarela oficial que Redsys publica para WooCommerce, que se conecta con el TPV virtual que tienes contratado con tu banco. Según la propia Redsys, esa pasarela incluye el pago con Bizum.',
        },
        {
          type: 'p',
          text: 'En Venezuela, WooCommerce es nuestra plataforma probada para cobrar de forma automática con SiTef, Instapago, Cashea, Banesco, Zelle y BDV. Hacemos lo mismo en apps y en tiendas sobre Medusa, así que el pago se confirma en el pedido sin que nadie lo valide a mano.',
        },
        {
          type: 'p',
          text: 'Integramos Zelle en tiendas de marcas que ya tienen su cuenta, y lo contamos en [Zelle en Venezuela como método de pago para tu ecommerce](https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce). Para vender fuera con cobro internacional, trabajamos con Shopify, como explicamos en nuestra página de [agencia Shopify](https://playfulagency.com/agencia-shopify).',
        },
      ],
    },
    {
      h2: 'Casos publicados',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'En Venezuela, [SoyTechno](https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela) es una tienda de tecnología hecha en WooCommerce. Desarrollamos un Smart Checkout que deja pagar en bolívares o en divisas desde una sola pantalla y la primera integración nativa de Cashea en un ecommerce venezolano.',
        },
        {
          type: 'quote',
          quote:
            '«Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más. No sólo se quedaron con la idea de vender el producto, sino que también buscaron más soluciones, como agregar un comparador de productos para que la gente pueda verlo.»',
          attribution: 'Eva Cristina Luciani, e-Commerce Manager de Soytechno.com.',
        },
        {
          type: 'p',
          text: 'En España, nuestros casos publicados son de consumo masivo. [Jumex](https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce) y [Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce) son dos tiendas en Shopify en las que trabajamos el catálogo, las colecciones, las variantes y las vistas de escritorio y móvil.',
        },
      ],
    },
    {
      h2: 'SEO para tu tienda WooCommerce',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Trabajamos la tienda y su posicionamiento desde el mismo equipo, así que cada categoría, cada ficha y cada cambio de estructura se piensa también para Google. Si quieres ver cómo trabajamos el SEO fuera de la tienda, lo tienes en nuestra página de [agencia SEO](https://playfulagency.com/agencia-seo).',
        },
      ],
    },
  ],
  process: {
    h2: 'Cómo trabajamos contigo',
    steps: [
      {
        lead: 'Reunión de 30 a 40 minutos.',
        body: 'Nos cuentas qué vendes y cómo está tu tienda, y si ya está en marcha la miramos juntos.',
      },
      {
        lead: 'Dos propuestas visuales.',
        body: 'Cuando el proyecto incluye diseño, te presentamos exactamente 2 propuestas visuales y eliges sobre ellas.',
      },
      {
        lead: 'Desarrollo e integraciones.',
        body: 'Montamos o mejoramos la tienda y la conectamos con el cobro, el inventario y la facturación que hayamos acordado.',
      },
      {
        lead: 'Entrega con garantía de 30 días.',
        body: 'Durante los 30 días siguientes a la entrega, corregimos cualquier error que aparezca en lo que hemos hecho.',
      },
    ],
  },
  faq: {
    h2: 'Preguntas frecuentes sobre WooCommerce',
    items: [
      {
        question: '¿Qué hace una agencia WooCommerce como Playful?',
        answer:
          'Diseñamos, desarrollamos y mantenemos tiendas WooCommerce. Montamos el catálogo y el checkout, conectamos la tienda con tu cobro y con tu ERP, y la mejoramos después de la entrega si lo necesitas.',
      },
      {
        question: 'Ya tengo una tienda WooCommerce. ¿Podéis mejorarla sin rehacerla?',
        answer:
          'Sí. Partimos de la tienda que tienes, revisamos el tema y los plugins, corregimos los fallos que más afectan al comprador y añadimos las funciones que falten. Solo proponemos rehacerla si en la reunión vemos que te sale mejor.',
      },
      {
        question: '¿Podéis conectar WooCommerce con Redsys y Bizum en mi tienda?',
        answer:
          'Sí. Redsys publica una pasarela oficial para WooCommerce que incluye Bizum, y la conectamos con el TPV virtual que tengas contratado con tu banco. En la reunión revisamos qué tienes contratado y cómo queda en tu checkout.',
      },
      {
        question: '¿WooCommerce o Shopify?',
        answer:
          'Depende de tus integraciones y de dónde cobras. WooCommerce te da control del código y es nuestra plataforma para cobros automáticos en Venezuela. Shopify encaja si prefieres no ocuparte del servidor o si vendes fuera con cobro internacional.',
      },
      {
        question: '¿Cuánto se tarda en tener la tienda lista?',
        answer:
          'El plazo depende del tamaño del catálogo, de las integraciones con tu ERP y con el cobro, y de lo rápido que lleguen los contenidos. En la reunión te damos el plazo para tu caso con esos datos delante.',
      },
      {
        question: '¿Qué cubre la garantía de 30 días?',
        answer:
          'Cubre cualquier error que aparezca en nuestro trabajo durante los 30 días siguientes a la entrega. Si algo falla en ese plazo, lo corregimos.',
      },
      {
        question: '¿Trabajáis con marcas fuera de España?',
        answer:
          'Sí. Playful es una empresa venezolana, con el equipo en Venezuela y constituida en Estados Unidos con una LLC, y hoy trabajamos con clientes en Venezuela, España y México. La reunión la hacemos por videollamada estés donde estés.',
      },
    ],
  },
  closing: {
    h2: 'Hablemos de tu tienda WooCommerce',
    body: 'Reserva 30 a 40 minutos y miramos tu tienda contigo, la que ya tienes o la que quieres montar. Sales con una lectura clara de qué haríamos en WooCommerce y con 30 días de garantía sobre lo que entreguemos.',
  },
};

export { SERVICE_BOOKING_HREF } from '../../utils/booking.ts';
