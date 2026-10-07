import { CONTACT_HREF, SERVICE_BOOKING_HREF } from '@/utils/booking';

export const HOME_META = {
  title: 'Playful Agency: tienda online de marca en Shopify y WooCommerce',
  description:
    'Diseñamos, integramos y migramos tiendas online de marcas de consumo en Shopify o WooCommerce, a tiempo y con 30 días de garantía. Reserva tu reunión.',
} as const;

export const HOME_HERO = {
  antetitulo:
    'Playful Agency, tiendas online para marcas de consumo en Shopify, WooCommerce, Medusa y apps móviles',
  h1: 'Tiendas online para marcas de consumo',
  subtitulo:
    'Diseñamos, desarrollamos e integramos la tienda online de marcas de consumo, y la publicamos en el plazo que acordamos con tu equipo. Lo hemos hecho para Jumex, Odwalla y SoyTechno.',
  cuerpo: [
    'Si tu equipo quiere abrir el canal de venta directa de la marca, llevar la tienda actual a otra plataforma o conectarla de una vez con la facturación y el inventario, el primer paso es una reunión.',
    'En 30 a 40 minutos revisamos el proyecto con tu equipo y te decimos qué plataforma, qué integraciones y qué fases necesita el canal.',
  ],
  shopifyAntes:
    'Si la tienda de tu marca ya funciona en Shopify o el plan es migrar a Shopify, tienes todo el detalle en nuestra página de ',
  shopifyAnchor: 'agencia Shopify',
  shopifyHref: '/agencia-shopify',
  shopifyDespues: '.',
  ctaPrincipal: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
  microcopia:
    'La reunión es sin compromiso y sirve para recoger la información del proyecto. Con ella preparamos el presupuesto y te lo presentamos en otra reunión, unos días después.',
  ctaSecundario: 'O cuéntanos el proyecto por el formulario',
  ctaSecundarioHref: CONTACT_HREF,
} as const;

export const HOME_PROBLEMAS = {
  h2: 'Por qué el canal online de una marca no avanza al ritmo que necesita su equipo',
  intro:
    'En las reuniones con equipos de marketing y de e-commerce se repiten casi siempre los mismos frenos, que son un lanzamiento que se aplaza, una operación que depende del proveedor y unas ventas y un stock que hay que cuadrar a mano.',
  items: [
    {
      icon: '/images/diseno-confuso-obsoleto.png',
      h3: 'El lanzamiento del canal se ha intentado más de una vez',
      body: [
        'Hay empresas que llevan dos o tres intentos de lanzar su tienda online y ninguno ha llegado a publicarse, a veces porque se esperaba que lo resolviera la casa matriz, el fabricante u otra de las partes implicadas.',
        'Cada intento vuelve a empezar con otro proveedor o con otra plataforma, el equipo no tiene una fecha de salida con la que planificar y el canal propio sigue sin existir.',
      ],
    },
    {
      icon: '/images/velocidad-carga-lenta.png',
      h3: 'La operación diaria depende del proveedor',
      body: [
        'Si subir un producto, cambiar un precio o revisar un pedido exige escribir al proveedor, el equipo que opera la tienda cada día tiene que esperar a otra persona para hacer su trabajo.',
        'Lo que piden los equipos casi siempre es una plataforma robusta y, sobre todo, fácil de administrar.',
      ],
    },
    {
      icon: '/images/errores-tecnicos-bugs.png',
      h3: 'Los pagos, la facturación y el inventario van cada uno por su lado',
      body: [
        'Cuando el cobro está en la tienda y la factura y el inventario viven en otro sistema, como el ERP (el programa de gestión de la empresa), cada pedido se cuadra a mano y las ventas y el stock no coinciden de un sistema a otro, así que medir el canal exige cruzar datos antes de poder leerlos.',
        'Y si la marca vende en Venezuela, que pueda cobrar con pagos locales automáticos depende de la plataforma que se elija.',
      ],
    },
  ],
  cta: 'Reservar reunión para revisar tu canal',
  ctaHref: SERVICE_BOOKING_HREF,
} as const;

export const HOME_METODO = {
  h2: 'Cómo trabajamos la tienda online de tu marca, de la primera reunión a la entrega',
  intro:
    'Cada proyecto pasa por las mismas tres fases, y en cada una tu equipo sabe qué recibe, qué tiene que aprobar y en qué momento.',
  items: [
    {
      icon: '/images/desarrollo-web-a-medida.png',
      h3: 'Diseño con dos propuestas visuales',
      body: [
        'Antes de desarrollar nada, presentamos a tu equipo dos propuestas visuales de la tienda.',
        'Tu equipo elige sobre ellas y a partir de esa elección se construye, así que el diseño queda aprobado antes de que empiece el desarrollo y nadie se encuentra al final con algo que no esperaba.',
      ],
    },
    {
      icon: '/images/optimizacion-experiencia-usuario.png',
      h3: 'Desarrollo e integraciones en la plataforma que encaja con tu operación',
      body: [
        'La plataforma se elige a partir de tus integraciones, tu catálogo y la forma en que cobras. Trabajamos en Shopify, en WooCommerce, en Medusa (una plataforma de código abierto para tiendas a medida) y en apps móviles. El proceso completo está en nuestra página de ',
        'La conexión con el sistema donde facturas y llevas el inventario es una fase del proyecto con su propio entregable, para que la tienda y la operación trabajen con los mismos datos de pedidos, facturas y stock.',
      ],
    },
    {
      icon: '/images/seo-integrado.png',
      h3: 'Entrega a tiempo con 30 días de garantía',
      body: [
        'Publicamos la tienda en el plazo acordado y la dejamos lista para que tu equipo la opere sin depender de nosotros para lo básico.',
        'Durante los 30 días siguientes a la entrega, la garantía cubre cualquier error que aparezca.',
      ],
    },
  ],
  ecommerceAntes: '',
  ecommerceAnchor: 'agencia de e-commerce',
  ecommerceHref: '/agencia-e-commerce',
  ecommerceDespues: '.',
  pagosAntes: 'Los ',
  pagosAnchor: 'pagos venezolanos',
  pagosHref: '/pasarela-de-pago-ecommerce',
  pagosDespues:
    ' automáticos, como Instapago, los instalamos en WooCommerce, en apps móviles y en Medusa, así que si tu marca vende en Venezuela la plataforma se elige teniendo eso en cuenta.',
  migracion:
    'Si migras, antes de mover nada hacemos la lista de las direcciones (URL) que Google ya conoce y del catálogo que tus clientes ya navegan, para que el canal conserve el posicionamiento que trae.',
  cta: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
} as const;

