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
| `/reunion-playful` | `/cms-pagina-b4-preview/reunion-playful` | `/reunion-playful` | B4; `noindex,follow` |

Activación en producción futura (fuera de H6): variables `CMS_*_FROM_PAYLOAD=true` por bloque, no `?cms=1`.

## Bloque B · Sin Payload en Preview (`?cms=1` no cambia origen)

Incluye **todo el blog** (~100 URLs del sitemap), **podcast** (episodios indexables), **`/nosotros`** (copy TSX + equipo WP; PR #390 sin rewrite en middleware), **`/links`**, landings WP vía `[slug]` no incluidas en H3 (`/marketing-internacional`, `/seo-expertos`, `/seo-vigo`), funnel `/gracias`, `/firma/*`, `/test-blog`.

| URL producción | Origen actual | Canonical |
|----------------|---------------|-----------|
| `/blog/…` | WordPress | URL del post |
| `/podcast/{slug}` | WordPress CPT | URL episodio |
| `/nosotros` | Código + equipo WP | `/nosotros` |
| `/marketing-internacional`, `/seo-expertos`, `/seo-vigo` | WordPress Elementor | path propio |

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
| Varias URLs blog (canibalización, categorías) | Post/canonical nuevo | 301/308 |
| Posts en `blog-closed-paths` | 410 Gone | 410 |

No crear nuevas redirecciones en H6 salvo auditoría SEO aparte.

## Bloque E · URLs que desaparecen / no indexables (sin 301 nuevo)

| URL / patrón | Estado | Acción SEO |
|--------------|--------|------------|
| `/agencia-prestashop`, `/agencia-woocommerce`, `/pasarela-de-pagos-venezuela`, `/shopify-precios` | En `SITEMAP_UNPUBLISHED_PATHS`; redirects en mapa unpublished | Ya fuera de sitemap; redirects existentes |
| `/podcast` (hub) | `noindex,follow` | Fuera de sitemap a propósito |
| `/links`, `/reunion-playful`, `/gracias`, `/firma/*`, `/test-blog` | `noindex` o QA | Fuera de sitemap |
| `/admin`, `/cms-api/*`, `/cms-*-preview/*` | Técnicas / admin | `noindex`; disallow robots |
| Landings `/lp/*` históricas | Sin `page.tsx`; reglas middleware | Tratar caso a caso en mapas SEO existentes |

## Bloque F · Staging solo en código (divergencia sitemap)

| URL | En sitemap repo (`buildSitemapXml`) | En sitemap producción (nov 2026) |
|-----|-------------------------------------|----------------------------------|
| `/blog/otros/eshow-madrid-2026` | Sí | No (118 locs live) |

En cutover, alinear lastmod/sitemap con lo publicado en Neon, no con staging del repo.

## Resumen cutover SEO

1. **Canonical siempre** `https://playfulagency.com{path}` para páginas indexables Payload (ya sembrado en Yoast Payload B1/B4 y servicios/casos).
2. **No hay slugs nuevos** para el bloque migrado: Payload alimenta las mismas URLs.
3. **301 existentes** siguen en middleware antes del rewrite CMS.
4. **No indexar** rutas internas `cms-*-preview`.
