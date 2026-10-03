import type { WPPost } from '@/services/wordpress';
import {
  CASHEA_COMERCIOS_BLOG_SLUG,
  MIGRACION_SEO_ALT_BLOG_PATH,
  MIGRACION_SEO_ALT_BLOG_SLUG,
} from './blog-body-overrides.ts';

/**
 * Next-owned blog posts that are not in WordPress. The post page still
 * runs through `app/blog/[...slug]/page.tsx`; body HTML lives in
 * `blog-body-overrides.ts` (same closed-list pattern as Zelle).
 */
export const CASHEA_COMERCIOS_BLOG_PATH =
  '/blog/tecnologia/cashea-para-comercios';

const TECNOLOGIA_CATEGORY = {
  id: 24,
  slug: 'tecnologia',
  name: 'Tecnología',
  taxonomy: 'category',
} as const;

const SEO_CATEGORY = {
  id: 6,
  slug: 'seo',
  name: 'Seo',
  taxonomy: 'category',
} as const;

const CASHEA_PUBLISHED = '2026-09-29T00:00:00.000Z';
const MIGRACION_PUBLISHED = '2026-09-29T00:00:00.000Z';

export const CASHEA_COMERCIOS_LOCAL_POST: WPPost = {
  id: 900001,
  date: CASHEA_PUBLISHED,
  date_gmt: CASHEA_PUBLISHED,
  modified: CASHEA_PUBLISHED,
  modified_gmt: CASHEA_PUBLISHED,
  slug: CASHEA_COMERCIOS_BLOG_SLUG,
  link: CASHEA_COMERCIOS_BLOG_PATH,
  status: 'publish',
  type: 'post',
  title: { rendered: 'Cashea para comercios: cómo ofrecer cuotas en tu tienda online' },
  excerpt: {
    rendered:
      'Si tu tienda ya vende y tus compradores te preguntan si pueden pagar en cuotas, lo que te toca entender es Cashea para comercios, que no es lo mismo que la app que usan ellos.',
  },
  content: { rendered: '' },
  categories: [{ ...TECNOLOGIA_CATEGORY }],
  author: { id: 0, name: 'Playful Agency', slug: 'playful-agency' },
  author_name: 'Playful Agency',
};

export const MIGRACION_SEO_ALT_LOCAL_POST: WPPost = {
  id: 900002,
  date: MIGRACION_PUBLISHED,
  date_gmt: MIGRACION_PUBLISHED,
  modified: MIGRACION_PUBLISHED,
  modified_gmt: MIGRACION_PUBLISHED,
  slug: MIGRACION_SEO_ALT_BLOG_SLUG,
  link: MIGRACION_SEO_ALT_BLOG_PATH,
  status: 'publish',
  type: 'post',
  title: { rendered: 'Cómo hacer una migración SEO al cambiar de plataforma de tienda online' },
  excerpt: {
    rendered:
      'Si tu tienda online ya aparece en Google y estás por cambiar de plataforma, necesitas una migración SEO, porque lo que está en juego no es el diseño ni el catálogo.',
  },
  content: { rendered: '' },
  categories: [{ ...SEO_CATEGORY }],
  author: { id: 0, name: 'Playful Agency', slug: 'playful-agency' },
  author_name: 'Playful Agency',
};

const LOCAL_BLOG_POSTS: Record<string, WPPost> = {
  [CASHEA_COMERCIOS_BLOG_SLUG]: CASHEA_COMERCIOS_LOCAL_POST,
  [MIGRACION_SEO_ALT_BLOG_SLUG]: MIGRACION_SEO_ALT_LOCAL_POST,
};

export function localBlogPostBySlug(slug: string | undefined | null): WPPost | null {
  if (!slug) return null;
  return LOCAL_BLOG_POSTS[slug] || null;
}

