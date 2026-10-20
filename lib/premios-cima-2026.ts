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
  'SoyTechno y Playful Agency resultaron ganadores en la categoría Plataforma de E-commerce, del área de Mercadeo, de los Premios CIMA 2026';
export const PREMIOS_CIMA_2026_TITLE = PREMIOS_CIMA_2026_H1;
export const PREMIOS_CIMA_2026_EXCERPT =
  'El caso «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela» se llevó el premio de su categoría en la cuarta edición del certamen, celebrada el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, Salón Plaza Real, a las 5:00 pm.';
/** Meta description: el subtítulo recortado a ~155 caracteres. */
export const PREMIOS_CIMA_2026_META =
  'El caso «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela» se llevó el premio de su categoría en la cuarta edición del certamen.';
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
  'Salón Plaza Real del Hotel Eurobuilding de Caracas, con el logo de Premios CIMA en el escenario durante la ceremonia de 2026.';

export const PREMIOS_CIMA_2026_TROFEO_CAPTION = PREMIOS_CIMA_2026_TROFEO_ALT;
export const PREMIOS_CIMA_2026_ENTREGA_CAPTION = PREMIOS_CIMA_2026_ENTREGA_ALT;

export const PREMIOS_CIMA_2026_AUTHOR_NAME = 'Equipo editorial';

export const PREMIOS_CIMA_2026_BODY_HTML = `
<p>SoyTechno y Playful Agency resultaron ganadores de los <a href="https://premioscima.com" rel="noopener" target="_blank">Premios CIMA 2026</a> en la categoría <a href="/agencia-e-commerce">Plataforma de E-commerce</a>, del área de Mercadeo. La ceremonia de la cuarta edición se celebró el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, en el Salón Plaza Real, a las 5:00 pm.</p>
<figure>
  <img src="${PREMIOS_CIMA_2026_TROFEO_SRC}" alt="${PREMIOS_CIMA_2026_TROFEO_ALT}" width="${PREMIOS_CIMA_2026_TROFEO_WIDTH}" height="${PREMIOS_CIMA_2026_TROFEO_HEIGHT}" />
  <figcaption>${PREMIOS_CIMA_2026_TROFEO_CAPTION}</figcaption>
</figure>
<p>En Venezuela, la tecnología se compraba sobre todo por Instagram y por WhatsApp, y la visión de SoyTechno era demostrar que el venezolano compra en línea cuando tiene una infraestructura formal, segura y transparente. Playful Agency convirtió esa visión en la tienda en línea.</p>
<p>Esa tienda se adapta a cómo paga y confía Venezuela. El comprador elige la moneda y paga en bolívares o en divisas en un mismo flujo, desde una sola pantalla, y las cuotas pasan por la primera integración nativa del Botón de Pago de Cashea en una tienda en línea venezolana. Después del pago, el rastreo de MRW en tiempo real sigue el envío. Así, en 2025, SoyTechno cerró el año con 12.722 ventas, un 65% más que en 2024. Los Premios CIMA reconocen hoy ese resultado, y Playful Agency y SoyTechno agradecen a la organización el premio.</p>
<figure>
  <img src="${PREMIOS_CIMA_2026_ENTREGA_SRC}" alt="${PREMIOS_CIMA_2026_ENTREGA_ALT}" width="${PREMIOS_CIMA_2026_ENTREGA_WIDTH}" height="${PREMIOS_CIMA_2026_ENTREGA_HEIGHT}" />
  <figcaption>${PREMIOS_CIMA_2026_ENTREGA_CAPTION}</figcaption>
</figure>
<figure>
  <img src="${PREMIOS_CIMA_2026_SALON_SRC}" alt="${PREMIOS_CIMA_2026_SALON_ALT}" width="${PREMIOS_CIMA_2026_SALON_WIDTH}" height="${PREMIOS_CIMA_2026_SALON_HEIGHT}" />
</figure>
<p>Yulieth Carvajal, CEO de SoyTechno, dijo estas palabras en el discurso al recibir el premio. «[...] Desde hace muchísimo tiempo soñamos una plataforma web que tuviese el nivel internacional que necesitamos ahora mismo en Venezuela. Gracias, Playful. Y en SoyTechno no solo creemos en el futuro de la tecnología, creemos en el futuro de Venezuela. [...]»</p>
<p>Alejandra Da Costa, CEO de Playful Agency. «Este reconocimiento es muestra de lo que el país necesita, [...] porque definitivamente Venezuela está preparada para esto y para seguir creciendo en la categoría. Gracias.»</p>
<p>En Playful Agency convertimos requisitos de negocio en experiencias digitales funcionales. Nuestro equipo de diseño y desarrollo trabaja sobre arquitectura, flujos, interfaz e integraciones para resolver necesidades concretas de ecommerce.</p>
<p>José Reyes, socio y CMO de Playful Agency, <a href="mailto:hello@playfulagency.com">hello@playfulagency.com</a></p>
`.trim();
