# Fase H2 · Imágenes WordPress → Vercel Blob (dry-run)

Rama de trabajo: `cursor/payload-h2-imagenes-5a28` (base `cursor/cms-payload-fase1`).

## Inventario

```bash
npm run cms:migrate-images
# equivalente: node scripts/migrate-images-to-blob.ts --dry-run
```

Salidas:

- `docs/blob-migration-inventory.json` — cada URL, tamaño, HTTP, clave Blob.
- `docs/blob-migration-map.json` — mapa viejo → URL pública Blob planificada.

REST WordPress: GET en serie, 1 petición/s, `User-Agent: PlayfulQA/1.0`.  
Sondeo de binarios: `HEAD` con la misma cadencia hacia `endpoint.playfulagency.com` / proxies `i0.wp.com`.

## Upload (cuando existan store y token)

```bash
export BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
export BLOB_PUBLIC_BASE_URL=https://<store-id>.public.blob.vercel-storage.com
npm run cms:migrate-images:upload
```

Idempotente: `addRandomSuffix: false`, clave `media/AAAA/MM/archivo`. Omite blobs ya presentes (`head`).

## Reescritura en Payload

Por defecto **desactivado** (`CMS_BLOB_IMAGES` vacío o distinto de `1`).

```bash
CMS_BLOB_IMAGES=1 DATABASE_URI=postgres://... npm run cms:seed-blob-urls
```

Persiste URLs del mapa en `contentHtml`, `imagenesContenido`, `yoast.ogImage`, ACF de casos y `medios.sourceUrl`.

Runtime (casos vía Payload): con `CMS_BLOB_IMAGES=1` y mapa presente, `lib/cms-casos.ts` reescribe URLs de medios al servir.

## Admin Payload

Montaje: `payload.config.ts` → `routes.admin: '/admin'`, vistas en `app/(payload)/admin/`.  
En preview con `DATABASE_URL` + `PAYLOAD_SECRET`: `/admin` responde 200 (ver informe fase 1).  
Colección de usuarios: `usuarios` (`cms/collections/Usuarios.ts`), auth email + contraseña.

Primer acceso sin tocar credenciales en chat:

1. **Primer usuario**: en Payload 3, el primer usuario creado en `/admin` suele ser admin (registro inicial en UI vacía).
2. **Seed local** (`cms:seed-casos`): solo en dev crea `CMS_ADMIN_EMAIL` / `CMS_ADMIN_PASSWORD` si no existe — no usar en producción.
3. **José con su contraseña**: invitarlo creando usuario solo con email y flujo «Forgot password» / verificación de email si está configurado SMTP en Payload, o reset one-time en entorno controlado; nadie debe ver ni commitear la contraseña.
