'use client';

import { useEffect } from 'react';

const WP_HOST = 'https://endpoint.playfulagency.com';

const SCRIPTS = [
  `${WP_HOST}/wp-includes/js/jquery/jquery.min.js`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/js/frontend-modules.min.js`,
  `${WP_HOST}/wp-includes/js/jquery/ui/core.min.js`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/js/frontend.min.js`,
  `${WP_HOST}/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/waitforimages.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/gsap.min.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/core.min.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/flickity.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/cubeportfolio.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/parallax-scroll.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/magnific.popup.js`,
  `${WP_HOST}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/init.js`,
];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-playful-el="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.playfulEl = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}


type MaeWindow = typeof window & { jQuery?: any };

function initMaeCarousels() {
  const w = window as MaeWindow;
  const $ = w.jQuery;
  if (!$) return;

  document.querySelectorAll('.playful-wp-page img[src=""]').forEach((img) => {
    (img as HTMLImageElement).src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  });

  if ($.fn && $.fn.masterCarouselBox) {
    $('.playful-wp-page .master-carousel-box').each(function (this: HTMLElement) {
      const $el = $(this);
      if ($el.hasClass('flickity-enabled') || $el.data('flickity')) return;
      try {
        $el.masterCarouselBox();
      } catch {
        /* CSS row fallback covers this */
      }
    });
  }
}

export default function ElementorPageScripts({ pageId }: { pageId: number }) {
  useEffect(() => {
    document.body.classList.add('playful-elementor-plain');
    const w = window as typeof window & { elementorFrontendConfig?: Record<string, unknown> };
    w.elementorFrontendConfig = {
      environmentMode: { edit: false, wpPreview: false, isScriptDebug: false },
      i18n: {
        shareOnFacebook: 'Share on Facebook',
        shareOnTwitter: 'Share on Twitter',
        pinIt: 'Pin it',
        download: 'Download',
        downloadImage: 'Download image',
        fullscreen: 'Fullscreen',
        zoom: 'Zoom',
        share: 'Share',
        playVideo: 'Play Video',
        previous: 'Previous',
        next: 'Next',
        close: 'Close',
      },
      is_rtl: false,
      breakpoints: { xs: 0, sm: 480, md: 768, lg: 1025, xl: 1440, xxl: 1600 },
      responsive: {
        breakpoints: {
          mobile: { label: 'Mobile', value: 767, default_value: 767, direction: 'max', is_enabled: true },
          mobile_extra: { label: 'Mobile Extra', value: 880, default_value: 880, direction: 'max', is_enabled: false },
          tablet: { label: 'Tablet', value: 1024, default_value: 1024, direction: 'max', is_enabled: true },
          tablet_extra: { label: 'Tablet Extra', value: 1200, default_value: 1200, direction: 'max', is_enabled: false },
          laptop: { label: 'Laptop', value: 1366, default_value: 1366, direction: 'max', is_enabled: false },
          widescreen: { label: 'Widescreen', value: 2400, default_value: 2400, direction: 'min', is_enabled: false },
        },
      },
      version: '3.32.3',
      is_static: false,
      experimentalFeatures: {},
      urls: {
        assets: `${WP_HOST}/wp-content/plugins/elementor/assets/`,
        ajaxurl: `${WP_HOST}/wp-admin/admin-ajax.php`,
        uploadUrl: `${WP_HOST}/wp-content/uploads`,
      },
      settings: { page: {}, editorPreferences: {} },
      kit: { active_breakpoints: ['viewport_mobile', 'viewport_tablet'] },
      post: { id: pageId, title: '', excerpt: '', featuredImage: false },
    };

    let cancelled = false;
    (async () => {
      for (const src of SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }
      if (!cancelled) initMaeCarousels();
    })();

    return () => {
      cancelled = true;
      document.body.classList.remove('playful-elementor-plain');
    };
  }, [pageId]);

  return null;
}
