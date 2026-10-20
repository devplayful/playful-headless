# CMS fase 1 · Informe de importación WordPress → Payload

Rama `cursor/cms-payload-fase1` (sale de `cursor/react19-fase0`, PR #327).
Prueba hecha en el box el 20 oct 2026 contra un Postgres 17 local
(`127.0.0.1:54329`, cluster propio en `/workspace/.pg-cms`). Nada en la nube.

Última pasada: 20 oct 2026, 23:02:27–23:02:42 (Madrid), 7 peticiones al REST
público de `endpoint.playfulagency.com`, en serie, 1 petición/s, user agent
`PlayfulQA/1.0`. El detalle en bruto está en `docs/importacion-resultado.json`.

## Recuentos

| Colección   | Leídos en WP | Importados | Fallidos |
|-------------|-------------:|-----------:|---------:|
| Posts       | 135 | 135 | 0 |
| Paginas     | 31  | 31  | 0 |
| Casos       | 2   | 2   | 0 |
| Autores     | 10  | 10  | 0 |
| Categorias  | 7   | 7   | 0 |
| Medios      | 180 | 180 | 0 |

- Idempotencia: la segunda pasada dio 0 creados y todo «actualizado»; en la
  base hay exactamente un registro por `wpId` en cada colección.
- Medios: solo los referenciados (imágenes destacadas de posts, páginas y
  casos + las 26 imágenes ACF de los casos). Se guarda URL de origen, alt,
  título, caption, mime, dimensiones y tamaños de WP; no se descargan binarios.
- Relacionados: 309 enlaces `articulos_relacionados` en 103 posts, todos
  resueltos a posts importados (0 sin resolver).
- Imágenes del cuerpo: 802, guardadas con su alt en `imagenesContenido`;
  311 tienen el alt vacío en WP (coincide con el mapa de SEO). 20 de los 180
  medios importados no tienen alt.
- Categoría principal (primer segmento de `/blog/<categoria>/<slug>`):
  coincide con `categoria_principal` del export de SEO en los 135 posts.

## Comprobaciones

- `npm run build` sin `DATABASE_URI`: pasa. `/admin` y `/cms-api` son
  dinámicas y solo tocan la base en petición.
- `next start` sin base de datos: `/`, `/blog` y el resto de la web dan 200;
  `/admin` y `/cms-api` dan 500 (esperado sin base).
- `next start` con la base local: `/admin` 200, `/cms-api/posts` 200.
- 404: con dos layouts raíz Next ya no tiene `app/layout.tsx`, así que se
  activa `experimental.globalNotFound` con `app/global-not-found.tsx`, que
  reutiliza tal cual el layout y el not-found públicos. `/ruta-x`,
  `/ruta/que/no/existe`, `/casos-de-exito/no-existe` y `/blog/no/existe/x`
  devuelven 404 con el mismo título y H1 que producción.
- `tsc --noEmit`, `test:route-integrity`, `test:cta-click`, `test:wordpress`:
  pasan. `test:canonical`: 2 fallos que ya fallan en la base (#327) en el box
  (`blog-editorial-meta` depende de la zona horaria, pasa con `TZ=UTC`;
  `gsc-brief…20` recorre ficheros fuera del repo).

## Estructura

- `payload.config.ts`, `cms/collections/*`, `cms/fields/common.ts`.
- Admin aislado en `app/(payload)/` (`/admin`, API REST en `/cms-api` para no
  chocar con `app/api`). La web pública pasa a `app/(frontend)/` con los
  mismos ficheros (solo `git mv`; se ajustan 3 imports relativos y las rutas en
  los tests). Ficheros de metadatos (`robots.ts`, `manifest.ts`, iconos,
  `sitemap.xml`, `llms*.txt`) y `app/api` se quedan en la raíz.
- Medios: disco local (`/media`, ignorado en git) o Vercel Blob si existe
  `BLOB_READ_WRITE_TOKEN`.
- Variables: `DATABASE_URI` (o `POSTGRES_URL`), `PAYLOAD_SECRET`,
  `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_PUBLIC_SERVER_URL`, opcional
  `PAYLOAD_DB_PUSH=true`.
- Scripts: `npm run cms:import` (`node scripts/import-wp.ts`),
  `npm run cms:importmap`, `npm run cms:types`.

## Campos no mapeados o con matices

- **Casos: el REST devuelve 67 campos ACF de primer nivel, no 68.** Se
  conservan los 67 con su nombre: 39 de texto, 26 imágenes (relación con
  Medios), `mostrar_cta_final` como grupo (5 subcampos) y `soytechno` como
  JSON (secciones A–F, con placeholders y sin imágenes en los dos casos).
  Falta identificar el 68.º (probablemente un campo vacío que ACF no expone
  por REST); hay que mirarlo en el grupo de campos de ACF.
- **Posts: `tags`** no se importan (no hay colección de etiquetas).
- **Cuerpo**: se guarda el HTML renderizado de WP (`contentHtml`); la
  conversión a Lexical queda para fase 2. Páginas Elementor: igual, solo HTML.
- **Yoast**: se guardan title, description, canonical, robots, og:image,
  og:title, og:description y el grafo `schema` tal cual. El canonical se
  reconstruirá desde el front (decisión de SEO).
- **Fechas**: `date` = `date_gmt` como instante UTC; `wpDate` = `date` de WP
  sin zona; `modifiedGmt` = `modified_gmt` (fuente del lastmod).
- **Autores**: salen del `_embed=author` de los posts, no de `/wp/v2/users`
  (para que el import no dependa de que la lista de usuarios sea pública).
- **Medios del cuerpo** (2.160 en la biblioteca): no se crean como Medios;
  solo `src` + `alt` dentro del post.

## Versiones

- Payload **3.75.0** fijado. Desde la 3.76 `@payloadcms/next` excluye Next
  15.5.x en su peer range (solo 15.4.x o ≥16.2); el repo está en 15.5.25.
  Subir de Payload exige pasar a Next 16.
- La CLI de Payload se ejecuta con `--disable-transpile` (Node 24 quita los
  tipos de forma nativa; el cargador tsx de Payload falla con este repo).

## Siguientes pasos

1. Localizar el campo ACF n.º 68 de Casos.
2. Fase 2: convertir `contentHtml` a Lexical y decidir qué hacer con Elementor.
3. Migraciones de Payload (`payload migrate:create`) en vez de `push` antes de
   cualquier base real; elegir Postgres gestionado (decisión de pago, no
   tomada) y `PAYLOAD_SECRET` real.
4. Leer el front desde Payload detrás de un flag, con los overrides de alt
   (`lib/image-alt-overrides.json`, `lib/blog-cover-alt-overrides.json`).
5. Usuarios del admin: crear el primero en `/admin` cuando haya base real.
6. Congelar WordPress al empezar la importación definitiva (lo avisa el CEO)
   y relanzar `cms:import`, que es idempotente.
