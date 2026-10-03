import type { WPPost } from '../services/wordpress';

/**
 * Staging-only blog posts that must not exist in WordPress.
 * Staging and production read the same WP (`endpoint.playfulagency.com`),
 * so publishing there would leak to playfulagency.com.
 *
 * Gate: never on Vercel production or the `main` git ref.
 * Staging branch / preview / local tests serve these slugs.
 *
 * ## Al pasar a producción (GO de Jose o Ale)
 * 1. Confirmar datePublished / dateModified con SEO
 *    (`GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL` abajo).
 * 2. Añadir `/blog/pautas-digitales/google-merchant-center` a
 *    `SITEMAP_BLOG_PATHS` en `utils/apex-sitemap.ts` y a
 *    `config/expected-routes.json`.
 * 3. Relacionados: el índice sale de WordPress, así que este slug
 *    no aparece en los relacionados de otros posts mientras sea
 *    local. Tras el GO, o se publica el post en WP (entonces entra
 *    solo en el índice) o se inyecta en `lib/blog-related-posts.ts`.
 *    La página del artículo ya muestra relacionados de la categoría.
 * 4. Quitar el gate o mover el post a `localBlogPostBySlug` de
 *    producción solo cuando el GO lo pida. No publicar en WP antes.
 */
export const GOOGLE_MERCHANT_CENTER_SLUG = 'google-merchant-center';
export const GOOGLE_MERCHANT_CENTER_CATEGORY_SLUG = 'pautas-digitales';
export const GOOGLE_MERCHANT_CENTER_CATEGORY_ID = 25;
export const GOOGLE_MERCHANT_CENTER_H1 =
  'Google Merchant Center: el catálogo de tu tienda en Google';
export const GOOGLE_MERCHANT_CENTER_TITLE =
  'Google Merchant Center para tu tienda online';
export const GOOGLE_MERCHANT_CENTER_META =
  'Google Merchant Center: cómo subir el catálogo de tu tienda y aparecer en Shopping. Reserva una reunión con Playful Agency.';

/**
 * SEO-PENDING datePublished / dateModified. Fecha de staging, provisional
 * a propósito: SEO la cambia aquí (y en date_gmt / modified / modified_gmt).
 */
export const GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL =
  '2026-10-03T00:00:00.000Z';
export const GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL =
  GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL;

export type StagingLocalBlogEnv = Record<string, string | undefined>;

export function isStagingLocalBlogEnabled(
  env: StagingLocalBlogEnv = process.env,
): boolean {
  if (env.VERCEL_ENV === 'production') return false;
  if (env.VERCEL_GIT_COMMIT_REF === 'main') return false;
  return true;
}

const GOOGLE_MERCHANT_CENTER_EXCERPT =
  'Google Merchant Center es la herramienta gratuita de Google donde subes el catálogo de tu tienda online para que tus productos aparezcan en la Búsqueda, en la pestaña Shopping, en YouTube o en Maps, y es también la base de la que salen los anuncios de Shopping.';

