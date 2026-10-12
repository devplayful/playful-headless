'use client';

const WP_HOST = 'endpoint.playfulagency.com';

/**
 * Defer WordPress / Elementor stylesheets (print→all) so inline hero CSS can paint first.
 * Google Fonts stay blocking — Paytone/DM must match hero typography quickly.
 */
export default function ElementorDeferredWpCss() {
  return (
    <script
      id="playful-elementor-defer-wp-css"
      dangerouslySetInnerHTML={{
        __html: `(function(){
  var host=${JSON.stringify(WP_HOST)};
  function deferLink(link){
    if(!link||link.dataset.playfulDeferredWpCss)return;
    if(link.rel!=='stylesheet')return;
    var href=link.href||'';
    if(href.indexOf(host)===-1)return;
    link.dataset.playfulDeferredWpCss='1';
    link.media='print';
    link.onload=function(){this.media='all';this.onload=null;};
  }
  function scan(){
    document.querySelectorAll('link[rel="stylesheet"]').forEach(deferLink);
  }
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  }
  scan();
})();`,
      }}
    />
  );
}
