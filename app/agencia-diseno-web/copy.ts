export const DISENO_META = {
  title: 'Agencia Diseño Web Personalizamos tu Web | Playful Agency',
  description:
    'Activa tu presencia en línea con una agencia diseño web que dé vida a tu marca. En Playful Agency, creamos ese sitio web.',
  path: '/agencia-diseno-web',
} as const;

export const HERO = {
  h1: 'Agencia de diseño web: Dando vida a tu visión en línea',
  body: 'Tu tienda recibe visitas, pero el diseño no las convierte en pedidos. Diseñamos o rediseñamos la página de lista de productos (PLP), la página de detalle de producto (PDP) y el checkout para que cada clic acerque a tu cliente a la compra, en Shopify o WooCommerce.',
  cta: 'Agenda tu llamada diagnóstica',
} as const;

export const AUDIENCE = {
  h2: 'Diseño para quien ya vende o quiere empezar a vender online',
  paragraphs: [
    'Si tu tienda online ya vende, sabes que no todas las visitas terminan en pedido. Hay quien no encuentra el producto que buscaba, quien no resuelve su duda en la ficha y quien abandona en el checkout porque hay un paso de más o porque no aparece su forma de pago. Cada una de esas visitas llegó a tu tienda con intención de comprar, y un buen diseño puede convertir una parte de ellas en ventas.',
    'No todas las marcas llegan en el mismo punto. Algunas ya tienen una tienda que vende, pero que se quedó corta para su catálogo o para su forma de cobrar. Otras tienen tiendas físicas y quieren dar el paso a vender online. Y otras ya intentaron lanzar su tienda más de una vez y el proyecto nunca llegó a salir.',
    'Por eso el trabajo cambia según tu caso. A veces toca rediseñar la tienda que ya tienes, a veces conviene rehacerla en otra plataforma y a veces hay que construirla desde cero. Lo que se mantiene es la forma de decidir, porque partimos de tu catálogo, de cómo compra tu cliente y, si ya tienes tienda, de sus datos, y el resultado lo medimos en pedidos y en tasa de conversión.',
    'Para eso hace falta entender cómo se relacionan la estructura del catálogo, la ficha de producto y el flujo de compra, y diseñar cada pantalla pensando en que tu cliente llegue hasta el pago. Es el trabajo que hace nuestro [equipo de ecommerce](https://playfulagency.com/agencia-e-commerce), contigo y a partir de tu catálogo.',
  ],
} as const;

export const SCREENS = {
  h2: 'Lista de productos (PLP), detalle de producto (PDP), carrito y checkout',
  intro:
    'Los colores y la tipografía son importantes, porque son parte de cómo se reconoce tu marca, pero la venta se decide en cuatro pantallas, que son la página de lista de productos (PLP), la página de detalle de producto (PDP), el carrito y el checkout.',
  items: [
    {
      body: '**PLP (página de lista de productos).** Es la primera pantalla donde tu cliente recorre el catálogo. Organizamos colecciones, filtros y jerarquía visual para que encuentre lo que busca sin fricciones. Cuando implementamos la tienda de Jumex en Shopify, estructuramos el catálogo con colecciones y categorías para que los productos pudieran descubrirse desde distintas rutas de navegación, tanto en escritorio como en móvil.',
    },
    {
      body: '**PDP (página de detalle de producto).** La ficha de producto es donde tu cliente decide si compra o se va. Diseñamos plantillas con galería, información comercial, selección de variantes y contenido que resuelve objeciones. En el caso de [Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce), las fichas incluyen galería, descripción, información nutricional y opciones de producto dentro de Shopify, porque en una marca de bebidas el contenido nutricional es parte de la decisión de compra.',
    },
    {
      body: '**Carrito y checkout.** Son los pasos donde se concentran los abandonos. Reducimos campos, aclaramos costos y quitamos distracciones para que quien ya decidió comprar no tenga motivos para salir. También cuenta cómo se confirma el pago, porque hay tiendas que todavía validan cada pago a mano y el cliente se queda esperando. Si vendes en Venezuela, en WooCommerce podemos implementar una cantidad importante de métodos de pago automáticos, como Instapago, SITEF, Banesco Panamá, Cashea y Zelle con validación automática para marcas que ya reciben pagos por Zelle, así que el pedido se confirma sin que nadie tenga que revisar cada transferencia.',
    },
  ],
  outro:
    'Cada una de estas pantallas tiene un trabajo concreto dentro del flujo de compra, y las diseñamos como un sistema conectado en el que cada paso prepara el siguiente.',
} as const;

