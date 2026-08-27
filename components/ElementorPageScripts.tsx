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


/** SEM-only: 84478 carousel d0fefa4 is shared with SEO. Prod shows a loop
 *  peek («ANO TO» / venemerg sliced) because Swiper measures ~4.5 slides.
 *  Force 4-up, clip overflow, contain logos. Do not shrink below old 200px. */
function fixSemLogoCarousel(pageId?: number) {
  const root = document.querySelector(
    '.playful-wp-page[data-playful-page="83848"] .elementor-element-d0fefa4',
  ) as HTMLElement | null;
  if (!root) return;
  if (pageId != null && pageId !== 83848) return;

  root.style.setProperty('--e-image-carousel-slides-to-show', '4');

  const viewport = root.querySelector(
    '.elementor-image-carousel-wrapper, .swiper, .swiper-container',
  ) as HTMLElement | null;
  if (viewport) {
    viewport.style.setProperty('overflow', 'hidden', 'important');
  }

  const swiperEl = root.querySelector('.swiper, .swiper-container') as
    | (HTMLElement & { swiper?: any })
    | null;
  const swiper = swiperEl?.swiper;
  if (swiper && swiper.params) {
    swiper.params.slidesPerView = 4;
    swiper.params.slidesPerGroup = 1;
    swiper.params.centeredSlides = false;
    swiper.params.watchOverflow = true;
    if (typeof swiper.params.spaceBetween === 'number' && swiper.params.spaceBetween < 16) {
      swiper.params.spaceBetween = 16;
    }
    try {
      swiper.update();
      if (typeof swiper.slideToLoop === 'function' && swiper.params.loop) {
        swiper.slideToLoop(0, 0);
      } else {
        swiper.slideTo(0, 0);
      }
    } catch {
      /* CSS overflow/object-fit still clip the frame */
    }
  }

  root.querySelectorAll('.swiper-slide-image').forEach((img) => {
    const el = img as HTMLImageElement;
    el.style.setProperty('object-fit', 'contain', 'important');
    el.style.setProperty('object-position', 'center', 'important');
    el.style.setProperty('max-width', 'none', 'important');
    el.style.removeProperty('max-height');
    el.style.setProperty('max-height', 'none', 'important');
    el.style.setProperty('width', '300px', 'important');
    el.style.setProperty('height', '200px', 'important');
  });
}


/** SEM-only closed list: unhide mint/FAQ headings, keep first FAQ open. */
function fixSemClosedList(pageId?: number) {
  if (pageId != null && pageId !== 83848) return;
  const page = document.querySelector('.playful-wp-page[data-playful-page="83848"]') as HTMLElement | null;
  if (!page) return;

  page.querySelectorAll('.elementor-element-24002ee, .elementor-element-ea23e47').forEach((node) => {
    const el = node as HTMLElement;
    el.classList.remove('elementor-invisible');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.querySelectorAll('.main-heading, .sub-heading, .master-heading, .elementor-widget-container').forEach((child) => {
      const c = child as HTMLElement;
      c.style.setProperty('visibility', 'visible', 'important');
      c.style.setProperty('opacity', '1', 'important');
      c.style.setProperty('text-align', 'center', 'important');
    });
  });

  const btn = page.querySelector('.elementor-element-0067e2f') as HTMLElement | null;
  if (btn) {
    btn.style.setProperty('text-align', 'center', 'important');
    const wrap = btn.querySelector('.elementor-widget-container') as HTMLElement | null;
    if (wrap) wrap.style.setProperty('text-align', 'center', 'important');
  }

  const faq = page.querySelector('.elementor-element-eec3d51 .elementor-accordion') as HTMLElement | null;
  if (faq) {
    const firstTitle = faq.querySelector('.elementor-accordion-item .elementor-tab-title') as HTMLElement | null;
    const firstContent = faq.querySelector('.elementor-accordion-item .elementor-tab-content') as HTMLElement | null;
    if (firstTitle && !firstTitle.classList.contains('elementor-active')) {
      firstTitle.classList.add('elementor-active');
      firstTitle.setAttribute('aria-expanded', 'true');
    }
    if (firstContent && !firstContent.classList.contains('elementor-active')) {
      firstContent.classList.add('elementor-active');
      firstContent.style.setProperty('display', 'block', 'important');
    }
  }
}

