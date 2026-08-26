import styles from './ElementorPageContent.module.css';
import './ElementorPageHeaderFix.css';
import ElementorPageScripts from './ElementorPageScripts';

const WP_HOST = 'https://endpoint.playfulagency.com';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Paytone+One&family=Montserrat:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Outfit:wght@400;500;600;700&family=Varela+Round&display=swap';

const CORE_STYLESHEETS = [
  `${WP_HOST}/wp-content/uploads/elementor/css/post-8.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/frontend.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-heading.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-image.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-spacer.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-accordion.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-image-carousel.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/animations/styles/zoomIn.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/mae-widgets.min.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/core-icons.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/pollock-icons.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/cubeportfolio.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/flickity.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/magnific.popup.css`,
];

/** Keep WP magia-negra/demo heading in HTML but hidden; show old.playfulagency.com copy. */
function restoreOldBodyCopy(html: string): string {
  let out = html.replace(/\u2028|\u2029/g, '');
  out = out.replace(/perder y\s+empezar a ganar/g, 'perder y empezar a ganar');
  out = out.replace(
    '<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>',
    '<h2 class="main-heading playful-wp-hidden-heading">Marcas que han trabajado con nosotros</h2>'
    + '<h2 class="main-heading">No confíes solo en nuestra palabra, mira los resultados</h2>',
  );

  out = out.replace(
    'Somos la compañía de <b>marketing digital internacional</b> que trabaja para lograr objetivos en las diferentes areas del mercado en línea, no solo nos encargamos del posicionamiento, <b>también construímos páginas que les permita hacer realidad proyectos</b>',
    '<span class="playful-wp-hidden-heading">Somos la compañía de <b>marketing digital internacional</b> que trabaja para lograr objetivos en las diferentes areas del mercado en línea, no solo nos encargamos del posicionamiento, <b>también construímos páginas que les permita hacer realidad proyectos</b></span>'
    + 'Nuestros clientes han logrado resultados impactantes gracias a nuestras estrategias innovadoras y personalizadas. Hemos ayudado a empresas a alcanzar sus metas y a crecer de forma exponencial. ¿Quieres ser el próximo?',
  );

  out = out.replace(
    /(<h2 class="main-heading">)(¡Es Hora de actuar y cambiar tu futuro digital!\s*\(\s*sin necesidad de magia negra\s*\))(<\/h2>)/g,
    '$1<span class="playful-magia-negra">$2</span>¡Es Hora de Dejar de Perder Dinero y Empezar a Vender Más!$3',
  );

  out = out.replace(
    /(<div class="sub-heading">)(No esperes más para dar el siguiente paso\.[\s\S]*?tu próxima gran campaña comienza con una conversación\.)(<\/div>)/g,
    '$1<span class="playful-magia-negra">$2</span>Deja de arreglar tu web con parches. Como tu Agencia de E-commerce especializada, te ofrecemos una propuestas profesionales e innovadoras, enfocadas en la conversión.$3',
  );

  out = out.replaceAll(
    '<span class="text">¡Contáctanos y empieza ya!</span>',
    '<span class="text playful-magia-negra">¡Contáctanos y empieza ya!</span><span class="text">Agenda una Reunión</span>',
  );

  return out;
}

type ElementorPageContentProps = {
  html: string;
  pageId: number;
  stylesheetIds: number[];
};

export default function ElementorPageContent({
  html,
  pageId,
  stylesheetIds,
}: ElementorPageContentProps) {
  const bodyHtml = restoreOldBodyCopy(html);
  const ids = Array.from(new Set([8, pageId, ...stylesheetIds]));
  const pageStylesheets = ids
    .filter((id) => id !== 8)
    .map((id) => `${WP_HOST}/wp-content/uploads/elementor/css/post-${id}.css`);

  return (
    <>
      <link rel="stylesheet" href={FONTS} />
      {CORE_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {pageStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <div className={`${styles.page} playful-wp-page playful-servicios-page elementor-kit-8`}>
        <div className="playful-wp-elementor" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>
      <style id="playful-qa2-ssr">{`
html body .playful-wp-page .playful-post-home .recent-news li .texts{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:0 10px!important}
html body .playful-wp-page .playful-post-home .recent-news li .texts>h3{flex:0 0 100%!important;width:100%!important}
html body .playful-wp-page .playful-post-home .recent-news li .texts>.playful-meta-row{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;flex:0 0 100%!important;font-size:11px!important}
html body .playful-wp-page .playful-post-home .recent-news li .texts .playful-meta-row .post-meta{display:inline-flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;white-space:nowrap!important;flex:0 1 auto!important}
html body:has(.playful-wp-page) footer.px-5,
html body:has(.playful-wp-page) footer .footer,
html body:has(.playful-wp-page) footer .mt-\\[160px\\]{margin-top:0!important;margin-bottom:0!important}
html body .playful-wp-page .elementor-element-145155f,
html body .playful-wp-page .elementor-element-0088077{display:none!important;height:0!important;margin:0!important;padding:0!important}
`}</style>
      <ElementorPageScripts pageId={pageId} />
    </>
  );
}
