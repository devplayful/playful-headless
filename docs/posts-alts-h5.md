# Alts SEO fase H5 (posts Payload)

Rama `cursor/payload-alts-h5-0fa9`. Lista cerrada 29 oct 2026.

- **Criterio A:** `scripts/import-wp.ts` extrae el `alt` de cada `<img>` en
  `content.rendered` a `imagenesContenido` (y conserva el HTML en `contentHtml`).
  Las filas OK de `alts-aplicados.log` (23 oct), excl. 410, destacadas y fuera de
  lista, deben coinverger con `valor_nuevo` del CSV cuando WP ya las tiene.
- **Criterio B:** overrides idempotentes en import (4 fijos) y
  `npm run cms:seed-posts-alts-h5` (incluye comprobación HTTP del post 66684).
- **Tests:** `npm run test:payload-alts-h5`
- **Datos:** `cms/data/posts-content-alt-h5.ts`, `cms/lib/post-content-images.ts`
