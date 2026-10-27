/** Route-local boot: booking hop + mkt/ang below the fold. Does not touch the H1. */
export const QUERY_BOOT_SCRIPT = `
document.addEventListener("click", function (e) {
  var a = e.target && e.target.closest && e.target.closest("[data-lp-meta-booking]");
  if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  var q = location.search;
  location.assign(q ? "/reunion-playful" + q : "/reunion-playful");
}, true);
(function () {
  var q = new URLSearchParams(location.search);
  function mkt(v) {
    v = (v || "").toLowerCase();
    return v === "latam" || v === "ve" ? v : "es";
  }
  function ang(v, u) {
    v = (v || "").toLowerCase();
    if (/^c[1-5]$/.test(v)) return v;
    var m = (u || "").toLowerCase().match(/^(c[1-5])_/);
    return m ? m[1] : "generic";
  }
  var M = mkt(q.get("mkt"));
  var A = ang(q.get("ang"), q.get("utm_content"));
  var root = document.querySelector("[data-lp-meta-shopify]");
  if (root) {
    root.setAttribute("data-lp-mkt", M);
    root.setAttribute("data-lp-ang", A);
  }
  document.querySelectorAll("[data-lp-when-mkt]").forEach(function (el) {
    el.classList.toggle("hidden", el.getAttribute("data-lp-when-mkt") !== M);
  });
  document.querySelectorAll("[data-lp-when-ang]").forEach(function (el) {
    el.classList.toggle("hidden", el.getAttribute("data-lp-when-ang") !== A);
  });
  var pain = { generic: [0, 1, 2], c1: [0, 1, 2], c2: [1, 0, 2], c3: [2, 0, 1], c4: [0, 2, 1], c5: [1, 2, 0] };
  var order = pain[A] || pain.generic;
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
})();
`.trim();