export const GOOGLE_MERCHANT_CENTER_BODY_HTML = `
<p>Google Merchant Center es la herramienta gratuita de Google donde subes el catálogo de tu tienda online para que tus productos aparezcan en la Búsqueda, en la pestaña Shopping, en YouTube o en Maps, y es también la base de la que salen los anuncios de Shopping.</p>
<p>Si tu tienda está en Shopify o en WooCommerce, una aplicación oficial sincroniza los productos con Merchant Center.</p>
<p>Lo que esa aplicación no hace sola es dejar el catálogo en orden, y de ese orden depende que Google apruebe tus productos y cuánto te cuesten después las campañas.</p>
<h2 id="que-es-google-merchant-center-y-en-que-se-diferencia-de-shopping-y-de-google-ads">Qué es Google Merchant Center y en qué se diferencia de Shopping y de Google Ads</h2>
<p>Merchant Center es donde Google guarda los datos de tus productos, es decir, el título, el precio, la imagen, la disponibilidad y el envío de cada artículo de tu catálogo.</p>
<p>Según la ayuda oficial de Google, es una herramienta sin coste y con ella tus productos pueden mostrarse gratis en la Búsqueda, Maps, YouTube y otros servicios. Google llama a esas apariciones «fichas gratuitas», y en las cuentas nuevas vienen activadas por defecto.</p>
<p>Google Shopping no es una herramienta aparte, sino la pestaña donde Google enseña esos productos. Google Ads es otra cuenta, la de los anuncios de pago, y cuando la vinculas a Merchant Center usa los mismos datos para crear anuncios de Shopping con la foto, el título, el precio y el nombre de tu tienda.</p>
<p>A esa parte de pago se la llama SEM, las siglas en inglés de marketing en buscadores, y es la que trabajamos en nuestro servicio de <a href="https://playfulagency.com/agencia-sem">SEM para tiendas online</a>.</p>
<p>Merchant Center tampoco es una pasarela de pago. El comprador hace clic, llega a la ficha de tu web y paga en tu tienda con los métodos que ya tengas activos.</p>
<h2 id="como-crear-la-cuenta-de-merchant-center-y-verificar-tu-tienda">Cómo crear la cuenta de Merchant Center y verificar tu tienda</h2>
<p>Para crear la cuenta necesitas una cuenta de Google, y cada correo solo puede tener una cuenta de Merchant Center. El alta te pide los datos de la empresa, dónde vendes (online, en tienda física o en las dos) y cómo quieres subir los productos.</p>
<p>Decide bien el país antes de empezar, porque según la ayuda de Google no se puede cambiar después.</p>
<p>Luego viene la verificación del sitio web. Verificar es demostrarle a Google que la web es tuya, y reclamar es reservar su URL (la dirección web de tu tienda) para tu cuenta. Solo una cuenta puede reclamar cada URL.</p>
<p>Google admite varios métodos de verificación, y para Shopify recomienda una etiqueta HTML (el código de la página). En la ayuda de octubre de 2026, la web se añade desde Configuración, Información de empresa y Editar tienda online.</p>
<p>Tu tienda también tiene que estar lista para la revisión. Entre la ayuda de Google para Shopify y la documentación de WooCommerce, la lista básica es una tienda publicada y sin contraseña, un pago seguro en https, los métodos de pago a la vista, una política de devoluciones fácil de encontrar y al menos un dato de contacto. WooCommerce avisa de que, si Google no encuentra la política de devoluciones, la cuenta puede quedar suspendida.</p>
<p>Para la primera revisión, Google pide además la dirección de la empresa verificada, una fuente de datos para el país de destino y las opciones de envío en los países donde son obligatorias, y España es uno de ellos. Esa revisión puede tardar entre 3 y 5 días hábiles, y mientras tanto los productos aparecen como «Pendiente».</p>
<h2 id="el-feed-de-productos-titulo-precio-imagen-envio-y-disponibilidad">El feed de productos: título, precio, imagen, envío y disponibilidad</h2>
<p>El feed es la fuente de datos con la lista de tus productos y sus atributos. Puede ser un archivo que subes o la sincronización de tu plataforma, y en los dos casos Google lo compara con lo que ve en tu web.</p>
<p>Estos son los atributos obligatorios para una tienda online según la especificación de Google, más el envío, que en España también lo es.</p>
<p><strong>Título.</strong> Hasta 150 caracteres, igual al de la ficha de tu web, sin texto promocional como «Envío gratuito» y sin todo en mayúsculas. En las variantes, con el color o la talla.</p>
<p><strong>Precio.</strong> Tiene que coincidir con la ficha, con los datos estructurados de la página y con el pago, en la moneda del país. Fuera de Estados Unidos y Canadá, va con el IVA (impuesto sobre el valor añadido) incluido.</p>
<p><strong>Imagen.</strong> La principal del producto, sin marcas de agua, bordes ni texto promocional, y nunca genérica. Google ha anunciado un mínimo de 500 × 500 píxeles a partir del 31 de enero de 2027.</p>
<p><strong>Envío.</strong> En España hay que informar los gastos de envío, en la configuración de la cuenta o en cada producto.</p>
<p><strong>Disponibilidad.</strong> En stock, agotado, reserva o bajo pedido, y siempre igual a lo que dice la ficha.</p>
<p><strong>Identificadores.</strong> El GTIN (número global de artículo comercial, el del código de barras) es obligatorio cuando el producto lo tiene. Si no lo tiene, se usa el MPN (número de referencia del fabricante) con la marca. Un GTIN incorrecto provoca el rechazo, así que Google pide dejarlo vacío antes que inventarlo.</p>
<p><strong>ID.</strong> Cada producto lleva un identificador único. Google recomienda usar el SKU (el código de referencia interno de tu tienda) y no cambiarlo al actualizar.</p>
<p>Si cargas el stock y facturas en un sistema de gestión propio (ERP) y la tienda solo se actualiza de vez en cuando, el feed puede decir «en stock» de algo que ya no tienes. Por eso, cuando planteamos una tienda, conectar el ERP con el inventario de la web es una fase del proyecto con su propio entregable, y no un añadido del final.</p>
<p>En las tiendas Shopify de <a href="https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce">Jumex</a> y Odwalla ordenamos el catálogo con colecciones, variantes y fichas de producto, y ese orden facilita el feed, porque Google pide que las variantes de un producto compartan identificador de grupo y lleven cada una su color o su talla.</p>
<p>Y si tu tienda tiene versión en inglés, Google pide que las páginas de destino estén en el mismo idioma que los datos del producto.</p>
<h2 id="conectar-shopify-o-woocommerce-con-merchant-center">Conectar Shopify o WooCommerce con Merchant Center</h2>
<h3 id="shopify-y-la-app-google-youtube">Shopify y la app Google &amp; YouTube</h3>
<p>En Shopify, la conexión se hace con la app Google &amp; YouTube, que desarrolla y gestiona Google y se instala gratis desde la tienda de aplicaciones de Shopify.</p>
<p>Según la guía de Google, buscas «Google &amp; YouTube» en la administración de Shopify, instalas la app y seleccionas Conectar cuenta de Google. Después eliges tu cuenta de Merchant Center o creas una, revisas los datos de la tienda, verificas tu teléfono con un código, eliges país, idioma y envíos y seleccionas Completar configuración.</p>
<p>El correo que conectas tiene que ser administrador de la cuenta de Merchant Center, y la app no admite cuentas multicliente (MCA), que son las que agrupan varias subcuentas bajo una principal.</p>
<p>Al terminar, los productos disponibles en tu tienda online se sincronizan solos. Shopify avisa de que algunos datos que usa Google no están en la ficha del producto y hay que añadirlos desde el canal.</p>
<p>Si el dominio no se verifica solo, Shopify recomienda usar el dominio principal y no un subdominio.</p>
<p>Si estás montando la tienda o rehaciendo el catálogo, en <a href="https://playfulagency.com/agencia-shopify">desarrollo de tiendas Shopify</a> contamos cómo trabajamos la estructura de productos.</p>
<h3 id="woocommerce-y-la-extension-google-for-woocommerce">WooCommerce y la extensión Google for WooCommerce</h3>
<p>En WooCommerce, la pieza oficial es la extensión Google for WooCommerce. Conecta tu cuenta de Google con Merchant Center y con Google Ads, y te deja crear una cuenta nueva o vincular la que ya tienes. Tampoco admite cuentas multicliente.</p>
<p>Durante la configuración eliges idioma, países, envíos e impuestos. Lo que configures ahí sobrescribe los ajustes que ya tuvieras en Merchant Center, y WooCommerce aconseja revisar los envíos allí al terminar.</p>
<p>La extensión no sincroniza los productos sin título, descripción, ID, enlace o imagen. Y el GTIN, la marca o la talla suelen estar guardados como atributos globales de WooCommerce, que no se envían a Google por defecto. Para eso está el mapeo de atributos, en Marketing y Google for WooCommerce, donde creas reglas por categoría que asignan cada atributo de tu tienda al que espera Google.</p>
<p>En electrónica, WooCommerce pide un identificador único en cada producto. Es el tipo de catálogo de <a href="https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela">SoyTechno</a>, la tienda de tecnología que hicimos en WooCommerce en Venezuela.</p>
<p>Google retira del feed los productos que no se actualizan en 30 días, y la extensión los reenvía si las tareas programadas de WordPress funcionan bien.</p>
<h2 id="errores-habituales-del-catalogo-en-merchant-center">Errores habituales del catálogo en Merchant Center</h2>
<p>En la ayuda de Google de octubre de 2026, los problemas se ven en Productos y tienda, Productos y la pestaña Requiere atención. Con una advertencia el producto se sigue mostrando con rendimiento limitado, con un rechazo deja de aparecer, y los problemas de cuenta afectan a todo el catálogo y pueden acabar en suspensión.</p>
<p><strong>Precio que no coincide.</strong> El robot de Google lee el precio en el código que envía tu servidor, así que si la web lo carga con JavaScript después de abrir la página, lo marca como error. También pasa cuando el precio cambia en la web antes que en el feed.</p>
<p><strong>Disponibilidad que no coincide.</strong> Si el precio o la disponibilidad no son los de la página, Google puede rechazar el producto de forma preventiva hasta revisarlo.</p>
<p><strong>Identificadores.</strong> Un GTIN mal puesto provoca el rechazo, y sin GTIN, MPN ni marca Google puede limitar el rendimiento del producto.</p>
<p><strong>Imágenes.</strong> Las marcas de agua y los textos promocionales sobre la foto provocan rechazos, igual que un archivo robots.txt que impide a Google rastrear tus imágenes.</p>
<p><strong>Páginas de destino.</strong> Google rechaza productos cuando la ficha tiene enlaces rotos, no carga o tarda mucho, o redirige a una página genérica en lugar de al producto.</p>
<p><strong>Información engañosa.</strong> Es un problema de cuenta. La política de Shopping no permite datos de empresa o de contacto falsos ni ofertas que no sean veraces, y en los casos graves la suspensión es inmediata.</p>
<p>Cuando corriges un problema, puedes pedir una revisión. Google indica que los nuevos rastreos suelen completarse en 24 a 48 horas y que la revisión de una cuenta puede tardar hasta 7 días.</p>
<h2 id="de-merchant-center-a-campanas-shopping-o-performance-max">De Merchant Center a campañas Shopping o Performance Max</h2>
<p>Con el catálogo aprobado, el paso a los anuncios pide una cuenta de Google Ads vinculada a Merchant Center y un método de pago en Google Ads. Según Google, solo pagas por rendimiento, por ejemplo cuando alguien hace clic.</p>
<p>Las campañas que creas desde Merchant Center, en Marketing y Campañas publicitarias, son siempre Performance Max, que en la interfaz en español se llama Máximo rendimiento. Para tener más control, como las opciones de puja, se editan en Google Ads.</p>
<p>Las dos opciones usan el mismo feed. Según la tabla de Google, las campañas de Shopping salen en la pestaña Shopping, junto a los resultados de la Búsqueda y en Google Imágenes, se cobran por clic y admiten puja manual. Performance Max llega a la mayoría de canales de Google Ads, incluidos YouTube, Display, Gmail y Maps, y combina el feed con los textos, imágenes y vídeos que le das.</p>
<p>Como los anuncios de Shopping se construyen con los datos de tu catálogo y no con palabras clave, en nuestro servicio de SEM revisamos primero la cuenta de Merchant Center y el feed, y después las campañas. No prometemos posiciones en Shopping ni un número de ventas. Lo que trabajamos es que el catálogo llegue a Google completo y coherente con tu web.</p>
<p>Si el problema está antes, en la propia tienda, en <a href="https://playfulagency.com/agencia-e-commerce">agencia de e-commerce</a> contamos cómo trabajamos catálogo, plataforma e integraciones.</p>
<h2 id="preguntas-frecuentes-sobre-google-merchant-center">Preguntas frecuentes sobre Google Merchant Center</h2>
<h3 id="que-es-google-merchant-center">¿Qué es Google Merchant Center?</h3>
<p>Es la herramienta de Google donde subes y gestionas los datos de los productos de tu tienda para que aparezcan en la Búsqueda, la pestaña Shopping, YouTube, Maps y otros servicios de Google, gratis o con anuncios.</p>
<h3 id="google-merchant-center-es-gratis">¿Google Merchant Center es gratis?</h3>
<p>Sí. Google lo define como una herramienta sin coste y las fichas gratuitas no se pagan. Solo pagas si haces anuncios, y ese gasto se factura en Google Ads con el presupuesto que tú fijas.</p>
<h3 id="como-accedo-a-google-merchant-center">¿Cómo accedo a Google Merchant Center?</h3>
<p>Desde la página de inicio de sesión de Google Merchant Center, con la cuenta de Google que tenga acceso a tu cuenta. También funciona en el móvil.</p>
<h3 id="como-creo-una-cuenta-de-google-merchant-center">¿Cómo creo una cuenta de Google Merchant Center?</h3>
<p>Entras con tu cuenta de Google en la página de Merchant Center, das los datos de tu empresa, indicas dónde vendes y eliges cómo subir los productos. Si tu tienda está en Shopify o WooCommerce, también puedes crearla desde la app Google &amp; YouTube o desde la extensión Google for WooCommerce.</p>
<h3 id="necesito-google-ads-para-salir-en-google-shopping">¿Necesito Google Ads para salir en Google Shopping?</h3>
<p>No. Con las fichas gratuitas activadas, tus productos aprobados pueden aparecer sin pagar, aunque Google aclara que no asegura que se muestren. Google Ads solo hace falta para los anuncios de pago.</p>
<p>Si quieres que revisemos el catálogo de tu tienda, la cuenta de Merchant Center y el paso a campañas antes de invertir en anuncios, <a href="https://api.playfulagency.com/widget/bookings/reunion-playful">reserva una reunión con nuestro equipo</a>.</p>
`.trim();

