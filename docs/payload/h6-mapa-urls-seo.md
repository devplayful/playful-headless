# H6 · Mapa URL SEO (producción → Payload)

Referencia: rama `cursor/payload-h7-integracion` (PR #396). **La URL pública no cambia** cuando Preview usa `?cms=1`: el middleware hace *rewrite* interno y elimina el query de la barra de direcciones lógica (el usuario sigue viendo la URL de producción/canonical).

## Leyenda

| Columna | Significado |
|---------|-------------|
| **URL producción** | Lo que indexa Google hoy (`https://playfulagency.com…`) |
| **URL servida (Preview `?cms=1`)** | Ruta interna App Router tras rewrite; en prod futura sería la misma pública sin query |
| **Canonical objetivo** | Siempre apex producción salvo nota |
| **301/308** | Solo URLs legacy que ya redirigen hoy (no introducidas por Payload) |

## Bloque A · Misma URL pública; contenido desde Payload en Preview

| URL producción | Rewrite Preview (`?cms=1`) | Canonical | Notas |
|----------------|------------------------------|-----------|--------|
| `/` | `/cms-home-preview` | `https://playfulagency.com/` | Home **congelada** (PR #388); flag solo Preview |
| `/agencia-seo` | `/cms-servicio-preview/agencia-seo` | `/agencia-seo` | H3 Servicios |
| `/agencia-sem` | `/cms-servicio-preview/agencia-sem` | `/agencia-sem` | H3 |
| `/agencia-diseno-web` | `/cms-servicio-preview/agencia-diseno-web` | `/agencia-diseno-web` | H3 |
| `/agencia-e-commerce` | `/cms-servicio-preview/agencia-e-commerce` | `/agencia-e-commerce` | H3 |
| `/agencia-ux-ui` | `/cms-servicio-preview/agencia-ux-ui` | `/agencia-ux-ui` | H3 |
| `/agencia-shopify` | `/cms-servicio-preview/agencia-shopify` | `/agencia-shopify` | H3 (página dedicada + colección) |
| `/casos-de-exito` | `/cms-casos-preview/hub` | `/casos-de-exito` | H4 Casos |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | *(misma URL; header `x-cms-casos-preview`)* | path propio | H4 |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | *(idem)* | path propio | H4 |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | *(idem)* | path propio | H4 |
| `/politica-de-privacidad` | `/cms-pagina-b1-preview/politica-de-privacidad` | `/politica-de-privacidad` | B1 PR #389 |
| `/contactar-agencia-de-marketing-digital` | `/cms-pagina-b4-preview/contactar-agencia-de-marketing-digital` | path propio | B4 PR #392 |

Activación en producción futura (fuera de H6): variables `CMS_*_FROM_PAYLOAD=true` por bloque, no `?cms=1`.

**`/reunion-playful`:** **308** permanente a `/reunion` **antes** de cualquier rewrite `?cms=1` (sin canonical propia; no es rewrite B4).

## Bloque B · Sin Payload en Preview (`?cms=1` no cambia origen)

Incluye **todo el blog** (~100 URLs del sitemap), **podcast** (episodios indexables), **`/nosotros`**, **`/links`**, **`/seo-vigo`** (Elementor), funnel `/gracias`, `/firma/*`, landings de campaña Next (`/eshow`, `/reunion`, `/jose`, `/qa/filtro-reunion`), `/test-blog`.

| URL producción | Origen actual | Canonical / robots |
|----------------|---------------|-------------------|
| `/blog/…` | WordPress | URL del post |
| `/podcast/{slug}` | WordPress CPT | URL episodio |
| `/nosotros` | Código + equipo WP | `/nosotros` |
| `/seo-vigo` | WordPress Elementor | `/seo-vigo` |
| `/marketing-internacional`, `/seo-expertos` | WordPress Elementor | **301** → servicio (mapa cruce H7); no son landings 200 |
| `/eshow`, `/eshow/gracias` | App Router (merge main) | `noindex,follow` |
| `/reunion` | App Router calificación | `noindex,follow`; canonical a `/reunion` |
| `/jose` | App Router contacto | `noindex,nofollow` |

## Bloque C · 404 Payload solo en Preview (rutas desconocidas + `?cms=1`)

Cualquier path **no** listado en `isKnownPublicAppPath()` con `?cms=1` en Preview → rewrite a `/cms-pagina-b5-preview/not-found` (HTTP 404). **No** afecta producción ni URLs sin flag.

## Bloque D · Redirecciones 301/308 ya vigentes (mantener en cutover)

Ejemplos críticos (`middleware.ts`, mapas JSON):

| Origen | Destino | Código |
|--------|---------|--------|
| `/contacto`, `/contactanos` | `/contactar-agencia-de-marketing-digital` | 301 |
| `/casos`, `/casos-de-exito-agencia-de-marketing-digital` | `/casos-de-exito` | 301 |
| `/servicios`, `/services` | `/agencia-e-commerce` | 301 |
| `/landing-seo`, `/seo`, `/servicios/seo` | `/agencia-seo` | 301 |
| `/servicios/desarrollo-web` | `/agencia-diseno-web` | 301 |
| `/marketing-internacional` | `/agencia-e-commerce` | 301 (cruce H7) |
| `/seo-expertos` | `/agencia-seo` | 301 (cruce H7) |
| `/reunion-playful` | `/reunion` | **308** (antes de `?cms=1`) |
| 7 posts blog (mapa `seo-cruce-2810-redirect-map.json`) | Destinos acordados | 301 |
| Varias URLs blog (canibalización, categorías) | Post/canonical nuevo | 301/308 |
| Posts en `blog-closed-paths` | 410 Gone | 410 |

No crear nuevas redirecciones en H6 salvo auditoría SEO aparte.

## Bloque E · URLs que desaparecen / no indexables (sin 301 nuevo)

| URL / patrón | Estado | Acción SEO |
|--------------|--------|------------|
| `/agencia-prestashop`, `/agencia-woocommerce`, `/pasarela-de-pagos-venezuela`, `/shopify-precios` | En `SITEMAP_UNPUBLISHED_PATHS`; redirects en mapa unpublished | Ya fuera de sitemap; redirects existentes |
| `/podcast` (hub) | `noindex,follow` | Fuera de sitemap a propósito |
| `/links`, `/reunion-playful`, `/gracias`, `/firma/*`, `/test-blog`, `/eshow`, `/eshow/gracias`, `/reunion`, `/jose` | `noindex` o QA | Fuera de sitemap (salvo post indexable abajo) |
| `/admin`, `/cms-api/*`, `/cms-*-preview/*` | Técnicas / admin | `noindex`; disallow robots |
| Landings `/lp/*` históricas | Sin `page.tsx`; reglas middleware | Tratar caso a caso en mapas SEO existentes |

## Bloque F · Sitemap e eShow

| URL | En sitemap repo (`buildSitemapXml`) | Notas |
|-----|-------------------------------------|--------|
| `/blog/otros/eshow-madrid-2026` | **Sí** | Post indexable eShow Madrid (118 locs live en prod nov 2026) |
| `/eshow` (landing formulario) | No | `noindex,follow`; campaña, no canonical de producto |

En cutover, alinear lastmod/sitemap con lo publicado en Neon, no con staging del repo.

## Resumen cutover SEO

1. **Canonical siempre** `https://playfulagency.com{path}` para páginas indexables Payload (Yaast Payload B1/B4 y servicios/casos).
2. **No hay slugs nuevos** para el bloque migrado: Payload alimenta las mismas URLs.
3. **301/308 existentes** siguen en middleware; **308 `/reunion-playful`** precede al rewrite CMS.
4. **No indexar** rutas internas `cms-*-preview`.
