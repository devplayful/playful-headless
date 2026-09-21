import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './SoyTechnoCaseStudy.module.css'

const base = '/images/casos/soytechno'
const image = (name: string) => `${base}/images/${name}`
const vector = (name: string) => `${base}/vectors/${name}`

const approvedCopy = {
  title: 'SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela',
  executiveChallenge: 'Tras su soft launch, SoyTechno debía consolidar su eCommerce en un mercado donde la industria asumía que el consumidor no confía y solo compra por WhatsApp. El reto 2025: demostrar que el venezolano sí transacciona masivamente online cuando se le brinda una infraestructura formal, segura y transparente.',
  insight: 'El venezolano no compra tecnología; la planifica. Con 67% de compras en divisas, BNPL creciendo +250% y 43% estirando cada dólar, el ganador no es el más barato: es quien ofrece catálogo, cuotas y autonomía. El consumidor no abandona por desinterés, sino por fricción logística y de pago.',
  idea: 'Mientras la categoría asumía que el venezolano vivía con miedo de comprar online, Soytechno asumió lo contrario —que estaba cansado de la informalidad— y lo trató como comprador real dándole un ecosistema con autonomía y transparencia, cuando la industria todavía lo trata como seguidor.',
  executiveResults: 'Alcanzamos 2,8 millones de usuarios activos y 5,2 millones de sesiones. Logramos una tasa de conversión del 2,57% sobre usuarios recurrentes —por encima del promedio global del eCommerce (1,5–2%)—, cerrando el año con 12.722 ventas, +65% vs 2024 y un ticket promedio de $450–$600.',
  challenge: 'En 2025, el eCommerce venezolano creció +125% (Cavecom-e), pero la industria seguía operando en la informalidad: ventas por mensaje directo, precios ocultos y un mercado con solo 18,5% de bancarización crediticia. El reto de SoyTechno no era tecnológico, era de confianza. Debía demostrar que el venezolano sí transacciona masivamente online cuando se le ofrece una infraestructura formal, segura y transparente, en un entorno donde la categoría asumía que el consumidor prefería el WhatsApp y donde las opciones de pago digital eran escasas o inexistentes.',
  audience: 'La audiencia son consumidores venezolanos de 18 a 45 años, hiperconectados, con acceso a smartphones y poder adquisitivo limitado: ya compraban tecnología en redes informales (Instagram, WhatsApp), enfrentando fricción de pagos multimoneda, desconfianza en envíos y exposición a estafas. Navegan en su mayoría desde dispositivos móviles con Android. Geográficamente está distribuida en 7 ciudades clave (Caracas, Valencia, Maracaibo, Barquisimeto, Guayana, Maracay, Barcelona). Su relevancia para SoyTechno es directa: es el segmento que ya existe digitalmente, que concentra la demanda real de tecnología en Venezuela y que ya estaba comprando online.',
  objectives: 'SoyTechno definió cinco objetivos para 2025: (1) Dar a conocer la plataforma a nivel nacional y posicionarla como opción moderna, segura y automatizada para comprar tecnología. (2) Educar al consumidor venezolano sobre el uso de métodos de pago digitales —bolívares, divisas y financiamiento en cuotas— para reducir la fricción y mejorar la conversión. (3) Incrementar las ventas online mediante optimización de la experiencia de usuario y cobertura de envíos en todo el país. (4) Fortalecer la reputación digital de la marca como referente confiable del sector tecnológico venezolano. (5) Automatizar la atención al cliente para escalar sin perder calidad de respuesta.',
  strategy: 'Con un enfoque trimestral (Q1: Reconocimiento, Q2: Expansión, Q3: Escalabilidad, Q4: Fidelización), SoyTechno consolidó un ecosistema Mobile-First basado en tres pilares. (1) Autonomía Financiera: Primera integración nativa con Cashea en un eCommerce venezolano y Smart Checkout que elimina la fricción multimoneda. (2) Transparencia Logística: Filtros dinámicos de MRW y rastreo en tiempo real, capitalizando la Semana Cosecha Cashea con picos de 31.000 usuarios diarios. (3) Arquitectura de Confianza: Asistente IA entrenado con miles de consultas reales que absorbió picos de hasta 1.500 chats acumulados, reduciendo tiempos de respuesta de horas a segundos.',
  strategicResponse: 'El mercado asumía que el venezolano no compraba online por desconfianza. El insight real era otro: no le faltaba disposición, le faltaba una plataforma que lo tratara como comprador real. La respuesta fue diseñar un ecosistema Mobile-First que eliminó cada punto de fricción del comercio informal: precios publicados en múltiples monedas, financiamiento en cuotas disponible desde el mismo checkout, logística rastreable en tiempo real y atención automatizada disponible las 24 horas. No se le pidió al usuario que confiara primero. Se le dio la infraestructura para que la confianza fuera la consecuencia natural de cada interacción.',
  media: 'La plataforma fue el medio principal. SoyTechno.com concentró toda la experiencia de compra: un Smart Checkout con soporte multimoneda (bolívares y divisas) y la primera integración nativa de Cashea en un eCommerce venezolano para compras en cuotas. El módulo de rastreo MRW en tiempo real —con 816.000 vistas en el año— operó como herramienta de confianza postventa. Freshchat con inteligencia artificial Freddy AI gestionó la atención al cliente, absorbiendo picos de hasta 1.500 chats acumulados por jornada y reduciendo los tiempos de respuesta de horas a segundos. Todo dentro de un solo ecosistema digital, sin canales externos.',
  results: 'Los resultados validan la transformación del hábito de consumo. Alcanzamos 2,8 millones de usuarios activos (+711% de Q1 a Q3), 5,2 millones de sesiones y 7,6 millones de interacciones. Logramos una tasa de conversión global del 2,57% sobre los 495.000 usuarios recurrentes —por encima del promedio mundial del eCommerce (1,5–2%)—. La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  evidence: 'El indicador más contundente no es el volumen de tráfico, sino su origen: el 44,48% de las sesiones llegó de forma directa, sin publicidad. Los usuarios buscaban a SoyTechno por nombre. El tráfico orgánico, con una tasa de interacción del 66,54%, fue el canal de mayor intención de compra de todo el ecosistema. La Semana Cosecha Cashea concentró 4.043 ventas en un solo mes, el 32% de las ventas totales del año. Cerramos 2025 con 12.722 ventas, un ticket promedio de $450–$600 (+125–200% vs 2024) y 31.259 usuarios registrados, confirmando que la plataforma desbloqueó la compra de tecnología de alto valor en Venezuela.',
  baseline: 'SoyTechno arrancó diciembre de 2024 con 99.384 usuarios activos mensuales. En julio de 2025 registró 685.732: un crecimiento de ×6,9 en ocho meses. Cada objetivo declarado al inicio del año tuvo su respuesta en datos: la consolidación de marca se tradujo en 2,8 millones de usuarios activos y 2,7 millones de usuarios nuevos; la educación en métodos de pago se reflejó en una tasa de conversión del 2,57%, por encima del promedio mundial del eCommerce (1,5–2%); y la automatización de la atención permitió gestionar picos de hasta 1.500 chats acumulados por jornada sin escalar el equipo humano.',
  innovation: 'La innovación fue adaptar tecnología global a la hipercomplejidad venezolana. Desarrollamos un Smart Checkout propietario que resuelve la dualidad cambiaria y logramos la primera integración de Cashea en web. Implementamos Freshchat (Freshworks) con IA Freddy, entrenado con miles de consultas reales de visitantes, que gestionó picos de hasta 1.500 chats acumulados por jornada, reduciendo tiempos de respuesta de horas a segundos y liberando al equipo para cerrar ventas. Los filtros adaptativos bajaron el rebote a 11% en celulares. El aporte: SoyTechno demostró que el eCommerce formal, automatizado y de alta gama sí es viable en Venezuela.',
  resources: 'Se desarrolló un Smart Checkout propietario que resuelve la dualidad cambiaria venezolana, permitiendo al usuario pagar en bolívares o divisas desde una sola pantalla. Se logró la primera integración nativa de Cashea en un eCommerce venezolano, habilitando compras en cuotas directamente en el flujo de pago. Para la atención al cliente se implementó Freshchat de Freshworks con el motor de inteligencia artificial Freddy AI, entrenado con miles de consultas reales de visitantes de la plataforma. El resultado: gestión de picos de hasta 1.500 chats acumulados por jornada, con tiempos de respuesta reducidos de horas a segundos.',
  contribution: 'SoyTechno demostró que el eCommerce formal, automatizado y de alta gama es viable en Venezuela. En un mercado donde la industria operaba por mensaje directo y sin precios publicados, la plataforma estableció un nuevo estándar: catálogo transparente, métodos de pago digitales accesibles y logística rastreable. Eso no solo benefició a SoyTechno, educó al consumidor venezolano sobre cómo comprar tecnología online con autonomía y seguridad. Cada transacción completada en la plataforma es una demostración práctica de que la informalidad no es una condición permanente del mercado venezolano, sino un problema de infraestructura que tiene solución.',
} as const

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
      <div className={styles.heroBackdrop}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link><span>/</span>
          <Link href="/casos-de-exito-agencia-de-marketing-digital">Casos de éxito</Link>
          <span>/</span>
          <span>SoyTechno</span>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>{approvedCopy.title}</h1>
            <p>{approvedCopy.executiveChallenge}</p>
            <p>{approvedCopy.insight}</p>
          </div>
          <div className={styles.heroArtwork}>
            <Image src={image('hero-composition.png')} width={638} height={998} priority alt="Composición visual de SoyTechno, Cashea, WordPress y comercio electrónico" />
          </div>
        </section>
      </div>

      <section className={styles.introSection}>
        <h2>El desafío no era tecnológico, era de confianza</h2>
        <p>{approvedCopy.challenge}</p>
        <div className={styles.introIcons} aria-hidden="true">
          <Image src={image('lifestyle-i.png')} width={120} height={120} alt="" />
          <Image src={image('lifestyle-1.png')} width={120} height={120} alt="" />
          <span className={styles.blueIcon}><Image src={image('lifestyle-f-alt.png')} width={76} height={76} alt="" /></span>
        </div>
      </section>

      <section className={styles.challenge}>
        <div className={styles.challengeCopy}>
          <ContentItem title="La idea: tratar al venezolano como comprador real">
            <p>{approvedCopy.idea}</p>
          </ContentItem>
          <ContentItem title="Una audiencia que ya compraba online">
            <p>{approvedCopy.audience}</p>
          </ContentItem>
          <ContentItem title="Cinco objetivos para consolidar la plataforma">
            <p>{approvedCopy.objectives}</p>
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
        <h2>Una estrategia trimestral para construir autonomía y confianza</h2>
        <p>{approvedCopy.strategy}</p>
        <div className={styles.introIcons} aria-hidden="true">
          <Image src={image('lifestyle-i.png')} width={120} height={120} alt="" />
          <Image src={image('lifestyle-1.png')} width={120} height={120} alt="" />
          <Image className={styles.roundPhoto} src={image('lifestyle-f.jpg')} width={120} height={120} alt="" />
        </div>
      </section>

      <section className={styles.introSectionSmall}>
        <h2>La confianza como consecuencia de cada interacción</h2>
        <p>{approvedCopy.strategicResponse}</p>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>A. El ecosistema digital como medio principal</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <Image className={styles.tallMedia} src={image('giffycanvas-01.gif')} width={827} height={1134} unoptimized alt="Ficha de producto y ofertas de SoyTechno" />
          <div className={styles.textStack}>
            <ContentItem title="Un solo ecosistema de compra"><p>{approvedCopy.media}</p></ContentItem>
            <ContentItem title="Innovación adaptada a Venezuela"><p>{approvedCopy.innovation}</p></ContentItem>
            <ContentItem title="Herramientas para reducir la fricción"><p>{approvedCopy.resources}</p></ContentItem>
            <ContentItem title="Un nuevo estándar para el mercado"><p>{approvedCopy.contribution}</p></ContentItem>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>B. Resultados que validan el cambio de hábito</SectionTitle>
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
              <ContentItem title="Escala y conversión"><p>{approvedCopy.executiveResults}</p></ContentItem>
              <ContentItem title="La intención llegó por canales propios"><p>{approvedCopy.evidence}</p></ContentItem>
              <ContentItem title="Crecimiento frente al punto de partida"><p>{approvedCopy.baseline}</p></ContentItem>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>C. Innovación y aporte más allá de la interfaz</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <Image className={styles.tallMedia} src={image('giffycanvas-01.gif')} width={827} height={1134} unoptimized alt="Pantallas vacías y estados de SoyTechno" />
          <div className={styles.textStack}>
            <ContentItem title="Tecnología global para la hipercomplejidad venezolana"><p>{approvedCopy.innovation}</p></ContentItem>
            <ContentItem title="Una infraestructura que educó al mercado"><p>{approvedCopy.contribution}</p></ContentItem>
          </div>
        </div>
      </section>

      <div className={styles.divider} />
      <section className={styles.introSection}>
        <h2>La prueba del éxito: resultados y KPIs</h2>
        <p>{approvedCopy.results}</p>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>1. Autonomía financiera: Smart Checkout y Cashea</SectionTitle>
        <div className={`${styles.mediaTextGrid} ${styles.reverseMobile}`}>
          <div className={styles.textStack}>
            <h2 className={styles.subTitle}>Financiamiento y moneda sin salir del flujo de compra</h2>
            <p>{approvedCopy.resources}</p>
            <ContentItem title="El medio principal fue la plataforma"><p>{approvedCopy.media}</p></ContentItem>
            <ContentItem title="Una innovación diseñada para Venezuela"><p>{approvedCopy.innovation}</p></ContentItem>
          </div>
          <Image className={styles.tallMedia} src={image('giffycanvas-02.gif')} width={729} height={1000} unoptimized alt="Integración Cashea" />
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>2. Arquitectura de confianza: una experiencia Mobile-First</SectionTitle>
        <div className={styles.mediaTextGrid}>
          <div className={styles.ipadComposite}>
            <div className={styles.ipadScreen}>
              <Image src={image('ipad-mockup-01.png')} width={1640} height={2360} alt="Formulario del checkout multistep de SoyTechno" />
            </div>
            <Image className={styles.ipadFrame} src={image('ipad-mockup-02.png')} width={750} height={541} alt="" aria-hidden="true" />
          </div>
          <div className={styles.textStack}>
            <p>{approvedCopy.strategicResponse}</p>
            <ContentItem title="Objetivos para consolidar la plataforma"><p>{approvedCopy.objectives}</p></ContentItem>
            <ContentItem title="Una audiencia móvil e hiperconectada"><p>{approvedCopy.audience}</p></ContentItem>
            <ContentItem title="La idea que cambió el enfoque"><p>{approvedCopy.idea}</p></ContentItem>
          </div>
        </div>
      </section>

      <section className={styles.standardSection}>
        <SectionTitle>3. Transparencia logística y confianza postventa</SectionTitle>
        <div className={`${styles.mediaTextGrid} ${styles.reverseMobile}`}>
          <div className={styles.textStack}>
            <p>{approvedCopy.media}</p>
            <ContentItem title="La confianza era el verdadero reto"><p>{approvedCopy.challenge}</p></ContentItem>
            <ContentItem title="El aporte al mercado venezolano"><p>{approvedCopy.contribution}</p></ContentItem>
          </div>
          <Image className={styles.logisticsMedia} src={image('logistics-composition.png')} width={1300} height={1458} alt="Sistema de envíos y rastreo MRW de SoyTechno" />
        </div>
      </section>

      <section className={styles.resultsIntro}>
        <h2>Resultados que cambiaron la categoría</h2>
        <p>{approvedCopy.results}</p>
        <div className={styles.resultsGrid}>
          <ContentItem title="Escala y conversión"><p>{approvedCopy.executiveResults}</p></ContentItem>
          <ContentItem title="La evidencia de una marca buscada por nombre"><p>{approvedCopy.evidence}</p></ContentItem>
          <ContentItem title="Del punto de partida al crecimiento ×6,9"><p>{approvedCopy.baseline}</p></ContentItem>
        </div>
      </section>

      <section className={styles.phonesSection}>
        <Image src={image('phones-composition.png')} width={2400} height={1672} alt="Flujo móvil de compra de SoyTechno" />
      </section>

      <section className={styles.testimonial}>
        <Image className={styles.quoteArt} src={vector('quote-background.svg')} width={841} height={599} alt="" aria-hidden="true" />
        <div className={styles.client}>
          <Image src={image('testimonial-avatar.png')} width={249} height={249} alt="Equipo de SoyTechno" />
          <h2>Un nuevo estándar</h2>
          <p>Aporte al mercado venezolano</p>
        </div>
        <blockquote>{approvedCopy.contribution}</blockquote>
      </section>

      <section className={styles.cta}>
        <Image className={styles.ctaArt} src={image('cta-illustration.png')} width={720} height={720} alt="Equipo de comercio electrónico" />
        <div className={styles.ctaCopy}>
          <h2>¿Qué pasa cuando el comprador recibe la infraestructura que esperaba?</h2>
          <p>{approvedCopy.idea}</p>
          <Link href="/reunion-playful">¡Hablemos de tu proyecto!</Link>
        </div>
      </section>

      <nav className={styles.breadcrumb} aria-label="Más casos de éxito">
        <Link href="/casos-de-exito/jumex-shopify-dtc-ecommerce">Jumex Shopify DTC: canal propio para un catálogo grande</Link>
        <span>/</span>
        <Link href="/casos-de-exito/odwalla-shopify-dtc-ecommerce">Odwalla Shopify DTC: de sitio informativo a tienda</Link>
      </nav>
    </article>
  )
}
