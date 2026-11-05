# Migración CMS: de WordPress a CMS propio en Vercel — Fase 1A

Fecha: 20 oct 2026 (Madrid). GO de José (20:52) y del CEO (20:53/20:54). Rama `cursor/migracion-cms-inventario`, base `main` @ `20b03b5`.
Alcance: solo documentación. No se ha tocado producción, WordPress, Vercel ni Neon.

Método: lectura en serie del REST público de `https://endpoint.playfulagency.com/wp-json`, 1 petición/s, UA `PlayfulQA/1.0`, recuentos con la cabecera `X-WP-Total`, el 20 oct entre las ~20:58 y 21:01 (Madrid). **[AUTH]** = necesita autenticación (respondió 401).

## 1. Resumen

| Recurso | Total | Uso en la web Next |
|---|---|---|
| Posts (`/wp/v2/posts`) | 135 | Blog completo |
| Páginas (`/wp/v2/pages`) | 31 | Landings Elementor vía `app/[slug]`, metadatos Yoast |
| Medios (`/wp/v2/media`) | 2.160 | Imágenes de posts, casos, equipo (servidas desde `/wp-content/uploads`) |
| Casos de éxito (CPT `casos-de-exito`) | 2 | `/casos-de-exito/*` con ACF |
| Podcast (CPT `podcast`) | 18 | `/podcast/*` |
| Equipo (CPT `equipo`) | 6 | `/nosotros` con ACF |
| Usuarios/autores | 13 | Autor del post |
| Categorías | 7 | Blog |
| Etiquetas | 21 | Sin uso detectado en el front |
| Comentarios | 0 | — |

## 2. Tipos de contenido (de `/wp/v2/types`)

- **Usados por la web:** `post`, `page`, `attachment`, `casos-de-exito`, `podcast`, `equipo`.
- **Taxonomías:** `category`, `post_tag` (posts); `categoria`, `etiqueta` (podcast); `cargo`, `rol` (equipo).
- **No usados por el front (no migrar o solo archivar):** `elementor_library` **[AUTH]**, `nav_menu_item`/`menu-items` **[AUTH]** (el menú está hardcodeado en `services/wordpress.ts` → `menuItems`), `wp_block` (0), `audioplayer` (2), `radioplayer`, `metform-entry` (0), plantillas FSE (`wp_template`, `wp_global_styles`, etc.). El sitemap de Yoast lista además `e-landing-page`, `header`, `footer`, `project`, `metform-form`, `project_category` (restos de Elementor/temas).
- **Namespaces relevantes:** `playful/v1` (`/contact`, `/contact-receipt`: formulario de contacto propio, ver `wordpress-contact-endpoint.php`, `wordpress-contact-gate.php`), `yoast/v1`, `redirection/v1`, `elementor/v1`, `metform/v1`, `mc4wp/v1`, `google-site-kit/v1`, `pys-facebook/v1`.

### Páginas (31 slugs)
miembros-de-equipo, seo-internacional, servicio-marketing-digital, services, pasarela-de-pago-ecommerce, pagos-online-ecommerce, marketing-digital-espana, nosotros, politica-de-privacidad, landing-seo, podcast, landing-page, privacy-policy, mercantil-servicios-financieros-internacional, casos-de-exito-agencia-de-marketing-digital, contactar-agencia-de-marketing-digital, policlinica-metropolitana, grupo-automotriz-multimarca, email-marketing, blog, gracias, home, seo-vigo, seo-expertos, agencia-ux-ui, agencia-sem, agencia-seo, agencia-e-commerce, marketing-internacional, agencia-diseno-web, home-2.

## 3. Campos Elementor y ACF

- **Elementor:** no se leen campos estructurados; la web consume `content.rendered` (HTML ya renderizado por Elementor) de las páginas y lo limpia/reescribe en `lib/elementor-html-optimize.ts`, `services/rewrite-in-site-hrefs.mjs` y estilos en `components/ElementorPageContent.module.css` (clases `.elementor-*`, reglas por id de página, p. ej. 85582). Los datos JSON de Elementor (`_elementor_data`) no son públicos **[AUTH]**.
- **ACF casos de éxito** (68 campos): h1, primerh2…tercerh2, primerap…novenap, decima, imagenbanner, imagendesarrollo, imagenminuta1–6, desafioimagen1–4, grilla1–8, categoria1–5, resultado1–3, resultadop1–3, resultadotitulo, resultadodescripcion, primerah3desarrollo, segundah3desarrollo, tercerh3desarrollo, primerapdesarrollo…tercerapdesarrollo, otroh2st, otropst, telefono1–4, telefonos, testimonio, testimonialnombre, testimonialcargo, testimonial_foto, mostrar_cta_final, template (`soytechno_extended`), soytechno (grupo con secciones A–F), challenge_logos, badge, badge_color, button_text, button_color. Normalizados en `utils/case-study-acf-fields.ts`.
- **ACF equipo:** imagen, nombre, cargo, habilidades (lista), descripcion.
- **ACF/meta posts:** `articulos_relacionados` (vacío hoy, `wordpress-related-posts.php`), `inline_featured_image`, `footnotes`.