export const GOOGLE_MERCHANT_CENTER_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: '¿Qué es Google Merchant Center?',
    answer:
      'Es la herramienta de Google donde subes y gestionas los datos de los productos de tu tienda para que aparezcan en la Búsqueda, la pestaña Shopping, YouTube, Maps y otros servicios de Google, gratis o con anuncios.',
  },
  {
    question: '¿Google Merchant Center es gratis?',
    answer:
      'Sí. Google lo define como una herramienta sin coste y las fichas gratuitas no se pagan. Solo pagas si haces anuncios, y ese gasto se factura en Google Ads con el presupuesto que tú fijas.',
  },
  {
    question: '¿Cómo accedo a Google Merchant Center?',
    answer:
      'Desde la página de inicio de sesión de Google Merchant Center, con la cuenta de Google que tenga acceso a tu cuenta. También funciona en el móvil.',
  },
  {
    question: '¿Cómo creo una cuenta de Google Merchant Center?',
    answer:
      'Entras con tu cuenta de Google en la página de Merchant Center, das los datos de tu empresa, indicas dónde vendes y eliges cómo subir los productos. Si tu tienda está en Shopify o WooCommerce, también puedes crearla desde la app Google & YouTube o desde la extensión Google for WooCommerce.',
  },
  {
    question: '¿Necesito Google Ads para salir en Google Shopping?',
    answer:
      'No. Con las fichas gratuitas activadas, tus productos aprobados pueden aparecer sin pagar, aunque Google aclara que no asegura que se muestren. Google Ads solo hace falta para los anuncios de pago.',
  },
];

