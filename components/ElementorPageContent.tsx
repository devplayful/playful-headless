import styles from './ElementorPageContent.module.css';
import './ElementorPageHeaderFix.css';
import './pollock-scoped.css';
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
      <div className={`${styles.page} playful-wp-page overflow-x-hidden elementor-kit-8`}>
        <div className="playful-wp-elementor" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <ElementorPageScripts pageId={pageId} />
    </>
  );
}
