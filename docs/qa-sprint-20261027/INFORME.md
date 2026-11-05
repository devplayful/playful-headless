# QA sprint 2026-10-27 — playfulagency.com

Ventana: GO de José del 27 oct 2026 12:41 al 28 oct 2026 23:59 (Madrid).
Sitio medido: `https://playfulagency.com` (producción). User-Agent `PlayfulQA/1.0` y `?qa=1` en cada petición de primer nivel. Ritmo de como mucho una petición por segundo. Playwright 1.64.1, capturas a página completa en 390×844 y 1280×800.

El live es la verdad de este informe. Los previews de las ramas de arreglo no son el live: un 200 en preview no cierra el hallazgo en producción.

INP de laboratorio: Lighthouse 12 no devuelve INP. Se anota TBT. El INP de campo queda **[SIN VERIFICAR]**.

## Resumen

El sitemap live respondió 200 y trae 123 URLs. Se revisaron las 32 que no son un post (landings, legales, podcasts y el hub `/blog`), más 15 posts, más `/contactar`, `/gracias`, `/thank-you` y `/reunion-playful`. Son 52 rutas y 104 vistas. 100 vistas devolvieron 200. Las 4 restantes son `/contactar` y `/thank-you` en los dos viewports (404). La página de gracias real es `/gracias` y en el live también da 200.

Lo que más pesa:

- Un SVG del post de plataformas de email se pide por `/_next/image` y el optimizador responde 400. En escritorio la imagen queda rota.
- Figuras de WordPress e iframes de YouTube ensanchan el documento. En móvil el scroll horizontal es real (`scrollX` hasta 200).
- Dos acortadores `bit.ly` del contenido redirigen a sitios de contenido para adultos.
- `/contactar` da 404. `/contacto` y `/contactanos` ya redirigen al formulario.
- Los episodios del podcast enlazan `endpoint.playfulagency.com` (404) y sus players de Buzzsprout responden 404.
- Fuentes de Elementor bloqueadas por CORS, `cubeportfolio is not a function` y un PNG de `old.playfulagency.com` con error SSL. Esos tres no se parchean aquí: el arreglo limpio toca WordPress o `ElementorPageHeaderFix.css`.

El formulario de contacto se renderiza y valida. reCAPTCHA no dejó marcado el checkbox, así que **no se envió** el lead de prueba a GHL. La entrega al CRM queda **[SIN VERIFICAR]**. Intento: 2026-10-27 13:08:50 Europe/Madrid. Nombre previsto `QA PlayfulQA`, email `qa+sprint@playfulagency.com`, URL con `?qa=1`.

Core Web Vitals de laboratorio, una pasada por URL y factor (no la mediana de tres). Escritorio entre 99 y 100. Móvil entre 94 y 99, salvo el post de auditoría SEO: 72, con LCP 9,5 s en la imagen del hero.

### Hallazgos por severidad

| Severidad | Cantidad | IDs |
| --- | ---: | --- |
| Alta | 4 | QA-01, QA-02, QA-03, QA-04 |
| Media | 9 | QA-05 a QA-13 |
| Baja | 4 | QA-14 a QA-17 |
| Informativo | 1 | QA-18 |

## Página de gracias

La ruta en código es `app/gracias/page.tsx` (`/gracias`). No existe `thank-you`. El preview de Ale daba 410 porque el deployment de staging ya no estaba.

