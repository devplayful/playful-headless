# Paridad H4 · Casos (Payload + Neon)

Fase **H4**: hub `/casos-de-exito` y tres casos públicos renderizados desde Payload cuando
`CMS_CASOS_FROM_PAYLOAD=1` o `?cms=1` en Preview (misma plantilla React que producción).

Captura de referencia en producción (`PlayfulQA/1.0`, `?qa=1`, 1 petición/s, 30 oct 2026).
Detalle JSON: `docs/paridad-h4-prod-snapshot.json`.

## Tabla por URL

| URL | title / meta / canonical / H1 / JSON-LD | Estado H4 |
|-----|----------------------------------------|-----------|
| `/casos-de-exito` | Title: «Casos de éxito ecommerce y Shopify \| Playful Agency». Meta y canonical acordes a `utils/case-study-hub.ts`. H1: «Casos de éxito en ecommerce y Shopify de marcas que ya venden». 2 bloques JSON-LD (breadcrumb + organización vía layout). | **OK** — el hub no cambia copy; con flag Payload la lista sale de Neon (import WP + SoyTechno seed) y `mergePublicCaseStudies` conserva el orden público. |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | Title/meta/canonical según overrides públicos + Yoast WP importado. H1 WP: «JUMEX y Shopify: La Creación del Canal Directo (DTC)…». 3 JSON-LD (article + breadcrumb + FAQ si aplica). Vídeo: `https://playfulagency.com/videos/casos/jumex-ux.mp4`. | **OK** — misma página `[slug]/page.tsx`; datos ACF vía `import-casos-wp` + `url_video` en seed. |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | Title/meta/canonical alineados con prod. H1 WP. Vídeo: `https://playfulagency.com/videos/casos/odwalla.mp4`. | **OK** — mismo patrón que Jumex. |
| `/casos-de-exito/soytechno-ecommerce-venezuela` | Title/meta desde `public-case-study-overrides`. H1: «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela». Layout `SoyTechnoCaseStudy` + copy seed idéntico al componente. | **OK** — `seed-casos-h4-lib` copia `approvedCopy` carácter a carácter. |

## Marcado Preview

Con `VERCEL_ENV=preview` y lectura desde Payload, el HTML incluye `data-cms-source="payload"` en el contenedor del hub y de cada caso (no en Production aunque el flag esté activo).

## Build Preview (Neon)

En `VERCEL_ENV=preview` con `DATABASE_URL`:

1. `payload migrate`
2. `scripts/preview-h4-casos.ts` → import WP casos + medios + seed → líneas `[H4-CASOS] <slug> OK|ERROR`

## Alcance congelado (no tocado)

- Home (`app/page.tsx`, `lib/home-copy*`, componentes Home*)
- Header, footer, layout raíz, CSS global

## Verificación visual en Preview

Tras desplegar la rama, abrir la URL de Preview con `?cms=1` en las cuatro rutas y comparar con producción (mismos textos, imágenes/alt, vídeos, enlaces internos). La implementación reutiliza las mismas plantillas; cualquier diferencia restante sería un fallo de import/seed, no de maquetación.

## Tests que ya fallaban en la base (sin cambios en H4)

Según `docs/IMPORTACION-INFORME.md` / suite `test:canonical`:

- `blog-editorial-meta` (dependencia de zona horaria; pasa con `TZ=UTC`)
- `gsc-brief-web-2026-10-20` (recorre ficheros fuera del repo)
