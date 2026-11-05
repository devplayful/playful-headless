# H5 — Migración blog + legales + preview Payload

Rama: `cursor/payload-h5-migrate-d576` · Base: `cursor/cms-payload-fase1` (PR #333).

## Reutilización de PRs abiertos (no duplicados en diff)

| PR | Rama | Qué aporta a H5 |
|----|------|-----------------|
| #386 | `cursor/payload-alts-h5-0fa9` | **Cherry-pick completo** — alts SEO en import/seed, `[H5-ALT]`, `applyBlogPostContentAltH5` |
| #389 | `cursor/payload-paginas-b1-ab03` | **Cherry-pick B1** — `politica-de-privacidad` en `paginas-codigo`, flag `CMS_PAGINAS_B1_FROM_PAYLOAD`, preview `?cms=1` |
| #387 / #333 | casos / fase1 | Sin cambios H5 (casos siguen `CMS_CASOS_FROM_PAYLOAD`) |
| #390–#392, #391 | nosotros, contacto, 404 | **Fuera de este PR** — siguen en sus ramas H6 |
| #393 | imágenes Blob | No mergeado aquí |
| #396 | H7 integración | **No mergear** — referencia de flags `?cms=1` |

## Flags y activación

| Flag / señal | Efecto |
|--------------|--------|
| `CMS_BLOG_FROM_PAYLOAD=true` | Blog (listado + artículo) lee colección `posts` en Payload |
| `?cms=1` en **Preview** (`VERCEL_ENV=preview`) | Header `x-cms-blog-preview: 1` en `/blog` y `/blog/*`; mismo origen Payload |
| `CMS_PAGINAS_B1_FROM_PAYLOAD=true` o `?cms=1` en `/politica-de-privacidad` | Legal B1 desde Payload (PR #389) |

Producción y flag apagado: WordPress / JSX congelado (sin cambios en Home, header, footer, layout global).

## Contenido migrado (colecciones Payload)

| Tipo | Colección | Conteo objetivo | Seed / import |
|------|-----------|----------------:|---------------|
| **Posts blog** | `posts` | **135** publicados | `npm run cms:import` (idempotente) + preview build `preview-h5-wp-import.ts` si &lt; 130 |
| **Páginas legales (código)** | `paginas-codigo` bloque B1 | **1** (`politica-de-privacidad`) | `cms:seed-paginas-b1` en build Preview |
| **Páginas sueltas WP** | `paginas` | **31** en import WP (incl. `privacy-policy` EN) | `cms:import`; render bajo flag solo slug público `privacy-policy` vía `lib/cms-blog.ts` |
| Categorías / autores / medios | varias | 7 / 10 / ~180 | `cms:import` |

Orden del blog: campo `date` (UTC desde `date_gmt` de WP), sort `-date` en Payload — no `updatedAt`.

## Paridad (checklist)

- Título, cuerpo (`contentHtml`), extracto, slug, categoría principal
- Yoast: title, description, canonical, og:*
- Fecha publicación: `date` + `wpDate` + `modifiedGmt`
- Imagen destacada + alt (medios + overrides H5 en cuerpo)
- Alts H5: criterio PR #386 (`imagenesContenido` + overrides)

**Posibles diferencias frente a producción**

- Canonical reconstruido en front (decisión SEO fase 1); Payload guarda canonical Yoast pero el front puede preferir `canonicalForPath(blogPostPath(post))`.
- Páginas Elementor en `paginas`: solo HTML importado; sin conversión Lexical.
- `privacy-policy` (EN): en Payload vía import; la URL pública principal de legal es `/politica-de-privacidad` (código B1), no Elementor EN.
- Posts locales de staging (`lib/blog-local-posts`) se siguen uniendo tras Payload.

## Scripts

- `npm run cms:import` — import WP completo
- `npm run cms:seed-posts-alts-h5` / build Preview — alts H5
- `npm run cms:seed-paginas-b1` — legal B1
- `npm run test:cms-blog-payload` / `test:payload-alts-h5`

## Pendiente / bloqueado

- **Nosotros, contacto, reunión, 404, links**: PRs H6 (#390–#392, #391, bloque 2) — no incluidos en H5.
- **Servicios / Home / Casos**: H3, #388, H4 — fuera de alcance.
- **Blob imágenes (#393)**: no integrado; URLs siguen endpoint/WP en HTML importado.
- **Import en build Preview**: si Neon vacío, el build intenta `cms:import` (hasta ~4 min); si falla por tiempo, ejecutar import manual en Preview.
- **Campo ACF 68 casos**: sin cambio (fase 1).

## URLs de prueba (Preview con `?cms=1`)

- `/blog?cms=1`
- `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce?cms=1`
- `/politica-de-privacidad?cms=1` → rewrite preview B1

Atributo opcional en Preview: `data-cms-source="payload"` (blog / B1).
