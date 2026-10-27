# Sprint Lighthouse + a11y — 27 oct 2026

Auditoría WCAG 2.1 AA (axe-core 4.10) y Lighthouse 12 (Performance, Accessibility, Best Practices, SEO) sobre **todas las rutas de cascarón + servicios + casos + podcast + `/blog` y 10 posts**.

## Método

- Origen de inventario: rutas estáticas de `app/` + `https://playfulagency.com/sitemap.xml` (200, 123 locs).
- Blog: listado `/blog` y 10 posts representativos, incluyendo Premios CIMA y Zelle. El resto de posts del sitemap no se recorre uno a uno.
- Tráfico: en serie, ≥1 s entre peticiones, `?qa=1`, UA `PlayfulQA/1.0` en fetch/axe. Lighthouse usa `?qa=1` y su UA emulada (mismo criterio que `scripts/lighthouse-mobile-median.mjs`).
- Sin envío de formularios ni clics en Reservar/agendar.
- Runner: `scripts/qa-lighthouse-a11y.mjs`.
- Línea base: producción `https://playfulagency.com`.
- Después: preview de Vercel de esta rama (se rellena cuando exista).

## Inventario (51 rutas auditadas)

Estáticas de `app/` y servicios: `/`, `/nosotros`, `/contactar-agencia-de-marketing-digital`, `/agencia-shopify`, `/agencia-e-commerce`, `/agencia-seo`, `/agencia-sem`, `/agencia-diseno-web`, `/agencia-ux-ui`, `/marketing-internacional`, `/seo-expertos`, `/seo-vigo`, `/casos-de-exito`, `/politica-de-privacidad`, `/reunion-playful`, `/gracias`, `/links`, `/firma/alejandra-da-costa`, `/podcast`.

Casos: `/casos-de-exito/soytechno-ecommerce-venezuela`, `/casos-de-exito/jumex-shopify-dtc-ecommerce`, `/casos-de-exito/odwalla-shopify-dtc-ecommerce`.

Podcast: 18 episodios del sitemap.

Blog (muestra):

- `/blog`
- `/blog/otros/premios-cima-2026-soytechno-playful`
- `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`
- `/blog/tecnologia/cashea-para-comercios`
- `/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad`
- `/blog/seo/auditoria-seo-que-es-como-se-hace`
- `/blog/seo/chat-gpt-puede-mejorar-el-seo-de-una-pagina-web`
- `/blog/mas-vistos/los-5-problemas-de-e-commerce`
- `/blog/mas-vistos/que-es-una-agencia-de-sem`
- `/blog/email-marketing/estrategia-de-email-marketing`
- `/blog/pautas-digitales/storytelling-en-el-marketing-digital`

Fuera de la muestra de blog: 100+ posts del sitemap. Fuera de auditoría: `/test-blog`, `/blog/q`, APIs.

## Scores medios

| Fase | Formato | Perf | A11y | BP | SEO | Nodos axe | Reglas axe |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Antes (prod) | mobile | *pendiente LH* | *pendiente LH* | *pendiente LH* | *pendiente LH* | 85 | 37 |
| Antes (prod) | desktop | *pendiente LH* | *pendiente LH* | *pendiente LH* | *pendiente LH* | 85 | 37 |
| Después (preview) | mobile | *pendiente preview* | *pendiente preview* | *pendiente preview* | *pendiente preview* | *pendiente* | *pendiente* |
| Después (preview) | desktop | *pendiente preview* | *pendiente preview* | *pendiente preview* | *pendiente preview* | *pendiente* | *pendiente* |

Axe de producción (51 rutas, 27 oct 2026): **85 nodos / 37 reglas**.