## 4. Autores, categorías y etiquetas

- **Autores (13, públicos en `/wp/v2/users`):** aolivero, ale, arosillo, arturo, indira-ui-ux, dikcibell-playful, equipo-editorial, fpinto, lsantamaria, mafer, poseidon, stefanniparabavidez, wachique. Nota de seguridad: el listado de usuarios es público.
- **Categorías (7, con nº de posts):** pautas-digitales 45, seo 32, otros 27, tecnologia 20, mas-vistos 15, email-marketing 13, e-commerce 0.
- **Etiquetas:** 21 (sin uso en el front).

## 5. Metadatos Yoast

La web lee `yoast_head` (HTML) y `yoast_head_json`. Campos presentes en posts: title, description, robots, og_locale, og_type, og_title, og_description, og_url, og_site_name, article_published_time, article_modified_time, og_image, author, twitter_card, twitter_misc, schema. Canonical: se audita en `scripts/audit-blog-yoast-canonicals.mjs`. Consumo en `services/wordpress.ts` (getHomePageMetadata l.206, getPageMetadataBySlug l.284, getPodcastPageMetadata l.1364). `yoast/v1/get_head` es público. Aviso: Yoast tiene el endpoint completo en noindex en ajustes generales (detectado hoy en el post 86564).

## 6. Redirecciones

- **En el repo (Next):** `middleware.ts` (301/308) con mapas: `utils/blog-category-redirect-map.json` (17), `utils/blog-canibalizacion-redirect-map.json` (15), `utils/seo-service-redirect-map.json` (4), `utils/unpublished-landing-redirect-map.json` (3), más `utils/blog-legacy-listing-redirects`. `next.config.js` l.82 `redirects()` regenera en build los mapas de categorías y lastmod desde WP (`lib/blog-category-redirects.js`, `lib/blog-sitemap-lastmod.js`).
- **En WP:** plugin Redirection (`redirection/v1`) **[AUTH]**, no visible sin credenciales. Hay que exportarlo desde wp-admin antes de la fase 3.

## 7. Sitemaps