export function localBlogStaticParams(): Array<{ slug: string[] }> {
  return Object.values(LOCAL_BLOG_POSTS).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'tecnologia', post.slug],
  }));
}

/**
 * Staging-only blog posts that must not exist in WordPress.
 * Staging and production read the same WP (`endpoint.playfulagency.com`),
 * so publishing there would leak to playfulagency.com.
 *
 * Gate: never on Vercel production or the `main` git ref.
 * Staging branch / preview / local tests serve these slugs.
 */
export const ESHOW_MADRID_2026_SLUG = 'eshow-madrid-2026';
export const ESHOW_MADRID_2026_CATEGORY_SLUG = 'otros';
export const ESHOW_MADRID_2026_CATEGORY_ID = 21;
export const ESHOW_MADRID_2026_H1 = 'eShow Madrid 2026: la feria de ecommerce en IFEMA';
export const ESHOW_MADRID_2026_TITLE = 'eShow Madrid 2026: fechas, IFEMA y qué ver';
export const ESHOW_MADRID_2026_META =
  'eShow Madrid 2026 en IFEMA el 4 y 5 de noviembre: fechas, qué ver y cómo sacarle partido. Reserva una reunión con Playful.';
export const ESHOW_MADRID_2026_ABOUT_NAME = 'E-SHOW Madrid 2026';

/**
 * SEO-PENDING datePublished. Provisional on purpose: SEO sets the live
 * date in staging. Change only this constant (and the matching date_gmt).
 */
export const ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL = '2026-10-07T00:00:00.000Z';

export const ESHOW_MADRID_2026_CABECERA_SRC = '/images/blog/eshow-madrid-2026-cabecera.webp';
export const ESHOW_MADRID_2026_PROGRAMA_SRC = '/images/blog/eshow-madrid-2026-programa.webp';
export const ESHOW_MADRID_2026_IMAGE_WIDTH = 1044;
export const ESHOW_MADRID_2026_IMAGE_HEIGHT = 1030;
export const ESHOW_MADRID_2026_CABECERA_ALT =
  'Cabecera de la web oficial de E-SHOW Madrid 2026 con las fechas del 4 y 5 de noviembre y los pabellones 3 a 5 de IFEMA Madrid';
export const ESHOW_MADRID_2026_PROGRAMA_ALT =
  'Programa oficial de E-SHOW Madrid 2026 ordenado por día y por sala, con el E-SHOW Keynote Theatre y el Ecommerce Strategies Theatre';

export type StagingLocalBlogEnv = Record<string, string | undefined>;

export function isStagingLocalBlogEnabled(
  env: StagingLocalBlogEnv = process.env,
): boolean {
  if (env.VERCEL_ENV === 'production') return false;
  if (env.VERCEL_GIT_COMMIT_REF === 'main') return false;
  return true;
}

const ESHOW_MADRID_2026_EXCERPT =
  'El eShow Madrid 2026 se celebra el miércoles 4 y el jueves 5 de noviembre en IFEMA Madrid, en los pabellones 3 a 5, de 10:00 a 19:00. Es la feria de ecommerce y marketing digital que forma parte de Tech Show Madrid, y si tienes una tienda online te permite ver en dos días plataformas, pagos, logística y herramientas de captación que normalmente tendrías que buscar por separado.';

