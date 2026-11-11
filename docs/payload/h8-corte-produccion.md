# H8 — Procedimiento de corte a producción (Payload + Neon)

**Decisión CEO:** en producción, Postgres en Neon usa una rama propia llamada `production` (plan **Free**), creada como **copia de la rama de preview** en el momento del corte, con el contenido ya migrado. A partir del corte, **solo se edita contenido en la rama `production`**; preview queda congelada para edición CMS.

**Alcance de este documento:** runbook operativo. No ejecutar merge, no crear recursos en Neon/Vercel desde este repo sin GO explícito.

---

## A) Variables de entorno en Vercel (entorno **Production**)

Nombres extraídos del código (`payload.config.ts`, `lib/cms-database.ts`, `lib/*-flag.ts`, `lib/blob-image-url.ts`, `middleware.ts`, `scripts/build-with-budget.mjs`). **No incluir valores reales** en tickets ni en chat; solo referencias por nombre en el dashboard.

### Base de datos (Payload / Postgres)

| Variable | ¿Obligatoria? | Uso |
|----------|---------------|-----|
| `DATABASE_URL` | **Sí** (si Payload debe conectar en prod) | Cadena pooled; runtime Payload y Next (`lib/cms-database.ts` → `getPayloadConnectionString`). Sin ella la web pública puede seguir en WordPress con flags CMS apagados, pero `/admin` y `/cms-api` no persisten. |
| `DATABASE_URL_UNPOOLED` | Recomendada | Conexión directa para migraciones cuando el build define `PAYLOAD_MIGRATING=true` (`scripts/build-with-budget.mjs`). |
| `POSTGRES_URL` | Opcional (alias) | Mismo rol que `DATABASE_URL` si Vercel/Neon inyecta este nombre. |
| `DATABASE_URI` | Opcional (alias) | Idem. |
| `POSTGRES_URL_NON_POOLING` | Opcional (alias) | Idem que `DATABASE_URL_UNPOOLED` en fase migrate. |

### Payload core

| Variable | ¿Obligatoria? | Uso |
|----------|---------------|-----|
| `PAYLOAD_SECRET` | **Sí** en producción | Firma de sesiones Payload (`payload.config.ts`). El fallback del repo es solo local. |
| `PAYLOAD_PUBLIC_SERVER_URL` | **Sí** en producción | URL pública del sitio (p. ej. apex de marketing) para enlaces del admin y API (`payload.config.ts` `serverURL`). |
| `PAYLOAD_DB_PUSH` | Opcional | `push` del adapter Postgres; en prod el default efectivo es **no push** salvo que se ponga explícitamente `true` (evitar en corte). |
| `PAYLOAD_MEDIA_DIR` | Opcional | Directorio estático de medios en disco (`cms/collections/Medios.ts`); en Vercel suele no usarse si hay Blob. |

> `PAYLOAD_MIGRATING` lo fija el script de build en Preview/Development; **no** hace falta crearla a mano en Production.

### Vercel Blob (medios Payload)

| Variable | ¿Obligatoria? | Uso |
|----------|---------------|-----|
| `BLOB_READ_WRITE_TOKEN` | Opcional | Activa `@payloadcms/storage-vercel-blob` en `payload.config.ts` (`enabled: Boolean(blobToken)`). Sin token, subida a colección `medios` vía Blob queda deshabilitada. |
| `BLOB_PUBLIC_BASE_URL` | Opcional | Prefijo público de URLs Blob en `lib/blob-image-url.ts` cuando las imágenes salen del mapa Blob. |

### Flags CMS — contenido público desde Payload

Todos son **opcionales**. Valor inicial en el corte: **`false`** (o ausentes; el código solo activa con `=== 'true'`). Con flags apagados, producción sigue el comportamiento actual (WordPress / JSX legacy).

| Variable | Uso principal |
|----------|----------------|
| `CMS_HOME_FROM_PAYLOAD` | Home (`lib/cms-home-flag.ts`, `app/(frontend)/page.tsx`). |
| `CMS_SERVICIOS_FROM_PAYLOAD` | Landings de servicio Payload (`lib/cms-servicios-flag.ts`). |
| `CMS_CASOS_FROM_PAYLOAD` | Hub y fichas de casos (`lib/cms-casos-flag.ts`). |
| `CMS_PAGINAS_B1_FROM_PAYLOAD` | Bloque 1 (legales, etc.) (`lib/cms-paginas-b1-flag.ts`). |
| `CMS_PAGINAS_B4_FROM_PAYLOAD` | Bloque 4 (contacto / reunión) (`lib/cms-paginas-b4-flag.ts`). |
| `CMS_PAGINAS_B5_FROM_PAYLOAD` | Bloque 5 (404 y páginas gobernadas) (`lib/cms-paginas-b5-flag.ts`). |
| `CMS_BLOB_IMAGES` | Sustitución endpoint→Blob en HTML/OG (`lib/blob-image-url.ts`). En **producción** solo con `true`; en preview además por rama Git listada en código. **Inicial: `false`.** |

**Preview-only (no duplicar en Production para el corte):** `?cms=1` en middleware requiere `VERCEL_ENV=preview` (`middleware.ts`); no sustituye los flags anteriores en producción.

