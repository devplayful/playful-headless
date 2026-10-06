/**
 * Artículo vivo eShow Madrid 2026.
 * Copy literal de playful-copy #157, SHA 93d1533
 * (`pieces/eshow-articulo-vivo.md` + `pieces/eshow-lista-formulario.md`).
 *
 * datePublished es provisional hasta el deploy real a producción:
 * cambiar solo `ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL`.
 * dateModified y el lastmod del sitemap salen del bloque de cobertura
 * más reciente (una sola fuente).
 */

export const ESHOW_MADRID_2026_SLUG = 'eshow-madrid-2026';
export const ESHOW_MADRID_2026_CATEGORY_SLUG = 'otros';
export const ESHOW_MADRID_2026_CATEGORY_ID = 21;
export const ESHOW_MADRID_2026_PATH = '/blog/otros/eshow-madrid-2026';
export const ESHOW_MADRID_2026_CANONICAL =
  'https://playfulagency.com/blog/otros/eshow-madrid-2026';

export const ESHOW_MADRID_2026_H1 =
  'eShow Madrid 2026 en IFEMA: guía y cobertura de la feria';
export const ESHOW_MADRID_2026_TITLE =
  'eShow Madrid 2026: fechas, IFEMA, qué ver y cobertura';
export const ESHOW_MADRID_2026_META =
  'eShow Madrid 2026 en IFEMA el 4 y 5 de noviembre: fechas, qué trae la feria y cobertura de los dos días. Apúntate y recibe el informe.';
export const ESHOW_MADRID_2026_ABOUT_NAME = 'E-SHOW Madrid 2026';

/**
 * SEO-PENDING datePublished.
 * Constante fija hasta el deploy real a producción. No se vuelve a tocar
 * después. Hoy lleva la fecha prevista del 7 oct 2026 con offset de
 * Europe/Madrid (CEST, +02:00). SEO o Web la sustituye por la hora real
 * del GO a producción.
 */
export const ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL =
  '2026-10-07T00:00:00+02:00';

export const ESHOW_MADRID_2026_CABECERA_SRC =
  '/images/blog/eshow-madrid-2026-cabecera.webp';
export const ESHOW_MADRID_2026_PROGRAMA_SRC =
  '/images/blog/eshow-madrid-2026-programa.webp';
export const ESHOW_MADRID_2026_IMAGE_WIDTH = 1044;
export const ESHOW_MADRID_2026_IMAGE_HEIGHT = 1030;
export const ESHOW_MADRID_2026_CABECERA_ALT =
  'Cabecera de la web oficial de E-SHOW Madrid 2026 con las fechas del 4 y 5 de noviembre y los pabellones 3 a 5 de IFEMA Madrid';
export const ESHOW_MADRID_2026_PROGRAMA_ALT =
  'Programa oficial de E-SHOW Madrid 2026 ordenado por día y por sala, con el E-SHOW Keynote Theatre y el Ecommerce Strategies Theatre';

export const ESHOW_LISTA_FORM_SLOT = '<p data-eshow-lista-form="" hidden></p>';
export const ESHOW_LISTA_FORM_MARKER = '<!--eshow-lista-form-->';
export const ESHOW_LISTA_FORM_ID = 'web-eshow-madrid-2026';
export const ESHOW_LISTA_SOURCE = 'Lista Sigue el eShow';
export const ESHOW_LISTA_PRIVACY_URL = 'https://playfulagency.com/politica-de-privacidad';
export const ESHOW_LISTA_DEFAULT_UTM = {
  utm_source: 'blog',
  utm_medium: 'form',
  utm_campaign: 'eshow-madrid-2026',
} as const;

/** Añadir un bloque real = añadir una entrada. dateModified sigue al más reciente. */
export type EshowCoverageBlock = {
  datetime: string;
  label: string;
  html: string;
  id?: string;
};

export const ESHOW_MADRID_2026_COVERAGE_BLOCKS: EshowCoverageBlock[] = [
  {
    datetime: '2026-10-07T00:00:00+02:00',
    label: '7 de octubre de 2026 · Antes de la feria',
    html:
      '<p>La cobertura empieza el miércoles 4 de noviembre, con la apertura de IFEMA a las 10:00, y esta sección se actualiza durante el 4 y el 5 de noviembre. Cada bloque lleva fecha y hora, el más reciente va arriba y cuenta lo que se ve en salas, zonas y stands. Los envía desde el recinto José Reyes, de Playful Agency.</p>',
  },
];

const OFFSET_ISO =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export function assertEshowOffsetIso(value: string, field: string): string {
  const trimmed = value.trim();
  if (!OFFSET_ISO.test(trimmed)) {
    throw new Error(`${field} debe ser ISO con zona (p. ej. 2026-10-07T00:00:00+02:00).`);
  }
  return trimmed;
}

