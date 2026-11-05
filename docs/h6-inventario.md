# H6 — Inventario de páginas (contenido y origen)

Base: `cursor/cms-payload-fase1`. Ámbito: todo `app/**/page.tsx` y `app/**/route.ts` que devuelve documento (HTML, XML o texto plano) al navegador.

Leyenda **origen del contenido**:

| Valor | Significado |
|--------|-------------|
| **Código** | Copy y maquetación en TSX/TS del repo |
| **WordPress** | Cuerpo o listados vía `services/wordpress` / Elementor |
| **Payload (ya)** | Flag o colección Payload ya cableada (H3/H4/B1) |
| **Redirect** | Página mínima cuyo propósito es redirigir (cliente o middleware) |
| **Técnica** | Admin, API JSON, SEO/sitemap, preview interno, QA |

Leyenda **H6**: ¿entra en la migración de «páginas que viven en código»?

---

## Tabla exhaustiva

| Ruta (plantilla) | Archivo | Indexable | Formulario / script | Origen contenido | H6 |
|------------------|---------|-----------|---------------------|------------------|-----|
| `/` | `app/(frontend)/page.tsx` | Sí | No | Código (+ Yoast home vía WP en metadata) | **No** — Home PR #388 / `CMS_HOME_FROM_PAYLOAD` |
| `/[slug]` (p. ej. `/agencia-seo`, `/marketing-internacional`, `/seo-vigo`, …) | `app/(frontend)/[slug]/page.tsx` | Sí (por slug) | No | WordPress (Elementor HTML) | **No** — H3 Servicios / `CMS_SERVICIOS_FROM_PAYLOAD` |
| `/agencia-shopify` | `app/(frontend)/agencia-shopify/page.tsx` | Sí | No (CTAs enlace) | Código (+ casos/blog WP en secciones) | **No** — H3 (React en seed servicios) |
| `/blog` | `app/(frontend)/blog/page.tsx` | Sí | No | WordPress (listado posts) | **No** — blog WP |
| `/blog/q` | `app/(frontend)/blog/q/page.tsx` | Sí (query) | No | WordPress (misma vista listado) | **No** — blog WP |
| `/blog/[...slug]` | `app/(frontend)/blog/[...slug]/page.tsx` | Sí (por URL) | No | WordPress (post + categorías) | **No** — blog WP |
| `/casos-de-exito` | `app/(frontend)/casos-de-exito/page.tsx` | Sí | No | Código hub (+ cards WP) | **No** — H4 Casos |
| `/casos-de-exito/[slug]` | `app/(frontend)/casos-de-exito/[slug]/page.tsx` | Sí (3 slugs públicos) | No | Código SoyTechno + WP/Jumex/Odwalla | **No** — H4 / `CMS_CASOS_FROM_PAYLOAD` |
| `/contactar-agencia-de-marketing-digital` | `app/(frontend)/contactar-agencia-de-marketing-digital/page.tsx` | Sí | **Sí** — formulario + reCAPTCHA → `/api/contact` | Código (+ carrusel casos WP) | **Sí** — bloque 4 (contacto) |
| `/cms-pagina-b1-preview/[slug]` | `app/(frontend)/cms-pagina-b1-preview/[slug]/page.tsx` | N/A (rewrite Preview) | No | Payload (preview `?cms=1`) | **No** — infra H6 B1, no URL pública indexable |
| `/politica-de-privacidad` | `app/(frontend)/politica-de-privacidad/page.tsx` | Sí | No | Código (B1 en Payload con flag apagado) | **Sí** — bloque 1 (**migrado** en PR #389) |
| `/nosotros` | `app/(frontend)/nosotros/page.tsx` | Sí | No | Código (+ **equipo WP**; sin mover equipo en H6) | **Sí** — bloque 3 (copy TSX; equipo sigue WP) |
| `/links` | `app/(frontend)/links/page.tsx` (+ `links/layout.tsx`) | No (`noindex`) | No | Código | **Sí** — bloque 2 (sin tocar en paralelo a eShow staging) |
| `/reunion-playful` | `app/(frontend)/reunion-playful/page.tsx` | No (`noindex, follow`) | **Sí** — redirect cliente GHL | Redirect (+ metadata código) | **Sí** — bloque 4 (funnel) |
| `/gracias` | `app/(frontend)/gracias/page.tsx` | No | **Sí** — `BookAppointmentTracker` | Código (post-submit) | **No** — página técnica funnel |
| `/firma/alejandra-da-costa` | `app/(frontend)/firma/alejandra-da-costa/page.tsx` | No | No (copiar firma HTML) | Código | **No** — herramienta firma email |
| `/podcast` | `app/(frontend)/podcast/page.tsx` | No (hub noindex) | No | WordPress (episodios CPT) | **No** — podcast WP |
| `/podcast/[slug]` | `app/(frontend)/podcast/[slug]/page.tsx` | Sí (episodios publicados) | No | WordPress | **No** — podcast WP |
| `/test-blog` | `app/(frontend)/test-blog/page.tsx` | No | No | WordPress (slug fijo prueba) | **No** — QA interno |
| `/admin/[[...segments]]` | `app/(payload)/admin/[[...segments]]/page.tsx` | No | No | Payload Admin UI | **No** — CMS técnico |
| UI 404 App Router | `app/(frontend)/not-found.tsx` | N/A | Búsqueda cliente | Código | **Sí** — bloque 5 (plantilla 404) |
| UI 404 global | `app/global-not-found.tsx` | N/A | No | Código | **Sí** — bloque 5 (variante global) |
| `/robots.txt` | `app/robots.ts` | N/A | No | Técnica (generado) | **No** |
| `/sitemap.xml` | `app/sitemap.xml/route.ts` | N/A | No | Técnica (XML estático + blog) | **No** |
| `/manifest.webmanifest` | `app/manifest.ts` | N/A | No | Técnica | **No** |
| `/llms.txt` | `app/llms.txt/route.ts` | N/A | No | Técnica (texto) | **No** |
| `/llms-full.txt` | `app/llms-full.txt/route.ts` | N/A | No | Técnica (texto) | **No** |
| `/api/contact` | `app/api/contact/route.ts` | N/A | API POST | Técnica (backend) | **No** |
| `/api/blog-posts` | `app/api/blog-posts/route.ts` | N/A | API GET | Técnica | **No** |
| `/api/eshow-lista` | `app/api/eshow-lista/route.ts` | N/A | API | Técnica | **No** |
| `/cms-api/[...slug]` | `app/(payload)/cms-api/[...slug]/route.ts` | N/A | API Payload | Técnica | **No** |
| `/lp/*` | *(sin `page.tsx` en repo)* | — | — | WordPress histórico / redirects (`middleware`, mapas SEO) | **No** — no hay ruta App dedicada; no cuenta como fila de migración TSX |

**Nota `/lp/*`:** no existe carpeta `app/(frontend)/lp`. Landings tipo landing-page WP viven en `[slug]` o en redirects (`utils/unpublished-landing-redirect-map.json`, etc.).

---

## Totales (conteo de filas de la tabla)

| Concepto | Cantidad |
|----------|----------|
| **Filas totales** | **32** |
| **H6 = Sí** (candidatas a migrar origen código → Payload) | **7** |
| **H6 = No** | **25** |

Desglose **H6 = Sí** (bloques propuestos):

| Bloque | Rutas | Estado |
|--------|-------|--------|
| **1 — Legales** | `politica-de-privacidad` | Migrado PR #389 (`CMS_PAGINAS_B1_FROM_PAYLOAD`) |
| **2 — Bio** | `links` | Pendiente (no mezclar con eShow staging) |
| **3 — Nosotros** | `nosotros` | Pendiente; **equipo permanece en WordPress** |
| **4 — Contacto / funnel** | `contactar-agencia-de-marketing-digital`, `reunion-playful` | Pendiente |
| **5 — Errores** | `not-found`, `global-not-found` | Pendiente |

---

## Excluidos de H6 (referencia rápida)

- **Home** `/` — PR #388.
- **Servicios** `[slug]` + `/agencia-shopify` — H3.
- **Casos** `/casos-de-exito/*` — H4.
- **Blog y podcast** — WordPress.
- **Técnicas** — API, sitemap, robots, llms, admin Payload, preview B1, `gracias`, `test-blog`, `firma/*`.

---

## Orden sugerido de migración

1. Bloque 1 — legales (**hecho** en B1).  
2. Bloque 2 — `links` (cuando eShow staging esté cerrado).  
3. Bloque 3 — `nosotros` (solo copy TSX; equipo WP).  
4. Bloque 4 — contacto + reunión.  
5. Bloque 5 — plantillas 404.