### Variables que la web sigue necesitando con Payload (fuera del admin)

No son Payload, pero el sitio en prod con flags apagados aún las usa (WordPress, formularios, analytics). Documentar en el mismo checklist de corte si ya existen: p. ej. `WORDPRESS_API_URL`, `WORDPRESS_CONTACT_TOKEN`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `HIGHLEVEL_*`, etc. No forman parte del mínimo “Payload admin + DB”.

---

## B) Neon Free — rama `production` desde preview

**Lectura de documentación:** 2026-11-11.

| Tema | Dato (plan Free) | Fuente |
|------|------------------|--------|
| ¿Rama hija desde otra rama (p. ej. preview)? | **Sí.** Al crear rama se elige **Parent branch**; puede ser cualquier rama del proyecto, con “Current data” (copia COW). | [Manage branches](https://neon.tech/docs/manage/branches) (actualizado 2026-10-09 en doc) |
| Límite de ramas | **10 ramas/proyecto** (incluye la root). | [Neon plans](https://neon.tech/docs/introduction/plans) (actualizado 2026-11-04 en doc) |
| Ramas “extra” de pago | En Free **no** hay ramas extra de pago; límite duro 10/proyecto. | Misma fuente, sección *Extra branches* |
| Almacenamiento | **1 GB/proyecto** en Free; **20 GB total** en la cuenta Free. | [Neon plans](https://neon.tech/docs/introduction/plans) |
| Cómputo | **100 CU-hours/proyecto/mes**; autoscale hasta **2 CU**. Computes de **todas las ramas** cuentan hacia el mismo proyecto. | [Neon plans](https://neon.tech/docs/introduction/plans) |
| ¿La rama hija comparte límite? | **Sí a nivel de proyecto:** storage y CU-hours son del proyecto; las ramas hijas suman storage (delta COW, con tope al tamaño lógico de datos según doc) y cada rama tiene compute propio que consume CU-hours. | [Neon plans](https://neon.tech/docs/introduction/plans) (Storage + Compute) |

**No comprobado en consola Playful:** nombre exacto de la rama preview actual, tamaño en GB de la BD migrada, ni si el proyecto Free ya está cerca del límite de 10 ramas. Validar en Neon Console antes del corte.

**Operación recomendada:** en el mismo proyecto Neon, **New branch** → parent = rama preview migrada → nombre **`production`** → include **Current data** → obtener nuevas connection strings (pooled + direct) → actualizar solo **Production** en Vercel (`DATABASE_URL` / `DATABASE_URL_UNPOOLED`).

---

## C) Orden del corte (pasos, tiempos, responsables)

Tiempos orientativos en ventana de mantenimiento (no incluyen esperas de revisión humana entre días).

| Paso | Acción | Quién | Tiempo est. |
|------|--------|-------|-------------|
| **1** | En Neon: crear rama `production` desde la rama preview con datos migrados; anotar connection strings. **Congelar edición** en preview (comunicar a editores: no publicar en Payload preview; opcional: proteger rama o revocar acceso admin preview). | DevOps / quien administre Neon | 15–30 min |
| **2** | En Vercel → **Production**: crear/actualizar variables de la sección A; `DATABASE_*` apuntando a la rama `production`; todos los `CMS_*_FROM_PAYLOAD` y `CMS_BLOB_IMAGES` en **`false`**; `PAYLOAD_SECRET` y `PAYLOAD_PUBLIC_SERVER_URL` correctos; Blob token si se usa subida de medios. **No** tocar Preview en este paso salvo congelar DB. | DevOps | 20–40 min |
| **3** | **Merge a `main`** con GO explícito de José (PR H7 integración u equivalente). CI verde en la rama antes del merge. | José (GO) + Dev (merge) | 10 min + CI (~15–25 min) |
| **4** | Post-deploy producción: ejecutar checklist **134 URL** (`docs/payload/h6-qa-134.*`) y muestra de códigos (`docs/payload/h7-status-codes.md`): 308, 301 cruce, 410, blog/cms. Comparar con baseline CSV. | SEO / QA | 45–90 min |
| **5a** | **Si falla contenido/código:** Promote en Vercel del deployment anterior estable **o** rollback de merge según `docs/payload/h6-rollback.md`. | DevOps + José | 10–20 min |
| **5b** | **Si falla solo flags CMS:** apagar `CMS_*_FROM_PAYLOAD` y `CMS_BLOB_IMAGES`, redeploy Production (vuelta a WordPress/legacy sin tocar Neon). | DevOps | 10–15 min |

**Criterio de éxito del corte:** producción sirve el commit acordado, BD `production` es la única editable, flags CMS en `false` sin regresiones en las 134 URL y códigos acordados; admin Payload accesible solo si se validó login contra la nueva rama.

---

## Referencias internas

- QA 134: `docs/payload/h6-qa-134.md`
- Códigos HTTP locales: `docs/payload/h7-status-codes.md`
- Rollback: `docs/payload/h6-rollback.md`
- Tests flags/DB: `tests/cms-database.test.mjs`, `tests/cms-*-payload.test.mjs`