function initMaeCarousels(pageId?: number) {
  initPillsMarquee();
  hideDuplicateMasterLinkArrows();
  hideBrokenPostMetaImages();
  applyQa2Fixes();
  fixSemLogoCarousel(pageId);
  fixSemClosedList(pageId);

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


function applySemPillsClipFix() {
  const page = document.querySelector('.playful-wp-page[data-playful-page="83848"]');
  if (!page) return;
  page.querySelectorAll('.elementor-element-45ee457, .contenedor-texto').forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.style.setProperty('max-height', 'none', 'important');
    el.style.setProperty('overflow', 'visible', 'important');
    el.style.setProperty('background-color', '#FFDBDB', 'important');
  });
  page.querySelectorAll('.elementor-element-83d7ee0 .elementor-button').forEach((node) => {
    (node as HTMLElement).style.setProperty('background-color', '#F7F7F7', 'important');
  });
  page.querySelectorAll('.elementor-element-2894a31').forEach((node) => {
    (node as HTMLElement).style.setProperty('display', 'none', 'important');
  });
  page.querySelectorAll('.elementor-element-867a80c, .elementor-element-867a80c .elementor-widget-wrap, .elementor-element-867a80c .elementor-widget, .elementor-element-867a80c .elementor-widget-container').forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty('position', 'static', 'important');
    el.style.setProperty('left', 'auto', 'important');
    el.style.setProperty('top', 'auto', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('animation', 'none', 'important');
    el.style.setProperty('animation-name', 'none', 'important');
    el.style.setProperty('overflow', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
  });
  page.querySelectorAll('.elementor-element-867a80c').forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty('background-color', 'transparent', 'important');
    el.style.setProperty('background-image', 'none', 'important');
    el.style.setProperty('width', '100%', 'important');
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

    let row = texts.querySelector(':scope > .playful-meta-row') as HTMLElement | null;
    const metas = Array.from(texts.querySelectorAll(':scope > .post-meta, :scope > .playful-meta-row .post-meta'))
      .filter((el) => !el.classList.contains('post-meta-categories')) as HTMLElement[];
    if (!row && metas.length) {
      row = document.createElement('div');
      row.className = 'playful-meta-row';
      metas.forEach((m) => row!.appendChild(m));
      texts.appendChild(row);
    }
    if (row) {
      row.style.setProperty('display', 'flex', 'important');
      row.style.setProperty('flex-direction', 'row', 'important');
      row.style.setProperty('flex-wrap', 'nowrap', 'important');
      row.style.setProperty('align-items', 'center', 'important');
      row.style.setProperty('gap', '8px', 'important');
      row.style.setProperty('width', '100%', 'important');
      row.style.setProperty('flex', '0 0 100%', 'important');
      row.style.setProperty('min-width', '0', 'important');
      row.style.setProperty('font-size', '11px', 'important');
    }
    metas.forEach((el) => {
      el.style.setProperty('display', 'inline-flex', 'important');
      el.style.setProperty('flex-direction', 'row', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('width', 'auto', 'important');
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('white-space', 'nowrap', 'important');
      el.style.setProperty('flex', '0 1 auto', 'important');
    });
  });

  if (!document.querySelector('.playful-wp-page')) return;

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
    '.playful-wp-page .playful-post-home .recent-news li .texts .playful-meta-row{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;width:100%!important;flex:0 0 100%!important;font-size:11px!important}',
    '.playful-wp-page .playful-post-home .recent-news li .texts .playful-meta-row .post-meta{display:inline-flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;white-space:nowrap!important}',
    '.playful-wp-page[data-playful-page="83848"] .elementor-element-45ee457,.playful-wp-page[data-playful-page="83848"] .contenedor-texto{height:auto!important;max-height:none!important;overflow:visible!important;background-color:#FFDBDB!important}',
    '.playful-wp-page[data-playful-page="83848"] .elementor-element-2894a31{display:none!important}',
    '.playful-wp-page[data-playful-page="83848"] .elementor-element-867a80c .elementor-widget,.playful-wp-page[data-playful-page="83848"] .elementor-element-867a80c .elementor-widget-wrap{position:static!important;transform:none!important;animation:none!important;opacity:1!important;visibility:visible!important}',
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
        applySemPillsClipFix();
        fixSemLogoCarousel(pageId);
        fixSemClosedList(pageId);
        window.setTimeout(() => {
          applyQa2Fixes();
          fixSemLogoCarousel(pageId);
          fixSemClosedList(pageId);
        }, 0);
      });
    };
    runQa2();
    const onLoad = () => {
      applyQa2Fixes();
      fixSemLogoCarousel(pageId);
      fixSemClosedList(pageId);
    };
    window.addEventListener('load', onLoad);
    const t500 = window.setTimeout(() => {
      applyQa2Fixes();
      fixSemLogoCarousel(pageId);
      fixSemClosedList(pageId);
    }, 500);
    const t1500 = window.setTimeout(() => {
      fixSemLogoCarousel(pageId);
      fixSemClosedList(pageId);
    }, 1500);
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
        initMaeCarousels(pageId);
        applyQa2Fixes();
        fixSemClosedList(pageId);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      window.clearTimeout(t500);
      window.clearTimeout(t1500);
      document.body.classList.remove('playful-elementor-plain');
    };
  }, [pageId]);

  return null;
}
