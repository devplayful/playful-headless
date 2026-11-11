# H6 · Rollback (flag Preview y producción)

Objetivo: volver al comportamiento actual (WordPress / TSX) sin desplegar migraciones destructivas ni tocar Neon producción.

## 1. Flag opt-in Preview (`?cms=1`)

| Condición | Comportamiento |
|-----------|----------------|
| `VERCEL_ENV=preview` **y** query `cms=1` | Middleware reescribe a rutas `cms-*-preview` (ver `middleware.ts` ~203–270) |
| Preview **sin** `cms=1` | Misma pila que hoy: WP, TSX, redirects legacy |
| **Producción** con o sin `cms=1` | **Ignorado** — verificado en QA H6 (2026-11-05): `/`, `/nosotros`, `/politica-de-privacidad`, `/agencia-seo` devuelven el mismo HTML con y sin `cms=1` |

### Procedimiento rollback en Preview (manual)

1. Abrir la URL **sin** `cms=1` (o quitar el parámetro). Ejemplo:  
   `https://playful-headless-git-cursor-pay-cbb685-playful-agencys-projects.vercel.app/nosotros?qa=1`
2. Confirmar HTTP 200 y ausencia de cabeceras de rewrite Payload (contenido legacy).
3. Opcional: comparar con producción (`?qa=1` en ambos lados).

**Estado H6:** la prueba en Preview quedó **bloqueada** por Vercel Deployment Protection (respuesta HTML «Protected by Vercel Authentication», HTTP 200 tras redirect). Error exacto registrado en `docs/payload/h6-qa-134.json` → `previewAccess.error`.

**Desbloqueo para QA/rollback en Preview:**

```bash
export PREVIEW_BASE='https://playful-headless-git-cursor-pay-cbb685-playful-agencys-projects.vercel.app'
export VERCEL_AUTOMATION_BYPASS_SECRET='…'   # Automation Bypass del proyecto Vercel
node scripts/h6-qa-134-compare.mjs
```

Cabeceras (también válidas en curl):

- `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET`
- `x-vercel-set-bypass-cookie: true`

Alternativa: `vercel curl "$PREVIEW_BASE/nosotros?cms=1"` con CLI autenticada.

## 2. Flags de entorno (futuro cutover producción)

Con flags apagados, el sitio usa el camino legacy aunque exista Payload en Neon:

| Variable | Efecto si `false` / unset |
|----------|---------------------------|
| `CMS_HOME_FROM_PAYLOAD` | Home TSX/WP actual |
| `CMS_SERVICIOS_FROM_PAYLOAD` | Servicios WP / Shopify React |
| `CMS_CASOS_FROM_PAYLOAD` | Casos código + WP |
| `CMS_PAGINAS_B1_FROM_PAYLOAD` | Política TSX congelada |
| `CMS_PAGINAS_B4_FROM_PAYLOAD` | Contacto / reunión TSX |
| `CMS_PAGINAS_B5_FROM_PAYLOAD` | 404 App Router actual |
| `CMS_BLOB_IMAGES` | URLs `endpoint.*` legacy en HTML |

Rollback operativo en un deploy: **no definir** estas variables o ponerlas en `false` y redeploy.

### Imágenes Blob en producción (futuro cutover)

En producción, `isBlobImagesEnabled` solo devuelve `true` cuando `CMS_BLOB_IMAGES=true` (cadena exacta). Sin variable, `false` u otro valor → el HTML sigue apuntando a `endpoint.playfulagency.com` como hoy.

**Rollback de medios a endpoint:** quitar `CMS_BLOB_IMAGES` o ponerla en `false` / cualquier valor distinto de `true`, redeploy a producción y validar que las páginas de servicio vuelven a cargar uploads desde `endpoint.*` (salvo `pixel.gif` en `/wp-static` en preview).

En Preview de las ramas `cursor/payload-h2-imagenes-5a28` y `cursor/payload-h7-integracion`, Blob sigue activo **sin** depender de `CMS_BLOB_IMAGES`.

## 3. Lo que NO hacer en rollback

- **No** mergear PR #396 / H6 hasta QA preview completo.
- **No** ejecutar `cms/migrations/20261103_170000_wipe_preview_usuarios.ts` ni migraciones wipe en producción.
- **No** cambiar variables de entorno de **producción** en este hito.
- **No** “arreglar” diffs en Home, header, footer, layout o CSS global; solo documentar en QA.

## 4. Rollback de despliegue

Si un deploy Preview o futuro prod rompe el sitio:

1. En Vercel, **Promote to Production** el deployment anterior estable (playfulagency.com).
2. Mantener rama git anterior; revertir commits Payload si hace falta.
3. Payload Admin (`/admin`) puede seguir en Preview con DB Neon preview sin afectar el frontend legacy.

## 5. Evidencia H6 (parcial)

| Prueba | Resultado |
|--------|-----------|
| Prod ignora `?cms=1` | OK (4 rutas muestra, cuerpo idéntico) |
| Preview sin `?cms=1` vs prod | **Pendiente** (Deployment Protection) |
| Preview con `?cms=1` vs prod | **Pendiente** (134/134 `PREVIEW_BLOCKED` en CSV) |

Referencia cruzada: `docs/payload/h6-qa-134.md`, `docs/paridad-h4.md` (casos; mismo bloqueo Preview en oct 2026).
