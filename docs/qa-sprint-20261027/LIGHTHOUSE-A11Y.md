# Sprint Lighthouse + a11y — 27 oct 2026

Auditoría WCAG 2.1 AA (axe-core 4.10) y Lighthouse 12 (Performance, Accessibility, Best Practices, SEO) sobre **51 rutas**: estáticas de `app/` + servicios + 3 casos + 18 podcasts + `/blog` y 10 posts (incl. Premios CIMA y Zelle).

## Método

- Inventario: rutas de `app/` + `https://playfulagency.com/sitemap.xml` (200, 123 locs).
- Blog: `/blog` + 10 posts. El resto de posts del sitemap no se recorre uno a uno.
- Tráfico: en serie, ≥1 s, `?qa=1`, UA `PlayfulQA/1.0` en fetch/axe. Lighthouse usa `?qa=1` y su UA emulada.
- Sin envío de formularios ni clics en Reservar/agendar.
- Runner: `scripts/qa-lighthouse-a11y.mjs`.
- **Antes:** producción `https://playfulagency.com` (Chrome + axe + Lighthouse).
- **Después (Chrome):** mismo SHA en `next start` local (`http://127.0.0.1:3100`). El preview de Vercel está detrás de **Vercel Authentication (SSO)**; Lighthouse/puppeteer/Playwright reciben `Login – Vercel`. No se desactivó la protección.
- **Después (HTML del preview):** comprobación autenticada con la API de Vercel (`web_fetch_vercel_url`) en `/nosotros`, `/contactar-agencia-de-marketing-digital` y el post CIMA: `lang="es"`, H1 reales, `#2A0064` y labels de marketplaces presentes.
- Preview: https://playful-headless-git-cursor-a11y-light-71a460-playfuls-projects.vercel.app
- Deployment: `dpl_6QuiZmdLtqsrNWiFsiPNraCJd9mz`

## Inventario (51)

Estáticas y servicios: `/`, `/nosotros`, `/contactar-agencia-de-marketing-digital`, `/agencia-shopify`, `/agencia-e-commerce`, `/agencia-seo`, `/agencia-sem`, `/agencia-diseno-web`, `/agencia-ux-ui`, `/marketing-internacional`, `/seo-expertos`, `/seo-vigo`, `/casos-de-exito`, `/politica-de-privacidad`, `/reunion-playful`, `/gracias`, `/links`, `/firma/alejandra-da-costa`, `/podcast`.

Casos: `/casos-de-exito/soytechno-ecommerce-venezuela`, `/casos-de-exito/jumex-shopify-dtc-ecommerce`, `/casos-de-exito/odwalla-shopify-dtc-ecommerce`.

Podcast: 18 episodios del sitemap.

Blog (muestra): `/blog`, CIMA, Zelle, Cashea, SEO internacional 2025, auditoría SEO, ChatGPT SEO, 5 problemas e-commerce, agencia SEM, email marketing, storytelling.

`/blog/pautas-digitales/linkedin-ads-aumenta-el-alcance-de-tu-negocio` no está en el sitemap de prod (410). Sustituida por storytelling.

## Scores medios

| Fase | Host | Formato | Perf | A11y | BP | SEO | Nodos axe | Instancias de regla |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Antes | playfulagency.com | mobile | 85 | 92 | 77 | 88 | 84 | 36 |
| Antes | playfulagency.com | desktop | 72 | 93 | 76 | 87 | 84 | 36 |
| Después | next start mismo SHA | mobile | 85 | 94 | 99 | 87 | 46 | 10 |
| Después | next start mismo SHA | desktop | 71 | 96 | 97 | 88 | 46 | 10 |

LH «después» es el mismo SHA, no el CDN de Vercel: Best Practices sube porque el host local no carga el mismo terceros (GTM/chat). Performance se mantiene. Accessibility LH +2 / +3.

### Axe por regla

| Regla | Prod (nodos) | Después (nodos) | Notas |
| --- | ---: | ---: | --- |
| `aria-hidden-focus` | 55 | 45 | Clones slick: `inert` + `tabindex=-1`; la librería sigue reportando clones |
| `color-contrast` | 21 | 0 | Formularios, TOC PDF, casos, firma, podcast, privacidad |
| `aria-allowed-attr` | 7 | 0 | Tabs Elementor: se quita `aria-selected` en HTML y en cliente |
| `link-name` | 1 | 0 | Post auditoría SEO |
| `html-has-lang` | 0 | 1 | Solo local: `/contactar…` cayó en `#__next_error__`. El preview tiene `lang="es"` |
| `aria-prohibited-attr` | 0 | 0 | Introducido y corregido (`role="img"` en estrellas) |

Sin el error local de contacto: **45 nodos / 9 instancias**, todos `aria-hidden-focus` de slick.

## Tabla por ruta