Preview nuevo, rama `cursor/qa-gracias-preview-dd77`, PR draft [#352](https://github.com/devplayful/playful-headless/pull/352), deployment `dpl_7gsceVgkgt21JGGdxRcMsbhXixaZ`.

Enlace comprobado (cookie de `_vercel_share`, respuesta final 200, title «Gracias — siguiente paso | Playful Agency», texto «Recibimos tu caso»):

https://playful-headless-e7vwsshuz-playfuls-projects.vercel.app/gracias?qa=1&_vercel_share=2tV3jSQXefSR93Ee05tvd9slzlgRtqEc

Hora de la comprobación: **2026-10-27 12:49:37 CET**. El enlace caduca el 28 oct 2026 hacia las 10:49 (antes del fin de la ventana de GO).

`/gracias` en el live también respondió 200, con el h1 «¡Recibimos tu caso!». No está en el sitemap.

## Tabla de hallazgos

| ID | Severidad | URL | Viewport | Descripción | Captura | Arreglo propuesto | Rama o PR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| QA-01 | Alta | `/blog/email-marketing/5-plataformas-para-email-marketing-efectivo` | Escritorio | `Beneficio-6-09.svg` se pide como `/_next/image` y responde 400. `naturalWidth` 0. Alt: «chico poniendo un reloj analógico a un teléfono». Consola: «Failed to load resource: 400». | `/opt/cursor/artifacts/qa-sprint/screenshots/blog-email-marketing-5-plataformas-para-email-marketing-efectivo-desktop.jpg` | Dejar el SVG en su URL de WordPress, con `loading=lazy`. | [#358](https://github.com/devplayful/playful-headless/pull/358) `fix/qa-sprint-blog-svg` |
| QA-02 | Alta | Posts y episodios con `figure.wp-caption` o iframe de YouTube. Muestra: email marketing `overflowX` 238 y figura a 628 px; wireframe `overflowX` 118; episodio 6 móvil `overflowX` 738 y escritorio 56 (figura a 1336 px). | Móvil y, en el episodio 6, escritorio | El documento se desplaza de lado. El nombre largo del autor empuja ~6 px en el wireframe. | `/opt/cursor/artifacts/qa-sprint/screenshots/blog-email-marketing-5-plataformas-para-email-marketing-efectivo-mobile.jpg`, `/opt/cursor/artifacts/qa-sprint/screenshots/podcast-episodio-6-plan-de-contenidos-que-es-por-que-te-hace-vender-mas-mobile.jpg`, `/opt/cursor/artifacts/qa-sprint/screenshots/blog-mas-vistos-wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo-mobile.jpg` | `max-width: 100%` y `width: auto` solo dentro del artículo. El chip de autor puede partir línea; la fecha sigue en una línea. | [#360](https://github.com/devplayful/playful-headless/pull/360) `fix/qa-sprint-article-overflow` |
| QA-03 | Alta | `bit.ly/3cMK03N` en `/podcast/episodio-2-el-metaverso-que-es-cuales-son-sus-caracteristicas`. `bit.ly/3cPMfUb` en `/blog/seo/auditoria-seo-que-es-como-se-hace`. | Ambos | El primero hace 301 a un sitio de vídeo para adultos y la cadena termina en 404. El segundo hace 301 a un sitio de contenido para adultos (el destino respondió 403 al checker). No se reproduce la URL de destino. | `/opt/cursor/artifacts/qa-sprint/screenshots/podcast-episodio-2-el-metaverso-que-es-cuales-son-sus-caracteristicas-desktop.jpg`, `/opt/cursor/artifacts/qa-sprint/screenshots/blog-seo-auditoria-seo-que-es-como-se-hace-desktop.jpg` | Desenvolver el `<a>`: queda el texto, desaparece el href. | [#365](https://github.com/devplayful/playful-headless/pull/365) `fix/qa-sprint-shortlinks` y, para el episodio, también [#364](https://github.com/devplayful/playful-headless/pull/364) |
| QA-04 | Alta | `/contactar` | Ambos | 404. El formulario vive en `/contactar-agencia-de-marketing-digital`. `/contacto` y `/contactanos` ya hacen 301. | `/opt/cursor/artifacts/qa-sprint/screenshots/contactar-mobile.jpg` | El mismo 301 permanente. | [#363](https://github.com/devplayful/playful-headless/pull/363) `fix/qa-sprint-enlaces-404` |
| QA-05 | Media | Botones de la 404, vistos desde `/contactar` y `/thank-you` | Ambos | `/posicionamiento-seo`, `/publicidad-para-vender` y `/diseno-e-commerce` responden 404. El 404 de contacto además dispara RSC a esas rutas. | `/opt/cursor/artifacts/qa-sprint/screenshots/contactar-desktop.jpg` | Mismos rótulos, href a `/agencia-seo`, `/agencia-sem` y `/agencia-diseno-web`. | [#363](https://github.com/devplayful/playful-headless/pull/363) |
| QA-06 | Media | `/blog/seo/migracion-seo-cambiar-de-plataforma` desde `/blog/tecnologia/cashea-para-comercios` | Ambos | El canonical publicado es el path corto y la página generada es `...-alternativa`. El corto responde 404. El test de canonical exige que el path corto siga siendo el canonical. | `/opt/cursor/artifacts/qa-sprint/screenshots/blog-tecnologia-cashea-para-comercios-desktop.jpg` | Rewrite interno, sin 301. | [#363](https://github.com/devplayful/playful-headless/pull/363) |
| QA-07 | Media | 18 episodios del sitemap enlazan páginas de `endpoint.playfulagency.com` | Ambos | Esos href no pasan por `rewriteInSitePageHrefs` porque el episodio se pide en cliente. En apex, el mismo path de buyer persona y el de «aprende todo sobre el SEO» dan 200. `/blog/otros/ecosistema-digital-de-tu-marca` hace 301 a `/blog/mas-vistos/...`. `/servicios/desarrollo-web` hace 301 a `/agencia-diseno-web`. `/contactanos` hace 301 al formulario. Siguen en 404 tras el cambio de host: `/blog/seo/blog-seo-aprende-todo-sobre-el-seo`, `/blog/tecnologia/ecommerce-quiero-tener-mi-negocio-online`, `/servicios/desarrollo-web/ui-ux`. No se inventa destino. | `/opt/cursor/artifacts/qa-sprint/screenshots/podcast-episodio-1-trafico-organico-vs-trafico-pago-desktop.jpg` | Reescribir content y excerpt con el mismo helper del blog. | [#364](https://github.com/devplayful/playful-headless/pull/364) `fix/qa-sprint-podcast-hrefs` |
| QA-08 | Media | Los 18 episodios del sitemap | Ambos | El iframe `small_player` de `www.buzzsprout.com` o `benditaweb.buzzsprout.com` responde 404. El HTML sale de WordPress. Quitar el iframe sin una URL nueva deja el episodio sin player. | `/opt/cursor/artifacts/qa-sprint/screenshots/podcast-episodio-6-plan-de-contenidos-que-es-por-que-te-hace-vender-mas-desktop.jpg` | Propuesto, sin PR: sustituir el embed en WordPress o por un player cuyo URL responda 2xx. WordPress está fuera de este sprint. | — |
| QA-09 | Media | `/agencia-e-commerce`, `/agencia-seo`, `/agencia-sem`, `/agencia-diseno-web`, `/agencia-ux-ui` | Ambos | `eicons` y `fa-solid-900` (woff2, woff, ttf) en `endpoint.playfulagency.com` fallan por CORS (`net::ERR_FAILED`). Unas 19 líneas de consola por vista. | `/opt/cursor/artifacts/qa-sprint/screenshots/agencia-seo-desktop.jpg` | Propuesto, sin PR. El arreglo limpio es un header CORS en WordPress o un proxy. `ElementorPageHeaderFix.css` es CSS global y toca el header: no se edita. | — |
| QA-10 | Media | `/agencia-seo`, `/agencia-diseno-web` | Ambos | `Uncaught TypeError: a.$elm.find(...).cubeportfolio is not a function`. El plugin MAE no está cargado. | `/opt/cursor/artifacts/qa-sprint/screenshots/agencia-diseno-web-mobile.jpg` | Propuesto, sin PR. No se añade el script de un tercero a ciegas. | — |
| QA-11 | Media | `/agencia-e-commerce`, `/agencia-seo`, `/agencia-sem`, `/agencia-ux-ui` | Ambos | `https://old.playfulagency.com/wp-content/uploads/2024/07/CONFETY-PLAYFUL.png` → `net::ERR_SSL_PROTOCOL_ERROR`. La misma imagen ya está declarada en `ElementorPageHeaderFix.css` contra `endpoint.playfulagency.com`. | `/opt/cursor/artifacts/qa-sprint/screenshots/agencia-e-commerce-mobile.jpg` | Propuesto, sin PR: cambiar el `background-image` de `old.` al de `endpoint.` en ese CSS. Es CSS global. | — |
| QA-12 | Media | `/podcast/episodio-1-trafico-organico-vs-trafico-pago` | Móvil | La imagen `...trafico-pago-560x421.png` de endpoint falla con `net::ERR_BLOCKED_BY_ORB` y queda `naturalWidth` 0. En escritorio el fallo visible de esa vista fue el iframe de Buzzsprout, no la imagen. | `/opt/cursor/artifacts/qa-sprint/screenshots/podcast-episodio-1-trafico-organico-vs-trafico-pago-mobile.jpg` | Propuesto, sin PR. El recurso está en WordPress. Rehospedar o servirla same-origin. | — |
| QA-13 | Media | `/blog/seo/auditoria-seo-que-es-como-se-hace` | Móvil | Lighthouse: performance 72, LCP 9,5 s. El elemento es la imagen del hero («Un hombre se mira en un espejo…», `decoding=async`, sin `fetchpriority=high`). Escritorio: 99 y LCP 0,8 s. | `/opt/cursor/artifacts/qa-sprint/screenshots/blog-seo-auditoria-seo-que-es-como-se-hace-mobile.jpg` | Propuesto, sin PR. Priorizar esa imagen en la plantilla del post roza el layout del artículo. Una pasada de laboratorio, no mediana. | — |
| QA-14 | Baja | `/agencia-seo`, `/agencia-sem`, `/agencia-diseno-web`, `/agencia-ux-ui` | Ambos | `overflowX` de 199 a 377 px (capturas de 753 y 1528 px de ancho) por slides fuera de pantalla. `scrollX` se queda en 0: `body` ya tiene `overflow-x: hidden`. El usuario no puede hacer pan. | `/opt/cursor/artifacts/qa-sprint/screenshots/agencia-seo-mobile.jpg`, `/opt/cursor/artifacts/qa-sprint/screenshots/agencia-ux-ui-desktop.jpg` | `overflow-x: clip` en el módulo de la página Elementor, no en el CSS global. | [#362](https://github.com/devplayful/playful-headless/pull/362) `fix/qa-sprint-elementor-clip` |
| QA-15 | Baja | Episodios del podcast y `/gracias` | Móvil, y podcast también escritorio | CLS de podcast entre 0,05 y 0,08 (un shift hacia 1,5–2 s). `/gracias` móvil 0,097. `/contactar` y `/thank-you` marcan 0,11–0,25 porque son la 404, no la página de gracias. | `/opt/cursor/artifacts/qa-sprint/screenshots/gracias-mobile.jpg` | Propuesto, sin PR. Reservar alto del player y de la imagen del episodio. El player hoy es un 404 (QA-08). | — |
| QA-16 | Baja | `/contactar-agencia-de-marketing-digital` | Ambos | El texto legal dice «Al hacer clic en Enviar mensaje» y el botón dice «¡Quiero que conozcan mi caso!». | `/opt/cursor/artifacts/qa-sprint/screenshots/contactar-agencia-de-marketing-digital-desktop.jpg` | Propuesto, sin PR. Es copy aprobado: no se cambia en este sprint. | — |
| QA-17 | Baja | `/thank-you` | Ambos | 404. La ruta de gracias es `/gracias`, que en el live da 200. | `/opt/cursor/artifacts/qa-sprint/screenshots/thank-you-mobile.jpg` | Propuesto, sin PR. Un alias 301 solo si se quiere conservar esa URL en anuncios viejos. | — |
| QA-18 | Informativo | `/pasarela-de-pagos-venezuela` desde `/blog/tecnologia/cashea-para-comercios` | Ambos | 404 a propósito. Los tests bloquean publicarla y el mapa de href rotos dice que no se invente destino para landings despublicadas. | `/opt/cursor/artifacts/qa-sprint/screenshots/blog-tecnologia-cashea-para-comercios-mobile.jpg` | Sin cambio. | — |

El breadcrumb del podcast usa `truncate` y muestra puntos suspensivos. El `h1` lleva el título completo. No se cuenta como defecto.

No se vio texto cortado fuera de ese breadcrumb ni imágenes deformadas (`deformed: false` en la imagen rota de QA-01: el hueco conserva 580×410 y el recurso no llega).

## Core Web Vitals

Lighthouse 12, una pasada, `?qa=1`. El user agent es el de Lighthouse. INP de campo: **[SIN VERIFICAR]**. «Culpable» es el audit de performance con peor `(1 − score) × weight` entre los que puntúan por debajo de 0,9. JSON en `/opt/cursor/artifacts/qa-sprint/lighthouse/`.

`/contactar` es 404, así que la fila de contacto es la URL real del formulario.

| URL | Viewport | Score | LCP | CLS | TBT | INP | Culpable |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `/` | Móvil | 94 | 3,0 s | 0 | 69 ms | [SIN VERIFICAR] | LCP. Elemento: `p.playful-h1` |
| `/` | Escritorio | 100 | 0,62 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno por debajo de 0,9. LCP: ilustración de la tienda |
| `/contactar-agencia-de-marketing-digital` | Móvil | 94 | 2,3 s | 0 | 223 ms | [SIN VERIFICAR] | TBT 220 ms |
| `/contactar-agencia-de-marketing-digital` | Escritorio | 100 | 0,50 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno. LCP: ilustración de contacto |
| `/agencia-shopify` | Móvil | 99 | 2,1 s | 0 | 60 ms | [SIN VERIFICAR] | Ninguno por debajo de 0,9 |
| `/agencia-shopify` | Escritorio | 100 | 0,51 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno. LCP: ilustración del dependiente |
| `/blog` | Móvil | 98 | 2,3 s | 0 | 97 ms | [SIN VERIFICAR] | Ninguno por debajo de 0,9. LCP: imagen del listado |
| `/blog` | Escritorio | 100 | 0,49 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno |
| `/blog/seo/auditoria-seo-que-es-como-se-hace` | Móvil | 72 | 9,5 s | 0 | 87 ms | [SIN VERIFICAR] | LCP. Hero «Un hombre se mira en un espejo…» |
| `/blog/seo/auditoria-seo-que-es-como-se-hace` | Escritorio | 99 | 0,79 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno. Misma imagen |
| `/casos-de-exito` | Móvil | 94 | 3,0 s | 0 | 59 ms | [SIN VERIFICAR] | LCP. Párrafo blanco del hero |
| `/casos-de-exito` | Escritorio | 100 | 0,62 s | 0 | 0 ms | [SIN VERIFICAR] | Ninguno. LCP: `/images/casos-de-exito.png` |

## Consola y peticiones fallidas

Agrupado. El mismo fallo se repite en móvil y escritorio salvo donde se indica.

| Qué | Dónde | Estado | Notas |
| --- | --- | --- | --- |
| Players Buzzsprout `small_player` | 18 episodios | 404 | QA-08 |
| Fuentes Elementor `eicons` y `fa-solid-900` (woff2, woff, ttf) | 5 landings Elementor | CORS, `net::ERR_FAILED` | QA-09. ~19 líneas de consola por vista |
| `CONFETY-PLAYFUL.png` en `old.playfulagency.com` | 4 landings | `ERR_SSL_PROTOCOL_ERROR` | QA-11. No está en diseño web |
| `cubeportfolio is not a function` | `/agencia-seo`, `/agencia-diseno-web` | pageerror | QA-10 |
| `/_next/image` del SVG `Beneficio-6-09.svg` | Post de 5 plataformas, escritorio | 400 | QA-01 |
| PNG de tráfico de pago | Episodio 1, móvil | `ERR_BLOCKED_BY_ORB` | QA-12 |
| Documento `/contactar?qa=1` y `/thank-you?qa=1` | Esas rutas | 404 | QA-04, QA-17 |
| RSC a `/posicionamiento-seo`, `/publicidad-para-vender`, `/diseno-e-commerce` | 404 de `/contactar`, móvil | 404 | QA-05 |

El resto de las 104 vistas no añadió otra familia de error.

## Enlaces que no devolvieron 2xx ni 3xx

28 URLs distintas, con la página de origen. Los 403, 429 y `fetch failed` de terceros se marcan **[SIN VERIFICAR]**: el checker usa un user agent de QA y varios sitios bloquean bots.

| URL | Origen | Resultado |
| --- | --- | --- |
| `https://soytechno.com/` | `/casos-de-exito/soytechno-ecommerce-venezuela`, `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce` | 403 **[SIN VERIFICAR]** |
| `https://www.instagram.com/realfunmarketing/?hl=es` | Episodio 1 | 302 y luego 429 **[SIN VERIFICAR]** |
| `https://cursos.realfun.marketing/coaching-y-cursos-facebook-instagram-ads-para-negocios-full` | Episodio 1 | `fetch failed` **[SIN VERIFICAR]** |
| `https://bit.ly/36zn4gN` | `/blog/email-marketing/estrategia-de-email-marketing` | 301 a `emailmarketing.playfulagency.com`, luego `fetch failed` **[SIN VERIFICAR]** |
| `https://www.behance.net/gallery/328381/Paper-Browser` | Post de wireframe | 403 **[SIN VERIFICAR]** |
| `https://www.templatemonster.com/es/plantillas-html5/` | Post de wireframe | 403 **[SIN VERIFICAR]** |
| `https://bit.ly/3cMK03N` | Episodio 2 del metaverso | 301 a un sitio de vídeo para adultos; la cadena termina en 404. QA-03 |
| `https://bit.ly/3cPMfUb` | Post de auditoría SEO | 301 a un sitio de contenido para adultos; ese destino respondió 403. QA-03 |
| `https://playfulagency.com/pasarela-de-pagos-venezuela` | `/blog/tecnologia/cashea-para-comercios` | 404 intencional. QA-18 |
| `https://playfulagency.com/blog/seo/migracion-seo-cambiar-de-plataforma` | El mismo post de Cashea | 404. QA-06 |
| `https://playfulagency.com/posicionamiento-seo` | `/contactar`, `/thank-you` | 404. QA-05 |
| `https://playfulagency.com/publicidad-para-vender` | `/contactar`, `/thank-you` | 404. QA-05 |
| `https://playfulagency.com/diseno-e-commerce` | `/contactar`, `/thank-you` | 404. QA-05 |
| `https://endpoint.playfulagency.com/blog/pautas-digitales/que-son-los-buyer-persona-y-como-se-determinan/` | Episodios «comenzando de cero», keywords, 1, 6 y auditoría | 404 en endpoint. En apex el path da 200 |
| `https://endpoint.playfulagency.com/blog/seo/aprende-todo-sobre-el-seo/` | Episodios SEO, auditoría, «qué funciona», «medir» | 404 en endpoint. En apex, 200 |
| `https://endpoint.playfulagency.com/blog/seo/que-es-la-intencion-de-busqueda-y-cuales-son-sus-beneficios/` | Episodio de keywords | 404 en endpoint |
| `https://endpoint.playfulagency.com/blog/otros/descubre-por-que-debes-usar-whatsapp-business-en-tu-negocio/` | Episodio 1 | 404 en endpoint |
| `https://endpoint.playfulagency.com/blog/otros/ecosistema-digital-de-tu-marca/` | Episodio 1 | 404 en endpoint. En apex, 301 a `/blog/mas-vistos/ecosistema-digital-de-tu-marca` |
| `https://endpoint.playfulagency.com/blog/pautas-digitales/como-usar-el-remarketing-para-tener-mas-clientes/` | Episodio 1 | 404 en endpoint |
| `https://endpoint.playfulagency.com/blog/pautas-digitales/guia-para-hacer-marketing-digital/` | Episodios 2 y 6 | 404 en endpoint |
| `https://endpoint.playfulagency.com/blog/pautas-digitales/criptomonedas-las-utilizarias-como-metodo-de-pago/` | Episodio 2 | 404 en endpoint |
| `https://endpoint.playfulagency.com/contactanos/` | Episodio 4 | 404 en endpoint. En apex, 301 al formulario |
| `https://endpoint.playfulagency.com/servicios/desarrollo-web/` | Episodio 4 | 404 en endpoint. En apex, 301 a `/agencia-diseno-web` |
| `https://endpoint.playfulagency.com/blog/tecnologia/chatbot-inteligencia-artificial-personalizada-para-tu-activo-digital/` | Episodio 5 | 404 en endpoint |
| `https://endpoint.playfulagency.com/blog/seo/blog-seo-aprende-todo-sobre-el-seo/` | Episodio 6 | 404 en endpoint y también 404 en apex |
| `https://endpoint.playfulagency.com/blog/tecnologia/ecommerce-quiero-tener-mi-negocio-online/` | Episodio 8 | 404 en endpoint y también 404 en apex |
| `https://endpoint.playfulagency.com/blog/seo/rich-snippet-ayuda-a-optimizar-tu-web/` | Episodio «qué funciona» | 404 en endpoint |
| `https://endpoint.playfulagency.com/servicios/desarrollo-web/ui-ux/` | Episodio «linda o funcional» | 404 en endpoint y también 404 en apex |

## Formularios

| Formulario | Dónde | Render | Validación | Destino del submit | Envío |
| --- | --- | --- | --- | --- | --- |
| Contacto | `/contactar-agencia-de-marketing-digital?qa=1` | Sí. Un `<form>`, dos iframes de reCAPTCHA v2 (sitekey `6LcQ_Z8t…`). `action` vacío: el cliente hace `fetch` a `/api/contact` y, si responde bien, navega a `/gracias?conv=Lead`. | Vacío: «Please fill out this field.» Email `no-es-un-correo`: «Please include an '@'…». | `/api/contact` (WordPress gate y luego HighLevel). No hay bypass por `?qa=1`. | No enviado. A las 13:08:50 Europe/Madrid el checkbox de reCAPTCHA no quedó `aria-checked`. No se reintentó. Entrega a GHL **[SIN VERIFICAR]**. |
| Lista eShow | `/blog/otros/eshow-madrid-2026` | Sí. Nombre, email, consentimiento, botón «Quiero seguir el eShow». | Click en vacío: «Escribe tu nombre…», «Revisa el correo…», «Marca la casilla…». | `fetch /api/eshow-lista`. | No enviado. Solo se comprobó la validación. |
| Búsqueda de la 404 | `/contactar` y `/thank-you` | Sí, el buscador de `not-found`. | — | `router.push('/blog?search=')`. | No es un lead. No se envió. |
| `/reunion-playful` | La ruta | 200. No es un formulario de la web: el cliente redirige a un widget de GHL. | — | Widget externo. | No se rellenó. |

Al cargar el contacto, el sitio dispara solo el pixel de atribución de GHL (`services.msgsndr.com`, con `qa=1` en los parámetros). Eso no es el POST del formulario.

## Previews de los arreglos

Todos los PR están en draft. No se mergeó nada y no se publicó a producción. CI «Route integrity» en verde en las seis ramas de arreglo; no hubo drift de `config/blog-sitemap-lastmod.json`.

Los enlaces `_vercel_share` caducan el 28 oct 2026 alrededor de las 11:15 (hora del token, unos 23 h desde su creación), antes del cierre de la ventana de GO.

| PR | Preview comprobado |
| --- | --- |
| [#358](https://github.com/devplayful/playful-headless/pull/358) | 200. El SVG `Beneficio-6-09.svg` sale de endpoint y ya no pasa por `/_next/image`. https://playful-headless-2a2jpiu49-playfuls-projects.vercel.app/blog/email-marketing/5-plataformas-para-email-marketing-efectivo?qa=1&_vercel_share=XInPHIXvfw7rXuJogdvDk5Zc0b7ELtF7 |
| [#360](https://github.com/devplayful/playful-headless/pull/360) | 200. https://playful-headless-ey59rts2c-playfuls-projects.vercel.app/blog/email-marketing/5-plataformas-para-email-marketing-efectivo?qa=1&_vercel_share=8i5ujhMwMujN6Dp7IXX1FriyGk12PKUx |
| [#364](https://github.com/devplayful/playful-headless/pull/364) | 200. https://playful-headless-h8tooy3c5-playfuls-projects.vercel.app/podcast/episodio-2-el-metaverso-que-es-cuales-son-sus-caracteristicas?qa=1&_vercel_share=A0swEoEqOUq0fd4bV7T347OzJNn7zil9 |
| [#363](https://github.com/devplayful/playful-headless/pull/363) | 200 en `/contactar?qa=1` (title «Contactar agencia ecommerce») y 200 en el path corto de migración (title «Migración SEO: cambia de plataforma sin perder ranking»). https://playful-headless-914jjkznd-playfuls-projects.vercel.app/contactar?qa=1&_vercel_share=RJdgKZCJ6EqYAVUeUrNziVqdVDEEc4ao |
| [#362](https://github.com/devplayful/playful-headless/pull/362) | 200. https://playful-headless-j5m10uhds-playfuls-projects.vercel.app/agencia-seo?qa=1&_vercel_share=3N50soJHJAwLv7yQq8qokqUjmpseVEIa |
| [#365](https://github.com/devplayful/playful-headless/pull/365) | 200. El HTML del post de auditoría ya no contiene `bit.ly/3cPMfUb`. https://playful-headless-84kjhdqh4-playfuls-projects.vercel.app/blog/seo/auditoria-seo-que-es-como-se-hace?qa=1&_vercel_share=Xj8YneH6JwOvE3kckeB1pAW3iqCH7Y0d |

## Capturas y datos

- Capturas (104 JPEG, página completa): `/opt/cursor/artifacts/qa-sprint/screenshots/`
- `pages.json`, `broken-links.json`, `forms.log` (JSON del chequeo de formularios), `lighthouse/*.json` y `lighthouse/summary.json`: `/opt/cursor/artifacts/qa-sprint/`

Muestra de 15 posts: `5-plataformas-para-email-marketing-efectivo`, `estrategia-de-email-marketing`, `como-elegir-el-mejor-framework`, `los-5-problemas-de-e-commerce`, wireframe, `como-posicionar-tu-negocio-en-google-ads`, `premios-cima-2026`, `eshow-madrid-2026`, analítica web, pixel de Facebook, storytelling, auditoría SEO, ChatGPT y SEO, Cashea, Zelle en Venezuela.
