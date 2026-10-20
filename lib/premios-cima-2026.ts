/**
 * Nota de prensa Premios CIMA 2026 (SoyTechno + Playful).
 * Post local, mismo circuito que eShow Madrid 2026: no WordPress.
 * Copy literal del briefing de publicación (GO José, 20 oct 2026).
 */

export const PREMIOS_CIMA_2026_SLUG = 'premios-cima-2026-soytechno-playful';
export const PREMIOS_CIMA_2026_CATEGORY_SLUG = 'otros';
export const PREMIOS_CIMA_2026_CATEGORY_ID = 21;
export const PREMIOS_CIMA_2026_PATH = '/blog/otros/premios-cima-2026-soytechno-playful';
export const PREMIOS_CIMA_2026_CANONICAL =
  'https://playfulagency.com/blog/otros/premios-cima-2026-soytechno-playful';

export const PREMIOS_CIMA_2026_H1 =
  'Premios CIMA 2026, ganadores SoyTechno en Plataforma de E-commerce';
/** Titular aprobado (5123191): visible como bajada, palabra por palabra. */
export const PREMIOS_CIMA_2026_BAJADA =
  'SoyTechno y Playful Agency resultaron ganadores en la categoría Plataforma de E-commerce, del área de Mercadeo, de los Premios CIMA 2026';
export const PREMIOS_CIMA_2026_TITLE =
  'Premios CIMA 2026: SoyTechno, ganadores E-commerce | Playful';
export const PREMIOS_CIMA_2026_EXCERPT =
  'El caso «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela» se llevó el premio de su categoría en la cuarta edición del certamen, celebrada el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, Salón Plaza Real, a las 5:00 pm.';
/** Meta de la capa SEO Contenido (playful-copy c33ffaa). */
export const PREMIOS_CIMA_2026_META =
  'SoyTechno y Playful Agency, ganadores de los Premios CIMA 2026 en la categoría Plataforma de E-commerce, en la 4.ª edición del certamen, celebrada en Caracas.';
export const PREMIOS_CIMA_2026_ABOUT_NAME = 'Premios CIMA 2026';
export const PREMIOS_CIMA_2026_EVENT = {
  '@type': 'Event',
  name: 'Premios CIMA 2026',
  organizer: { '@type': 'Organization', name: 'Premios CIMA' },
  startDate: '2026-10-19',
  location: {
    '@type': 'Place',
    name: 'Hotel Eurobuilding',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Caracas',
      addressCountry: 'VE',
    },
  },
} as const;
export const PREMIOS_CIMA_2026_SOYTECHNO_ORG = {
  '@type': 'Organization',
  name: 'SoyTechno',
} as const;

/** Dateline de la nota (Caracas, 19 oct 2026, 17:00 VET). */
export const PREMIOS_CIMA_2026_DATE_PUBLISHED = '2026-10-19T17:00:00-04:00';
export const PREMIOS_CIMA_2026_DATE_MODIFIED = PREMIOS_CIMA_2026_DATE_PUBLISHED;

export const PREMIOS_CIMA_2026_TROFEO_SRC = '/images/blog/premios-cima-2026-trofeo.webp';
export const PREMIOS_CIMA_2026_PORTADA_SRC = '/images/blog/premios-cima-2026-portada.webp';
/** Destacada + OG: ilustración (GO José 20 oct 2026, vía Diseño). */
export const PREMIOS_CIMA_2026_FEATURED_SRC = PREMIOS_CIMA_2026_PORTADA_SRC;
export const PREMIOS_CIMA_2026_ENTREGA_SRC = '/images/blog/premios-cima-2026-entrega.webp';
export const PREMIOS_CIMA_2026_SALON_SRC = '/images/blog/premios-cima-2026-salon.webp';

