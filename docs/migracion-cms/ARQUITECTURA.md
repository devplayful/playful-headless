# Arquitectura CMS post-WordPress (staging / sprint oct 2026)

## Decisión recomendada

**Payload CMS v3 embebido en el mismo repo Next.js**, con **Postgres (Neon, marketplace Vercel)** para edición y **snapshot JSON en git** (`content/migrated/`) para previews con `CMS_SOURCE=new` sin depender de la base en cada build.

| Opción | Dónde vive | Pros | Contras | Coste orientativo |
| --- | --- | --- | --- | --- |
| **Payload + Neon + Blob** (recomendada) | Repo + Vercel + Neon | Mismo despliegue, Local API, tipos, admin `/admin`, integración marketplace | React 19 ya aplicado; cold starts + pooler | Neon Launch ~19 USD/mes; Blob 1–3 GB ~2–8 USD; Payload OSS 0 USD |
| MDX/JSON solo en git (Keystatic, contentlayer) | Repo | Cero DB, previews baratos, diffs en PR | Editores no técnicos dependen de GitHub; 31 páginas Elementor + 68 campos ACF poco prácticos | 0 USD infra extra |
| Sanity / Contentful | SaaS | UI madura | Datos fuera de EU/Vercel, coste por asiento y API | 99–500+ USD/mes típico |
| Mantener WP headless | endpoint actual | Cero migración | Objetivo del sprint es salir; deuda Elementor/Yoast | Hosting WP actual |

**Por qué Payload + snapshot git:** el inventario (PR #329) muestra 135 posts, 31 páginas Elementor, CPT casos/podcast/equipo y 2.160 medios. Payload cubre ACF tipado y SEO; el **export** (`npm run cms:export`) alimenta `CMS_SOURCE=new` en preview de Vercel sin tocar producción ni DNS.

## Capa de datos

```
CMS_SOURCE=wp   → services/wordpress.ts (REST endpoint.playfulagency.com) — default producción
CMS_SOURCE=new  → content/migrated/*.json vía services/cms-export/* — solo preview/staging
```

Producción **no** define `CMS_SOURCE` (equivale a `wp`). El admin Payload (`/admin`) y `npm run cms:import` son opcionales para la fase 2 con Neon.

## Flujo de contenido

1. **Export** (serie, 1 req/s, UA `PlayfulQA/1.0`): `scripts/export-wp.mjs` → `content/migrated/`.
2. **Paridad**: `scripts/cms-parity-report.mjs` → `docs/migracion-cms/PARIDAD.md`.
3. **Runtime**: adaptadores en `services/cms-export/` devuelven el mismo shape `WPPost` / casos que WordPress.
4. **Import Payload** (rama con DB): `npm run cms:import` (idempotente por `wpId`).

## SEO, redirects y sitemaps

- Redirects: sin cambios; siguen en `middleware.ts` y mapas JSON (no dependen de `CMS_SOURCE` en esta fase).
- Sitemap: `app/sitemap.xml/route.ts` sigue leyendo WP en producción; en preview con `new`, las rutas de blog/casos usan snapshot — el artefacto `config/blog-sitemap-lastmod.json` se regenera en build desde WP y se commitea si CI detecta drift.

## Fuera de alcance del sprint (requieren GO de José)

- Merge a `main`, DNS, apagar WordPress, export Redirection plugin, formulario `playful/v1/contact`, migración de podcast/equipo/páginas Elementor completas.

## Referencias

- Inventario detallado: [INVENTARIO.md](./INVENTARIO.md)
- Paridad: [PARIDAD.md](./PARIDAD.md)
- Rama de trabajo: `cursor/migracion-cms-staging-86a2` (continúa `cursor/cms-payload-fase1` + inventario #329)