export const HOME_CASOS = {
  h2: 'Casos de e-commerce: Jumex, Odwalla y SoyTechno',
  intro:
    'Son tres marcas de consumo con catálogos y mercados distintos. Jumex y Odwalla necesitaban su canal de venta directa al consumidor en Shopify, y SoyTechno necesitaba que en Venezuela se comprara online pagando en bolívares, en divisas o a cuotas.',
  h3: '¿El canal de tu marca tiene un reto parecido?',
  items: [
    {
      slug: 'soytechno-ecommerce-venezuela',
      name: 'SoyTechno',
      tags: ['E-commerce en Venezuela'],
      body: 'Checkout en bolívares y divisas desde una sola pantalla, la primera integración nativa de Cashea en una tienda online venezolana para pagar a cuotas y el rastreo de MRW en tiempo real. SoyTechno cerró 2025 con 12.722 ventas, un 65 % más que en 2024.',
      cta: 'Ver el caso SoyTechno',
      href: '/casos-de-exito/soytechno-ecommerce-venezuela',
    },
    {
      slug: 'jumex-shopify-dtc-ecommerce',
      name: 'Jumex',
      tags: ['Shopify', 'Diseño de experiencia de usuario'],
      body: 'Jumex necesitaba llevar su portafolio de jugos, néctares y bebidas a un canal de venta directa. Su tienda en Shopify ordena el catálogo por colecciones, categorías y variantes, con fichas de producto pensadas para móvil y escritorio.',
      cta: 'Ver el caso Jumex',
      href: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
    },
    {
      slug: 'odwalla-shopify-dtc-ecommerce',
      name: 'Odwalla',
      tags: ['Shopify', 'Diseño de experiencia de usuario'],
      body: 'Odwalla dependía de marketplaces como Amazon y perdía la relación directa con su comprador. Su tienda en Shopify reúne colecciones, variantes y fichas con la información nutricional de cada producto.',
      cta: 'Ver el caso Odwalla',
      href: '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
    },
  ],
} as const;

export const HOME_TESTIMONIOS = {
  h2: 'Lo que cuentan los equipos de e-commerce que han trabajado con Playful',
  intro:
    'Federico Vera es e-Commerce Consultant de Odwalla y Eva Cristina Luciani es e-Commerce Manager de SoyTechno.',
  destacados: [
    {
      quote:
        'Uno de los grandes logros fue que cumplimos con los plazos establecidos para las páginas web, algo clave para nuestro cliente final. Esto no solo generó buenos resultados, sino que también nos abrió la puerta para avanzar con nuevos proyectos. Estamos muy contentos.',
      name: 'Federico Vera',
      role: 'e-Commerce Consultant de Odwalla',
    },
    {
      quote:
        'Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más. No sólo se quedaron con la idea de vender el producto, sino que también buscaron más soluciones, como agregar un comparador de productos para que la gente pueda verlo.',
      name: 'Eva Cristina Luciani',
      role: 'e-Commerce Manager de SoyTechno',
    },
  ],
} as const;

export const HOME_ALIADOS = {
  titulo: 'Marcas y aliados con los que trabajamos',
} as const;

export const HOME_BLOG = {
  h2: 'Guías de e-commerce para decidir plataforma, pagos, integraciones y migración',
  intro:
    'Si tu equipo todavía está comparando plataformas, métodos de pago o cómo migrar sin perder posicionamiento, en el blog lo explicamos paso a paso, para que llegue a la reunión con las preguntas claras.',
  cta: 'Ver más artículos',
  href: '/blog',
} as const;

export const HOME_CTA_FINAL = {
  h2: 'Reserva 30 a 40 minutos y sal con el alcance del proyecto',
  parrafos: [
    'Revisamos con tu equipo la tienda o el proyecto, recogemos toda la información que necesitamos y te decimos qué plataforma, qué integraciones y qué fases necesita el canal. Con eso preparamos el presupuesto y te lo presentamos en otra reunión, unos días después, aunque si lo necesitas antes podemos darte una cifra aproximada en la primera.',
    'No hay compromiso de seguir con nosotros. Y si sigues adelante, la garantía de 30 días cubre cualquier error que aparezca después de la entrega.',
  ],
  h3: '¿Revisamos juntos el canal de tu marca?',
  ctaPrincipal: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
  ctaSecundario: 'O escríbenos por el formulario',
  ctaSecundarioHref: CONTACT_HREF,
} as const;