- **Web:** `app/sitemap.xml/route.ts` (lastmod de posts = `modified_gmt`, si falta `date_gmt`, desde #323). `app/robots.ts` bloquea `/wp-json/`.
- **Endpoint WP (Yoast):** `sitemap_index.xml` con 15 sub-sitemaps (post, page, e-landing-page, podcast, casos-de-exito, equipo, header, footer, project, metform-form, categoria, etiqueta, cargo, rol, project_category). `post-sitemap.xml` tiene hoy 18 URLs. Desaparecerán con el apagado de WP.

## 8. Puntos del código que consumen WP

Núcleo: `services/wordpress.ts` (`WORDPRESS_API_URL` l.77) con peticiones en l.209 (pages home-2 yoast), 287 (pages por slug yoast), 403 (pages contenido), 633/640 (posts + categoría), 676 (posts), 723 (media), 758 (users), 839 (categories), 885, 940, 1085, 1252, 1274 (posts), 1366 (pages podcast), 1413 y 1512 (podcast), 1426 (equipo), 1492 y 1526 (casos-de-exito). Reintentos/timeouts: `services/wordpress-request.mjs` (l.177, env `WORDPRESS_REQUEST_TIMEOUT_MS`, `WORDPRESS_MAX_ATTEMPTS`, `WORDPRESS_BUILD_RETRY_BUDGET`).

Otros accesos directos a WP:
- `lib/blog-category-redirects.js:4`, `lib/blog-sitemap-lastmod.js:4` (build, desde `next.config.js`).
- `lib/case-study-listing-image.ts:5` (casos-de-exito `_embed`).
- `lib/blog-related-posts.ts:38` (campos de post, ACF `articulos_relacionados`).
- Host de medios: `next.config.js:26` (remotePatterns), `lib/next-image-url.ts:1`, `lib/image-alt-overrides.ts:3`, `services/case-study-media-policy.mjs:1`, `services/rewrite-in-site-hrefs.mjs:14`.
- Formulario: `lib/contact/preview-guard.ts:25` → `playful/v1/contact`.

Importadores de `@/services/wordpress`: `app/layout.tsx:9`, `app/page.tsx:2,68`, `app/[slug]/page.tsx:3`, `app/blog/blog-listing-view.tsx:1`, `app/blog/[...slug]/page.tsx:1`, `app/nosotros/page.tsx:1`, `app/casos-de-exito/page.tsx:1`, `app/casos-de-exito/[slug]/page.tsx:2`, `app/agencia-shopify/page.tsx:14`, `app/contactar-agencia-de-marketing-digital/page.tsx:4`, `app/podcast/page.tsx:1`, `app/podcast/PodcastHubContent.tsx:4`, `app/podcast/[slug]/page.tsx:10`, `app/api/blog-posts/route.ts:2`, `app/test-blog/page.tsx:15`, `components/Header.tsx:1`, `components/MegaMenu.tsx:7`, `components/DynamicPage.tsx:1`, `components/blog/MostViewedArticles.tsx:6`, `components/soytechno/SoyTechnoSection{A..F}.tsx:2`, `lib/blog-local-posts.ts:1`, `utils/blog-url.ts:1`. Tipos: `types/wordpress.d.ts`.
Scripts de QA (no runtime): `scripts/audit-blog-yoast-canonicals.mjs`, `about-href-curl.mjs`, `service-booking-cta-curl.mjs`, `wp-fetch-meter.mjs`, `seo-closed-href-curl.mjs`, `seo-smoke.mjs`.
Restos a limpiar: `app/blog/[...slug]/page.tsx.new` y un archivo suelto en la raíz llamado `et --hard 64af882…` (parece un comando git mal tecleado).

## 9. Propuesta de stack

**Recomendación: Payload CMS v3 dentro del mismo Next, Postgres en Neon (Vercel) y Vercel Blob para medios.** No hay razón técnica de peso en contra, pero sí un **requisito previo**:

- El repo usa **Next 15.5.25 y React 18.3.1** (App Router). Payload v3 exige **React 19** (y Next 15 App Router, que ya cumplimos). Hay que subir a React/React DOM 19 en un PR aparte antes de instalar Payload (Fase 0), con QA visual completo. Riesgo medio: librerías cliente que no declaren soporte de React 19.
- Payload se monta en `app/(payload)/admin` y `app/(payload)/api` con su Local API: las páginas pueden leer en servidor sin HTTP, sustituyendo `services/wordpress.ts` por un adaptador con las mismas firmas (migración por funciones, no por páginas).
- **HTML de Elementor:** no se convierte a bloques en la primera fase. Las 31 páginas entran como campo `htmlLegacy` (HTML ya optimizado) + metadatos; se siguen sirviendo con `ElementorPageContent` y su CSS. Las landings se rehacen a bloques Payload (Lexical + bloques) de forma gradual. Posts: convertir HTML → Lexical con `@payloadcms/richtext-lexical` (conversor HTML) y guardar también el HTML original como respaldo.
- **Medios:** 2.160 archivos a Vercel Blob con `@payloadcms/storage-vercel-blob`; mantener mapa URL antigua → nueva y reescribir en contenido.
- **Alternativas descartadas:** Sanity/Contentful (coste por uso y datos fuera de nuestra infra), Keystatic/MDX (no sirve a editores no técnicos), mantener WP headless (es lo que queremos dejar).

### Colecciones propuestas
Posts, Páginas, Casos (con grupo `soytechno` y los campos ACF tipados), Podcast, Equipo, Autores, Categorías, Etiquetas, Medios, Redirecciones (para sustituir mapas JSON y plugin Redirection) y global `SEO`/`Navegación`. Campo SEO común (title, description, robots, canonical, OG, schema) importado de `yoast_head_json`.

### Riesgos
1. Upgrade a React 19 (Fase 0). 2. Tamaño del bundle/tiempos de build y cold starts al incluir el admin en la misma app. 3. Fidelidad del HTML de Elementor y del CSS asociado. 4. Pérdida de SEO si cambian URLs, canonicals o lastmod. 5. Redirecciones del plugin Redirection no visibles sin acceso. 6. Formulario `playful/v1/contact` y plugins de WP (MetForm, MC4WP, Pixel) a reubicar. 7. Conexiones a Postgres desde funciones serverless (usar pooler de Neon).

### Coste aproximado (mensual)
Neon: plan gratuito o Launch (~19 USD) según volumen; Vercel Blob: con ~2.160 medios (estimación 1–3 GB) unos pocos USD de almacenamiento + transferencia; Payload: open source, 0 USD. Total estimado: **0–40 USD/mes** sobre el plan Vercel actual, frente al hosting y plugins premium de WP (Elementor Pro, etc.). Cifras orientativas, sin verificar contra la factura actual.

### Plan por fases (sin caída)
- **Fase 0:** React 19 en PR propio, QA visual, sin cambios funcionales.
- **Fase 1:** esqueleto Payload en rama propia + colecciones + script de importación desde el REST de WP probado contra una copia (Neon branch de pruebas) y un preview de Vercel.
- **Fase 2 – contenido:** importación completa (posts, páginas, CPT, medios, autores, taxonomías, SEO). Doble lectura en preview: comparar HTML/metadatos WP vs Payload por URL (diff automático).
- **Fase 3 – URLs, SEO y redirecciones:** mismas rutas; canonicals, robots, OG y schema desde Payload; sitemap con `updatedAt`; exportar Redirection desde wp-admin e importarlo a la colección Redirecciones; middleware leyendo de ahí.
- **Fase 4 – cambio sin caída:** feature flag `CMS_SOURCE=wp|payload` en el adaptador; activar por tipo de contenido (casos → podcast → blog → páginas); congelar edición en WP durante la importación final delta (por `modified_gmt`); verificación en prod de status, canonicals y sitemap; WP queda en solo lectura 30 días como rollback, después se apaga y los medios `/wp-content/uploads` se redirigen a Blob.
