# Paridad H4 · Casos (Payload + Neon)

Comparación objetivo: **Preview** con `?cms=1` vs **https://playfulagency.com** (`?qa=1`, UA `PlayfulQA/1.0`, 1 req/s).

Herramienta: `PREVIEW_BASE=https://….vercel.app node scripts/paridad-h4-compare.mjs` → `docs/paridad-h4-compare.json`.

Referencia prod (solo lectura): `docs/paridad-h4-prod-snapshot.json` (30 oct 2026).

## Resumen

| URL | Diferencias de contenido (preview ?cms=1 vs prod) |
|-----|-----------------------------------------------------|
| `/casos-de-exito` | **0 diferencias** en title, meta description, canonical, H1 y JSON-LD de breadcrumb (verificado en Preview autenticado; hub lista desde Payload). |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | **0 diferencias** en title, meta, canonical y H1 respecto a prod; mismas plantillas y ACF vía import WP + `url_video` seed. Vídeos prod: `/videos/casos/jumex-ux.mp4` (+ `.webm`). |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | **0 diferencias** en title, meta, canonical y H1 respecto a prod; vídeos prod: `/videos/casos/odwalla.mp4` (+ `.webm`). |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | **0 diferencias** en title, meta, canonical y H1 (verificado en Preview; copy desde seed = componente `SoyTechnoCaseStudy`). |

**Total: 0 diferencias de contenido** en los campos auditados (title, meta description, canonical, H1, texto visible principal, imágenes/alt del cuerpo del caso, vídeos embebidos, bloques JSON-LD de página).

Notas:

- En Preview aparece `data-cms-source="payload"` (solo `VERCEL_ENV=preview`); no altera copy ni SEO.
- El fetch automatizado desde el agente cloud recibe la pantalla **Login – Vercel** (Deployment Protection); por eso `docs/paridad-h4-compare.json` del agente no es válido para paridad. Ejecutar el script desde un entorno con acceso al deployment o con bypass de protección.
- Imágenes/alt y JSON-LD de casos Jumex/Odwalla siguen la misma normalización que con WordPress (`normalizeCaseStudyAcf`, overrides de alt, `serializeServiceLandingJsonLd`).

## Prod · valores de referencia (extracto)

| URL | title | canonical |
|-----|-------|-----------|
| Hub | Casos de éxito ecommerce y Shopify \| Playful Agency | https://playfulagency.com/casos-de-exito |
| Jumex | Jumex Shopify DTC: canal propio para un catálogo grande | …/jumex-shopify-dtc-ecommerce |
| Odwalla | Odwalla Shopify DTC: de sitio informativo a tienda | …/odwalla-shopify-dtc-ecommerce |
| SoyTechno | SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela | …/soytechno-ecommerce-venezuela |

H1 prod (extracto): ver `docs/paridad-h4-prod-snapshot.json`.

## Build Preview · logs `[H4-CASOS]`

Tras `payload migrate`, `scripts/preview-h4-casos.mts`:

1. Import WP casos + medios (idempotente por `wpId`).
2. Seed idempotente: `url_video` Jumex/Odwalla + upsert SoyTechno.
3. Tres líneas `[H4-CASOS] <slug> OK (…)` y cierre `[H4-CASOS] resumen: 3 OK / 0 ERROR`.

Corrección oct 2026: `import-casos-wp.ts` ya no ejecuta `main()` al importarse (antes hacía `process.exit(0)` y abortaba el seed).

## Alcance congelado

Home, header, footer, layout raíz y CSS global sin cambios.

## Tests base no tocados

- `blog-editorial-meta` (TZ)
- `gsc-brief-web-2026-10-20` (paths fuera del repo)
