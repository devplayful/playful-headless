# H3 · Servicios en Payload (parte 1)

Rama `cursor/payload-servicios-10e7` (base: `cursor/cms-payload-fase1`, PR #333).

## Resumen

- Colección **`servicios`** en Payload con bloques reutilizables: hero, texto, ventajas, tarjetas, banda morada, logos/casos, FAQ, CTA, cuerpo Elementor (WP), separador CIMA y módulos extra (testimonios, blog).
- **`CMS_SERVICIOS_FROM_PAYLOAD=false`** por defecto (`.env.example`): producción sin cambios.
- Flag **`true`**: `/[slug]` (5 landings WP) y `/agencia-shopify` leen Payload si hay `DATABASE_URL` y documento; si no, fallback al comportamiento actual.
- Seed **`npm run cms:seed-servicios`**: 5 páginas vía `getPageBySlug` + Yoast; Shopify desde `copy.ts` (mismas URLs de imagen, sin Blob).

## Flag

| Variable | Default | Efecto |
|----------|---------|--------|
| `CMS_SERVICIOS_FROM_PAYLOAD` | `false` | WP + página React Shopify (actual) |
| `CMS_SERVICIOS_FROM_PAYLOAD=true` | — | Payload cuando hay BD y seed |

## Admin local

Tras `DATABASE_URI=… npm run cms:seed-servicios` → **6** documentos en `servicios` (comprobado en Preview/Neon al desplegar; en este box no había Postgres/Docker).

## Comprobaciones (este box)

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | OK |
| `npm run build` | OK |
| `npm run test:route-integrity` | OK (100 tests) |

## Comparativa prod vs local (flag ON, sin BD)

Con `CMS_SERVICIOS_FROM_PAYLOAD=true` y **sin** `DATABASE_URL`, Payload no conecta → fallback idéntico a prod.

Script `scripts/compare-servicios-prod-local.mjs`: **0 diferencias** en title, meta description, canonical, H1 y recuento H2 en las 6 URLs.

Capturas (viewport **390×844** y **1440×900**, producción):

- `/opt/cursor/artifacts/screenshots/servicios-prod-<slug>-390.png`
- `/opt/cursor/artifacts/screenshots/servicios-prod-<slug>-1440.png`

Capturas locales (mismo fallback, prefijo `servicios-local-flag-on-fallback-*`).

### Diferencias visuales / HTML esperadas con flag ON **y** seed en Preview

| Área | WP (bloque Elementor) | Shopify (bloques React) |
|------|------------------------|-------------------------|
| Cuerpo | Mismo HTML procesado que `getPageBySlug` | Misma plantilla que `agencia-shopify/page.tsx`; bloque FAQ en Payload no se pinta aparte (solo Elementor en WP incluye FAQ en HTML) |
| Meta | Yoast en Payload + overrides `page-seo-overrides` | Yoast en seed = `SHOPIFY_META` |
| Imágenes | URLs WP / `/images` sin Blob | Igual que código |

No se ejecutó render Payload real en local (sin Postgres). En Preview, tras `cms:migrate` + `cms:seed-servicios`, conviene repetir capturas con flag ON.

## Pendiente / no hecho aquí

1. **Migración Postgres** `payload migrate:create` para tablas `servicios` (en Preview suele usarse `PAYLOAD_DB_PUSH` o nueva migración tras merge).
2. **Seed en Neon** y recuento admin = 6 en Preview (requiere BD).
3. **Subida a Blob** de medios (otro hito, GO de gasto).
4. Descomposición fina de Elementor en bloques editables (H3 parte 2); hoy el cuerpo WP va en un bloque `elementor` + bloque `faq` espejo para JSON-LD/ CMS.

## Archivos clave

- `cms/collections/Servicios.ts`, `cms/blocks/servicio-blocks.ts`
- `lib/cms-servicios-flag.ts`, `lib/cms-servicios.ts`
- `components/servicios/*`
- `scripts/seed-servicios.ts`
