import type { AgencyLandingCopy } from '@/lib/agency-copy-landing';

export const PRESTASHOP_META = {
  title: 'Agencia PrestaShop: tienda, catálogo y SEO | Playful Agency',
  description:
    'Agencia PrestaShop para tu tienda: catálogo, fichas, SEO y cobros desde el mismo equipo. Reserva 30 a 40 minutos y miramos tu tienda con Playful Agency.',
  path: '/agencia-prestashop',
  serviceName: 'Agencia PrestaShop',
} as const;

export const CTA_LABEL = 'Reserva una reunión de 30 a 40 minutos';

export const PRESTASHOP_COPY: AgencyLandingCopy = {
  meta: PRESTASHOP_META,
  ctaLabel: CTA_LABEL,
  hero: {
    h1: 'Agencia PrestaShop para tu tienda: catálogo, SEO y cobros',
    paragraphs: [
      'Cuando comparas agencias PrestaShop, lo que quieres saber es quién se ocupa de tu tienda cada vez que hay que cambiar algo. En Playful somos una agencia PrestaShop que lleva el catálogo, las fichas, el backoffice, el SEO y el cobro desde el mismo equipo.',
      'Hoy es habitual que uno toque el servidor, otro instale un módulo y otro escriba las fichas, y que nadie revise si Google encuentra la tienda. Nosotros lo juntamos todo y te decimos con claridad cuándo te conviene seguir en PrestaShop y cuándo te conviene migrar a Shopify.',
      'Trabajamos con tiendas que ya funcionan, con tiendas físicas que dan el paso a internet y con proyectos que empiezan desde cero o que necesitan rehacer una tienda.',
    ],
  },
  sections: [
    {
      h2: 'Qué hacemos en tu tienda PrestaShop',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Hay marcas que llegan después de uno o dos intentos de tienda que no terminaron de salir. Otras tienen un equipo que conoce muy bien su producto, pero que nunca ha llevado una tienda online y espera que alguien marque cómo tiene que funcionar para quien compra.',
        },
        {
          type: 'p',
          text: 'En los dos casos empezamos por decidir contigo qué tiene que hacer la tienda. A partir de ahí ordenamos el catálogo, escribimos las fichas, dejamos el SEO configurado dentro de PrestaShop y conectamos la tienda con el cobro y con los sistemas donde facturas.',
        },
        {
          type: 'p',
          text: 'Si quieres ver cómo cuidamos la experiencia de compra, lo contamos en nuestra página de [agencia UX UI](https://playfulagency.com/agencia-ux-ui). Y si tu proyecto va más allá de la plataforma, en nuestra página de [agencia de e-commerce](https://playfulagency.com/agencia-e-commerce) tienes todo lo que hacemos alrededor de la tienda.',
        },
      ],
    },
    {
      h2: 'Catálogo, fichas y un backoffice fácil de administrar',
      variant: 'mint',
      blocks: [
        {
          type: 'p',
          text: 'El backoffice es el panel desde el que tu equipo da de alta productos, cambia precios, revisa pedidos y atiende a los clientes. Por eso lo dejamos fácil de administrar para las personas que lo usan cada día.',
        },
        {
          type: 'p',
          text: 'Organizamos las categorías y las combinaciones, que es como PrestaShop llama a las variantes de un producto, como la talla o el color. Así tu equipo encuentra cada cosa donde espera y no repite el mismo trabajo en varias pantallas.',
        },
        {
          type: 'p',
          text: 'En cada ficha cuidamos el nombre, la descripción, las imágenes y los datos que el comprador necesita para decidir. También dejamos escritos los campos que lee Google, como la URL amigable de cada producto y de cada categoría, y el título y la descripción para buscadores que PrestaShop gestiona desde la página «SEO y URLs».',
        },
        {
          type: 'p',
          text: 'Todo queda hecho y explicado, para que tu equipo siga dando de alta productos con el mismo criterio cuando terminamos.',
        },
      ],
    },
    {
      h2: 'SEO para tiendas PrestaShop',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'Como agencia SEO PrestaShop, trabajamos la tienda y su posicionamiento desde el mismo equipo. Así cada categoría nueva, cada ficha y cada cambio de estructura se piensa también para Google, y nadie se entera tarde de un cambio en el catálogo.',
        },
        {
          type: 'p',
          text: 'En PrestaShop hay ajustes técnicos que pesan mucho en el SEO. Las URL amigables solo funcionan si el servidor admite la reescritura de URL, y la documentación oficial avisa de que activarlas en un servidor que no la admite puede dejar la tienda sin acceso para los clientes. Por eso lo comprobamos antes de tocar nada.',
        },
        {
          type: 'p',
          text: 'Activamos la URL canónica, que es la etiqueta que le dice a Google cuál es la dirección principal cuando una misma página tiene varias, y revisamos que el tema la incluya bien. Desde la versión 1.7.6, la URL canónica de un producto con combinaciones apunta a la combinación por defecto, así que elegimos bien esa combinación y cuidamos su texto.',
        },
        {
          type: 'p',
          text: 'Con el archivo `robots.txt`, que indica a los buscadores qué partes de la tienda no deben rastrear, tenemos en cuenta que PrestaShop sustituye el archivo entero cada vez que lo regenera. Las reglas propias las añadimos después.',
        },
        {
          type: 'p',
          text: 'Si quieres ver cómo trabajamos el posicionamiento fuera de la tienda, lo tienes en nuestra página de [agencia SEO](https://playfulagency.com/agencia-seo).',
        },
      ],
    },
    {
      h2: 'Mantenimiento de tu tienda PrestaShop',
      variant: 'cream',
      blocks: [
        {
          type: 'p',
          text: 'Una tienda PrestaShop también se lleva en el día a día. PrestaShop tiene miles de módulos y temas, según su propia web, y elegir cuáles instalar, configurarlos y comprobar que no se pisan entre ellos es trabajo de la tienda.',
        },
        {
          type: 'p',
          text: 'Revisamos los módulos y el tema cuando hay que actualizarlos, comprobamos que el cobro y el envío siguen funcionando después de cada cambio y hablamos con tu proveedor de hosting cuando el servidor necesita algo, como la reescritura de URL.',
        },
      ],
    },
    {
      h2: 'Cobros en PrestaShop con Redsys y Bizum',
      variant: 'purple',
      blocks: [
        {
          type: 'p',
          text: 'Si cobras con el TPV virtual de tu banco, que es el terminal con el que cobras con tarjeta por internet, Redsys publica una pasarela oficial para PrestaShop. Según la propia Redsys, esa pasarela incluye el pago con Bizum.',
        },
        {
          type: 'p',
          text: 'En la reunión vemos qué tienes contratado con tu banco y cómo encaja en el checkout de tu tienda.',
        },
      ],
    },
    {
      h2: 'Si PrestaShop se te queda corto, migramos tu tienda a Shopify',
      variant: 'purple',
      blocks: [
        {
          type: 'p',
          text: 'A veces la tienda crece y PrestaShop deja de encajar con cómo quiere trabajar tu equipo, por ejemplo porque prefiere no depender del servidor y de los módulos para cada cambio. En ese caso te ayudamos a migrar a Shopify, y en nuestra página de [agencia Shopify](https://playfulagency.com/agencia-shopify) tienes todo lo que incluye la mudanza.',
        },
        {
          type: 'p',
          text: 'Lo que más cuidamos en una migración son las direcciones que ya posicionan. PrestaShop construye por defecto la URL de un producto con la categoría, un número y el nombre, y Shopify usa rutas propias para productos y colecciones, así que las direcciones cambian.',
        },
        {
          type: 'p',
          text: 'Por eso redirigimos cada URL antigua con un 301, la redirección permanente que le indica a Google cuál es la dirección nueva. Shopify permite importar esas redirecciones en un archivo CSV, que es un archivo de texto con los datos separados por comas, y después revisamos que todas funcionen.',
        },
        {
          type: 'p',
          text: 'Si prefieres quedarte en PrestaShop, seguimos trabajando la tienda donde está y la migración queda como opción para cuando la necesites.',
        },
      ],
    },
    {
      h2: 'Casos publicados',
      variant: 'plain',
      blocks: [
        {
          type: 'p',
          text: 'En España, nuestros casos publicados son de consumo masivo. [Jumex](https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce) y [Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce) son dos tiendas en Shopify, con catálogo, colecciones, variantes y vistas de escritorio y móvil, y son el destino que trabajamos cuando una tienda PrestaShop se muda.',
        },
        {
          type: 'quote',
          quote:
            '«Personalmente me siento mucho más seguro desde que trabajo con ustedes. Me han quitado una carga de trabajo importante y el proceso ha sido cero estresante.»',
          attribution: 'Federico Vera, e-Commerce Consultant de Odwalla.',
        },
        {
          type: 'p',
          text: 'En Venezuela, nuestro caso publicado es [SoyTechno](https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela), una tienda de tecnología.',
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
        lead: 'Construcción o mejora de la tienda.',
        body: 'Trabajamos el catálogo, las fichas, el SEO, el cobro y las integraciones que hayamos acordado.',
      },
      {
        lead: 'Entrega con garantía de 30 días.',
        body: 'Durante los 30 días siguientes a la entrega, corregimos cualquier error que aparezca en lo que hemos hecho.',
      },
    ],
  },
  faq: {
    h2: 'Preguntas frecuentes sobre PrestaShop',
    items: [
      {
        question: '¿Qué hace una agencia PrestaShop como Playful?',
        answer:
          'Nos ocupamos de la tienda que ya tienes o de la que vas a tener. Ordenamos el catálogo, escribimos las fichas, dejamos el SEO configurado dentro de PrestaShop, conectamos el cobro y le enseñamos a tu equipo a llevar el backoffice. Si PrestaShop deja de encajar con tu negocio, también te ayudamos a migrar a Shopify.',
      },
      {
        question: '¿Qué tenemos que mirar al comparar agencias PrestaShop?',
        answer:
          'Lo primero es saber quién se ocupa de cada parte de la tienda cuando hay que cambiar algo. En Playful llevamos el catálogo, las fichas, el SEO y el cobro desde el mismo equipo, te presentamos 2 propuestas visuales cuando el proyecto incluye diseño y corregimos cualquier error durante los 30 días siguientes a la entrega. También te decimos con claridad si te conviene seguir en PrestaShop o migrar a Shopify.',
      },
      {
        question: '¿Trabajáis el SEO dentro de PrestaShop o hay que contratar otra agencia?',
        answer:
          'Lo trabajamos nosotros, dentro de la propia tienda y con el mismo equipo que la lleva. Eso incluye las URL amigables, la URL canónica, los títulos y descripciones para buscadores, el `robots.txt` y la estructura de categorías.',
      },
      {
        question: '¿Podéis migrar mi tienda de PrestaShop a Shopify sin perder las URLs que ya posicionan?',
        answer:
          'Las direcciones cambian, porque Shopify usa sus propias rutas para productos y colecciones. Redirigimos cada URL antigua con un 301 a su equivalente en Shopify, para que Google y tus clientes lleguen a la página nueva, y después revisamos que todas las redirecciones funcionen.',
      },
      {
        question: '¿Me conviene seguir en PrestaShop o pasar a Shopify?',
        answer:
          'Depende de cómo trabaja tu equipo y de lo que necesita tu tienda. PrestaShop es de código abierto y te deja controlar el servidor, los módulos y el código, lo que tiene sentido si tienes quien lo mantenga. Si prefieres no ocuparte del servidor ni de los módulos, en la reunión vemos con tu tienda delante si Shopify encaja mejor.',
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
      {
        question: '¿Qué pasa en la reunión de 30 a 40 minutos?',
        answer:
          'Nos cuentas qué vendes, cómo está hoy tu tienda y qué quieres cambiar. Si todavía no has llevado una tienda online, no hace falta que traigas nada preparado, porque parte de la reunión sirve para ordenar qué necesita la tuya. Al terminar sabes qué haríamos y si te conviene seguir en PrestaShop o migrar.',
      },
    ],
  },
  closing: {
    h2: 'Hablemos de tu tienda PrestaShop',
    body: 'Reserva 30 a 40 minutos y miramos tu tienda contigo. Sales con una lectura clara de qué haríamos en PrestaShop, o de cómo sería la mudanza a Shopify, y con 30 días de garantía sobre lo que entreguemos.',
  },
};

export { SERVICE_BOOKING_HREF } from '../../utils/booking.ts';
