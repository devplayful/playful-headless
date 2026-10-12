'use client';

/**
 * On /agencia-shopify only: defer the main Next CSS chunk so it does not block
 * first paint. The href hash changes per build; match `data-precedence="next"`.
 */
export default function ShopifyDeferredCss() {
  return (
    <script
      id="playful-shopify-defer-css"
      dangerouslySetInnerHTML={{
        __html: `(function(){
  function deferLink(link){
    if(!link||link.dataset.playfulDeferredCss)return;
    if(link.rel!=='stylesheet'||link.getAttribute('data-precedence')!=='next')return;
    link.dataset.playfulDeferredCss='1';
    link.media='print';
    link.onload=function(){this.media='all';this.onload=null;};
  }
  function scan(){
    document.querySelectorAll('link[rel="stylesheet"][data-precedence="next"]').forEach(deferLink);
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
