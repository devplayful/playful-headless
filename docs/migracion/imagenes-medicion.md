# Medición de imágenes WordPress → Vercel Blob

Fecha de recolección REST: 2026-10-28T15:06:38.159Z
Fecha de medición HEAD: en curso
Origen: `https://endpoint.playfulagency.com`
User-Agent: `PlayfulQA/1.0`
Ritmo: 1 petición/s en serie (REST + HEAD).
Rama de medición: `cursor/payload-imagenes-medicion` (sale de `cursor/cms-payload-fase1`).

## Alcance

CPT que consume el front (código en `services/wordpress.ts`): **posts, pages, casos-de-exito, podcast, equipo**.
Tipos registrados en WP: post, page, attachment, nav_menu_item, wp_block, wp_template, wp_template_part, wp_global_styles, wp_navigation, wp_font_family, wp_font_face, elementor_library, podcast, casos-de-exito, equipo, metform-entry, audioplayer, radioplayer.
No se inventariaron CPT que el front no llama (`audioplayer`, `radioplayer`, `elementor_library`, etc.).

Fuentes por URL (columna `origen`, puede haber varias):

- `media_original` / `media_size`: biblioteca REST `/wp/v2/media` (per_page=100).
- `featured`: `featured_media` de posts, páginas, casos-de-exito, podcast y equipo.
- `acf:<cpt>`: cualquier URL en campos ACF (incluye tamaños anidados).
- `content:<cpt>`: `src`, `srcset` y `background-image` (y `url()` de wp-content) en `content.rendered`.
- `og:<cpt>`: `yoast_head_json.og_image`.
- `repo`: literales `endpoint.playfulagency.com/wp-content/`, `${WP_HOST}/wp-content/` y claves `WP:` de `lib/image-alt-overrides.json`.

`usado_en=front` = aparece en featured, ACF, content, og o repo. `solo_libreria` = solo en la media library.

El `X-WP-Total` de `/wp/v2/media` es **2160**, pero el REST público solo entrega **2073** adjuntos (páginas 1–3 y 21–22 salen cortas; repetido con `orderby=id`). Los 87 que faltan no se exponen sin autenticación (privados, rotos o filtrados por WP). No se han adivinado IDs.

