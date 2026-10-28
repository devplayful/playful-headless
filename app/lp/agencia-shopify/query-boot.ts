import { DEFAULT_LP_META_ANGLE, LP_META_STATIC_ANGLES } from './angles.js';
import { LP_META_PAIN_ORDER } from './copy';

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ANGLE_SLUGS = LP_META_STATIC_ANGLES.filter((slug) => slug !== DEFAULT_LP_META_ANGLE);
const ANGLE_SLUG_RE = ANGLE_SLUGS.map(escapeRe).join('|');
const STATIC_ANGLE_RE = LP_META_STATIC_ANGLES.map(escapeRe).join('|');
const PAIN_ORDER_JSON = JSON.stringify(LP_META_PAIN_ORDER);
const DEFAULT_ANGLE_JSON = JSON.stringify(DEFAULT_LP_META_ANGLE);

/** Route-local boot after load. Does not touch the H1 or the LCP image ancestor. */
export const QUERY_BOOT_SCRIPT = `
document.addEventListener("click", function (e) {
  var a = e.target && e.target.closest && e.target.closest("[data-lp-meta-booking]");
  if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  var q = location.search;
  location.assign(q ? "/reunion-playful" + q : "/reunion-playful");
}, true);
function lpMetaBoot() {
  var q = new URLSearchParams(location.search);
  function mkt(v) {
    v = (v || "").toLowerCase();
    return v === "latam" || v === "ve" ? v : "es";
  }
  function ang(v, u) {
    v = (v || "").toLowerCase();
    if (/^(${ANGLE_SLUG_RE})$/.test(v)) return v;
    var m = (u || "").toLowerCase().match(/^((?:${ANGLE_SLUG_RE}))_/);
    return m ? m[1] : ${DEFAULT_ANGLE_JSON};
  }
  var M = mkt(q.get("mkt"));
  var pathAng = (location.pathname.replace(new RegExp("/+$"), "").match(new RegExp("/lp/agencia-shopify/(${STATIC_ANGLE_RE})$")) || [])[1];
  var A = pathAng || ang(q.get("ang"), q.get("utm_content"));
  document.querySelectorAll("[data-lp-when-mkt]").forEach(function (el) {
    el.classList.toggle("hidden", el.getAttribute("data-lp-when-mkt") !== M);
  });
  document.querySelectorAll("[data-lp-when-ang]").forEach(function (el) {
    el.classList.toggle("hidden", el.getAttribute("data-lp-when-ang") !== A);
  });
  var pain = ${PAIN_ORDER_JSON};
  var order = pain[A] || pain[${DEFAULT_ANGLE_JSON}] || [0, 1, 2];
  document.querySelectorAll("[data-lp-pain-index]").forEach(function (el) {
    var idx = Number(el.getAttribute("data-lp-pain-index"));
    var pos = order.indexOf(idx);
    if (pos >= 0) el.style.order = String(pos);
  });
  var cases = {
    es: ["odwalla-shopify-dtc-ecommerce", "jumex-shopify-dtc-ecommerce", "soytechno-ecommerce-venezuela"],
    latam: ["jumex-shopify-dtc-ecommerce", "odwalla-shopify-dtc-ecommerce", "soytechno-ecommerce-venezuela"],
    ve: ["soytechno-ecommerce-venezuela", "jumex-shopify-dtc-ecommerce", "odwalla-shopify-dtc-ecommerce"],
  };
  (cases[M] || cases.es).forEach(function (slug, pos) {
    document.querySelectorAll("[data-lp-case]").forEach(function (el) {
      if (el.getAttribute("data-lp-case") === slug) el.style.order = String(pos);
    });
  });
  var hop = "/reunion-playful/ir" + location.search;
  document.querySelectorAll("[data-lp-meta-booking]").forEach(function (a) {
    a.setAttribute("href", hop);
  });
  document.querySelectorAll("[data-lp-keep-search]").forEach(function (a) {
    var base = a.getAttribute("data-lp-keep-search") || "";
    a.setAttribute("href", base.charAt(0) === "#" ? base : base + location.search);
  });
  var featured = {
    es: "/casos-de-exito/odwalla-shopify-dtc-ecommerce",
    latam: "/casos-de-exito/jumex-shopify-dtc-ecommerce",
    ve: "/casos-de-exito/soytechno-ecommerce-venezuela",
  };
  var fl = document.querySelector("[data-lp-featured]");
  if (fl) {
    fl.setAttribute("data-lp-keep-search", featured[M]);
    fl.setAttribute("href", featured[M] + location.search);
  }
}
if (document.readyState === "complete") lpMetaBoot();
else window.addEventListener("load", lpMetaBoot);
`.trim();
