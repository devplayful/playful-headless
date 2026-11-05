# Paridad H4 · Casos (Payload + Neon)

Comparación objetivo: **Preview** con `?cms=1` vs **https://playfulagency.com** (`?qa=1`, UA `PlayfulQA/1.0`).

Herramienta del usuario: `cmp.py` (texto visible, alt/src de imágenes, vídeos, canonical, JSON-LD, title, meta). Referencia adjunta oct 2026: `diff-h4-1100.txt`.

Script repo (requiere preview sin pantalla Vercel Login): `PREVIEW_BASE=https://….vercel.app node scripts/paridad-h4-compare.mjs` → `docs/paridad-h4-compare.json`.

## Medición (agente cloud, oct 2026)

El agente **no** puede ejecutar `cmp.py` ni el script de paridad contra Preview protegida (Deployment Protection → HTML de login). Los cambios de código abajo responden al diff real que pasó el usuario (`diff-h4-1100.txt`).

| URL | Diff usuario (preview `dpl_Fr36HcKK` / SHA anterior) | Corrección en código |
|-----|------------------------------------------------------|----------------------|
| `/casos-de-exito` | Orden tarjetas; SoyTechno «El» vs «el», categoría; Odwalla con excerpt largo vs «Descripción no disponible» | `mergePublicCaseStudies`: listing público de SoyTechno aunque exista en Payload; `sortHubCaseStudies`; excerpt vacío en listing Payload |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | Orden/cruce «El»/«el» al inyectar copy del seed | Misma UI que prod: `SoyTechnoCaseStudy` sin `copy` desde Payload |
| Jumex / Odwalla detalle | Tapa `endpoint…/Tapa-…` vs `/casos/Tapa-…`; alt testimonio «Ellipse 12» vs « Federico Vera» | `finalizePayloadSuccessStory` (cover + medios allowlist); override alt en `image-alt-overrides.json` |

**Paridad 0 diferencias en `cmp.py`:** pendiente de re-medición en Preview tras el deploy siguiente; debe ejecutarla quien tenga acceso al deployment (o bypass).

## Build Preview · logs `[H4-CASOS]`

Tras `payload migrate`, `scripts/preview-h4-casos.mts`:

1. Import WP casos + medios (idempotente por `wpId`).
2. Seed idempotente: `url_video` Jumex/Odwalla + upsert SoyTechno.
3. Tres líneas `[H4-CASOS] <slug> OK (…)` y cierre `[H4-CASOS] resumen: 3 OK / 0 ERROR`.

## Alcance congelado

Home, header, footer, layout raíz y CSS global sin cambios. Sin Blob. Commits Preview con `[preview]`.

## Tests base no tocados

- `blog-editorial-meta` (TZ)
- `gsc-brief-web-2026-10-20` (paths fuera del repo)