export const PREMIOS_CIMA_2026_PORTADA_WIDTH = 1600;
export const PREMIOS_CIMA_2026_PORTADA_HEIGHT = 1600;
export const PREMIOS_CIMA_2026_FEATURED_WIDTH = PREMIOS_CIMA_2026_PORTADA_WIDTH;
export const PREMIOS_CIMA_2026_FEATURED_HEIGHT = PREMIOS_CIMA_2026_PORTADA_HEIGHT;
export const PREMIOS_CIMA_2026_TROFEO_WIDTH = 1152;
export const PREMIOS_CIMA_2026_TROFEO_HEIGHT = 2048;
export const PREMIOS_CIMA_2026_ENTREGA_WIDTH = 608;
export const PREMIOS_CIMA_2026_ENTREGA_HEIGHT = 1080;
export const PREMIOS_CIMA_2026_SALON_WIDTH = 960;
export const PREMIOS_CIMA_2026_SALON_HEIGHT = 1280;

export const PREMIOS_CIMA_2026_TROFEO_ALT =
  'El trofeo de los Premios CIMA 2026 en la categoría Plataforma de E-commerce, con los nombres de SoyTechno y Playful Agency en la placa.';
export const PREMIOS_CIMA_2026_FEATURED_ALT =
  'Ilustración de un trofeo: una bota negra sobre un podio amarillo, con una placa rosa de los Premios CIMA 2026 en la categoría Plataforma de E-commerce para Playful Agency.';
export const PREMIOS_CIMA_2026_ENTREGA_ALT =
  'Yulieth Carvajal, CEO de SoyTechno, y Alejandra Da Costa, CEO de Playful Agency, recogen el premio en la categoría Plataforma de E-commerce de los Premios CIMA 2026.';
export const PREMIOS_CIMA_2026_SALON_ALT =
  'Salón Plaza Real del Hotel Eurobuilding de Caracas durante la gala de los Premios CIMA 2026, con el logo de Premios CIMA en el escenario.';

export const PREMIOS_CIMA_2026_TROFEO_CAPTION = PREMIOS_CIMA_2026_TROFEO_ALT;
export const PREMIOS_CIMA_2026_ENTREGA_CAPTION = PREMIOS_CIMA_2026_ENTREGA_ALT;

export const PREMIOS_CIMA_2026_AUTHOR_NAME = 'Equipo editorial';

export const PREMIOS_CIMA_2026_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: '¿Qué son los premios CIMA?',
    answer:
      'Los Premios CIMA son un certamen venezolano de mercadeo y creatividad. La cuarta edición se celebró el 19 de octubre de 2026 en Caracas.',
  },
];