El import de Payload (#333) contó **802** `<img src>` en el cuerpo. Aquí el cuerpo suma **2081** URLs únicas porque también se leen `srcset` y `background-image` (y hay solapes entre posts/páginas).

## Recuentos de origen

| Fuente | Ítems WP | Notas |
| --- | ---: | --- |
| Media library | 2073 | header X-WP-Total=2160 (87 no públicos) |
| Posts | 135 | |
| Páginas | 31 | |
| casos-de-exito | 2 | |
| podcast | 18 | |
| equipo | 6 | |
| URLs extraídas del cuerpo (con duplicados entre documentos) | 3025 | únicas del cuerpo: 2081 |
| URLs en el repo | 145 | |

## Totales (después de deduplicar por URL)

| Escenario | Archivos | Con tamaño | Sin tamaño | GB | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| (i) Usado en el front | 2459 | 1550 | 909 | 0.143 | 153344888 |
| (ii) Librería completa (originales + intermedios) | 10774 | 7198 | 3576 | 0.503 | 539977804 |
| (iii) Solo originales | 2052 | 1219 | 833 | 0.334 | 358346517 |
| Intermedios (tamaños WP) | 8722 | 5979 | 2743 | 0.169 | 181631287 |
| Universo único (librería + front + repo) | 10968 | 7198 | 3770 | 0.503 | 539977804 |

Tamaños: HEAD `Content-Length` preferente; si falta, GET `Range: bytes=0-0` y `Content-Range`.
Si HEAD/GET no dieron bytes, se usa `media_details.filesize` del REST (marcado `wp_filesize` en el raw).
Medidos por HEAD/GET-range: 0. Solo REST filesize: 7198.

### (i) Usado en el front por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 235 | 0.031 GB | 33.369.738 B |
| png | 1845 | 0.075 GB | 80.891.940 B |
| webp | 74 | 0.001 GB | 1.159.478 B |
| gif | 8 | 0.035 GB | 37.923.732 B |
| svg | 140 | 0.000 GB | 0 B |
| pdf | 1 | 0.000 GB | 0 B |
| css | 26 | 0.000 GB | 0 B |
| js | 12 | 0.000 GB | 0 B |
| font | 5 | 0.000 GB | 0 B |
| otro | 113 | 0.000 GB | 0 B |

### (ii) Librería completa por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 1565 | 0.092 GB | 98.302.403 B |
| png | 7805 | 0.215 GB | 230.721.496 B |
| webp | 914 | 0.018 GB | 18.929.278 B |
| gif | 57 | 0.036 GB | 38.922.352 B |
| svg | 421 | 0.000 GB | 0 B |
| pdf | 3 | 0.007 GB | 7.530.429 B |
| video | 4 | 0.083 GB | 89.158.752 B |
| otro | 5 | 0.053 GB | 56.413.094 B |

### (iii) Originales por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 239 | 0.062 GB | 67.020.018 B |
| png | 1241 | 0.088 GB | 94.546.156 B |
| webp | 134 | 0.005 GB | 5.754.336 B |
| gif | 9 | 0.035 GB | 37.923.732 B |
| svg | 417 | 0.000 GB | 0 B |
| pdf | 3 | 0.007 GB | 7.530.429 B |
| video | 4 | 0.083 GB | 89.158.752 B |
| otro | 5 | 0.053 GB | 56.413.094 B |

## 404 / no encontrados

Ninguno con status 404/410 en esta pasada.

## Coste Vercel Blob

Fuente leída el **28 oct 2026, 16:05–16:10 hora de Madrid (CET, UTC+1)** (hora de Madrid):

- [Vercel Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Pricing on Vercel](https://vercel.com/docs/pricing)
- [vercel.com/pricing](https://vercel.com/pricing) (tabla pública Hobby / Pro)
- [Regional pricing](https://vercel.com/docs/pricing/regional-pricing)

Tarifas oficiales (USD, sin impuestos), ejemplo de la doc (iad1) y tabla pública:

| Recurso | Precio (doc / ejemplo iad1) | Rango regional | Incluido Hobby | Incluido Pro |
| --- | --- | --- | --- | --- |
| Blob Storage Size | 0,023 USD / GB-mes | 0,023–0,041 USD / GB | 1 GB/mes | Usage-based (crédito mensual; on-demand después) |
| Blob Simple Operations | 0,40 USD / 1M | 0,35–0,56 USD / 1M | primeros 10.000 | Usage-based |
| Blob Advanced Operations | 5,00 USD / 1M | 4,50–7,00 USD / 1M | primeros 2.000 | Usage-based |
| Blob Data Transfer | 0,05 USD / GB (iad1) | 0,05–0,117 USD / GB | primeros 10 GB | Incluido en Flat Rate CDN (1 TB/mes de equipo) |

Hobby: al superar el cupo se **bloquea** Blob (no se factura extra). Pro: se cobra con el crédito mensual y luego on-demand. En Hobby el cupo se comparte con el resto de servicios del proyecto.

Plan del proyecto **playful-headless**: vive en el team de Vercel `playfuls-projects` (`team_WneR3BWaDf7kGBmCMUHb6I5z`, id de proyecto `prj_pLpYIo0J8pjz66nVSgl8yzjYFuow`), con dominio de producción `playfulagency.com`. Un team de Vercel no es Hobby (Hobby es cuenta personal). Se trata como **Pro**. Se informan ambos planes por si el store se creara en otra cuenta.

### Hipótesis de coste

- Almacenamiento mensual = GB del escenario × 0,023 USD (precio de la tabla pública / ejemplo oficial).
- Subida puntual: 1 Advanced Operation por archivo (put simple, sin multipart).  N × 5 / 1.000.000 USD.
- No hay tráfico GA4 en este box. Transferencia: se da el coste **por cada 10 GB** a 0,05 USD/GB = **0,50 USD / 10 GB** (Hobby: los primeros 10 GB/mes van incluidos; Pro: entra en Flat Rate CDN).
- Simple operations de lectura (cache MISS) no se estiman: dependen del HIT ratio.

| Escenario | GB | Hobby almacenamiento / mes | Pro almacenamiento / mes | Hobby ¿cabe? | Escritura puntual (N × 5e-6 USD) | Transfer / 10 GB |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| (i) Front | 0.143 | 0 USD (dentro del 1 GB) | 0.0033 USD | sí (≤ 1 GB) | 0.0123 USD | 0,50 USD |
| (iii) Originales | 0.334 | 0 USD (dentro del 1 GB) | 0.0077 USD | sí (≤ 1 GB) | 0.0103 USD | 0,50 USD |

Hobby almacenamiento: 0 USD si GB ≤ 1; si no, el cupo no basta (acceso bloqueado; no hay overage). En la tabla se muestra también el equivalente on-demand (0,023 USD/GB) por si se subiera a Pro.

En la librería hay un `u856009520.20240223003251.tar.gz` de **53,5 MB** y un `.sql.gz` de 0,3 MB (backups, no se sirven en el front). Si se copian «todos los originales» a Blob, esos 54 MB entran en el escenario (iii). No hace falta para la web.

Los totales de esta versión **aún mezclan `filesize` del REST** (7.198 URLs) con 3.770 pendientes de HEAD (sobre todo SVG y derivados sin `filesize`). El HEAD en serie (prioridad: front y originales sin bytes) está corriendo; se actualizará este informe al terminar.

## Método

1. REST público, `per_page=100`, UA `PlayfulQA/1.0`, 1 req/s.
2. Deduplicado por URL normalizada (https, host canónico, sin hash).
3. HEAD en serie (prioridad: front+original, resto front, resto originales, intermedios).
4. Nada se subió a Vercel Blob. WordPress no se modificó.

Script: `scripts/medir-imagenes-wp.mjs`. Inventario: `docs/migracion/imagenes-inventario.csv`.
