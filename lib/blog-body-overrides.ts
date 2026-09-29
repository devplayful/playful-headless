/**
 * Closed-list HTML body overrides for blog posts whose signed copy
 * lives in Next (not WordPress). Featured image, category, and date
 * stay on WP. TOC still runs cheerio on this HTML (h2/h3 keep ids).
 *
 * When Contento ships a rewrite, also add `updatedAt` for that slug in
 * `lib/blog-editorial-meta.ts` so the “última actualización” byline appears.
 * WordPress is often left unedited; the override date is the source of truth.
 */
export const ZELLE_VE_BLOG_SLUG =
  'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';

export const MIGRACION_SEO_ALT_BLOG_SLUG =
  'migracion-seo-cambiar-de-plataforma-alternativa';

export const MIGRACION_SEO_PLAN_PATH =
  '/blog/seo/migracion-seo-cambiar-de-plataforma';

export const MIGRACION_SEO_ALT_BLOG_PATH =
  '/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa';


export const ZELLE_VE_BLOG_BODY_HTML = `
<p>Si ya recibes pagos por Zelle en tu negocio, sabes cómo es la rutina. Llega la notificación del banco, abres el correo, buscas el pedido en la tienda, cruzas monto y nombre, marcas como pagado y pasas al siguiente.</p>
<p>Cuando son pocos pedidos la cosa se maneja, pero en cuanto el volumen crece esa validación manual se convierte en un cuello de botella que te quita tiempo de vender y te obliga a dedicar horas a revisar capturas.</p>
<p>Este artículo te explica cómo integrar Zelle en el checkout de tu tienda online para que ese proceso se automatice, y qué puede hacer Playful Agency como <a href="https://playfulagency.com/agencia-e-commerce">agencia de ecommerce</a> para ayudarte a lograrlo.</p>
<blockquote>
<p><strong>Aviso importante:</strong> Playful Agency no abre, no crea y no gestiona cuentas Zelle. Somos una agencia de ecommerce que integra métodos de pago en tiendas online. Si necesitas abrir una cuenta Zelle, esa relación es directamente entre tu y tu banco en Estados Unidos.</p>
</blockquote>
<h2 id="que-es-zelle">¿Qué es Zelle?</h2>
<p>Si estás aquí, probablemente ya lo usas y lo que te interesa es entender cómo llevarlo al checkout de tu tienda de forma profesional.</p>
<p>Pero vale la pena repasar el contexto porque ayuda a entender las posibilidades y los límites de la integración.</p>
<p>Zelle es un sistema de pago interbancario que permite enviar y recibir dinero entre cuentas bancarias de Estados Unidos. Funciona dentro de la app o la plataforma web del banco participante, y la transferencia se ejecuta con el correo electrónico o el número de teléfono del destinatario.</p>
<p>Los fondos se acreditan de forma casi inmediata en la cuenta receptora, así que tanto el comprador como el comercio saben en poco tiempo que el pago se completó.</p>
<p>Para un negocio en Venezuela que ya recibe pagos en dólares a través de una cuenta bancaria en Estados Unidos, Zelle ya es parte de la operación diaria. El problema no es recibirlo, sino que cada pago llega como una transferencia suelta que alguien tiene que validar a mano, y eso se convierte en un dolor de cabeza operativo cuando el volumen de pedidos sube.</p>
<p>El ángulo de este artículo es precisamente ese. Tu ya tienes Zelle, ya cobras con él, pero necesitas que la validación deje de depender de una persona revisando correos uno por uno.</p>
<h2 id="como-funciona-zelle">¿Cómo funciona Zelle?</h2>
<p>El proceso desde el lado del comprador es sencillo. El cliente entra a la plataforma de su banco, selecciona la opción de Zelle, ingresa el correo electrónico o número del destinatario, coloca el monto y confirma el envío.</p>
<p>Zelle es un sistema multibancario, así que la interfaz puede variar de banco a banco, pero los pasos son esencialmente los mismos en todos los bancos participantes. Siempre es recomendable que el comprador guarde su comprobante de pago como respaldo.</p>
<p>Desde el lado del comercio, lo que llega es una notificación del banco confirmando que se recibieron los fondos. Y ahí empieza la parte que genera trabajo operativo: tomar esa notificación, buscar a qué pedido corresponde, verificar que el monto coincide y actualizar el estado de la orden en la tienda.</p>
<p>Cuando tienes cinco pedidos al día es manejable, pero cuando tienes veinte o treinta, esa tarea repetitiva consume recursos que podrían estar dedicados a vender, atender clientes o hacer crecer el negocio.</p>
<h2 id="cual-es-la-gran-ventaja-de-aceptar-zelle-en-venezuela">¿Cuál es la gran ventaja de aceptar Zelle en Venezuela?</h2>
<p>Por experiencia trabajando con <a href="https://playfulagency.com/blog/tecnologia/actualizar-tu-e-commerce">ecommerce</a> en Venezuela, hay tres ventajas concretas que hacen que Zelle funcione bien como método de pago para tiendas en línea.</p>
<p>La primera es que las transacciones se liquidan en dólares estadounidenses. El comercio recibe el monto exacto sin conversiones ni intermediarios, así que no hay pérdida por tipo de cambio ni comisiones de procesamiento como las que cobran algunas pasarelas internacionales.</p>
<p>La segunda es la velocidad. Los fondos se acreditan de forma casi inmediata, lo que reduce la incertidumbre entre el momento en que el cliente paga y el momento en que el comercio puede confirmar la compra y despachar el producto.</p>
<p>La tercera es la seguridad frente a reversiones. Las transferencias por Zelle, una vez completadas, no se pueden revertir.</p>
<p>Eso protege al comercio frente a contracargos, que es uno de los dolores más comunes cuando se trabaja con tarjetas internacionales o ciertas pasarelas de pago.</p>
<h2 id="es-posible-aceptar-zelle-en-venezuela">¿Es posible aceptar Zelle en Venezuela?</h2>
<p>Sí, pero hay que entender cómo funciona el sistema para no caer en confusiones. Zelle opera exclusivamente dentro del sistema bancario de Estados Unidos, así que tanto el comprador como el comercio necesitan cuentas en bancos estadounidenses participantes en la red Zelle.</p>
<p>No existe un «Zelle venezolano» ni hay bancos en Venezuela afiliados a la red de Zelle.</p>
<p>Lo que sí existe son negocios en Venezuela que cuentan con una cuenta bancaria en Estados Unidos afiliada a Zelle, y eso les permite recibir pagos de clientes que también operan con bancos estadounidenses.</p>
<p>Es una estructura relativamente común en el ecommerce venezolano, sobre todo en comercios que facturan en dólares y trabajan con proveedores o clientes que manejan cuentas en Estados Unidos.</p>
<p>Si tu negocio ya tiene esa cuenta bancaria y ya recibe pagos por Zelle, la oportunidad no está en empezar a aceptar Zelle, sino en integrar ese método dentro del checkout de tu tienda para que el proceso sea profesional y, sobre todo, para que la validación deje de ser manual.</p>
<h2 id="zelle-como-metodo-de-pago-en-venezuela-en-tiendas-en-linea-o-comercio-electronico">Zelle como método de pago en Venezuela en tiendas en línea o comercio electrónico</h2>
<p>En Venezuela, Zelle se ha convertido en uno de los <a href="https://playfulagency.com/pagos-online-ecommerce">métodos de pago</a> más utilizados por los compradores que manejan dólares. Esa realidad ya la conoces si vendes en línea, porque tus clientes te lo piden constantemente.</p>
<p>El reto no es aceptar Zelle como tal, porque la mayoría de los comercios que operan en dólares ya lo hacen, sino integrarlo dentro del flujo de compra de la tienda para que deje de ser un proceso informal que depende de mensajes de WhatsApp y capturas de pantalla.</p>
<p>Cuando Zelle está integrado en la pasarela de pago de la tienda, el comprador llega al checkout, selecciona Zelle como método de pago, recibe los datos del comercio directamente en pantalla y completa la transferencia desde su banco.</p>
<p>Eso elimina el ida y vuelta de «escríbeme por WhatsApp para darte los datos», que además de ser lento genera desconfianza en el comprador y aumenta la tasa de abandono del carrito.</p>
<p>Pero la integración en la pasarela es solo la primera parte. La segunda, y la que más impacto tiene en la operación diaria, es la automatización de la validación.</p>
<p>Cuando un cliente paga por Zelle, el banco envía un correo de confirmación al comercio. Ese correo se puede usar como punto de partida para una prevalidación automática que cruce los datos del pago con la orden en la tienda, así que en lugar de revisar cada pago a mano, el equipo solo tiene que confirmar los pedidos que ya pasaron por ese primer filtro automático.</p>
<h3 id="tiendas-online-en-venezuela-que-usan-zelle">Tiendas Online en Venezuela que usan Zelle</h3>
<p><a href="https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela">SoyTechno</a> es una tienda de tecnología en Venezuela que acepta Zelle como método de pago en su ecommerce construido con WooCommerce.</p>
<p><a href="https://soytechno.com/">Su catálogo</a> incluye smartphones, consolas de videojuegos, electrodomésticos y productos tecnológicos con amplia variedad.</p>
<p>Lo relevante del caso de SoyTechno para quien busca automatizar Zelle en su tienda es el sistema de prevalidación que se implementó. Cuando un cliente paga con Zelle, el correo de confirmación que envía el banco se cruza automáticamente con la orden correspondiente en WooCommerce.</p>
<p>Esa primera validación automática filtra los pagos, y el equipo de SoyTechno solo ve los pedidos que ya pasaron ese cruce. El resultado es una reducción enorme del tiempo dedicado a verificar pagos manualmente.</p>
<p>El cliente decidió mantener una segunda capa de validación manual como control adicional, pero la arquitectura permite ir a un flujo completamente automático si el negocio lo prefiere.</p>
<p>Ese nivel de automatización en la validación de Zelle dentro de WooCommerce es lo que marca la diferencia entre tener Zelle como opción de pago y tener Zelle funcionando como un método de pago profesional y escalable dentro del ecommerce.</p>
<h2 id="puede-tu-e-commerce-tener-zelle-como-metodo-de-pago">¿Puede tu E-Commerce tener Zelle como método de pago?</h2>
<p>Lo más probable es que sí, y si tu ecommerce está construido en <strong>WooCommerce</strong>, la respuesta es segura.</p>
<p>La integración en WooCommerce incluye no solo que Zelle aparezca como opción de pago en el checkout, sino también la posibilidad de automatizar la validación de los pagos. El flujo completo funciona así: el comprador selecciona Zelle en la pasarela, recibe los datos del comercio, paga desde su banco, y la confirmación del banco se cruza automáticamente con la orden en WooCommerce para una prevalidación automática.</p>
<p>Tu equipo se libera de revisar cada pago manualmente y solo interviene cuando hay algo puntual que verificar. Es el mismo sistema que implementamos en SoyTechno, y la diferencia operativa es enorme.</p>
<p>Si tu tienda está en <a href="https://playfulagency.com/agencia-shopify">Shopify</a>, Zelle puede aparecer como método de pago en el checkout, pero la validación de cada pago se hace de forma manual. Playful no ha automatizado ese cruce en Shopify porque la plataforma no ofrece la misma flexibilidad que WooCommerce para conectar la confirmación del banco con la orden en la tienda.</p>
<p>La ventaja de automatización real está en WooCommerce. Si tu operación ya recibe volumen de pagos por Zelle y quieres dejar de validar a mano, esa es la plataforma donde el flujo se puede llevar al nivel más eficiente.</p>
<h2 id="quieres-que-tu-e-commerce-tenga-zelle-en-su-pasarela-de-pago">¿Quieres que tu E-Commerce tenga Zelle en su pasarela de pago?</h2>
<p>Si tu ecommerce ya recibe pagos por Zelle y quieres que ese método aparezca de forma profesional en tu checkout y esté automatizado, podemos ayudarte.</p>
<p>En Playful Agency trabajamos la <a href="https://playfulagency.com/pasarela-de-pago-ecommerce">integración de pagos</a> para marcas que venden desde Venezuela, y Zelle es uno de los que más configuramos porque es el que más piden los compradores.</p>
<p><a href="https://playfulagency.com/reunion-playful">Agenda una reunión con nuestro equipo</a> y revisamos juntos cómo integrar Zelle en la pasarela de tu tienda, qué plataforma estás usando y qué nivel de automatización puedes alcanzar en la validación.</p>
<h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>
<p><strong>¿Playful abre o crea cuentas Zelle en Venezuela?</strong></p>
<p>No. Playful Agency es una <a href="https://playfulagency.com/agencia-e-commerce">agencia de ecommerce</a>. No abrimos, no creamos y no gestionamos cuentas Zelle.</p>
<p>Esa relación es entre el titular y su banco en Estados Unidos. Lo que hacemos es integrar Zelle como método de pago en el checkout de tu tienda online.</p>
<p><strong>¿Cómo se usa Zelle en Venezuela?</strong></p>
<p>Zelle se usa en Venezuela a través de cuentas bancarias en Estados Unidos que estén afiliadas a la red Zelle. Tanto el que envía como el que recibe necesitan tener cuenta en un banco estadounidense participante.</p>
<p>En el contexto de ecommerce, el comprador paga desde su banco y el comercio recibe los fondos en su cuenta en Estados Unidos, y la tienda puede integrar ese método directamente en su pasarela de pago para que el proceso sea ordenado y profesional.</p>
<p><strong>¿Qué bancos de Venezuela están afiliados a Zelle?</strong></p>
<p>Ninguno. No hay bancos venezolanos afiliados a Zelle.</p>
<p>Zelle es un sistema interbancario que opera exclusivamente entre bancos participantes en Estados Unidos. Lo que ocurre en Venezuela es que muchos negocios y compradores tienen cuentas en bancos estadounidenses que sí participan en la red Zelle, y eso les permite enviar y recibir pagos a través del sistema.</p>
<p><strong>¿Qué bancos son compatibles con Zelle?</strong></p>
<p>Zelle funciona con bancos e instituciones financieras en Estados Unidos que se han afiliado a su red. Entre los más conocidos están Bank of America, Chase, Wells Fargo, Citibank y Capital One, pero la lista completa incluye cientos de bancos y cooperativas de crédito.</p>
<p>Puedes verificar si tu banco participa directamente en el sitio web de Zelle o dentro de la app de tu banco.</p>
<p><strong>¿Cómo está el Zelle en Venezuela?</strong></p>
<p>Zelle sigue siendo uno de los métodos de pago más populares en Venezuela para transacciones en dólares, sobre todo en comercio electrónico. No ha cambiado la mecánica del sistema, que funciona entre cuentas bancarias en Estados Unidos.</p>
<p>Lo que sí ha crecido es la cantidad de negocios venezolanos que lo integran en sus tiendas en línea como método de pago formal dentro del checkout, en lugar de manejarlo por canales informales como WhatsApp o mensajes directos.</p>
`.trim();