Leyenda LH: `P/A/B/S`. After Chrome = `next start` mismo SHA.

| Ruta | Axe prod | Reglas prod | LH mobile prod | LH desktop prod | Axe after | Reglas after | LH mobile after | LH desktop after |
| --- | ---: | --- | --- | --- | ---: | --- | --- | --- |
| `/` | 5 | aria-hidden-focus×5 | 93/90/79/100 | 77/94/78/100 | 5 | aria-hidden-focus×5 | 85/87/100/100 | 67/91/100/100 |
| `/nosotros` | 5 | aria-hidden-focus×5 | 98/90/79/100 | 83/98/78/100 | 5 | aria-hidden-focus×5 | 97/90/100/100 | 79/98/100/100 |
| `/contactar-agencia-de-marketing-digital` | 7 | aria-hidden-focus×5, color-contrast×2 | 97/88/79/100 | 85/92/78/100 | 1 | html-has-lang×1 (error local) | 92/59/89/82 | 78/79/93/100 |
| `/agencia-e-commerce` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 78/89/75/92 | 64/90/74/92 | 5 | aria-hidden-focus×5 | 79/89/96/92 | 61/90/96/92 |
| `/agencia-shopify` | 0 | — | 98/94/79/100 | 81/98/78/100 | 0 | — | 91/91/100/100 | 72/91/100/100 |
| `/agencia-seo` | 5 | aria-hidden-focus×5 | 79/95/75/92 | 62/95/74/92 | 5 | aria-hidden-focus×5 | 82/95/96/92 | 63/95/96/92 |
| `/agencia-sem` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 81/89/75/92 | 53/89/74/92 | 5 | aria-hidden-focus×5 | 82/89/96/92 | 62/89/96/92 |
| `/agencia-diseno-web` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 81/89/75/92 | 51/89/74/92 | 5 | aria-hidden-focus×5 | 80/89/96/92 | 60/89/96/92 |
| `/agencia-ux-ui` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 78/89/75/92 | 63/89/74/92 | 5 | aria-hidden-focus×5 | 79/89/96/92 | 60/89/96/92 |
| `/casos-de-exito` | 0 | — | 96/94/79/100 | 80/98/78/100 | 0 | — | 94/91/100/100 | 78/91/100/100 |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | 1 | color-contrast×1 | 86/94/79/100 | 86/94/78/92 | 0 | — | 89/98/100/92 | 71/98/100/92 |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | 1 | color-contrast×1 | 93/94/79/100 | 82/94/78/100 | 0 | — | 90/98/100/92 | 75/98/100/92 |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | 1 | color-contrast×1 | 79/94/79/100 | 80/94/78/100 | 0 | — | 90/94/100/92 | 74/98/100/92 |
| `/blog` | 0 | — | 99/94/79/69 | 87/94/78/69 | 0 | — | 96/94/100/92 | 82/94/100/92 |
| `/politica-de-privacidad` | 1 | color-contrast×1 | 99/94/79/100 | 88/94/78/100 | 0 | — | 93/98/100/100 | 73/98/100/100 |
| `/reunion-playful` | 0 | — | 100/100/—/58 | 90/42/—/45 | 0 | — | 97/100/100/69 | 84/100/—/83 |
| `/gracias` | 0 | — | 94/98/79/69 | 82/98/78/69 | 0 | — | 94/98/100/69 | 81/98/100/69 |
| `/links` | 0 | — | 84/100/79/69 | 85/100/78/69 | 0 | — | 77/100/100/69 | 80/100/100/69 |
| `/firma/alejandra-da-costa` | 3 | color-contrast×3 | 96/94/79/66 | 84/94/78/66 | 0 | — | 93/98/100/66 | 81/98/100/66 |
| `/podcast` | 2 | color-contrast×2 | 86/94/79/69 | 72/94/78/69 | 0 | — | 84/98/100/69 | 72/98/100/69 |
| `/marketing-internacional` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 78/89/75/92 | 59/89/74/92 | 5 | aria-hidden-focus×5 | 78/89/96/92 | 63/89/96/92 |
| `/seo-expertos` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 79/89/75/92 | 63/89/74/92 | 5 | aria-hidden-focus×5 | 77/89/96/92 | 62/89/96/92 |
| `/seo-vigo` | 6 | aria-allowed-attr×1, aria-hidden-focus×5 | 77/89/75/92 | 50/89/74/92 | 0 | — | 78/89/96/92 | 61/89/96/92 |
| 18 episodios `/podcast/*` | 0 | — | ~80/94/79/83 | ~68/94/78/83 | 0 | — | ~82/98/100/83 | ~69/98/100/83 |
| Posts CIMA, Zelle, Cashea, SEO intl, ChatGPT, 5 problemas, SEM, email, storytelling | 1 c/u | color-contrast TOC | ver tabla | ver tabla | 0 | — | ver tabla | ver tabla |
| `/blog/seo/auditoria-seo-que-es-como-se-hace` | 2 | contrast + link-name | 58/87/79/92 | 65/91/96/92 | 0 | — | 71/95/96/92 | 54/98/96/92 |