export const PREMIOS_CIMA_2026_BODY_HTML = `
<h2 id="que-son-los-premios-cima-y-quien-los-organiza">Qué son los Premios CIMA y quién los organiza</h2>
<p>Los Premios CIMA premian casos de mercadeo y creatividad con firma venezolana. En premioscima.com la cuarta edición tiene fecha 19 de octubre de 2026, y Tata López figura como fundadora en la junta consultiva. PRODU publicó el 19 de octubre de 2026 que la ceremonia la produjeron OZ Producciones y LBM. La página de nominados de Premios CIMA incluye, en Plataforma de e-commerce, el caso de SoyTechno con Playful Agency.</p>
<h2 id="la-gala-de-premios-cima-2026">La gala de Premios CIMA 2026</h2>
<p>SoyTechno y Playful Agency resultaron ganadores de los <a href="https://premioscima.com" rel="noopener" target="_blank">Premios CIMA 2026</a> en la categoría <a href="/agencia-e-commerce">Plataforma de E-commerce</a>, del área de Mercadeo. La ceremonia de la cuarta edición se celebró el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, en el Salón Plaza Real, a las 5:00 pm.</p>
<p>La cuarta edición recibió 313 casos inscritos, según la nota de PRODU del 14 de octubre de 2026.</p>
<figure>
  <img src="${PREMIOS_CIMA_2026_TROFEO_SRC}" alt="${PREMIOS_CIMA_2026_TROFEO_ALT}" width="${PREMIOS_CIMA_2026_TROFEO_WIDTH}" height="${PREMIOS_CIMA_2026_TROFEO_HEIGHT}" />
  <figcaption>${PREMIOS_CIMA_2026_TROFEO_CAPTION}</figcaption>
</figure>
<h2 id="la-categoria-y-el-caso-ganador">La categoría y el caso ganador</h2>
<p>En Venezuela, la tecnología se compraba sobre todo por Instagram y por WhatsApp, y la visión de SoyTechno era demostrar que el venezolano compra en línea cuando tiene una infraestructura formal, segura y transparente. Playful Agency convirtió esa visión en la tienda en línea.</p>
<h2 id="los-resultados">Los resultados</h2>
<p>Esa tienda se adapta a cómo paga y confía Venezuela. El comprador elige la moneda y paga en bolívares o en divisas en un mismo flujo, desde una sola pantalla, y las cuotas pasan por la primera integración nativa del Botón de Pago de Cashea en una tienda en línea venezolana. Después del pago, el rastreo de MRW en tiempo real sigue el envío. Así, en 2025, SoyTechno cerró el año con 12.722 ventas, un 65% más que en 2024. Los Premios CIMA reconocen hoy ese resultado, y Playful Agency y SoyTechno agradecen a la organización el premio.</p>
<figure>
  <img src="${PREMIOS_CIMA_2026_ENTREGA_SRC}" alt="${PREMIOS_CIMA_2026_ENTREGA_ALT}" width="${PREMIOS_CIMA_2026_ENTREGA_WIDTH}" height="${PREMIOS_CIMA_2026_ENTREGA_HEIGHT}" />
  <figcaption>${PREMIOS_CIMA_2026_ENTREGA_CAPTION}</figcaption>
</figure>
<figure>
  <img src="${PREMIOS_CIMA_2026_SALON_SRC}" alt="${PREMIOS_CIMA_2026_SALON_ALT}" width="${PREMIOS_CIMA_2026_SALON_WIDTH}" height="${PREMIOS_CIMA_2026_SALON_HEIGHT}" />
</figure>
<h2 id="las-declaraciones">Las declaraciones</h2>
<style>
.cima-editorial-quote{margin:1.75rem 0;padding:1.75rem 1.5rem 1.25rem 1.85rem;border-left:4px solid #440099;background:#f5f3ff;border-radius:0 1rem 1rem 0;position:relative;quotes:none}
.cima-editorial-quote::before{content:"“";position:absolute;top:.15rem;left:.7rem;font-size:3.25rem;line-height:1;color:#2A0064;font-family:Georgia,"Times New Roman",serif;opacity:.28;pointer-events:none}
.cima-editorial-quote>p{margin:0 0 .85rem;padding:0;font-size:1.35rem;line-height:1.55;font-style:italic;color:#2A0064;font-weight:500}
.cima-editorial-quote>cite{display:block;font-size:.8125rem;line-height:1.4;font-style:normal;font-weight:600;color:#440099;letter-spacing:.01em}
@media (max-width:480px){.cima-editorial-quote{padding:1.5rem 1.1rem 1rem 1.35rem}.cima-editorial-quote>p{font-size:1.125rem}}
</style>
<p>Yulieth Carvajal, CEO de SoyTechno, dijo estas palabras en el discurso al recibir el premio.</p>
<blockquote class="cima-editorial-quote not-prose">
<p>«[...] Desde hace muchísimo tiempo soñamos una plataforma web que tuviese el nivel internacional que necesitamos ahora mismo en Venezuela. Gracias, Playful. Y en SoyTechno no solo creemos en el futuro de la tecnología, creemos en el futuro de Venezuela. [...]»</p>
<cite>Yulieth Carvajal, CEO de SoyTechno</cite>
</blockquote>
<blockquote class="cima-editorial-quote not-prose">
<p>«Este reconocimiento es muestra de lo que el país necesita, [...] porque definitivamente Venezuela está preparada para esto y para seguir creciendo en la categoría. Gracias.»</p>
<cite>Alejandra Da Costa, CEO de Playful Agency</cite>
</blockquote>
<p>En Playful Agency convertimos requisitos de negocio en experiencias digitales funcionales. Nuestro equipo de diseño y desarrollo trabaja sobre arquitectura, flujos, interfaz e integraciones para resolver necesidades concretas de ecommerce.</p>
<p>José Reyes, socio y CMO de Playful Agency, <a href="mailto:hello@playfulagency.com">hello@playfulagency.com</a></p>
<h3 id="que-son-los-premios-cima">¿Qué son los premios CIMA?</h3>
<p>Los Premios CIMA son un certamen venezolano de mercadeo y creatividad. La cuarta edición se celebró el 19 de octubre de 2026 en Caracas.</p>
`.trim();