| Regla | Impacto | Nodos | Rutas | Alcance |
| --- | --- | ---: | ---: | --- |
| `aria-hidden-focus` | serious | 55 | 11 | Carrusel slick (`CarouselResultados`): clones `aria-hidden` con `<a>` focusable |
| `color-contrast` | serious | 20 | 16 | Formularios, TOC PDF, SoyTechno, Jumex/Odwalla, firma, podcast, privacidad |
| `aria-allowed-attr` | critical | 7 | 7 | Tabs Elementor `role="button"` + `aria-selected` |
| `link-name` | serious | 1 | 1 | Enlace-imagen sin nombre en un post |
| `document-title` | serious | 1 | 1 | URL de muestra que no está en el sitemap de prod (HTML vacío) |
| `html-has-lang` | serious | 1 | 1 | Misma URL vacía; el layout raíz sí tiene `lang="es"` |

## Tabla por ruta

Leyenda: **Axe** = nodos en prod. Las columnas LH se rellenan al cerrar la pasada de Lighthouse y la del preview.

| Ruta | Axe prod | Notas prod | LH mobile P/A/B/S | LH desktop P/A/B/S | Axe preview | LH preview |
| --- | ---: | --- | --- | --- | --- | --- |
| `/` | 5 | slick `aria-hidden-focus` | pend. | pend. | pend. | pend. |
| `/nosotros` | 5 | slick | pend. | pend. | pend. | pend. |
| `/contactar-agencia-de-marketing-digital` | 7 | slick + contraste rosa | pend. | pend. | pend. | pend. |
| `/agencia-e-commerce` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/agencia-shopify` | 0 | limpia | pend. | pend. | pend. | pend. |
| `/agencia-seo` | 5 | slick | pend. | pend. | pend. | pend. |
| `/agencia-sem` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/agencia-diseno-web` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/agencia-ux-ui` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/casos-de-exito` | 0* | *sin axe extra en hub; contraste vacío-filtros corregido en código | pend. | pend. | pend. | pend. |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | 1 | h3 azul `#297dff` | pend. | pend. | pend. | pend. |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | 1 | naranja `#F78D2B` | pend. | pend. | pend. | pend. |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | 1 | naranja `#F78D2B` | pend. | pend. | pend. | pend. |
| `/blog` | 0 | limpia | pend. | pend. | pend. | pend. |
| `/politica-de-privacidad` | 1 | fecha `opacity-80` | pend. | pend. | pend. | pend. |
| `/reunion-playful` | 0 | redirect, no form | pend. | pend. | pend. | pend. |
| `/gracias` | 0 | limpia | pend. | pend. | pend. | pend. |
| `/links` | 0 | limpia | pend. | pend. | pend. | pend. |
| `/firma/alejandra-da-costa` | 3 | teal `#1A8479` sobre `#FFF8EC` | pend. | pend. | pend. | pend. |
| `/podcast` | 2 | botones naranja/verde | pend. | pend. | pend. | pend. |
| `/marketing-internacional` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/seo-expertos` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| `/seo-vigo` | 6 | tab ARIA + slick | pend. | pend. | pend. | pend. |
| 18 episodios `/podcast/*` | 0 | limpios en axe | pend. | pend. | pend. | pend. |
| Posts CIMA, Zelle, Cashea, SEO intl, auditoría, ChatGPT, 5 problemas, agencia SEM, email | 1 c/u | TOC PDF blanco sobre `#39DDCB` | pend. | pend. | pend. | pend. |
| `/blog/seo/auditoria-seo-que-es-como-se-hace` | 2 | TOC + `link-name` | pend. | pend. | pend. | pend. |

## Arreglos en esta rama (fuera de cascarón)

| Archivo | Qué |
| --- | --- |
| `lib/elementor-a11y-html.ts` | Alt ausente, `aria-label` en enlaces vacíos, quita `aria-selected` de tabs `role=button` |
| `components/ElementorPageContent.tsx` | Aplica el pase a11y al HTML de Elementor |
| `services/wordpress.ts` | Mismo pase en `getPageBySlug` |
| `app/blog/[...slug]/page.tsx` | Pase a11y al cuerpo del post (arregla `link-name`) |
| `app/casos-de-exito/[slug]/page.tsx` | Pase a11y en ACF; contraste de labels naranja `#B45309` |
| `components/ContactLeadForm.tsx` | Label de marketplaces; contraste enlace/legal; grupo reCAPTCHA |
| `app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx` | Igual que el formulario + H1 real de página |
| `components/blog/TableOfContents.tsx` | PDF: texto `#2A0064` sobre `#39DDCB` |
| `components/CarouselResultados.tsx` | Flechas con `aria-label`; `tabindex=-1` en slides `aria-hidden`; CTA `span` (el card ya es enlace); spinner `role=status` |
| `components/ui/PortfolioCarousel.tsx` | Módulo A11y de Swiper |
| `app/casos-de-exito/TestimonialsSection.tsx` | A11y Swiper, `h3`, estrellas, avatar decorativo |
| `app/casos-de-exito/CaseStudiesContent.tsx` | Hero `next/image` + sizes; filtros `aria-pressed`; vacío con contraste AA |
| `components/soytechno/SoyTechnoCaseStudy.module.css` | Azul de h3/card `#1256B5` |
| `app/nosotros/page.tsx` | H1 en el título visual; alt y sizes del hero |
| `app/politica-de-privacidad/page.tsx` | H1 en el título visual; fecha sin opacity |
| `app/page.tsx` / `app/links/page.tsx` | Decoraciones `aria-hidden` |
| `components/AnimatedButton.tsx` | Lottie `aria-hidden` |
| `app/podcast/PodcastHubContent.tsx` | Contraste de CTAs; spinner accesible |
| `app/podcast/[slug]/page.tsx` | Contraste del CTA Buzzsprout |
| `app/firma/alejandra-da-costa/firma-html.ts` | Teal `#14665C` (AA sobre `#FFF8EC`) |
| `scripts/qa-lighthouse-a11y.mjs` | Runner de auditoría |
| `tests/elementor-a11y-html.test.mjs` | Cobertura del pase a11y |

Copy visible aprobado: no se reescribió. Solo niveles de heading, `alt`, labels y color de texto/fondo en componentes de página.

## Fuera de alcance: cascarón

Fallos que solo se corrigen tocando header, footer, `app/layout.tsx` o CSS global. **No se tocaron.**

| Fallo | Dónde | Propuesta |
| --- | --- | --- |
| No hay «Saltar al contenido» | `app/layout.tsx` + `HeaderClient.tsx` | Enlace `.sr-only` al `#main` como primer foco; envolver el children del layout en `<main id="main">` |
| Widget de chat HighLevel (loader diferido) | `components/ChatWidget.tsx` montado desde el layout | El botón flotante de terceros suele fallar `button-name` / contraste; hay que parchearlo en el loader o sustituirlo. No auditable de forma estable sin interactuar |
| Contraste de tokens globales (`.playful-boton`, header/footer teal) | `app/globals.css`, `HeaderClient.tsx`, `Footer.tsx` | Subir el texto de CTAs teal a `#2A0064` en el tema base; no se tocó CSS global |
| `reCAPTCHA` iframe sin nombre propio | Tercero, formularios | El wrapper `role=group` mitiga; el iframe de Google sigue fuera de nuestro HTML |
| HTML vacío (`document-title`, `html-has-lang`) en URL de blog no publicada | `/blog/pautas-digitales/linkedin-ads-aumenta-el-alcance-de-tu-negocio` no está en el sitemap de prod | No es un fallo de layout: la URL no existe como página 200. Sustituida en la muestra por `storytelling-en-el-marketing-digital` |

En esta pasada de axe **no** aparecieron violaciones atribuibles a logo/nav/redes del header o footer.

## Checks locales

- `tsc --noEmit`: OK
- `next lint`: no hay `.eslintrc`; el comando pide configurar ESLint de forma interactiva (preexistente)
- `npm run test:canonical`: OK
- `npm run test:cta-click`: OK
- `npm run build`: OK (141 páginas)

## Pendiente al cerrar el sprint

1. Terminar Lighthouse prod (serie, mobile + desktop) y volcar scores en la tabla.
2. Cuando Vercel publique el preview, repetir axe + Lighthouse sobre ese host.
3. Actualizar medias antes/después y esta nota.