export const ESHOW_MADRID_2026_BODY_HTML = `
<p>El eShow Madrid 2026 se celebra el miércoles 4 y el jueves 5 de noviembre en IFEMA Madrid, en los pabellones 3 a 5, de 10:00 a 19:00. Es la feria de ecommerce y marketing digital que forma parte de Tech Show Madrid, y si tienes una tienda online te permite ver en dos días plataformas, pagos, logística y herramientas de captación que normalmente tendrías que buscar por separado.</p>
<p>Aquí tienes lo que publica la web oficial a 3 de octubre de 2026 sobre fechas, sede, zonas, programa y registro, y después cómo preparar la visita y qué decidir sobre tu tienda cuando vuelvas.</p>
<p>José Reyes, de Playful Agency, va al eShow los dos días para reunirse con marcas medianas que tienen su tienda online en marcha y quieren rehacerla o conectarla con el programa donde llevan el stock y las facturas. Si es tu caso, puedes <a href="https://api.playfulagency.com/widget/bookings/reunion-playful">reservar una reunión con Playful</a> para veros en la feria o antes.</p>
<h2 id="fechas-horario-y-como-llegar-a-ifema">Fechas, horario y cómo llegar a IFEMA</h2>
<figure>
  <img src="${ESHOW_MADRID_2026_CABECERA_SRC}" alt="${ESHOW_MADRID_2026_CABECERA_ALT}" width="${ESHOW_MADRID_2026_IMAGE_WIDTH}" height="${ESHOW_MADRID_2026_IMAGE_HEIGHT}" />
</figure>
<p>Según la web oficial del eShow, estos son los datos básicos de la edición de 2026.</p>
<ul>
<li><strong>Fechas:</strong> miércoles 4 y jueves 5 de noviembre de 2026.</li>
<li><strong>Horario:</strong> de 10:00 a 19:00.</li>
<li><strong>Lugar:</strong> IFEMA Madrid, pabellones 3 a 5.</li>
<li><strong>Dirección del recinto:</strong> avenida del Partenón, 5, 28042 Madrid.</li>
</ul>
<p>IFEMA indica en su página de <a href="https://www.ifema.es/como-llegar">cómo llegar</a> que el recinto tiene operativas las entradas norte, este y oeste, y que los taxis y los VTC (vehículos de alquiler con conductor) entran por el acceso norte. Si vas en coche, los aparcamientos abren en horario general de 07:00 a 22:00.</p>
<p>IFEMA avisa de que los accesos pueden cambiar según las necesidades del recinto, así que conviene revisar esa página la semana de la feria.</p>
<h2 id="que-es-eshow-y-en-que-se-diferencia-de-tech-show-madrid">Qué es eShow y en qué se diferencia de Tech Show Madrid</h2>
<p>Tech Show Madrid es el evento que reúne en IFEMA varias ferias de tecnología a la vez. En la web oficial aparecen Cloud &amp; AI Infrastructure, Cyber Security World, Big Data &amp; AI World, Data Centre World, Technology for Marketing, E-SHOW y, desde esta edición, HR &amp; Learning Technologies, que es la parte de tecnología para recursos humanos y formación. Lo organiza CloserStill Media.</p>
<p>El eShow es la parte de ecommerce de ese evento. La web oficial lo presenta junto a Technology for Marketing como el punto de encuentro de ecommerce, marketing digital y tecnología aplicada al negocio digital en España.</p>
<p>Por eso «Tech Show Madrid» y «eShow Madrid» son la misma cita, en el mismo recinto y con un registro común, pero lo que interesa a tu tienda está en las salas y en las zonas del eShow.</p>
<p>Para hacerte una idea del tamaño, la web oficial dice que la edición de 2025 de E-SHOW y Technology for Marketing, dentro de Tech Show Madrid, reunió a más de 470 empresas expositoras y patrocinadoras, más de 400 ponentes y más de 27.000 profesionales. Son cifras de la edición pasada, no una previsión para 2026.</p>
<h2 id="que-ver-si-tienes-tienda-villages-pagos-cro-y-catalogo">Qué ver si tienes tienda: villages, pagos, CRO y catálogo</h2>
<figure>
  <img src="${ESHOW_MADRID_2026_PROGRAMA_SRC}" alt="${ESHOW_MADRID_2026_PROGRAMA_ALT}" width="${ESHOW_MADRID_2026_IMAGE_WIDTH}" height="${ESHOW_MADRID_2026_IMAGE_HEIGHT}" />
</figure>
<p>El eShow tiene tres salas de conferencias propias, el E-SHOW Keynote Theatre, el Ecommerce Strategies Theatre y el Future Commerce Theatre, y comparte recinto con el Technology for Marketing Theatre. El programa ya está publicado por día y por sala, con algunas sesiones todavía por confirmar, así que conviene volver a mirarlo a finales de octubre.</p>
<h3 id="las-zonas-del-eshow">Las zonas del eShow</h3>
<ul>
<li><strong>PrestaShop Village.</strong> La web oficial anuncia un espacio dedicado de PrestaShop, la plataforma de comercio electrónico de código abierto.</li>
<li><strong>Shopify Partner Village.</strong> Aparece en la web oficial entre los espacios del evento.</li>
<li><strong>FBA Show.</strong> Es el congreso para vendedores de Amazon dentro del eShow. FBA son las siglas de Fulfillment by Amazon, el servicio con el que Amazon almacena y envía los pedidos del vendedor, y la web anuncia temas como el SEO, la publicidad y la logística en Amazon.</li>
<li><strong>Retail Media Show.</strong> Trata la publicidad que una marca contrata en el momento de la compra, dentro de las webs y las apps de los distribuidores, con stands y conferencias los dos días.</li>
</ul>
<h3 id="los-temas-que-tocan-a-tu-tienda">Los temas que tocan a tu tienda</h3>
<p>De la lista de temas que la web oficial publica para las salas del eShow, estos son los que más afectan a una tienda online, agrupados por la decisión que te ayudan a tomar.</p>
<p><strong>Pagos.</strong> Están los pagos flexibles (la compra ahora y paga después), los pagos instantáneos y diversificados y los pagos multicurrency, es decir, en varias monedas. Si tu checkout tiene pocos métodos o cobras fuera de España, son los primeros que conviene marcar.</p>
<p><strong>Conversión.</strong> La optimización de la tasa de conversión, que se conoce como CRO, aparece en las tres salas, igual que la omnicanalidad y el mobile commerce. Sirve para revisar por qué entra tráfico a tu tienda y no termina en pedido.</p>
<p><strong>Catálogo, inventario y facturación.</strong> Aquí entran la logística con inventario unificado, el seguimiento de envíos en tiempo real y Verifactu, el sistema de facturación verificable que la normativa española pide a los programas de facturación. Si cargas el inventario y facturas en un programa propio o en un ERP (el programa de gestión donde llevas stock y facturas) y la tienda no está bien conectada con él, en estas charlas y en sus stands es donde tiene sentido preguntar cómo se conecta cada herramienta con lo que ya usas.</p>
<p><strong>Plataforma.</strong> Los dos villages te dejan comparar Shopify y PrestaShop en la misma mañana. La plataforma conviene elegirla por el tamaño de tu catálogo, por los programas con los que la tienda tiene que hablar y por cómo cobras, y no por la que suena más potente.</p>
<p><strong>Búsqueda.</strong> En el Technology for Marketing Theatre están el SEO evolutivo, la búsqueda conversacional y el AEO (Answer Engine Optimization, el trabajo para que los buscadores que responden con inteligencia artificial muestren tu tienda). Si buena parte de tus ventas llega desde Google, es la parte del programa que más te toca.</p>
<h2 id="como-registrarte">Cómo registrarte</h2>
<p>El registro se hace en la <a href="https://www.techshowmadrid.es/registro">web oficial de Tech Show Madrid</a>. Es un formulario único para todo el evento, y en el primer campo eliges la feria de interés principal, que en tu caso es E-SHOW.</p>
<p>Antes de rellenarlo, ten en cuenta tres condiciones publicadas:</p>
<ul>
<li>Si eres expositor o trabajas en una empresa expositora, el registro se hace desde el portal del expositor, no desde este formulario.</li>
<li>La organización no permite la entrada a estudiantes y se reserva el derecho a cancelar la credencial.</li>
<li>Cuando un expositor escanea tu acreditación en su stand, recibe tus datos de registro y puede escribirte con información comercial.</li>
</ul>
<p>Al registrarte se crea además un perfil en la app del evento. Desde la app puedes consultar el programa y pedir citas de reunión antes, durante y después de la feria, así que es la herramienta que más te conviene tener lista antes del 4 de noviembre.</p>
<h2 id="como-preparar-la-visita-para-que-no-se-quede-en-paseo">Cómo preparar la visita para que no se quede en paseo</h2>
<p>Dos días en tres pabellones dan para mucho, y por eso es fácil volver con folletos y ninguna decisión. Estos pasos ayudan a que la visita deje un resultado concreto para tu tienda.</p>
<ol>
<li><strong>Escribe antes de ir las dos o tres decisiones que tu tienda tiene pendientes.</strong> Puede ser cambiar de plataforma, añadir métodos de pago, conectar la tienda con tu inventario y tu facturación o mejorar el posicionamiento en buscadores. Lo que no ayude a cerrar una de ellas puede esperar.</li>
<li><strong>Cruza esas decisiones con el programa.</strong> Marca en la app las charlas por sala y por hora, y deja huecos entre una y otra para moverte entre salas y stands.</li>
<li><strong>Pide las citas desde la app antes de la feria.</strong> Las conversaciones cerradas de antemano suelen dar más que las que salen en el pasillo, y te dejan huecos para recorrer los villages.</li>
<li><strong>Lleva las mismas preguntas a todos los stands</strong>, para poder comparar respuestas al volver.
<ul>
<li>¿Cómo se conecta vuestra herramienta con el ERP o el programa donde llevo el inventario y la facturación, sobre todo si es un desarrollo propio?</li>
<li>¿Quién la administra en el día a día y cuánto tiempo de mi equipo pide?</li>
<li>Una vez que os entrego toda la información, ¿cuánto se tarda en tenerlo funcionando?</li>
<li>Si cambio de plataforma, ¿qué pasa con las direcciones actuales de mi tienda y con el posicionamiento que ya tengo?</li>
</ul>
</li>
<li><strong>Toma notas después de cada conversación.</strong> Basta con el nombre, la empresa, lo que se dijo y el siguiente paso acordado, porque sin esas notas el seguimiento de la semana siguiente no se puede hacer.</li>
</ol>
<h2 id="despues-de-la-feria-que-decidir-sobre-tu-tienda">Después de la feria: qué decidir sobre tu tienda</h2>
<p>La semana después del eShow es cuando se ve si la visita sirvió. Si tu equipo ha intentado lanzar o rehacer la tienda dos o tres veces y el proyecto nunca ha llegado a concretarse, la feria te da opciones, pero la decisión sigue pendiente hasta que alguien la pone en un calendario.</p>
<p>Con las notas delante, conviene responder tres preguntas. La primera es si tu tienda necesita rehacerse o solo conectarse mejor con el stock, la facturación y los pagos. La segunda es qué plataforma encaja con tu catálogo, con tus programas y con tu forma de cobrar, que puede ser la que ya tienes. La tercera es cuánto tiempo puede dedicar tu equipo al proyecto y cuánto quieres que lleve un equipo externo.</p>
<p>En Playful rehacemos y conectamos tiendas online en Shopify y WooCommerce. Conectamos la tienda con tu ERP o tu programa de facturación a través de su API (la vía por la que un programa intercambia datos con otro), y si no la tiene, construimos lo necesario. Si vienes de otra plataforma, cada dirección antigua de tu tienda redirige a su página nueva para que Google y tus clientes no se encuentren con un error.</p>
<p>En <a href="https://playfulagency.com/agencia-e-commerce">agencia de ecommerce</a> está cómo trabajamos una tienda completa, y en <a href="https://playfulagency.com/agencia-shopify">agencia Shopify</a>, lo que hacemos en esa plataforma. Si partes de cero, <a href="https://playfulagency.com/blog/tecnologia/crear-un-e-commerce">cómo crear un ecommerce</a> repasa los pasos.</p>
<p>Jumex y Odwalla venden directamente a sus clientes con tiendas en Shopify que montó Playful, con el catálogo ordenado en colecciones y variantes y las fichas adaptadas a escritorio y móvil. Puedes verlas en <a href="https://playfulagency.com/casos-de-exito">casos de éxito</a>.</p>
<p>Si quieres hablar de tu tienda con José en el eShow Madrid o antes de la feria, <a href="https://api.playfulagency.com/widget/bookings/reunion-playful">reserva una reunión con Playful</a>. Eliges el día y la hora, y la conversación puede ser en IFEMA el 4 o el 5 de noviembre o en las semanas previas.</p>
`.trim();

