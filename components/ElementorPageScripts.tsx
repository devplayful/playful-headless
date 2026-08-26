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

function hideDuplicateMasterLinkArrows() {
  document.querySelectorAll('.playful-wp-page a.master-link').forEach((a) => {
    const text = (a.textContent || '').replace(/\s+/g, ' ');
    if (text.includes('>') || text.includes('›')) {
      const icon = a.querySelector('.icon') as HTMLElement | null;
      if (icon) icon.style.display = 'none';
    }
  });
}

function initMaeCarousels() {
  initPillsMarquee();
  hideDuplicateMasterLinkArrows();
  hideBrokenPostMetaImages();
  applyQa2Fixes();

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

function zeroPillBox(node: HTMLElement) {
  node.style.margin = '0';
  node.style.marginLeft = '0';
  node.style.marginRight = '0';
  const box = node.querySelector('.elementor-widget-container') as HTMLElement | null;
  if (box) {
    box.style.margin = '0';
    box.style.paddingLeft = '0';
    box.style.paddingRight = '0';
  }
}

function initPillsMarquee() {
  document.querySelectorAll('.playful-wp-page .moving-text-zurdo > .elementor-widget-wrap').forEach((wrap) => {
    const el = wrap as HTMLElement;
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.parentNode?.removeChild(node);
    });
    // Undo a previous marquee clone pass (do not leave duplicated rows).
    if (el.dataset.pillsMarquee === '1') {
      const kids = Array.from(el.children);
      const half = kids.length / 2;
      if (Number.isInteger(half) && half > 0) {
        kids.slice(half).forEach((node) => node.remove());
      }
      delete el.dataset.pillsMarquee;
    }
    Array.from(el.children).forEach((node) => zeroPillBox(node as HTMLElement));
  });
}

function hideBrokenPostMetaImages() {
  document.querySelectorAll('.playful-wp-page .post-meta img, .playful-wp-page .post-meta-categories img').forEach((img) => {
    const el = img as HTMLImageElement;
    const hide = () => {
      el.style.display = 'none';
    };
    el.addEventListener('error', hide);
    if (el.complete && el.naturalWidth === 0 && el.getAttribute('src')) hide();
  });
}

function applyQa2Fixes() {
  document.querySelectorAll('.playful-post-home .recent-news li .texts').forEach((node) => {
    const texts = node as HTMLElement;
    texts.style.setProperty('display', 'flex', 'important');
    texts.style.setProperty('flex-wrap', 'wrap', 'important');
    texts.style.setProperty('align-items', 'center', 'important');
    texts.style.setProperty('gap', '0 10px', 'important');

    texts.querySelectorAll('h3').forEach((h) => {
      const el = h as HTMLElement;
      el.style.setProperty('flex', '0 0 100%', 'important');
      el.style.setProperty('width', '100%', 'important');
    });

    texts.querySelectorAll('.post-meta').forEach((meta) => {
      const el = meta as HTMLElement;
      if (el.classList.contains('post-meta-categories')) return;
      el.style.setProperty('display', 'inline-flex', 'important');
      el.style.setProperty('flex-direction', 'row', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('width', 'auto', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('white-space', 'nowrap', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
    });
  });

  if (!document.querySelector('.playful-wp-page')) return;

  document.querySelectorAll('footer .footer, footer').forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty('margin-top', '0', 'important');
    el.style.setProperty('margin-bottom', '0', 'important');
  });

  document.querySelectorAll('.elementor-element-145155f, .elementor-element-0088077').forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('height', '0', 'important');
  });
}

function injectQa2Style() {
  if (document.getElementById('playful-qa2-runtime')) return;
  const style = document.createElement('style');
  style.id = 'playful-qa2-runtime';
  style.textContent = [
    '.playful-wp-page .playful-post-home .recent-news li .texts{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:0 10px!important}',
    '.playful-wp-page .playful-post-home .recent-news li .texts h3{flex:0 0 100%!important;width:100%!important}',
    '.playful-wp-page .playful-post-home .recent-news li .texts .post-meta:not(.post-meta-categories){display:inline-flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;max-width:none!important;white-space:nowrap!important;flex-shrink:0!important}',
    'body:has(.playful-wp-page) footer .footer,body:has(.playful-wp-page) footer{margin-top:0!important;margin-bottom:0!important}',
    '.playful-wp-page .elementor-element-145155f,.playful-wp-page .elementor-element-0088077{display:none!important;height:0!important}',
  ].join('');
  document.body.appendChild(style);
}

export default function ElementorPageScripts({ pageId }: { pageId: number }) {
  useEffect(() => {
    document.body.classList.add('playful-elementor-plain');
    initPillsMarquee();
    hideDuplicateMasterLinkArrows();
    hideBrokenPostMetaImages();
    injectQa2Style();
    const runQa2 = () => {
      requestAnimationFrame(() => {
        applyQa2Fixes();
        window.setTimeout(applyQa2Fixes, 0);
      });
    };
    runQa2();
    const onLoad = () => applyQa2Fixes();
    window.addEventListener('load', onLoad);
    const t500 = window.setTimeout(applyQa2Fixes, 500);
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
      if (!cancelled) {
        initMaeCarousels();
        applyQa2Fixes();
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      window.clearTimeout(t500);
      document.body.classList.remove('playful-elementor-plain');
    };
  }, [pageId]);

  return null;
}
