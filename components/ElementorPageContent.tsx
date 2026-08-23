import styles from './ElementorPageContent.module.css';
import './ElementorPageHeaderFix.css';

const WP_HOST = 'https://endpoint.playfulagency.com';

const CORE_STYLESHEETS = [
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/frontend.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-heading.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-image.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-spacer.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-accordion.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/mae-widgets.min.css`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/core-icons.css`,
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
  const ids = Array.from(new Set([pageId, ...stylesheetIds]));
  const pageStylesheets = ids.map((id) => `${WP_HOST}/wp-content/uploads/elementor/css/post-${id}.css`);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Paytone+One&family=Montserrat:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap"
      />
      {CORE_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {pageStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <div className={`${styles.page} playful-wp-page overflow-x-hidden`}>
        <div className="playful-wp-elementor" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}