export function eshowCoverageBlockId(block: EshowCoverageBlock): string {
  if (block.id?.trim()) return block.id.trim();
  const match = block.datetime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`datetime de cobertura inválido: ${block.datetime}`);
  }
  return `bloque-${match[1]}-${match[2]}-${match[3]}-${match[4]}${match[5]}`;
}

export function sortEshowCoverageBlocks(
  blocks: readonly EshowCoverageBlock[] = ESHOW_MADRID_2026_COVERAGE_BLOCKS,
): EshowCoverageBlock[] {
  return [...blocks].sort((left, right) => (
    Date.parse(right.datetime) - Date.parse(left.datetime)
  ));
}

export function eshowMadrid2026DateModified(
  blocks: readonly EshowCoverageBlock[] = ESHOW_MADRID_2026_COVERAGE_BLOCKS,
): string {
  const latest = sortEshowCoverageBlocks(blocks)[0];
  return latest?.datetime || ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL;
}

export function formatEshowActualizadoLine(iso: string = eshowMadrid2026DateModified()): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `Actualizado el ${day} a las ${time}`;
}

export function renderEshowCoverageBlocks(
  blocks: readonly EshowCoverageBlock[] = ESHOW_MADRID_2026_COVERAGE_BLOCKS,
): string {
  return sortEshowCoverageBlocks(blocks)
    .map((block) => {
      const id = eshowCoverageBlockId(block);
      const datetime = assertEshowOffsetIso(block.datetime, `bloque ${id}`);
      return [
        `<article id="${id}" class="eshow-coverage-block">`,
        `<p><time datetime="${datetime}"><strong>${block.label}</strong></time></p>`,
        block.html,
        '</article>',
      ].join('\n');
    })
    .join('\n');
}

export const ESHOW_MADRID_2026_EXCERPT =
  'El eShow Madrid 2026 se celebra el miércoles 4 y el jueves 5 de noviembre en IFEMA Madrid, en los pabellones 3 a 5, de 10:00 a 19:00. Es la feria de ecommerce y marketing digital de Tech Show Madrid, y si tienes una tienda online te permite ver en dos días plataformas, pagos, logística y herramientas de captación que normalmente tendrías que buscar por separado.';

