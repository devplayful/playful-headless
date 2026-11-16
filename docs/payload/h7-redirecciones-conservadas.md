# H7 · Redirecciones y respuestas SEO conservadas (rama `cursor/payload-h7-integracion`)

Este documento lista reglas que **no deben perderse** al integrar Payload. Objetivo: un solo salto (301/308/410), sin cadenas ni bucles. Cada fila cita el implementador en esta rama (` línea`).

## Cruce 28 oct (PR #383) — 22×301

Mapa: `utils/seo-cruce-2810-redirect-map.json` (22 entradas). Se fusiona al final de `PERMANENT_301` en `middleware.ts` líneas 10, 73–108; el resolver emite un único **301** en líneas 306–317.

Orígenes destacados (mismo destino que prod):

| Origen | Destino |
|--------|---------|
| `/pagos-online-ecommerce` | `/blog/tecnologia/cashea-para-comercios` |
| `/seo-expertos` | `/agencia-seo` |
| `/marketing-internacional` | `/agencia-e-commerce` |

Tests: `tests/seo-cruce-2810-freeze.test.mjs` («SEO cruce 22 new 301s…»).

## Cruce 28 oct — 2×410 exactos

`/landing-page` y `/test-blog` en `utils/blog-closed-paths.ts` líneas 48–53; decisión en `blogClosedDecision` líneas 105–110; middleware líneas 284–288.

## `/reunion-playful` → `/reunion` (308)

Middleware líneas 301–303 (único **308** de la app en middleware; ver test freeze). La página `app/(frontend)/reunion-playful/page.tsx` conserva el módulo legado pero **sin** `alternates.canonical` propia (H7).

## Barra final → un solo 301

`next.config.js` línea 14 (`skipTrailingSlashRedirect: true`) + normalización y `hadTrailingSlash` en `middleware.ts` líneas 111–112, 307–316.

## Host apex / www y HTTP→HTTPS (308)

Redirecciones de dominio **www→apex** y **http→https** las aplica la capa **Vercel** del proyecto (`playfulagency.com`); no hay matcher adicional en `middleware.ts` de la rama (el middleware solo usa `APEX_HOSTS` para destinos absolutos en líneas 115–147).

## Query `?amp` / `noamp` → 301

`utils/amp-junk-query.ts` (`stripAmpJunkParams`, `blogSeoRedirectDecision` líneas 67–101); encadenado en `resolveSingleHopRedirect` (`middleware.ts` líneas 164–168).

## `/blog/page/N` → `/blog?page=N` (y categorías legacy)

`utils/blog-legacy-listing-redirects.ts` líneas 46–62; invocado desde `resolveSingleHopRedirect` (`middleware.ts` línea 156).

## `/blog/<categoría>` (índice) → `/blog?category=`

`utils/amp-junk-query.ts` `blogCategoryIndexSlug` + `blogSeoRedirectDecision` (líneas 78–86); mismo resolver middleware.

## PR #73 y mapas legacy 301

- Servicios antiguos: `utils/seo-service-redirect-map.json` (spread en `PERMANENT_301`, `middleware.ts` ~103).
- Landings no publicadas: `utils/unpublished-landing-redirect-map.json`.
- Canibalización 15 orígenes: `utils/blog-canibalizacion-redirect-map.json` + `mergeCanibalizacionIntoPermanent301` (`utils/blog-canibalizacion-redirects.ts`).

Los dos posts que en prod ya son **301** del cruce (`consejos-para-que-hagas-pautas…`, `tipos-de-publicidad-online…`) **no** están en `CANIBALIZACION_DEFERRED_PATHS` (H7).

## 410 de URLs huérfanas (José Excel v2 + GSC)

31 rutas blog cerradas + 3 GSC (`/project/*`, `/agencylog`) en `utils/blog-closed-paths.ts` (`CLOSED_BLOG_PATHS`, `GSC_GONE_PATHS`); mismas líneas 105–110.

## Sitemap y filtro de orígenes del cruce

- Estáticos incluyen `/seo-vigo`: `utils/apex-sitemap.ts` `SITEMAP_STATIC_PATHS`.
- Orígenes del mapa 2810 excluidos del sitemap: import líneas 4–7, filtro en `getSitemapPaths` (~209–212).
- Entrega HTTP: `app/sitemap.xml/route.ts` líneas 1–11 → `buildSitemapXml()` línea 246.

### Extra: `/blog/otros/eshow-madrid-2026`

Producción lo publica en sitemap; la rama lo mantiene vía `listStagingSitemapBlogEntries()` en `buildSitemapXml` (mismo criterio que prod). El bloque F del 5 nov que lo excluía queda **obsoleto** frente a prod.

## `robots.txt`

`app/robots.ts` líneas 12–25: `disallow` de REST WP, `sitemap: https://playfulagency.com/sitemap.xml`.

## Mayúsculas en path

Next.js App Router: rutas con distinto casing no coinciden con segmentos generados → respuesta **404** (sin redirect). Comportamiento de plataforma; inventario en `config/expected-routes.json`.

---

Verificación automática: `npm run test:canonical` (incluye `tests/seo-cruce-2810-freeze.test.mjs`) y `npm run test:route-integrity`.
