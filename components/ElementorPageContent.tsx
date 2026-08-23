import styles from './ElementorPageContent.module.css';

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
      {CORE_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {pageStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <main className={`${styles.page} playful-wp-page overflow-x-hidden`}>
        <div className="playful-wp-elementor" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </>
  );
}
