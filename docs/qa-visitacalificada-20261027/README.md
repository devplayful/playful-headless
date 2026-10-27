# QA navegador — VisitaCalificada (27 oct 2026)

SHA compilado y servido con `next start`: `381578148a23d07a61ceb299331d5ab98086cf8e`.  
Base: `http://127.0.0.1:3000`. Chromium headless. Peticiones en serie, máx. 1/s.

Script oficial (casos a y b): `SEO_BASE_URL=http://127.0.0.1:3000 node scripts/visita-calificada-qa-playwright.mjs`  
Salida: `playwright-ab-stdout.json` (exit 0).

| Caso | Hora UTC | Resultado | Captura |
|---|---|---|---|
| **a** scroll ≥50 % + 15 s | 20:45:07Z (evento `vc-1793133907201-0h48cj1b`); captura 20:45:29Z | 1 push `visita_calificada`, `trigger: scroll_time`, `qa: true` | [a-scroll-time.png](./a-scroll-time.png) |
| **b** recarga + clic CTA `/reunion-playful` | 20:45:11Z (oficial `vc-1793133911129-jbx2je3d`); recaptura 20:46:10Z | 1 push, `trigger: cta_click`, `qa: true` | [b-cta-landing.png](./b-cta-landing.png), [b-cta-click.png](./b-cta-click.png) |
| **c** stub `window.fbq`, UA Chrome, sin `?qa=1` | 20:46:12Z | 1× `fbq('trackCustom','VisitaCalificada',…,{eventID:'vc-1793133972983-f0zo7zuz'})`; `event_id` del dataLayer coincide; sin `qa:true` | [c-fbq-trackcustom.png](./c-fbq-trackcustom.png) |
| **d** `/` (QA UA, scroll + 15 s) | 20:46:14Z–20:46:31Z | 200, `events: []` | [d-home-no-push.png](./d-home-no-push.png) |

No se cambió código del sitio. Detalle JSON: `results.json`.