export const PLATFORMS = {
  h2: 'Shopify y WooCommerce',
  intro:
    'Trabajamos con Shopify y con WooCommerce porque son las dos plataformas que cubren la mayoría de los casos reales de marcas que venden online, y elegimos una u otra según lo que necesita tu tienda.',
  items: [
    {
      body: '**Shopify** es donde hemos implementado proyectos como [Jumex](https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce) y [Odwalla](https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce), con configuración de catálogo por colecciones, variantes, plantillas de producto y vistas responsive para escritorio y móvil. Si tu marca vende en Shopify o necesita migrar a Shopify, puedes ver cómo lo hacemos en [nuestra página de Shopify](https://playfulagency.com/agencia-shopify).',
    },
    {
      body: '**WooCommerce** es la opción cuando tu tienda ya vive en WordPress o cuando necesitas integraciones que Shopify no cubre de forma nativa, como los métodos de pago locales en Venezuela. Aplicamos la misma lógica de conversión en la estructura de catálogo, en la ficha de producto y en el checkout. Así trabajamos con [SoyTechno](https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela), una tienda de tecnología en Venezuela que vende en WooCommerce. Integramos un checkout multimoneda en bolívares y divisas, la primera integración nativa de Cashea en un ecommerce venezolano y un flujo de Zelle en el que el correo de confirmación del banco se cruza con la orden, así que el equipo de SoyTechno recibe los pedidos ya prevalidados y no tiene que perseguir cada pago.',
    },
  ],
  outro:
    'Sea cual sea la plataforma, el enfoque es el mismo. No te entregamos un tema para que lo configures tú. Te entregamos una tienda lista para funcionar, en la que cada pantalla está pensada para que tu cliente avance hacia la compra.',
} as const;

export const CRO = {
  h2: 'CRO: optimización de conversión',
  paragraphs: [
    'Diseñar para conversión no se limita a cambiar el tema, los banners o las fotos de portada y esperar que la tienda venda más. Es un proceso de análisis, hipótesis y medición que aplicamos antes, durante y después del diseño o el rediseño.',
    'Antes de tocar el diseño, analizamos el flujo actual de tu tienda: dónde entran los visitantes, en qué pantallas se quedan y en qué punto abandonan. Ese diagnóstico nos dice qué pantallas necesitan intervención y qué tipo de cambio tiene más impacto potencial.',
    'Durante el diseño, cada decisión responde a una hipótesis de conversión. No movemos un bloque de sitio porque quede mejor visualmente, sino porque los datos indican que ese cambio puede reducir la fricción en un punto específico del flujo de compra. Y después del lanzamiento, medimos el resultado para confirmar que el cambio funcionó o para iterar si hace falta.',
    'Esa forma de trabajar es la que distingue un diseño o un rediseño de tienda orientado a conversión de uno puramente estético. Si lo que necesitas es tener la tienda publicada cuanto antes y no tienes tiempo de entrar en ese detalle, probablemente no somos la mejor opción. Pero si quieres que tu tienda convierta las visitas que ya recibe, o si tienes tiendas físicas y quieres empezar a vender online con ese mismo cuidado, podemos ayudarte. Nuestro equipo de [UX/UI](https://playfulagency.com/agencia-ux-ui) trabaja integrado con el equipo de CRO para que el diseño y la optimización no sean procesos separados.',
  ],
} as const;

