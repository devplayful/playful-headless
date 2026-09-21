import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './SoyTechnoCaseStudy.module.css'

const base = '/images/casos/soytechno'
const image = (name: string) => `${base}/images/${name}`
const vector = (name: string) => `${base}/vectors/${name}`

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div className={styles.sectionTitle}>
    <h2>{children}</h2>
  </div>
)

const ContentItem = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={styles.contentItem}>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

export default function SoyTechnoCaseStudy() {
  return (
    <article className={`soytechno-case-study ${styles.page}`}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link><span>/</span>
        <Link href="/casos-de-exito-agencia-de-marketing-digital">Casos de éxito</Link>
        <span>/</span>
        <span>SoyTechno</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>SOYTECHNO: Transformación 100% Centrada en el Usuario</h1>
          <p>
            SOYTECHNO necesitaba transformar su presencia digital en una plataforma de alto rendimiento. El desafío no era solo vender, sino crear una experiencia de <em>E-commerce</em> con la <strong>funcionalidad y la robustez de una aplicación</strong>, capaz de manejar un catálogo variado y métodos de pago complejos como el cambio de moneda y <strong>Cashea</strong>.
          </p>
          <p>
            En <strong>Playful Agency</strong>, demostramos que la <strong>personalización radical</strong> del <em>User Experience (UX)</em> y la <em>User Interface (UI)</em> era la clave para la conversión masiva.
          </p>
        </div>
        <div className={styles.heroArtwork}>
          <Image src={image('hero-composition.png')} width={638} height={998} priority alt="Composición visual de SoyTechno, Cashea, WordPress y comercio electrónico" />
        </div>
      </section>

      <section className={styles.introSection}>
        <h2>El Desafío UX/UI: De un Catálogo Inusable a una Navegación Intuitiva</h2>
        <p>El reto principal era transformar un sitio web no centrado en el usuario a una plataforma pensada 100% para la conversión, que pudiera gestionar un catálogo gigante, priorizando la experiencia móvil.</p>
        <div className={styles.introIcons} aria-hidden="true">
          <Image src={image('lifestyle-i.png')} width={120} height={120} alt="" />
          <Image src={image('lifestyle-1.png')} width={120} height={120} alt="" />
          <span className={styles.blueIcon}><Image src={image('lifestyle-f-alt.png')} width={76} height={76} alt="" /></span>
        </div>
      </section>

      <section className={styles.challenge}>
        <div className={styles.challengeCopy}>
          <ContentItem title="PRIORIDAD MÓVIL COMO MANDATO:">
            <p>La directriz de Playful Agency fue innovadora: La presentación del pitch de negocio y los bocetos se hicieron primeramente móvil, garantizando que el E-commerce estuviera <strong>“muy, muy, muy bien resuelto en móvil”.</strong></p>
          </ContentItem>
          <ContentItem title="FILTROS INEFICACES:">
            <p>El sitio anterior presentaba un <strong>filtro global que era inusable</strong>, lo que obstaculizaba la navegación en un catálogo con múltiples categorías (teléfonos, hogar, etc.).</p>
          </ContentItem>
          <ContentItem title="DISEÑO NO HOMOLOGADO:">
            <p>La falta de estándares de marca y accesibilidad generaba desconfianza y confusión en el proceso de compra.</p>
          </ContentItem>
        </div>
        <div className={styles.challengeLogo}>
          <Image src={image('website-capture-01.png')} width={218} height={199} alt="SoyTechno" />
        </div>
        <div className={styles.challengeLaptop}>
          <Image src={image('rectangle-147.gif')} width={918} height={560} unoptimized alt="Sitio anterior de SoyTechno" />
        </div>
        <div className={styles.challengePhone}>
          <Image className={styles.challengePhoneScreen} src={image('iphone-frame-01.png')} width={720} height={1558} alt="Catálogo móvil de SoyTechno" />
          <Image className={styles.challengePhoneFrame} src={image('iphone-frame-02.png')} width={720} height={1558} alt="" aria-hidden="true" />
        </div>
        <div className={styles.challengeProducts}>
          <Image src={image('electrodomesticos-composition.png')} width={386} height={512} alt="Composición de electrodomésticos de SoyTechno" />
        </div>
      </section>

      <section className={styles.introSection}>
        <h2>Ingeniería de Checkout: La Duplicidad de Lógica y el Desafío Cashea</h2>
        <p>El checkout de SOYTECHNO no fue una configuración; fue una proeza de ingeniería que transformó la pasarela de pagos de WooCommerce en un sistema financiero altamente adaptado y de precisión milimétrica. Este desarrollo representa el punto de inflexión donde el E-commerce superó la funcionalidad estándar para convertirse en una solución empresarial.</p>
        <div className={styles.introIcons} aria-hidden="true">
          <Image src={image('lifestyle-i.png')} width={120} height={120} alt="" />
          <Image src={image('lifestyle-1.png')} width={120} height={120} alt="" />
          <Image className={styles.roundPhoto} src={image('lifestyle-f.jpg')} width={120} height={120} alt="" />
        </div>
      </section>

      <section className={styles.introSectionSmall}>
        <h2>UX/UI: Personalización Holística y Navegación de Alta Conversión</h2>
        <p>El diseño se enfocó en hacer el viaje del usuario lo más práctico posible, cumpliendo con los estándares de accesibilidad y evitando todos los niveles de frustración.</p>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>A. Arquitectura de Producto y Filtros Inteligentes</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <Image className={styles.tallMedia} src={image('giffycanvas-01.gif')} width={827} height={1134} unoptimized alt="Ficha de producto y ofertas de SoyTechno" />
          <div className={styles.textStack}>
            <ContentItem title="FICHA DE PRODUCTO (PDP) COMPLETA:"><p>La ficha o tarjeta de producto fue explotada al 100% para ser completa, incluyendo todas las características para que el usuario solo tenga que añadir al carrito y pagar.</p></ContentItem>
            <ContentItem title="CATEGORIZACIÓN POR SLIDER:"><p>El Home presenta las categorías principales en un slider que permite al usuario un acceso rápido a una categoría específica, logrando que el producto se adquiera en menos de tres clics.</p></ContentItem>
            <ContentItem title="FILTROS ADAPTATIVOS Y ESPECÍFICOS:"><p>Se personalizó el filtro para que cambiara según la categoría. Si el usuario está en Teléfonos, los filtros muestran RAM, almacenamiento y color. Si está en Hogar (televisores), el filtro se adapta a pulgadas, tipo de pantalla, color y tamaño.</p></ContentItem>
            <ContentItem title="DISEÑO DE OFERTAS ESTRATÉGICO:"><p>Se personalizó la sección de ofertas llamando a categorías mediante un tag o etiqueta. Las ofertas se visualizan cómodamente con tabs en el Home y en la gaveta de categorías (lateral izquierdo en escritorio).</p></ContentItem>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>B. Coherencia Visual y Diseño de Interfaz (UI)</SectionTitle>
        <div className={styles.brandPanel}>
          <div className={styles.paletteColumn}>
            <div className={`${styles.paletteCard} ${styles.darkCard}`}><b>DARK BLUE-GRAY</b><span>HEX: 686EA0</span><span>RGB: 104 / 110 / 160</span><span>CMYK: 35 / 31 / 0 / 37</span><Image src={vector('shipping-national.svg')} width={120} height={120} alt="Envíos nacionales" /></div>
            <div className={`${styles.paletteCard} ${styles.greenCard}`}><b>MAY GREEN</b><span>HEX: 44A147</span><span>RGB: 68 / 161 / 71</span><span>CMYK: 58 / 0 / 56 / 37</span><Image src={vector('payment-methods.svg')} width={120} height={120} alt="Métodos de pago" /></div>
            <div className={`${styles.paletteCard} ${styles.orangeCard}`}><b>CADMIUM ORANGE</b><span>HEX: F78D2B</span><span>RGB: 247 / 141 / 43</span><span>CMYK: 0 / 43 / 83 / 3</span><Image src={vector('delivery-caracas.svg')} width={120} height={120} alt="Entrega rápida" /></div>
          </div>
          <div className={styles.brandMediaColumn}>
            <div className={styles.brandPhoneMask}>
              <div className={styles.brandPhoneScreen}>
                <Image className={styles.brandPhoneContent} src={image('iphone-mockup.gif')} width={353} height={647} unoptimized alt="Interfaz móvil de SoyTechno" />
              </div>
              <Image className={styles.brandPhoneFrame} src={image('iphone-frame-02.png')} width={720} height={1558} alt="" aria-hidden="true" />
            </div>
            <div className={styles.circuitCard}><span>Circuito</span><Image src={image('circuito.png')} width={720} height={786} alt="Elemento gráfico Circuito" /></div>
          </div>
          <div className={styles.brandCopyColumn}>
            <div className={styles.logoCard}><Image src={image('soytechno-logo-white.png')} width={384} height={69} alt="SoyTechno" /></div>
            <div className={styles.brandText}>
              <ContentItem title="CROMÁTICA CONTROLADA:"><p>El principal desafío fue garantizar que la cromática estuviera atada al color principal de la marca, evitando un “arco iris de colores” y buscando el contraste directo con el azul de SOYTECHNO.</p></ContentItem>
              <ContentItem title="ELEMENTOS GRÁFICOS DE MARCA:"><p>El diseño se homologó a un mismo concepto, utilizando el elemento de branding llamado “Circuito” para dar personalidad a las pantallas y secciones.</p></ContentItem>
              <ContentItem title="BOTONES DE ALTA HEURÍSTICA:"><p>Los botones de acciones estándar en el sitio son azules, mientras que el botón de Comprar tiene un tono verde que lo hace característico y un punto de atención que cumple la intención automáticamente.</p></ContentItem>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>C. Pantallas Vacías y Notificaciones de Sistema</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <Image className={styles.tallMedia} src={image('giffycanvas-01.gif')} width={827} height={1134} unoptimized alt="Pantallas vacías y estados de SoyTechno" />
          <div className={styles.textStack}>
            <ContentItem title="PERSONALIZACIÓN DE ESTADOS:"><p>Se diseñaron y personalizaron las pantallas vacías (favoritos, comparar y el error 404), un detalle que casi nunca se trabaja, para que cumplieran cromáticamente con los estándares de la marca. Las pantallas vacías y los banners son el punto de mayor orgullo del diseño.</p></ContentItem>
            <ContentItem title="MENSAJES DE NOTIFICACIÓN:"><p>Se personalizó la heurística de las notificaciones del sistema (&quot;esto se ha añadido al carrito&quot;, &quot;este correo es incorrecto&quot;), usando colores acordes a éxito, advertencia y error para guiar al usuario.</p></ContentItem>
          </div>
        </div>
      </section>

      <div className={styles.divider} />
      <section className={styles.introSection}>
        <h2>Ingeniería de Checkout: La Duplicidad de Lógica y el Desafío Cashea</h2>
        <p>El checkout de SOYTECHNO no fue una configuración; fue una proeza de ingeniería que transformó la pasarela de pagos de WooCommerce en un sistema financiero altamente adaptado y de precisión milimétrica. Este desarrollo representa el punto de inflexión donde el E-commerce superó la funcionalidad estándar para convertirse en una solución empresarial.</p>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>1. Integración Cashea:</SectionTitle>
        <div className={`${styles.mediaTextGrid} ${styles.reverseMobile}`}>
          <div className={styles.textStack}>
            <h2 className={styles.subTitle}>Un Desarrollo Vanguardista para la Financiación</h2>
            <p>Este plugin ad hoc es la joya técnica del proyecto, construido en colaboración con la API de Cashea para manejar el alto riesgo y la complejidad de los pagos fraccionados.</p>
            <ContentItem title="DUPLICIDAD CRÍTICA DE LA LÓGICA:"><p>La solución exigió la duplicación total de la lógica interna de checkout de WooCommerce. Esto fue esencial para controlar y validar la transacción específica de Cashea, asegurando que el sistema interpretara correctamente el regreso del cliente desde la web app (consumiendo el precio vía método GET).</p></ContentItem>
            <ContentItem title="GESTIÓN ASÍNCRONA DE LA INICIAL:"><p>El plugin maneja con precisión el pago de la inicial, la notificación de éxito por correo, y garantiza la sincronización total del estado de la compra, con la capacidad única de cancelación bidireccional.</p></ContentItem>
          </div>
          <Image className={styles.tallMedia} src={image('giffycanvas-02.gif')} width={729} height={1000} unoptimized alt="Integración Cashea" />
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>2. Arquitectura Wizard (Multistep) y Lógica de Facturación</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <div className={styles.ipadComposite}>
            <div className={styles.ipadScreen}>
              <Image src={image('ipad-mockup-01.png')} width={1640} height={2360} alt="Formulario del checkout multistep de SoyTechno" />
            </div>
            <Image className={styles.ipadFrame} src={image('ipad-mockup-02.png')} width={750} height={541} alt="" aria-hidden="true" />
          </div>
          <div className={styles.textStack}>
            <p>La idea de afrontar el checkout de forma distinta, como un wizard, se implementó contratando un plugin multistep y personalizándolo al extremo para la regla de negocio de SOYTECHNO.</p>
            <ContentItem title="FLUJO MULTISTEP (WIZARD):"><p>Se migró del flujo lineal a un proceso de pasos (wizard), dividiendo el llenado en Facturación (datos del comprador) y Envío (datos del receptor), que puede ser una persona distinta (familiar, amigo, etc.).</p></ContentItem>
            <ContentItem title="REGLA DE NEGOCIO:"><p>Se añadió una personalización crucial: un campo que valida si el cliente tiene determinadas características y en caso de poseerlas, no se procede con la compra.</p></ContentItem>
            <ContentItem title="GESTIÓN DE ASESORES Y TRAZABILIDAD:"><p>Desarrollamos un script para que el cliente pueda asociar su compra a un asesor. La carga de asesores es asíncrona (elige tienda, y luego el asesor de esa tienda). Creamos un plugin adicional que permite la sincronización masiva de tiendas y asesores a través de la carga de un Excel.</p></ContentItem>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>3. Sistema Logístico Predictivo: Cero Errores en la Entrega</SectionTitle>
        <div className={`${styles.mediaTextGrid} ${styles.reverseMobile}`}>
          <div className={styles.textStack}>
            <p>Este sistema elimina el error humano y automatiza las reglas de negocio de SOYTECHNO, logrando un margen de error mínimo.</p>
            <ContentItem title="ALGORITMO DE FILTRADO MRW AVANZADO:"><p>Al seleccionar un estado (ej. Zulia), el sistema filtra dinámicamente solo las agencias MRW disponibles, garantizando que &quot;nunca se ha tenido queja de que el producto se perdió o llegó a otra agencia&quot;.</p></ContentItem>
            <ContentItem title="APLICACIÓN DE CONDICIONALES GEOGRÁFICAS:"><p>El sistema aplica condicionales estrictas por ubicación: Distrito Capital: El cliente solo puede elegir entre Delivery o Retiro en Almacén (regla de negocio). Guarenas/Guatire: Se habilita la opción de &quot;Punto de Entrega&quot; para entregas semanales en puntos específicos.</p></ContentItem>
          </div>
          <Image className={styles.logisticsMedia} src={image('logistics-composition.png')} width={1300} height={1458} alt="Sistema de envíos y rastreo MRW de SoyTechno" />
        </div>
      </section>

      <section className={styles.resultsIntro}>
        <h2>Los Resultados que Posicionan a SOYTECHNO</h2>
        <p>La implementación tecnológica en WooCommerce no solo mejoró la apariencia del sitio, sino que transformó la operación de venta de SOYTECHNO, consolidando un E-commerce que cumple estándares de conversión al 100%.</p>
        <div className={styles.resultsGrid}>
          <ContentItem title="LIDERAZGO EN MÉTODOS DE PAGO:"><p>SOYTECHNO es un referente con una integración de Cashea que otras grandes marcas han intentado y no han podido replicar.</p></ContentItem>
          <ContentItem title="CONVERSIÓN SIMPLIFICADA:"><p>El diseño móvil y la fluidez del checkout garantizan que el viaje del usuario sea lo más práctico posible, transformando la experiencia de compra en una conversión fluida.</p></ContentItem>
          <ContentItem title="ROBUSTEZ DE WEB APP:"><p>El uso de WoodMart sobre WooCommerce nos permitió crear un E-commerce con la funcionalidad de una aplicación, capaz de manejar la lógica de transacciones complejas y la sincronización de inventario/asesores en tiempo real.</p></ContentItem>
        </div>
      </section>

      <section className={styles.phonesSection}>
        <Image src={image('phones-composition.png')} width={2400} height={1672} alt="Flujo móvil de compra de SoyTechno" />
      </section>

      <section className={styles.testimonial}>
        <Image className={styles.quoteArt} src={vector('quote-background.svg')} width={841} height={599} alt="" aria-hidden="true" />
        <div className={styles.client}>
          <Image src={image('testimonial-avatar.png')} width={249} height={249} alt="Eva Luciani" />
          <h2>Eva Luciani</h2>
          <p>Grupo SoyTechno</p>
        </div>
        <blockquote>“No tenemos que estar detrás de ustedes para que nos den respuesta o para nosotros poder ver cómo va el proyecto.”</blockquote>
      </section>

      <section className={styles.cta}>
        <Image className={styles.ctaArt} src={image('cta-illustration.png')} width={720} height={720} alt="Equipo de comercio electrónico" />
        <div className={styles.ctaCopy}>
          <h2>¿Tu E-commerce está listo para el nivel de un Web App?</h2>
          <p>Si tu plataforma necesita una personalización radical para manejar métodos de pago complejos y asegurar una experiencia móvil de primera, hablemos.</p>
          <p>¡Contáctanos y descubre cómo podemos llevar tu E-commerce a un nuevo nivel de robustez y diseño!</p>
          <Link href="/reunion-playful">¡Hablemos de tu proyecto!</Link>
        </div>
      </section>

      <nav className={styles.breadcrumb} aria-label="Más casos de éxito">
        <Link href="/reunion-playful">Agenda una reunión</Link>
        <span>/</span>
        <Link href="/casos-de-exito/jumex-shopify-dtc-ecommerce">Jumex Shopify DTC: canal propio para un catálogo grande</Link>
        <span>/</span>
        <Link href="/casos-de-exito/odwalla-shopify-dtc-ecommerce">Odwalla Shopify DTC: de sitio informativo a tienda</Link>
      </nav>
    </article>
  )
}