const STEFANNI_AVATAR =
  'https://secure.gravatar.com/avatar/0f4c6477fcdde767d8b99e553bf16a6c658373005f85299e5eb6e1a576571645?s=48&d=mm&r=g';

function buildEshowMadrid2026Post(): WPPost {
  return {
    id: 90002610,
    date: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    date_gmt: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    modified: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    modified_gmt: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    slug: ESHOW_MADRID_2026_SLUG,
    link: `https://playfulagency.com/blog/${ESHOW_MADRID_2026_CATEGORY_SLUG}/${ESHOW_MADRID_2026_SLUG}`,
    title: { rendered: ESHOW_MADRID_2026_H1 },
    content: { rendered: ESHOW_MADRID_2026_BODY_HTML, protected: false },
    excerpt: { rendered: `<p>${ESHOW_MADRID_2026_EXCERPT}</p>`, protected: false },
    featured_media_url: ESHOW_MADRID_2026_CABECERA_SRC,
    featured_media_alt: ESHOW_MADRID_2026_CABECERA_ALT,
    categories: [
      {
        id: ESHOW_MADRID_2026_CATEGORY_ID,
        name: 'Otros',
        slug: ESHOW_MADRID_2026_CATEGORY_SLUG,
        taxonomy: 'category',
      },
    ],
    tags: [],
    author: {
      id: 21,
      name: 'Stefanni Parabavidez',
      slug: 'stefanniparabavidez',
      avatar_urls: {
        '24': STEFANNI_AVATAR.replace('s=48', 's=24'),
        '48': STEFANNI_AVATAR,
        '96': STEFANNI_AVATAR.replace('s=48', 's=96'),
      },
    },
    author_name: 'Stefanni Parabavidez',
    status: 'publish',
    type: 'post',
  };
}

const STAGING_ONLY_BLOG_POSTS: Record<string, WPPost> = {
  [ESHOW_MADRID_2026_SLUG]: buildEshowMadrid2026Post(),
};

export function getStagingLocalBlogPost(
  slug: string | undefined | null,
  env: StagingLocalBlogEnv = process.env,
): WPPost | null {
  if (!slug || !isStagingLocalBlogEnabled(env)) return null;
  return STAGING_ONLY_BLOG_POSTS[slug] || null;
}

export function listStagingLocalBlogStaticParams(
  env: StagingLocalBlogEnv = process.env,
): Array<{ slug: string[] }> {
  if (!isStagingLocalBlogEnabled(env)) return [];
  return [{ slug: [ESHOW_MADRID_2026_CATEGORY_SLUG, ESHOW_MADRID_2026_SLUG] }];
}

export function blogArticleJsonLdExtras(slug: string | undefined | null): {
  type?: 'Article';
  about?: { '@type': 'Thing'; name: string };
} {
  if (slug !== ESHOW_MADRID_2026_SLUG) return {};
  return {
    type: 'Article',
    about: { '@type': 'Thing', name: ESHOW_MADRID_2026_ABOUT_NAME },
  };
}
