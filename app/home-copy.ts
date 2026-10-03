import { CONTACT_HREF, SERVICE_BOOKING_HREF } from '@/utils/booking';

export const HOME_META = {
  title: 'Playful Agency: tu tienda online en Shopify o WooCommerce',
  description:
    'Creamos, migramos o rehacemos tu tienda online en Shopify, WooCommerce o Medusa, con 30 días de garantía tras la entrega. Reserva tu reunión.',
} as const;

export const HOME_HERO = {
  antetitulo:
    'Playful Agency, tiendas online en Shopify, WooCommerce, Medusa y apps móviles',
  h1: 'Tu tienda online, entregada a tiempo y lista para vender',
  subtitulo:
    'Diseñamos, desarrollamos y migramos tiendas online, y las publicamos en el plazo que acordamos contigo. Lo hemos hecho para Jumex, Odwalla y SoyTechno.',
  cuerpo: [
    'Si tu marca ya vende y quiere su propio canal, si tienes tienda física y quieres empezar a vender online o si tu proyecto hay que hacerlo desde cero o rehacerlo, la primera conversación es la misma.',
    'En 30 a 40 minutos miramos tu caso y te decimos qué plataforma, qué pagos y qué alcance le convienen a tu tienda.',
  ],
  shopifyAntes:
    'Si tu tienda ya funciona en Shopify o quieres migrar a Shopify, tienes todo el detalle en nuestra página de ',
  shopifyAnchor: 'agencia Shopify',
  shopifyHref: '/agencia-shopify',
  shopifyDespues: '.',
  ctaPrincipal: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
  microcopia:
    'La reunión es sin compromiso y el precio lo hablamos en ella, con tu caso delante.',
  ctaSecundario: 'O cuéntanos tu proyecto por el formulario',
  ctaSecundarioHref: CONTACT_HREF,
} as const;

export const HOME_PROBLEMAS = {
  h2: 'Por qué tu tienda online no termina de salir como la necesitas',
  intro:
    'Lo que más se escucha en las reuniones no tiene que ver con el producto, sino con proyectos que se alargan, tiendas que solo sabe tocar quien las montó y cobros que no están conectados con el inventario.',
  items: [
    {
      icon: '/images/diseno-confuso-obsoleto.png',
      h3: 'La tienda online se ha intentado lanzar más de una vez',
      body: [
        'Hay empresas que llevan dos o tres intentos de tienda online y ninguno ha llegado a publicarse, a veces porque se esperaba que lo resolviera la marca o el fabricante.',
        'Cada intento empieza de nuevo, con otro proveedor o con otra plataforma, y el canal propio sigue sin existir.',
      ],
    },
    {
      icon: '/images/velocidad-carga-lenta.png',
      h3: 'Cambiar un precio depende de otra persona',
      body: [
        'Si subir un producto, cambiar un precio o revisar un pedido exige escribir al proveedor, la tienda está hecha para quien la montó y no para tu equipo.',
        'Lo que se pide casi siempre es una tienda robusta y, sobre todo, fácil de administrar.',
      ],
    },
    {
      icon: '/images/errores-tecnicos-bugs.png',
      h3: 'Los pagos, las facturas y el stock van cada uno por su lado',
      body: [
        'Cuando el cobro está en la tienda y la factura y el inventario están en otro sistema, como el ERP (el programa de gestión de la empresa), cada pedido se cuadra a mano.',
        'Y si vendes en Venezuela, que puedas cobrar con pagos locales automáticos depende de la plataforma que elijas.',
      ],
    },
  ],
  cta: 'Reservar reunión para revisar tu tienda',
  ctaHref: SERVICE_BOOKING_HREF,
} as const;

export const HOME_METODO = {
  h2: 'Cómo trabajamos tu tienda online, de la primera reunión a la entrega',
  intro:
    'Cada proyecto pasa por las mismas tres fases, y en cada una sabes qué recibes y qué decides tú.',
  items: [
    {
      icon: '/images/desarrollo-web-a-medida.png',
      h3: 'Diseño con dos propuestas visuales',
      body: [
        'Antes de desarrollar nada, te presentamos dos propuestas visuales de tu tienda.',
        'Eliges sobre ellas y a partir de esa elección se construye, así que no llegas al final con un diseño que no esperabas.',
      ],
    },
    {
      icon: '/images/optimizacion-experiencia-usuario.png',
      h3: 'Desarrollo en la plataforma que encaja con tu forma de cobrar',
      body: [
        'La plataforma se elige por tus integraciones, tu catálogo y la forma en que cobras, no por la que suena más. Trabajamos en Shopify, en WooCommerce, en Medusa (una plataforma de código abierto para tiendas a medida) y en apps móviles, y conectamos la tienda con el sistema donde emites las facturas y llevas el inventario.',
      ],
    },
    {
      icon: '/images/seo-integrado.png',
      h3: 'Entrega con 30 días de garantía',
      body: [
        'Publicamos la tienda en el plazo acordado y te la dejamos lista para que tu equipo la opere sin depender de nosotros para lo básico.',
        'Durante los 30 días siguientes a la entrega, la garantía cubre cualquier error que aparezca.',
      ],
    },
  ],
  ecommerceAntes: 'El proceso completo está en nuestra página de ',
  ecommerceAnchor: 'agencia de e-commerce',
  ecommerceHref: '/agencia-e-commerce',
  ecommerceDespues: '.',
  pagosAntes: 'Los ',
  pagosAnchor: 'pagos venezolanos',
  pagosHref: '/pasarela-de-pago-ecommerce',
  pagosDespues:
    ' automáticos, como Instapago, los integramos en WooCommerce, en apps móviles y en Medusa, pero no en Shopify. Por eso, si vendes en Venezuela, la plataforma se decide a partir de ahí.',
  migracion:
    'Si migras, antes de mover nada hacemos la lista de las direcciones (URL) que Google ya conoce y del catálogo que tus clientes ya navegan, para que no pierdas el posicionamiento que traes.',
  cta: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
} as const;

export const HOME_CASOS = {
  h2: 'Casos de e-commerce: Jumex, Odwalla y SoyTechno',
  intro:
    'Son tres marcas de consumo con retos distintos. Jumex y Odwalla querían su canal de venta directa al consumidor en Shopify, y SoyTechno necesitaba que en Venezuela se comprara online pagando en bolívares, en divisas o a cuotas.',
  h3: '¿Tu tienda tiene un reto parecido?',
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
  h2: 'Lo que cuentan quienes han trabajado con Playful',
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
  h2: 'Guías de e-commerce para decidir plataforma, pagos y migración',
  intro:
    'Si todavía estás comparando plataformas, métodos de pago o cómo migrar sin perder posicionamiento, en el blog lo explicamos paso a paso para que llegues a la reunión con las dudas claras.',
  cta: 'Ver más artículos',
  href: '/blog',
} as const;

export const HOME_CTA_FINAL = {
  h2: 'Reserva 30 a 40 minutos y sal con el alcance de tu tienda online',
  parrafos: [
    'Miramos contigo tu tienda o tu proyecto, te decimos qué plataforma, qué pagos y qué fases le tocan, y hablamos del precio con tu caso delante.',
    'No hay compromiso de seguir con nosotros. Y si sigues, la garantía de 30 días cubre cualquier error que aparezca después de la entrega.',
  ],
  h3: '¿Vemos tu tienda juntos?',
  ctaPrincipal: 'Reservar reunión de 30 a 40 minutos',
  ctaHref: SERVICE_BOOKING_HREF,
  ctaSecundario: 'O escríbenos por el formulario',
  ctaSecundarioHref: CONTACT_HREF,
} as const;