const STEFANNI_AVATAR =
  'https://secure.gravatar.com/avatar/0f4c6477fcdde767d8b99e553bf16a6c658373005f85299e5eb6e1a576571645?s=48&d=mm&r=g';

function buildGoogleMerchantCenterPost(): WPPost {
  return {
    id: 90002611,
    date: GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL,
    date_gmt: GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL,
    modified: GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL,
    modified_gmt: GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL,
    slug: GOOGLE_MERCHANT_CENTER_SLUG,
    link: `https://playfulagency.com/blog/${GOOGLE_MERCHANT_CENTER_CATEGORY_SLUG}/${GOOGLE_MERCHANT_CENTER_SLUG}`,
    title: { rendered: GOOGLE_MERCHANT_CENTER_H1 },
    content: { rendered: GOOGLE_MERCHANT_CENTER_BODY_HTML, protected: false },
    excerpt: { rendered: `<p>${GOOGLE_MERCHANT_CENTER_EXCERPT}</p>`, protected: false },
    categories: [
      {
        id: GOOGLE_MERCHANT_CENTER_CATEGORY_ID,
        name: 'Pautas Digitales',
        slug: GOOGLE_MERCHANT_CENTER_CATEGORY_SLUG,
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
  [GOOGLE_MERCHANT_CENTER_SLUG]: buildGoogleMerchantCenterPost(),
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
  return Object.values(STAGING_ONLY_BLOG_POSTS).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'sin-categoria', post.slug],
  }));
}

export function blogArticleJsonLdExtras(slug: string | undefined | null): {
  type?: 'Article';
  about?: { '@type': 'Thing'; name: string };
} {
  if (slug !== GOOGLE_MERCHANT_CENTER_SLUG) return {};
  return { type: 'Article' };
}

export function blogFaqPageJsonLd(slug: string | undefined | null): Record<string, unknown> | null {
  if (slug !== GOOGLE_MERCHANT_CENTER_SLUG) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GOOGLE_MERCHANT_CENTER_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