export const PROCESS = {
  h2: 'Cómo trabajamos',
  intro:
    'El proceso tiene cuatro fases. Las propuestas visuales forman parte del trabajo, pero no instalamos una plantilla prehecha sin adaptarla a tu marca, no tomamos atajos y no te dejamos solo cuando la tienda sale a producción. Cada fase tiene entregables concretos y criterios claros para pasar a la siguiente, y te acompañamos en todas.',
  steps: [
    {
      body: '**1. Diagnóstico.** Analizamos tu tienda actual, tu catálogo, tus datos de tráfico y tu flujo de compra. Identificamos los puntos de fuga y las pantallas con mayor potencial de mejora. Este paso suele tomar la primera llamada diagnóstica y una auditoría técnica inicial.',
    },
    {
      body: '**2. Estrategia de diseño.** Definimos la estructura del catálogo, el flujo de navegación y la jerarquía de cada pantalla clave (PLP, PDP, carrito, checkout). El entregable es un mapa de pantallas con la lógica de conversión documentada, antes de pasar a diseño visual.',
    },
    {
      body: '**3. Diseño e implementación.** Diseñamos e implementamos en tu plataforma (Shopify o WooCommerce), con vistas responsive para escritorio y móvil. La implementación la hace nuestro propio equipo de desarrollo, el mismo que trabaja con el equipo de diseño, y eso es lo que nos permite ir más allá de lo que trae una plantilla, por ejemplo conectar en el checkout varios métodos de pago locales. Cada pantalla se valida contra la estrategia de conversión que definimos contigo.',
    },
    {
      body: '**4. Medición e iteración.** Después del lanzamiento, medimos el comportamiento real de los visitantes y ajustamos. Un rediseño no termina cuando se publica; termina cuando los datos confirman que convierte mejor que la versión anterior.',
    },
  ],
} as const;

export const CASES = {
  h2: 'Casos',
  intro:
    'Estos son proyectos que hemos implementado. No publicamos métricas comerciales que no podamos respaldar, así que lo que vas a leer es el alcance real de cada proyecto, documentado en nuestras fichas de caso.',
  items: [
    {
      title: 'Jumex: implementación de ecommerce en Shopify',
      href: 'https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce',
      body: 'Implementamos la tienda de Jumex en Shopify, estructurando el catálogo completo con colecciones, categorías y variantes. Las plantillas de producto incluyen galería, información comercial y selección de variantes, con vistas adaptadas a escritorio y móvil. La navegación permite recorrer el catálogo desde distintos puntos de entrada.',
      quotes: [
        {
          attribution: 'Federico Vera, e-Commerce Consultant, lo resumió así:',
          text: 'Gracias a este proyecto, hemos empezado conversaciones con otros clientes para ofrecer una línea de servicios que antes no manejábamos. Ha sido una evolución natural y valiosa para nuestro portafolio.',
        },
      ],
    },
    {
      title: 'Odwalla: implementación de ecommerce en Shopify',
      href: 'https://playfulagency.com/casos-de-exito/odwalla-shopify-dtc-ecommerce',
      body: 'Configuramos la tienda de Odwalla en Shopify con colecciones, variantes, fichas de producto con información nutricional y vistas responsive. Las plantillas estructuran galería, descripciones y contenido nutricional porque, en una marca de bebidas, esa información es parte integral de la experiencia de compra.',
      quotes: [
        {
          attribution: 'Federico Vera, e-Commerce Consultant de Odwalla, comentó:',
          text: 'Personalmente me siento mucho más seguro desde que trabajo con ustedes. Me han quitado una carga de trabajo importante y el proceso ha sido cero estresante.',
        },
        {
          attribution: 'Y sobre los resultados del proyecto:',
          text: 'Uno de los grandes logros fue que cumplimos con los plazos establecidos para las páginas web, algo clave para nuestro cliente final. Esto no solo generó buenos resultados, sino que también nos abrió la puerta para avanzar con nuevos proyectos. Estamos muy contentos.',
        },
      ],
    },
  ],
} as const;

