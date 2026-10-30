# H6 — Inventario de páginas con contenido en código

Base: `cursor/cms-payload-fase1`. Ámbito: rutas bajo `app/(frontend)/` cuyo **cuerpo visible** está maquetado en React/TSX (no HTML Elementor de WordPress ni lectura Payload ya migrada).

Metodología: revisión de `app/**/page.tsx`, `config/expected-routes.json`, consumo de `services/wordpress` y mapa de sitemap (`utils/apex-sitemap.ts`).

## Resumen

| Ámbito | Cantidad |
|--------|----------|
| Páginas candidatas H6 (inventario principal) | **14** |
| Excluidas (Home, H3, H4, técnicas, layout) | **9 plantillas / grupos** |
| Slugs servicio WP vía `[slug]` (H3, no código) | **8** |
| Landings no publicadas (sin `page.tsx`, solo redirect) | **4** |
| **Total referencias en plan H6** | **14 + 8 + 4 = 26** (≈22 centradas en migración de rutas con page propio) |

---

## Excluidas (no entran en bloques H6)

| Ruta / grupo | Archivo | Motivo |
|--------------|---------|--------|
| `/` | `app/(frontend)/page.tsx` | Home — PR #388 / `CMS_HOME_FROM_PAYLOAD` |
| `/agencia-seo`, `/agencia-sem`, `/agencia-diseno-web`, `/agencia-e-commerce`, `/agencia-ux-ui`, `/marketing-internacional`, `/seo-expertos`, `/seo-vigo` | `app/(frontend)/[slug]/page.tsx` | Servicios H3 — Elementor/WP o `CMS_SERVICIOS_FROM_PAYLOAD` |
| `/agencia-shopify` | `app/(frontend)/agencia-shopify/page.tsx` | Servicios H3 (React, incluida en seed servicios) |
| `/casos-de-exito`, `/casos-de-exito/[slug]` | `app/(frontend)/casos-de-exito/**` | Casos H4 — `CMS_CASOS_FROM_PAYLOAD` |
| `/blog`, `/blog/q`, `/blog/[...slug]` | `app/(frontend)/blog/**` | Posts y listados desde WordPress |
| `/podcast`, `/podcast/[slug]` | `app/(frontend)/podcast/**` | CPT podcast en WordPress |
| `/api/*`, `/cms-api/*`, `/admin/*` | varios | Rutas técnicas / Payload admin |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest`, iconos | `app/robots.ts`, etc. | SEO / assets técnicos |
| `/firma/*` | `app/(frontend)/firma/**` | Firma de email (herramienta interna) |
| `/gracias` | `app/(frontend)/gracias/page.tsx` | Post-submit técnico (noindex; tracker reserva) |
| `/test-blog` | `app/(frontend)/test-blog/page.tsx` | QA interno (noindex) |
| Layout raíz, header, footer, CSS global | `layout.tsx`, `components/Header*`, `Footer.tsx`, `globals.css` | Fuera de alcance H6 |

---

## Inventario principal (contenido en código)

| Ruta | Archivo | Indexable | Formulario / script |
|------|---------|-----------|---------------------|
| `/politica-de-privacidad` | `app/(frontend)/politica-de-privacidad/page.tsx` | Sí (`sitemap`, canonical) | No |
| `/links` | `app/(frontend)/links/page.tsx` + `links/layout.tsx` | No (`robots: noindex`) | No |
| `/nosotros` | `app/(frontend)/nosotros/page.tsx` | Sí | No (equipo vía WP API; cuerpo en TSX) |
| `/contactar-agencia-de-marketing-digital` | `app/(frontend)/contactar-agencia-de-marketing-digital/page.tsx` | Sí | **Sí** — formulario + reCAPTCHA → `/api/contact` |
| `/reunion-playful` | `app/(frontend)/reunion-playful/page.tsx` | No (`noindex, follow`) | **Sí** — redirect cliente a widget reserva (GHL) |
| `/not-found` (UI 404) | `app/(frontend)/not-found.tsx` | N/A | No (formulario búsqueda cliente) |
| `global-not-found` | `app/global-not-found.tsx` | N/A | No |

**Nota:** `/reunion-playful` y `/gracias` son funnel post-conversión; se migran en bloques posteriores solo si se congela copy en Payload (scripts de reserva siguen en cliente).

### Landings solo en redirect (sin `page.tsx` propio)

| Ruta | Indexable | Notas |
|------|-----------|-------|
| `/agencia-prestashop` | No (410/redirect) | `SITEMAP_UNPUBLISHED_PATHS` |
| `/agencia-woocommerce` | No | idem |
| `/pasarela-de-pagos-venezuela` | No | idem |
| `/shopify-precios` | No | idem |

---

## Bloques propuestos para H6 (3–6 páginas)

### Bloque 1 — Legales (más simple) **← PR `cursor/payload-paginas-b1`**

| Slug | Flag |
|------|------|
| `politica-de-privacidad` | `CMS_PAGINAS_B1_FROM_PAYLOAD` |

### Bloque 2 — Bio / enlaces

| Slug |
|------|
| `links` |

### Bloque 3 — Sobre nosotros / equipo

| Slug | Notas |
|------|-------|
| `nosotros` | Híbrido: copy en TSX + miembros WP (decidir si equipo queda fuera del doc Payload en H6) |

### Bloque 4 — Contacto y funnel

| Slug | Notas |
|------|-------|
| `contactar-agencia-de-marketing-digital` | Formulario + carrusel casos WP |
| `reunion-playful` | Redirect script |
| `gracias` | Opcional; página técnica |

### Bloque 5 — Utilidades / errores

| Slug |
|------|
| `not-found` (plantilla 404) |

---

## Orden sugerido

1. Bloque 1 (legales) — una página, sin formularios, copy estable.  
2. Bloque 2 (`links`).  
3. Bloque 3 (`nosotros`).  
4. Bloque 4 (contacto + funnel).  
5. Bloque 5 (404).

Servicios (H3), casos (H4) y Home siguen en sus flags/PRs; blog y podcast permanecen en WordPress hasta fases posteriores.