export function buildEshowMadrid2026BodyHtml(
  blocks: readonly EshowCoverageBlock[] = ESHOW_MADRID_2026_COVERAGE_BLOCKS,
): string {
  return `
<p>El eShow Madrid 2026 se celebra el miércoles 4 y el jueves 5 de noviembre en IFEMA Madrid, en los pabellones 3 a 5, de 10:00 a 19:00. Es la feria de ecommerce y marketing digital de Tech Show Madrid, y si tienes una tienda online te permite ver en dos días plataformas, pagos, logística y herramientas de captación que normalmente tendrías que buscar por separado.</p>
<p>Hasta la feria, esta página recoge lo que publica la organización y las preguntas que vamos a llevar a IFEMA. El 4 y el 5 de noviembre se actualiza con bloques fechados en la <a href="#cobertura">cobertura del eShow</a>, y después queda como resumen de la edición, con un informe para quien se apunte a la lista.</p>
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
<p>IFEMA avisa de que los accesos pueden cambiar, así que conviene revisar esa página la semana de la feria.</p>
<h2 id="que-es-eshow-y-en-que-se-diferencia-de-tech-show-madrid">Qué es eShow y en qué se diferencia de Tech Show Madrid</h2>
<p>Tech Show Madrid reúne en IFEMA varias ferias de tecnología, entre ellas Cloud &amp; AI Infrastructure, Cyber Security World, Big Data &amp; AI World, Data Centre World, Technology for Marketing y E-SHOW, y en esta edición suma HR &amp; Learning Technologies, dedicada a recursos humanos y formación. Lo organiza CloserStill Media.</p>
<p>El eShow es la parte de ecommerce de ese evento, y la web oficial lo presenta junto a Technology for Marketing como el punto de encuentro de ecommerce, marketing digital y tecnología aplicada al negocio digital en España. Por eso «Tech Show Madrid» y «eShow Madrid» comparten fechas, recinto y registro, pero lo que interesa a una tienda online está en las salas y en las zonas del eShow.</p>
<p>La web oficial dice que la edición de 2025 de E-SHOW y Technology for Marketing reunió a más de 470 empresas expositoras y patrocinadoras, más de 400 ponentes y más de 27.000 profesionales.</p>
<h2 id="que-trae-el-eshow-2026-si-tienes-tienda-online">Qué trae el eShow 2026 si tienes tienda online</h2>
<figure>
  <img src="${ESHOW_MADRID_2026_PROGRAMA_SRC}" alt="${ESHOW_MADRID_2026_PROGRAMA_ALT}" width="${ESHOW_MADRID_2026_IMAGE_WIDTH}" height="${ESHOW_MADRID_2026_IMAGE_HEIGHT}" />
</figure>
<p>El eShow tiene tres salas de conferencias propias, el E-SHOW Keynote Theatre, el Ecommerce Strategies Theatre y el Future Commerce Theatre, y comparte recinto con el Technology for Marketing Theatre. El programa está publicado por día y por sala, con sesiones todavía por confirmar, así que conviene volver a mirarlo a finales de octubre.</p>
<h3 id="las-zonas-del-eshow">Las zonas del eShow</h3>
<ul>
<li><strong>PrestaShop Village.</strong> La web oficial anuncia un espacio dedicado de PrestaShop, la plataforma de comercio electrónico de código abierto.</li>
<li><strong>Shopify Partner Village.</strong> Aparece en la web oficial entre los espacios del evento, sin más descripción.</li>
<li><strong>FBA Show.</strong> Es el congreso para vendedores de Amazon dentro del eShow. FBA son las siglas de Fulfillment by Amazon, el servicio con el que Amazon almacena y envía los pedidos del vendedor, y la web anuncia temas como el SEO (posicionamiento en buscadores), la publicidad y la logística en Amazon.</li>
<li><strong>Retail Media Show.</strong> Trata la publicidad que una marca contrata en el momento de la compra, dentro de las webs y las apps de los distribuidores, con stands y conferencias los dos días.</li>
</ul>
<h3 id="los-temas-del-programa-que-tocan-a-una-tienda">Los temas del programa que tocan a una tienda</h3>
<p>De los temas que la web oficial publica para las salas del eShow, estos son los que más afectan a una tienda online.</p>
<p><strong>Pagos.</strong> Están los pagos flexibles (la compra ahora y paga después), los pagos instantáneos y diversificados y los pagos multicurrency (en varias monedas). Si tu checkout (la página de pago) tiene pocos métodos o cobras fuera de España, son los primeros que conviene marcar.</p>
<p><strong>Conversión.</strong> La optimización de la tasa de conversión, que se conoce como CRO, aparece en las tres salas, igual que la omnicanalidad y el mobile commerce. Sirve para ver por qué parte del tráfico de tu tienda no termina en pedido.</p>
<p><strong>Catálogo, inventario y facturación.</strong> Aquí entran la logística con inventario unificado, el seguimiento de envíos en tiempo real y Verifactu, el sistema de facturación verificable que la normativa española pide a los programas de facturación. Si llevas el stock y las facturas en un ERP (el programa de gestión de tu negocio) o en un programa propio, aquí conviene preguntar cómo se conecta cada herramienta con él.</p>
<p><strong>Plataforma.</strong> Los dos villages te dejan ver Shopify y PrestaShop en la misma mañana. La plataforma se elige por el tamaño de tu catálogo, por los programas con los que la tienda tiene que hablar y por cómo cobras, así que conviene llevar esas tres cosas apuntadas antes de entrar.</p>
<p><strong>Búsqueda.</strong> En el Technology for Marketing Theatre están el SEO evolutivo, la búsqueda conversacional y el AEO (Answer Engine Optimization, el trabajo para que los buscadores que responden con inteligencia artificial muestren tu tienda). Si buena parte de tus ventas llega desde Google, es la parte del programa que más te toca.</p>
<h2 id="que-vamos-a-mirar-en-el-eshow">Qué vamos a mirar en el eShow</h2>
<p>La cobertura de los dos días sigue cinco preguntas que salen de las reuniones con equipos que tienen una tienda online o quieren rehacerla.</p>
<ol>
<li><strong>Cómo se conecta cada herramienta con el ERP o con el programa donde se llevan el stock y la facturación</strong>, sobre todo cuando ese programa es un desarrollo propio.</li>
<li><strong>Quién administra cada herramienta en el día a día</strong> y cuánto tiempo pide al equipo de la tienda.</li>
<li><strong>Cuánto se tarda en tenerlo todo funcionando</strong> una vez que la tienda entrega la información que pide el proveedor.</li>
<li><strong>Qué métodos de pago se presentan para cobrar a plazos, al instante o en varias monedas</strong>, y qué hace falta para activarlos.</li>
<li><strong>Cómo llega Verifactu a la facturación de una tienda online</strong> y cómo lo resuelven las herramientas que lo tratan.</li>
</ol>
<p>Las respuestas van a la cobertura y al informe.</p>
<h2 id="cobertura">Cobertura del eShow Madrid 2026</h2>
${renderEshowCoverageBlocks(blocks)}
<h2 id="sigue-el-eshow">Sigue el eShow con Playful</h2>
<p>Si no puedes ir a IFEMA o quieres tener los dos días en un mismo sitio, apúntate a la lista «Sigue el eShow con Playful». Recibes un resumen al cerrar cada día de feria y, cuando esté listo, el informe del eShow.</p>
${ESHOW_LISTA_FORM_SLOT}
<h2 id="como-registrarte">Cómo registrarte</h2>
<p>El registro se hace en la <a href="https://www.techshowmadrid.es/registro">web oficial de Tech Show Madrid</a>. Es un formulario único para todo el evento, y en el primer campo eliges la feria de interés principal, que en tu caso es E-SHOW.</p>
<p>Antes de rellenarlo, ten en cuenta tres condiciones publicadas.</p>
<ul>
<li>Si eres expositor o trabajas en una empresa expositora, el registro va por el portal del expositor.</li>
<li>La organización no permite la entrada a estudiantes y se reserva el derecho a cancelar la credencial.</li>
<li>Cuando un expositor escanea tu acreditación en su stand, recibe tus datos de registro.</li>
</ul>
<p>Al registrarte se crea además un perfil en la app del evento. Desde la app puedes consultar el programa y pedir citas de reunión antes, durante y después de la feria, así que conviene tenerla lista antes del 4 de noviembre.</p>
<h2 id="como-preparar-la-visita-para-que-no-se-quede-en-paseo">Cómo preparar la visita para que no se quede en paseo</h2>
<p>Dos días en tres pabellones dan para mucho, y es fácil volver con folletos y ninguna decisión.</p>
<ol>
<li><strong>Escribe antes de ir las dos o tres decisiones que tu tienda tiene pendientes.</strong> Puede ser cambiar de plataforma, añadir métodos de pago, conectar la tienda con tu inventario y tu facturación o mejorar el posicionamiento en buscadores. Lo que no ayude a cerrar una de ellas puede esperar.</li>
<li><strong>Cruza esas decisiones con el programa.</strong> Marca en la app las charlas que te interesan y deja huecos para moverte entre salas y stands.</li>
<li><strong>Pide las citas desde la app antes de la feria.</strong> Las conversaciones cerradas de antemano suelen dar más que las del pasillo.</li>
<li><strong>Lleva las mismas preguntas a todos los stands</strong>, para poder comparar respuestas al volver. Las tres primeras de «Qué vamos a mirar» sirven tal cual, y si piensas cambiar de plataforma, añade qué pasa con las direcciones actuales de tu tienda y con el posicionamiento que ya tienes.</li>
<li><strong>Toma notas después de cada conversación.</strong> Basta con el nombre, la empresa, lo que se dijo y el siguiente paso acordado.</li>
</ol>
<h2 id="despues-del-eshow-resumen-informe-y-que-decidir">Después del eShow: resumen, informe y qué decidir</h2>
<p>Cuando cierre la feria, la cobertura se queda en esta página como resumen de los dos días, y quien esté en la lista recibe el informe del eShow.</p>
<p>La semana siguiente es cuando se ve si la visita sirvió. Si tu equipo ha intentado lanzar o rehacer la tienda dos o tres veces y el proyecto nunca ha llegado a concretarse, la feria te da opciones, pero la decisión sigue pendiente hasta que alguien la pone en un calendario.</p>
<p>Con las notas delante, conviene responder tres preguntas. La primera es si tu tienda necesita rehacerse o solo conectarse mejor con el stock, la facturación y los pagos. La segunda es qué plataforma encaja con tu catálogo, con tus programas y con tu forma de cobrar, que puede ser la que ya tienes. La tercera es cuánto tiempo puede dedicar tu equipo al proyecto y qué parte quieres que lleve un equipo externo.</p>
<p>En Playful rehacemos y conectamos tiendas online en Shopify y WooCommerce. Conectamos la tienda con tu ERP o tu programa de facturación a través de su API (la vía por la que un programa intercambia datos con otro), y si no la tiene, construimos lo necesario. Si vienes de otra plataforma, cada dirección antigua redirige a su página nueva, así que Google y tus clientes llegan a la correcta.</p>
<p>En <a href="https://playfulagency.com/agencia-e-commerce">agencia de ecommerce</a> está cómo trabajamos una tienda completa, y en <a href="https://playfulagency.com/agencia-shopify">agencia Shopify</a>, lo que hacemos en esa plataforma. Si partes de cero, <a href="https://playfulagency.com/blog/tecnologia/crear-un-e-commerce">cómo crear un ecommerce</a> repasa los pasos. Jumex y Odwalla venden directamente a sus clientes con tiendas en Shopify que montó Playful, y puedes verlas en <a href="https://playfulagency.com/casos-de-exito">casos de éxito</a>.</p>
<p>Playful estará en el eShow los dos días. Si vas y quieres hablar, <a href="https://api.playfulagency.com/widget/bookings/reunion-playful">reserva una reunión</a>.</p>
`.trim();
}

export const ESHOW_MADRID_2026_BODY_HTML = buildEshowMadrid2026BodyHtml();