`/reunion-playful` es redirect: Lighthouse a veces no puntúa Best Practices / a11y de forma estable. No se interactuó con el booking.

## Arreglos (fuera de cascarón)

| Archivo | Qué |
| --- | --- |
| `lib/elementor-a11y-html.ts` | Alt ausente, `aria-label` en enlaces vacíos, quita `aria-selected` de tabs `role=button` |
| `components/ElementorPageContent.tsx` | Aplica el pase a11y al HTML de Elementor |
| `components/ElementorPageScripts.tsx` | Observer cliente: vuelve a quitar `aria-selected` que reinyecta Elementor |
| `services/wordpress.ts` | Mismo pase en `getPageBySlug` |
| `app/blog/[...slug]/page.tsx` | Pase a11y al cuerpo del post (`link-name`) |
| `app/casos-de-exito/[slug]/page.tsx` | Pase a11y ACF; contraste naranja `#B45309` |
| `components/ContactLeadForm.tsx` | Label de marketplaces; contraste legal; grupo reCAPTCHA |
| `app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx` | Igual + H1 de página |
| `components/blog/TableOfContents.tsx` | PDF: texto `#2A0064` sobre `#39DDCB` |
| `components/CarouselResultados.tsx` | Flechas `aria-label`; `inert` + `tabindex=-1` en slides `aria-hidden`; CTA `span`; spinner `status` |
| `components/ui/PortfolioCarousel.tsx` | Módulo A11y de Swiper |
| `app/casos-de-exito/TestimonialsSection.tsx` | A11y Swiper, `h3`, estrellas `role="img"`, avatar decorativo |
| `app/casos-de-exito/CaseStudiesContent.tsx` | Hero `next/image` + sizes; filtros `aria-pressed`; vacío AA |
| `components/soytechno/SoyTechnoCaseStudy.module.css` | Azul h3/card `#1256B5` |
| `app/nosotros/page.tsx` | H1 real; alt y sizes del hero |
| `app/politica-de-privacidad/page.tsx` | H1 real; fecha sin opacity |
| `app/page.tsx` / `app/links/page.tsx` | Decoraciones `aria-hidden` |
| `components/AnimatedButton.tsx` | Lottie `aria-hidden` |
| `app/podcast/PodcastHubContent.tsx` | Contraste CTAs; spinner |
| `app/podcast/[slug]/page.tsx` | Contraste CTA Buzzsprout |
| `app/firma/alejandra-da-costa/firma-html.ts` | Teal `#14665C` |
| `scripts/qa-lighthouse-a11y.mjs` | Runner (serie, resume, share token opcional) |
| `tests/elementor-a11y-html.test.mjs` | Cobertura del pase |

Copy visible aprobado: no se reescribió.

## Fuera de alcance: cascarón

No se tocó header, footer, `app/layout.tsx` ni CSS global.

| Fallo | Dónde | Propuesta |
| --- | --- | --- |
| No hay «Saltar al contenido» | `app/layout.tsx` + header | Enlace `.sr-only` a `#main`; envolver children en `<main id="main">` |
| Widget chat HighLevel | `components/ChatWidget.tsx` desde el layout | Parchear el loader o sustituir el botón flotante (suele fallar `button-name` / contraste) |
| Contraste de tokens globales (`.playful-boton`, header/footer teal) | `app/globals.css`, header, footer | Texto de CTAs teal a `#2A0064` en el tema base |
| iframe reCAPTCHA sin nombre | Tercero | El wrapper `role=group` mitiga; el iframe de Google sigue fuera |
| `aria-hidden-focus` residual en clones slick | `react-slick` (home, nosotros, landings) | Sustituir slick por Swiper con A11y, o no clonar slides. `inert` no basta del todo |
| HTML 410 de un post fuera del sitemap | `linkedin-ads-…` | No es fallo de layout; no está publicada |

En prod **no** hubo violaciones axe en logo/nav/redes del header o footer.

## Checks

- `tsc --noEmit`: OK
- `next lint`: pide config interactiva (preexistente); no se añadió ESLint
- `npm run test:canonical`: OK
- `npm run test:cta-click`: OK
- `npm run build`: OK (141 páginas)

## Limitación del preview

Vercel Authentication redirige Chrome, curl y Playwright a `Login – Vercel`. `get_access_to_vercel_url` exige SSO. No hay permiso (403) para crear `protection-bypass` de automatización. Por eso Lighthouse/axe Chrome «después» corren contra el **mismo SHA** en `next start`, y el HTML del preview se verificó por API autenticada.
