# Triage En staging — 4 oct 2026 (fase 1, solo lectura)

Regla nueva de José (4 oct 2026): un arreglo técnico que no cambia copy aprobado ni pide comprobación visual entra a producción **sin su GO**. Esperan GO el copy, el diseño y cualquier cambio que necesite validación visual.

Esta fase no mueve cards, no mergea y no marca ready ningún PR. Fuente ClickUp: `GET https://api.clickup.com/api/v2/list/1200930000004053/task?include_closed=true` (lista **En staging**, 34 cards; 31 abiertas en `to do`, 3 en `complete`). Cruce GitHub: PRs de `devplayful/playful-headless` con base `main`, estado a 4 oct 2026 ~12:00 UTC. `main` en `a481c71` (`perf(web): ISR 300s en el HTML de /blog`, #183).

Clases:

- **A — técnico:** sin copy aprobado nuevo ni cambio visual relevante (rendimiento, schema, redirects, cache, next/image a mismos píxeles, quitar JSON de debug, headings duplicados, miga de pan, algo roto o que sobra).
- **B — necesita GO:** copy, diseño, layout, landing/artículo/página nueva, imágenes o ilustraciones nuevas, formulario o embudo que cambie lo que ve el usuario, o dependencia externa (GHL, Analytics DebugView, GTM).
- **C — obsoleta o ya en producción:** el cambio ya está en `main`, o el PR quedó cerrado / superado por otro.

`dirty` = conflictos con `main`. `unstable` = se puede mergear en GitHub pero el CI está en rojo. `clean` = sin conflictos y checks verdes en la última pasada. La API de branch protection de `main` respondió 403; no se puede afirmar desde aquí si Route integrity es check obligatorio.

## Route integrity: ¿bloquea?

El job `verify` del workflow **Route integrity** está en rojo en casi todos los PRs tocados después del 29 sep. El fallo repetido es:

`route-integrity-build: artifact has ungoverned concrete routes`

y lista decenas de posts reales de WordPress (`/blog/email-marketing/…`, `/blog/pautas-digitales/…`, `/blog/seo/…`) que el build prerenderiza y que **no están** en `config/expected-routes.json`. El manifiesto sigue anclado al baseline `a108e172`. No es un bug del next/image, del OG ni del JSON de Jumex: el inventario de rutas del blog se desfasó respecto al manifiesto.

Qué implica:

- **No bloquea por la regla de José.** Actualizar `expected-routes.json` es un arreglo técnico (clase A) y no pide su GO.
- **Sí pinta de rojo el CI** de los A recientes (#173, #170, #165, #130) y de casi todos los B posteriores al 29 sep. En GitHub eso deja `mergeable_state=unstable` si no hay conflictos.
- **No se ha podido confirmar** si el check es obligatorio para mergear a `main` (403 al leer protection). Si lo es, hay que sincronizar el manifiesto **antes** de un merge limpio. Si no lo es, el rojo no impide el merge a mano, pero el job seguirá fallando.
- Los PRs con `verify` verde (#44, #75, #80, #81, #87, y #109 sin rojo reciente) corrieron **antes** del desfase o no se han vuelto a lanzar; su verde está viejo.
- Las landings y artículos nuevos (#178, #185, #181, #74, #141, #155) tendrían que tocar el manifiesto **además**, porque añaden rutas que hoy no existen en producción (`/shopify-precios`, posts locales, `/pasarela-de-pagos-venezuela`). El rojo actual, aun así, es el inventario viejo del blog, no esas rutas nuevas.
- #78 falló el 29 sep por timeout de WordPress en el build (`ETIMEDOUT` al pedir redirects), no por el manifiesto.

Recomendación: un PR técnico solo para alinear `expected-routes.json` con el artefacto actual de `main`, rebasear los A, y entonces mergear. Esa card no está en En staging (en otras cards se cita `1247n70wh8d`, fuera de esta lista).

## Tabla completa

| Card | Título | PR a main | Clase | Riesgo | Motivo |
| --- | --- | --- | --- | --- | --- |
| [1247n70x4wu](https://app.clickup.com/t/1247n70x4wu) | Artículo Google Merchant Center | [#185](https://github.com/devplayful/playful-headless/pull/185) draft, dirty, verify rojo | B | — | Artículo nuevo en staging; copy de Contenido; no está en sitemap de producción. |
| [1247n70x4wq](https://app.clickup.com/t/1247n70x4wq) | Artículo eShow Madrid 2026 | [#181](https://github.com/devplayful/playful-headless/pull/181) draft, dirty, verify rojo | B | — | Artículo nuevo con copy e imágenes; gate solo staging. |
| [1247n70x4v9](https://app.clickup.com/t/1247n70x4v9) | Landing `/shopify-precios` | [#178](https://github.com/devplayful/playful-headless/pull/178) draft, dirty, verify rojo | B | — | Landing nueva (hoy 404 en prod) con copy literal; la ilustración del hero aún falta. |
| [1247n70x4uf](https://app.clickup.com/t/1247n70x4uf) | next/image hero home + tapas carrusel | [#173](https://github.com/devplayful/playful-headless/pull/173) draft, dirty, verify rojo | A | medio | Mismos píxeles y recorte; transporte a `next/image`. Pisa `app/page.tsx` con #174. |
| [1247n70x4uc](https://app.clickup.com/t/1247n70x4uc) | Reescritura home (copy oct 2026) | [#174](https://github.com/devplayful/playful-headless/pull/174) draft, dirty, verify rojo | B | — | Home nueva con copy firmado de octubre; la card pide GO expreso. |
| [1247n70x4u4](https://app.clickup.com/t/1247n70x4u4) | CTA de cierre por next/image | [#170](https://github.com/devplayful/playful-headless/pull/170) draft, dirty, verify rojo | A | bajo | Misma PNG del CTA por `next/image`; no toca copy ni `/reunion-playful`. |
| [1247n70wpr2](https://app.clickup.com/t/1247n70wpr2) | OG 1200×630 en 6 tapas Magnific | [#165](https://github.com/devplayful/playful-headless/pull/165) draft, unstable, verify rojo | A | medio | Recorte 1200×630 solo para og:image/JSON-LD; la destacada visible no cambia. |
| [1247n70wjff](https://app.clickup.com/t/1247n70wjff) | Cover globo live stream shopping | [#161](https://github.com/devplayful/playful-headless/pull/161) draft, unstable, verify rojo | B | — | Portada nueva visible; José ya dio OK al cover el 30 sep. |
| [1247n70whct](https://app.clickup.com/t/1247n70whct) | Atribución UTM first-touch hacia HighLevel | [#97](https://github.com/devplayful/playful-headless/pull/97) **merged** 28 sep | C | — | Ya está en `main` y en producción (`1ac2bbe`); card `complete`. |
| [1247n70wgcv](https://app.clickup.com/t/1247n70wgcv) | Cover la-nueva-gestion-de-google-ads | [#159](https://github.com/devplayful/playful-headless/pull/159) draft, unstable, verify rojo | B | — | Portada Magnific nueva; OK José 29 sep 22:39. |
| [1247n70wgcu](https://app.clickup.com/t/1247n70wgcu) | GA4/GTM solo en producción | [#157](https://github.com/devplayful/playful-headless/pull/157) draft, dirty, verify rojo | B | — | Cambia cuándo se inyectan GTM/gtag; dependencia externa de analítica. |
| [1247n70wgcn](https://app.clickup.com/t/1247n70wgcn) | Blog migración SEO — versión alternativa | [#155](https://github.com/devplayful/playful-headless/pull/155) draft, dirty, verify rojo | B | — | Copy propuesto en ruta nueva; pendiente GO; no sustituye a la original. |
| [1247n70wgcb](https://app.clickup.com/t/1247n70wgcb) | Cover estrategia-de-email-marketing | [#153](https://github.com/devplayful/playful-headless/pull/153) draft, unstable, verify rojo | B | — | Portada Magnific nueva; OK José 29 sep 22:38. |
| [1247n70wgc1](https://app.clickup.com/t/1247n70wgc1) | Timeout WP 20 s en build | [#151](https://github.com/devplayful/playful-headless/pull/151) **merged** | C | — | Ya está en `main` (`BUILD_TIMEOUT_MS = 20_000`); card `complete`. |
| [1247n70wgb1](https://app.clickup.com/t/1247n70wgb1) | Blog: imágenes a sangre | [#149](https://github.com/devplayful/playful-headless/pull/149) draft, dirty, verify rojo | B | — | Cambia el recorte/layout de las imágenes del índice, categorías y post. |
| [1247n70wg7f](https://app.clickup.com/t/1247n70wg7f) | Cover remarketing | [#147](https://github.com/devplayful/playful-headless/pull/147) draft, unstable, verify rojo | B | — | Portada nueva; José aprobó el cover el 29 sep a las 21:41. |
| [1247n70wg7d](https://app.clickup.com/t/1247n70wg7d) | `/agencia-diseno-web`: copy propuesto | [#142](https://github.com/devplayful/playful-headless/pull/142) draft, dirty, verify rojo | B | — | Copy propuesto pendiente GO; title/H1/meta de la pieza. |
| [1247n70wg6z](https://app.clickup.com/t/1247n70wg6z) | Cashea + bloque SiTef pasarela | [#141](https://github.com/devplayful/playful-headless/pull/141) draft, dirty, verify rojo | B | — | Post local nuevo y bloque SiTef en la landing de pasarela; copy pendiente GO. |
| [1247n70wg6m](https://app.clickup.com/t/1247n70wg6m) | `/agencia-shopify`: migración + bloque SEO | [#135](https://github.com/devplayful/playful-headless/pull/135) draft, dirty, verify rojo | B | — | Copy propuesto de migración y bloque SEO; layout nuevo en la landing. |
| [1247n70wg6j](https://app.clickup.com/t/1247n70wg6j) | `/agencia-sem`: copy propuesto | [#137](https://github.com/devplayful/playful-headless/pull/137) draft, dirty, verify rojo | B | — | Copy propuesto pegado en la landing Next; pendiente GO. |
| [1247n70wg6h](https://app.clickup.com/t/1247n70wg6h) | `/agencia-seo`: copy propuesto | [#136](https://github.com/devplayful/playful-headless/pull/136) draft, dirty, verify rojo | B | — | Copy propuesto pegado en la landing Next; pendiente GO. |
| [1247n70wg5w](https://app.clickup.com/t/1247n70wg5w) | Ilustraciones a sangre en tarjetas | [#132](https://github.com/devplayful/playful-headless/pull/132) draft, unstable, verify rojo | B | — | Cambia el recorte visual de las tarjetas (Shopify y Nosotros). |
| [1247n70wg4v](https://app.clickup.com/t/1247n70wg4v) | Casos Jumex y Odwalla: sin JSON ni bloques repetidos | [#130](https://github.com/devplayful/playful-headless/pull/130) draft, dirty, verify rojo | A | medio | Quita JSON de debug y headings duplicados; no reescribe copy aprobado. |
| [1247n70wg42](https://app.clickup.com/t/1247n70wg42) | Blog Facebook Ads: portada Magnific | [#127](https://github.com/devplayful/playful-headless/pull/127) draft, unstable, verify rojo | B | — | Portada nueva; la aprobó José y la pidió Diseño. |
| [1247n70wfpc](https://app.clickup.com/t/1247n70wfpc) | Formulario híbrido form→opp Consulta/Revisar | [#81](https://github.com/devplayful/playful-headless/pull/81) draft, dirty, verify verde viejo | B | — | Cambia el embudo (opp Consulta/Revisar) y toca GHL; el simulador solo vale en preview. |
| [1247n70wfpb](https://app.clickup.com/t/1247n70wfpb) | `/gracias?conv=Schedule` sin bucle | [#80](https://github.com/devplayful/playful-headless/pull/80) draft, dirty, verify verde viejo | B | — | Cambia H1/CTA de la página de gracias y quita el widget; el usuario ve otra cosa. |
| [1247n70wfpa](https://app.clickup.com/t/1247n70wfpa) | Internados Agencia Shopify (home + CTA Zelle) | [#78](https://github.com/devplayful/playful-headless/pull/78) draft, dirty, verify rojo (timeout WP) | B | — | Añade párrafo visible en home y CTA visible en Zelle; la home se pisa con #174. |
| [1247n70wfp9](https://app.clickup.com/t/1247n70wfp9) | Title/meta/H1 cintillos publicitarios | [#87](https://github.com/devplayful/playful-headless/pull/87) **no draft**, clean, verify verde | B | — | Cambia title, meta y H1 del post; es copy SEO, no un arreglo invisible. |
| [1247n70wfp8](https://app.clickup.com/t/1247n70wfp8) | Landing `/pasarela-de-pagos-venezuela` | [#74](https://github.com/devplayful/playful-headless/pull/74) draft, dirty | B | — | Landing nueva frente a Figma; #141 añade encima el bloque SiTef. |
| [1247n70wfp4](https://app.clickup.com/t/1247n70wfp4) | Blog: relacionados contextuales | [#106](https://github.com/devplayful/playful-headless/pull/106) **merged** | C | — | Ya está en `main` (`articulos_relacionados`); card `complete`. |
| [1247n70wfnf](https://app.clickup.com/t/1247n70wfnf) | Bloque Agencia SEO para Shopify | [#111](https://github.com/devplayful/playful-headless/pull/111) draft, unstable, verify rojo | C | — | Superado por #135, que ya lleva el mismo bloque más la migración. |
| [1247n70wfmh](https://app.clickup.com/t/1247n70wfmh) | Blog analítica web: portada Magnific | [#109](https://github.com/devplayful/playful-headless/pull/109) draft, clean | B | — | Portada nueva en el post y en la tarjeta de `/blog`; OK José 29 sep 17:33. |
| [1247n70wfmb](https://app.clickup.com/t/1247n70wfmb) | Quitar miga de pan en Política de Privacidad | [#44](https://github.com/devplayful/playful-headless/pull/44) draft, clean, verify verde | A | bajo | Quita el breadcrumb; H1/H2 y cuerpo intactos. En `main` la miga sigue. |
| [1247n70wfma](https://app.clickup.com/t/1247n70wfma) | SoyTechno QA redlines Ale | [#75](https://github.com/devplayful/playful-headless/pull/75) draft, clean, verify verde | B | — | Cambia diagrama, pilares, capturas y copy Mobile-First; pide validación visual. |

Resumen: **5 A**, **25 B**, **4 C**. Ninguna card de En staging quedó sin PR asociado a `main` (las C ya merged usan ese PR histórico).

## Clase A: riesgo, dependencias y orden de merge

Ningún A cambia copy aprobado. Todos menos #44 están sucios o con Route integrity en rojo. Orden recomendado:

1. **Fuera de esta lista: sincronizar `expected-routes.json` con el artefacto actual de `main`.** Sin eso, #173, #170, #165 y #130 seguirán con `verify` rojo. No está en En staging. No pide GO.
2. **[#44](https://github.com/devplayful/playful-headless/pull/44) — miga de pan.** Riesgo bajo. Sin conflictos, CI verde, un solo fichero (`app/politica-de-privacidad/page.tsx`). No depende de nadie. José ya dio GO el 29 sep 17:28; con la regla nueva ni siquiera haría falta. Mergear primero.
3. **[#170](https://github.com/devplayful/playful-headless/pull/170) — CTA por next/image.** Riesgo bajo. Solo toca `TwoColumnCtaSection.tsx` (y un test). Hay que rebasear por `dirty`. No pisa #174. Independiente de #173. El CTA se ve en home, `/agencia-shopify` y posts; el archivo de imagen es el mismo.
4. **[#165](https://github.com/devplayful/playful-headless/pull/165) — OG 1200×630.** Riesgo medio: las fichas de Facebook/LinkedIn/Slack pasan al recorte, aunque la destacada del post no cambie. `mergeable=true` / `unstable`. Los WebP van en este PR; no exige mergear antes las covers (#109, #127, #147, #153, #159, #161). Si esas covers entran después, hay que vigilar que `lib/blog-cover-image.ts` no se pise.
5. **[#130](https://github.com/devplayful/playful-headless/pull/130) — Jumex/Odwalla.** Riesgo medio: en pantalla desaparece el JSON crudo y un H2/bloque repetido; eso se ve, pero es quitar algo roto, no diseño nuevo. `dirty`; rebasear. No toca home ni blog covers. Independiente de los A de imagen.
6. **[#173](https://github.com/devplayful/playful-headless/pull/173) — hero + carrusel.** Riesgo medio. `dirty` y pisa `app/page.tsx` con #174. Si la home nueva (#174) **no** tiene GO, rebasear #173 sobre `main` y mergear: la home actual gana next/image sin esperar a José. Si #174 va a entrar enseguida, mejor rebasear #173 **encima** de #174 (o meter el next/image en ese PR) para no pelear el hero dos veces. El carrusel (`CarouselResultados.tsx`) no lo toca #174.

No mergear en paralelo #173 y #174. #170 puede ir en cualquier momento respecto a #174. #165 y #130 no se estorban entre sí.

## Notas sobre B que se pisan

- **#111 vs #135:** el bloque «Agencia SEO para Shopify» de #111 está entero en #135. No mergear #111. El GO, cuando llegue, va por [1247n70wg6m](https://app.clickup.com/t/1247n70wg6m) / #135.
- **#78 vs #174:** el internado de home de #78 se pisa con la reescritura. El CTA visible de Zelle no. Si #174 entra, #78 hay que recortar o cerrar.
- **#74 vs #141:** Cashea/SiTef (#141) asienta el bloque SiTef sobre la landing de pasarela (#74). Mergear #74 antes que #141, y solo con GO.
- **#80 vs #81:** #81 conserva la confirmación de #80. El embudo pide GO; el orden sería #80 y luego #81.
- **Covers Magnific** (#109, #127, #147, #153, #159, #161): José ya OK a varias por Diseño. Siguen siendo B (imagen nueva visible). #165 (A) puede ir antes: solo cambia OG.

## Qué no se ha hecho en esta fase

No se ha cambiado ninguna card de ClickUp. No se ha mergeado ningún PR. No se ha marcado ready. El único fichero de este trabajo es este informe.