export const MIGRACION_SEO_ALT_BLOG_BODY_HTML = `
<p>Si tu tienda online ya aparece en Google y estás por cambiar de plataforma, necesitas una migración SEO, porque lo que está en juego no es el diseño ni el catálogo.</p>
<p>Lo que está en juego es la lista de direcciones que Google ya conoce, cada ficha de producto, cada categoría y cada artículo que hoy te trae visitas sin pagar un anuncio.</p>
<p>Una migración SEO es el trabajo de llevar esa tienda a la plataforma nueva sin que esas direcciones se pierdan por el camino. Se hace antes, durante y después del cambio, y casi todo lo importante ocurre antes de apagar la tienda vieja.</p>
<p>Esta guía te sirve si dejas Shopify, WooCommerce o cualquier otra plataforma para pasarte a otra, sea cual sea el destino. Al final encuentras un ejemplo ilustrativo, con una tienda inventada que deja Shopify, y la lista de preguntas que conviene hacerle a la plataforma nueva antes de fijar la fecha de lanzamiento.</p>
<h2 id="que-cambia-de-verdad-cuando-cambias-de-plataforma-y-que-no-es-un-rediseno">Qué cambia de verdad cuando cambias de plataforma (y qué no es un rediseño)</h2>
<p>Cuando cambias de plataforma cambia mucho más que la pantalla que usas para cargar productos.</p>
<p>Cambia la estructura de tus URLs, porque cada plataforma arma las direcciones a su manera. Shopify, por ejemplo, fija patrones como <code>tudominio.com/products/nombre-del-producto</code> para las fichas, <code>tudominio.com/collections/nombre-de-la-coleccion</code> para las categorías y <code>tudominio.com/blogs/nombre-del-blog/titulo-del-articulo</code> para el blog. Es muy probable que tu plataforma nueva use otros patrones, y cada dirección vieja que deje de existir sin una redirección termina en un error 404 y pierde lo que había ganado en Google.</p>
<p>Cambian también las plantillas que generan tus títulos y descripciones, así que un title que trabajaste con cuidado puede volver al valor por defecto de la plataforma nueva sin que nadie lo note.</p>
<p>Y cambian los enlaces internos, el sitemap, el archivo <code>robots.txt</code> y las etiquetas canónicas, que son las piezas con las que Google entiende qué página es la buena y cómo recorrer tu tienda.</p>
<p>Un rediseño es otra cosa. En un rediseño te quedas en la misma plataforma, con las mismas URLs, y lo que cambia es cómo se ve la tienda. Si lo que estás planeando es eso, te conviene leer <a href="https://playfulagency.com/blog/seo/diseno-web-y-posicionamiento-seo">cómo rediseñar un e-commerce sin perder visibilidad SEO</a>, porque los riesgos y el orden de trabajo son distintos.</p>
<p>Google advierte que, cuando una web cambia de URLs, es normal ver una fluctuación temporal en el posicionamiento. El objetivo de la migración no es que eso no ocurra, sino que la tienda recupere su lugar y no se quede con la mitad de sus páginas perdidas.</p>
<h2 id="inventario-de-urls-y-de-lo-que-ya-te-posiciona">Inventario de URLs y de lo que ya te posiciona</h2>
<p>No puedes proteger lo que no has contado, así que el primer paso es un inventario completo de tu tienda actual.</p>
<p>Empieza con un rastreo de todo el sitio con una herramienta como Screaming Frog o Sitebulb. Ese rastreo te da la lista real de URLs que existen hoy, incluidas las que ya no enlazas desde el menú pero que siguen vivas.</p>
<p>Luego exporta los datos de Search Console y de tu analítica para saber qué páginas reciben impresiones, clics y ventas. Cruza esa lista con tu <code>sitemap.xml</code> y con tu <code>robots.txt</code>, porque ahí suelen aparecer páginas que el rastreo no encontró o secciones que llevas tiempo bloqueando sin saberlo.</p>
<p>De cada URL guarda también su title, su H1, su meta description, su canónica, el volumen aproximado de texto y los datos estructurados si los tiene. Esa exportación es tu copia de seguridad editorial, y la necesitas el día que compares la tienda nueva con la vieja.</p>
<p>Antes de cerrar el inventario, verifica que tienes acceso a la propiedad de Search Console de tu dominio actual y, si el dominio o el host cambian, también a la propiedad nueva.</p>
<p>Por último, confirma con la plataforma de destino cuál es el patrón de URL de cada tipo de página. Sin ese dato no se puede empezar el mapa.</p>
<h2 id="redirecciones-301-el-mapa-no-el-plugin">Redirecciones 301: el mapa, no el plugin</h2>
<p>Mucha gente piensa que las redirecciones 301 se resuelven instalando una herramienta en la plataforma nueva. La herramienta ayuda, pero el trabajo de verdad es el mapa.</p>
<p>El mapa es una tabla donde cada URL vieja apunta a su equivalente nueva, una por una, de modo que cada producto va a su producto, cada colección a su categoría y cada artículo a su artículo. Lo que no conviene hacer es mandar cientos de URLs viejas a la página de inicio, porque para Google eso no es una equivalencia y el posicionamiento de esas páginas se pierde igual.</p>
<p>Las redirecciones tienen que ser permanentes, es decir 301, y tienen que estar activas en el servidor que responda por tu dominio el mismo día en que cambias el DNS, no unos días después. Google indica que las redirecciones 301 y otras redirecciones permanentes no afectan negativamente el PageRank, así que bien hechas son la forma correcta de trasladar lo que ya ganaste.</p>
<p>Aquí hay un detalle que se escapa con frecuencia. Quien ejecuta las 301 es quien hospeda el dominio después del cambio, así que puede ser tu plataforma nueva, tu registrador o tu CDN. Esa responsabilidad tiene que tener nombre y apellido antes del lanzamiento.</p>
<p>Después del cambio toca revisar. Rastrea de nuevo la lista de URLs viejas y confirma que cada una responde con una 301 que termina en una página 200, sin cadenas de redirecciones ni bucles.</p>
<p>Envía el sitemap nuevo en Search Console y, si también cambiaste de dominio, usa la herramienta de cambio de dirección que ofrece Google. Durante las semanas siguientes vigila los errores 404, la cobertura y las impresiones.</p>
<p>Y no retires las redirecciones al poco tiempo. Google recomienda mantenerlas, y la guía de migración de Shopify pide conservarlas al menos un año, idealmente de forma indefinida.</p>
<h2 id="que-no-viaja-con-el-catalogo-pagos-apps-y-seguimiento-de-envios">Qué no viaja con el catálogo: pagos, apps y seguimiento de envíos</h2>
<p>Cuando exportas tu catálogo te llevas productos, variantes, precios e imágenes. Lo que no te llevas es todo lo que hoy ocurre alrededor de un pedido.</p>
<p>Los métodos de pago, las apps que resuelven algo en tu tienda y el seguimiento de envíos son una capa que hay que rehacer en el checkout y en la ficha del pedido de la plataforma nueva. No se migran solos, y si nadie los revisa antes del lanzamiento, la tienda nueva abre con menos formas de cobrar o de informar al comprador que la vieja.</p>
<p>En Venezuela esa capa pesa mucho, porque tus compradores pagan con métodos locales y en más de una moneda. Si hoy cobras con SiTef, con cuotas o con Zelle, tienes que confirmar cómo se conecta cada uno en el destino y cómo se concilia con tus pedidos. En Playful <a href="https://playfulagency.com/pagos-online-ecommerce">integramos cobros en tiendas online en Venezuela</a> y no somos una pasarela, así que esa revisión la hacemos método por método.</p>
<p>Si ofreces pagos en cuotas con Cashea, confirma qué resuelve el proveedor y qué tiene que resolver tu tienda en la plataforma nueva. Y si cobras en dólares con Zelle, en <a href="https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce">Zelle en Venezuela como método de pago para tu ecommerce</a> está cómo automatizar la validación, con una aclaración importante, que Playful no abre cuentas Zelle.</p>
<p>Con el seguimiento de envíos pasa algo parecido, y aquí conviene separar a los dos couriers más usados.</p>
<p>Zoom publica en su web una API con métodos públicos de rastreo de envíos, cálculo de precios y consulta de oficinas. Los métodos privados, como la creación de guías, están reservados a clientes corporativos.</p>
<p>MRW Venezuela no publica una API en mrwve.com. El seguimiento con MRW se resuelve por otra vía, con un enlace al rastreo de mrwve.com usando el número de guía, con la app MRW Móvil o cargando el número de guía en el pedido de la tienda para que el comprador lo tenga a mano. Si buscas documentación, ten cuidado de no confundirla con la de MRW España, cuya API no es la de MRW Venezuela.</p>
<h2 id="ejemplo-ilustrativo-una-tienda-online-venezolana-que-deja-shopify">Ejemplo ilustrativo: una tienda online venezolana que deja Shopify</h2>
<p>Para aterrizar todo lo anterior, vamos a usar un caso inventado. No es un cliente ni una marca real, y por eso no lleva nombre ni cifras. Piensa en una tienda online venezolana de artículos para el hogar que hoy vende en Shopify y que ya decidió pasarse a otra plataforma. El motivo del cambio no importa para esta guía, así que partimos de que el destino está elegido y de que lo que queda por delante es la migración.</p>
<p>El primer paso es el inventario. La tienda rastrea su sitio y exporta los datos de Search Console, y con eso separa lo que existe hoy en Shopify en cuatro grupos, que son las fichas de producto bajo <code>/products/</code>, las colecciones bajo <code>/collections/</code>, los artículos del blog bajo <code>/blogs/</code> y las páginas fijas, como envíos, contacto o preguntas frecuentes. De cada URL guarda el title, la meta description y el H1, y marca aparte las que reciben impresiones, clics o ventas, porque son las que más cuidado piden en el mapa.</p>
<p>Con el inventario cerrado, la tienda le pide a la plataforma nueva el patrón de URL de cada tipo de página y arma el mapa 1:1. Si, por ejemplo, la plataforma de destino usara <code>/producto/</code> para las fichas y <code>/categoria/</code> para las categorías, la ficha que hoy vive en <code>tudominio.com/products/juego-de-sartenes</code> tendría su 301 hacia <code>tudominio.com/producto/juego-de-sartenes</code>, y la colección <code>tudominio.com/collections/cocina</code> iría a <code>tudominio.com/categoria/cocina</code>. Esos patrones son un supuesto para el ejemplo, y los reales son los que confirme por escrito la plataforma que elijas.</p>
<p>Antes de fijar la fecha del cambio, la tienda necesita que la plataforma le responda por escrito las preguntas del último apartado, es decir, quién ejecuta las 301 el día del DNS, si los slugs y las canónicas se pueden controlar, si hay un sitemap que enviar a Search Console y si los titles y las metas se pueden editar. Mientras alguna de esas respuestas falte, la fecha no se fija.</p>
<p>Lo mismo aplica a la capa que no viaja con el catálogo. La tienda tiene que saber qué métodos de pago y qué seguimiento de envíos tiene la plataforma nueva el primer día, y cuáles hay que integrar después, para no abrir con menos formas de cobrar que antes.</p>
<p>Y el día del cambio, con el DNS ya apuntando al destino, la tienda vuelve a rastrear la lista de URLs viejas, comprueba que cada una termina en su página nueva con una sola 301 y envía el sitemap nuevo en Search Console.</p>
<h2 id="woocommerce-en-venezuela-y-shopify-como-via-internacional">WooCommerce en Venezuela y Shopify como vía internacional</h2>
<p>Si llegaste aquí buscando una alternativa a Shopify, esta guía no elige la plataforma por ti. Parte de que el destino ya está decidido y se concentra en que el cambio no te cueste el posicionamiento. Por eso el ejemplo anterior no nombra la plataforma de destino, porque los pasos son los mismos sea cual sea.</p>
<p>Lo que sí te podemos contar es cómo trabajamos nosotros cada plataforma.</p>
<p>Para vender en Venezuela con métodos de pago locales trabajamos con WooCommerce, que es donde tenemos experiencia integrando SiTef, Instapago, Cashea, Banesco, Zelle y BDV.</p>
<p>Shopify es nuestra vía para el ecommerce internacional, con procesadores como PayPal, Shop Pay y Mercado Pago en México. Si tu marca vende fuera de Venezuela, esa es la conversación de <a href="https://playfulagency.com/agencia-shopify">desarrollo de tiendas en Shopify</a>.</p>
<p>Tener clara esa diferencia antes de migrar evita una sorpresa frecuente, que es descubrir después del lanzamiento que la plataforma nueva no cobra con los métodos que usan tus compradores.</p>
<h2 id="como-no-mezclar-esta-migracion-con-un-rediseno-de-la-misma-tienda">Cómo no mezclar esta migración con un rediseño de la misma tienda</h2>
<p>Es tentador aprovechar el cambio de plataforma para estrenar diseño, reorganizar el menú y reescribir las fichas. Parece eficiente, pero complica mucho saber qué pasó si el tráfico cae.</p>
<p>La guía de migración de Shopify recomienda no mezclar un rediseño con una migración, y Google recomienda no cambiar a la vez el dominio, el gestor de contenidos y el diseño. La razón es sencilla. Si cambias todo el mismo día y las visitas bajan, no tienes forma de saber si el problema son las redirecciones, las plantillas nuevas o el contenido que reescribiste.</p>
<p>Por eso, en la tienda del ejemplo, lo sensato es migrar primero con el mismo diseño y el mismo contenido, confirmar que las URLs viejas redirigen bien y que el tráfico se estabiliza, y después trabajar el rediseño como un proyecto aparte.</p>
<p>Antes de dar el cambio por terminado revisa además dos cosas que suelen quedarse olvidadas. La primera es que la tienda nueva no tenga activo el <code>noindex</code> o la contraseña que se usó durante las pruebas. La segunda es que las canónicas apunten a tu dominio definitivo y no a la dirección temporal de la plataforma vieja.</p>
<h2 id="que-preguntarle-a-la-plataforma-nueva-antes-de-migrar">Qué preguntarle a la plataforma nueva antes de migrar</h2>
<p>Estas son las preguntas que conviene hacerle por escrito a la plataforma de destino antes de fijar la fecha del lanzamiento. Mientras no tengas la respuesta, trata cada punto como una duda abierta y no como algo que la plataforma ya resuelve.</p>
<ul>
<li>¿Quién configura las redirecciones 301 permanentes y en qué servidor quedan activas el día que cambias el DNS?</li>
<li>¿Puedo importar el mapa de redirecciones en un archivo o hay que cargarlas una por una?</li>
<li>¿Puedo controlar los slugs de productos, categorías y artículos, y qué prefijos agrega la plataforma a cada URL?</li>
<li>¿Cómo se configuran las etiquetas canónicas y a qué dominio apuntan?</li>
<li>¿La tienda genera un <code>sitemap.xml</code> que pueda enviar a Search Console, y se actualiza cuando agrego o quito productos?</li>
<li>¿Puedo editar el title y la meta description de cada producto, categoría y página?</li>
<li>¿Cómo se maneja el <code>robots.txt</code> y cómo se quita el <code>noindex</code> del entorno de pruebas al publicar?</li>
<li>¿Qué parte de todo esto está en su documentación pública y qué parte me confirman solo por escrito?</li>
<li>¿Qué métodos de pago y qué seguimiento de envíos tiene la tienda el primer día, y qué acceso dan a terceros para integrar lo que falte?</li>
</ul>
<p>Con esas respuestas en la mano ya puedes armar el mapa de redirecciones, planificar el día del cambio y saber qué capa de pagos y envíos hay que rehacer.</p>
<p>Si quieres revisar tu inventario de URLs o la capa de pagos antes de migrar, en Playful trabajamos <a href="https://playfulagency.com/agencia-e-commerce">proyectos de ecommerce completos</a> y podemos <a href="https://api.playfulagency.com/widget/bookings/reunion-playful">ver tu caso en una reunión de diagnóstico</a>.</p>
`.trim();

export const BLOG_BODY_OVERRIDES: Record<string, string> = {
  [ZELLE_VE_BLOG_SLUG]: ZELLE_VE_BLOG_BODY_HTML,
  [MIGRACION_SEO_ALT_BLOG_SLUG]: MIGRACION_SEO_ALT_BLOG_BODY_HTML,
};

export function blogBodyForSlug(slug: string | undefined | null): string {
  if (!slug) return '';
  return BLOG_BODY_OVERRIDES[slug] || '';
}
