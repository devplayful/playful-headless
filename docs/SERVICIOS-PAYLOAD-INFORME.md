# H3 · Servicios en Payload (parte 1 + Preview)

Rama `cursor/payload-servicios-10e7` · PR [#385](https://github.com/devplayful/playful-headless/pull/385) (base: `cursor/cms-payload-fase1`).

## Flag y Preview

| Mecanismo | Production | Preview |
|-----------|------------|---------|
| `CMS_SERVICIOS_FROM_PAYLOAD=true` | Solo si se define (no previsto) | Igual |
| `?cms=1` en la URL | Ignorado | Activa render Payload |
| Default | WP / React Shopify | Igual que prod |

## Build Preview (migrate + seed)

En `scripts/build-with-budget.mjs`, **antes** de `next build`:

1. **`payload migrate`** si `DATABASE_URL` y `VERCEL_ENV !== 'production'` (igual que H1).
2. **`cms:seed-servicios`** solo si `VERCEL_ENV=preview` y `DATABASE_URL` (nunca Production).

Logs esperados en el build de Vercel Preview:

```
payload migrate: ejecutando (Preview/Development, DATABASE_URL presente)
Migrating: 20261029_114031
cms:seed-servicios: ejecutando (Preview, DATABASE_URL presente)
cms:seed-servicios: 6 documento(s) en colección servicios
```

Migración: `cms/migrations/20261029_114031.ts` (`import type { MigrateUpArgs, MigrateDownArgs }` + `sql`).

## Comprobar recuento = 6 en Preview

Tras un deploy Preview READY:

```bash
curl -sS "https://<preview-host>/cms-api/servicios?limit=10&depth=0" | jq '.totalDocs, (.docs | length), [.docs[].slug]'
```

Debe devolver `totalDocs: 6` y los slugs `agencia-seo` … `agencia-shopify`.

Admin: `https://<preview-host>/admin` → colección **Servicios** (6 filas).

## Comparar render Payload vs producción

| Ruta | Prod (sin `?cms=1`) | Preview Payload |
|------|---------------------|-----------------|
| `/agencia-seo?cms=1` | — | Elementor desde Payload |
| `/agencia-sem?cms=1` | — | idem |
| `/agencia-diseno-web?cms=1` | — | idem |
| `/agencia-e-commerce?cms=1` | — | idem |
| `/agencia-ux-ui?cms=1` | — | idem |
| `/agencia-shopify?cms=1` | — | Bloques React desde Payload |

Referencia prod (flag off): mismas URLs **sin** query en `https://playfulagency.com/...`.

## Comprobaciones locales (box)

- `npm run typecheck` ✓
- `npm run test:route-integrity` ✓
- Migrate `20261029_114031` + seed → 6 servicios en Postgres local ✓

## Scripts

- `npm run cms:seed-servicios` — manual (Preview build lo invoca solo en `VERCEL_ENV=preview`).
- Lectura WP en seed: `scripts/servicios-wp-for-seed.mjs` (sin `next/cache`).