export const FAQ_ITEMS = [
  {
    question: '¿Diseñan tiendas desde cero o solo rediseñan tiendas existentes?',
    answer:
      'Hacemos ambas cosas. Si tu marca ya tiene una tienda que no convierte como necesitas, rediseñamos el flujo completo de PLP a checkout o la rehacemos en otra plataforma. Si tienes tiendas físicas y vas a vender online por primera vez, o si ya lo intentaste antes y la tienda no llegó a salir, la implementamos desde la estructura de catálogo hasta el checkout, con la misma lógica de conversión.',
  },
  {
    question: '¿Trabajan solo con Shopify?',
    answer:
      'No. Trabajamos con Shopify y con WooCommerce, también tenemos experiencia con PrestaShop y Medusa es la próxima plataforma que incorporamos. La elección de plataforma depende de tu tienda actual, tus integraciones y tus necesidades de negocio, y te ayudamos a tomar esa decisión durante el diagnóstico.',
  },
  {
    question: '¿Cuánto tarda un proyecto de diseño de tienda online?',
    answer:
      'Depende del alcance. Un rediseño de las pantallas clave (PLP, PDP, carrito y checkout) puede tomar menos tiempo que una implementación completa desde cero. En la llamada diagnóstica evaluamos tu caso y te damos un timeline realista.',
  },
  {
    question: '¿Qué pasa después del lanzamiento?',
    answer:
      'Seguimos midiendo, porque un diseño orientado a conversión no termina cuando se publica. Analizamos el comportamiento real de los visitantes después del lanzamiento y ajustamos las pantallas que lo necesiten para mejorar los resultados. Además, cada proyecto tiene 30 días de garantía después del lanzamiento.',
  },
  {
    question: '¿Necesito tener tráfico antes de contratar el rediseño?',
    answer:
      'Lo ideal es que sí. Si tu tienda ya recibe tráfico, tenemos datos para diagnosticar dónde se pierden las ventas y para medir el impacto del rediseño. Si todavía no tienes tráfico, podemos implementar la tienda, pero la fase de CRO y medición arranca cuando haya volumen suficiente para tomar decisiones con datos.',
  },
  {
    question: '¿Entregan el tema o la plantilla para que yo la configure?',
    answer:
      'No. Entregamos la tienda implementada y funcionando en tu plataforma, con todas las pantallas diseñadas, el catálogo estructurado y el flujo de compra configurado. No vendemos temas para autogestión.',
  },
  {
    question: '¿Garantizan subir la conversión?',
    answer:
      'No. Nadie que sea serio puede garantizar un porcentaje de conversión. Lo que sí hacemos es diseñar y medir con hipótesis de CRO, para reducir fricción en PLP, PDP, carrito y checkout y mejorar los resultados con datos reales después del lanzamiento.',
  },
] as const;

export const FAQ = {
  h2: 'Preguntas frecuentes (FAQ)',
  items: FAQ_ITEMS,
} as const;

export const CTA = {
  h2: 'Agenda tu llamada diagnóstica',
  paragraphs: [
    'Si tu tienda online ya vende pero sabes que el diseño le está costando conversiones, o si tienes tiendas físicas y quieres empezar a vender online, el siguiente paso es una llamada diagnóstica donde revisamos tu caso, identificamos los puntos de mejora con mayor impacto y te decimos si podemos ayudarte.',
    'La llamada dura entre 30 y 40 minutos, es sin costo y sin compromiso, y en ella hablamos de tu tienda y de tu negocio.',
  ],
  cta: 'Agenda tu llamada diagnóstica',
} as const;

export { BOOKING_HREF, CONTACT_HREF } from '../../utils/booking.ts';

export const MARKDOWN_TOKEN_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

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
