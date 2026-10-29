# Medición de imágenes WordPress → Vercel Blob

Fecha de recolección REST: 2026-10-28T15:06:38.159Z (16:06 Madrid).
Fecha de medición HEAD: 2026-10-28T17:51:06.737Z (18:51 Madrid).
Origen: `https://endpoint.playfulagency.com`
User-Agent: `PlayfulQA/1.0`
Ritmo: 1 petición/s en serie (REST + HEAD).
Rama: `cursor/payload-imagenes-medicion` (sale de `cursor/cms-payload-fase1`). PR draft: no merge.

## Alcance

CPT que consume el front (`services/wordpress.ts`): **posts, pages, casos-de-exito, podcast, equipo**.
Tipos en WP: post, page, attachment, nav_menu_item, wp_block, wp_template, wp_template_part, wp_global_styles, wp_navigation, wp_font_family, wp_font_face, elementor_library, podcast, casos-de-exito, equipo, metform-entry, audioplayer, radioplayer.
No se inventariaron CPT que el front no llama (`audioplayer`, `radioplayer`, `elementor_library`, etc.).

Fuentes por URL (columna `origen`, puede haber varias):

- `media_original` / `media_size`: biblioteca REST `/wp/v2/media` (`per_page=100`).
- `featured`: `featured_media` de posts, páginas, casos-de-exito, podcast y equipo.
- `acf:<cpt>`: URLs reales en campos ACF (no textos).
- `content:<cpt>`: `src`, `srcset` y `background-image` en `content.rendered`.
- `og:<cpt>`: `yoast_head_json.og_image`.
- `repo`: literales `endpoint.playfulagency.com/wp-content/`, `${WP_HOST}/wp-content/` y claves `WP:` de `lib/image-alt-overrides.json`.

`usado_en=front` = featured, ACF, content, og o repo. `solo_libreria` = solo media library.

`X-WP-Total` = **2160**; el REST público entrega **2073** (páginas 1–3 y 21–22 cortas; igual con `orderby=id`). 87 adjuntos no se exponen sin autenticación.

El import de Payload (#333) contó **802** `<img src>` en el cuerpo. Aquí hay **2081** URLs únicas del cuerpo porque también se leen `srcset` y `background-image`.

## Recuentos de origen

| Fuente | Ítems WP | Notas |
| --- | ---: | --- |
| Media library | 2073 | header X-WP-Total=2160 (87 no públicos) |
| Posts | 135 | |
| Páginas | 31 | |
| casos-de-exito | 2 | |
| podcast | 18 | |
| equipo | 6 | |
| URLs del cuerpo (con duplicados entre documentos) | 3025 | únicas: 2081 |
| URLs en el repo | 145 | |

## Totales (deduplicados por URL)

| Escenario | Archivos | Con tamaño | Sin tamaño | GB | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| (i) Usado en el front | 2339 | 2329 | 10 | 0.143 | 153313102 |
| (ii) Librería completa (originales + intermedios) | 10774 | 10656 | 118 | 0.565 | 606134618 |
| (iii) Solo originales | 2052 | 2037 | 15 | 0.331 | 355359991 |
| Intermedios (tamaños WP) | 8722 | 8619 | 103 | 0.234 | 250774627 |
| Universo único (librería + front + repo) | 10848 | 10720 | 128 | 0.567 | 608282898 |

Tamaños: HEAD `Content-Length` preferente; si falta, GET `Range: bytes=0-0` y `Content-Range`. Si tampoco, `media_details.filesize` del REST.
Medidos por HEAD/GET-range: **4851**. Solo REST filesize: **5869**.
Front con HEAD: 2119/2339. Originales con HEAD: 1462/2052.

HEAD vs `filesize` REST (1304 URLs con ambos): mediana HEAD/WP = 1,004; media 0,97.

El HEAD se cortó a las 17:51 UTC tras ~5100 peticiones: un `fetch` sin timeout se colgó. El script ahora lleva timeout de 15 s. Lo que falta es casi todo intermedios de librería no usados en el front.

### (i) Usado en el front por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 235 | 0.017 | 18.040.406 |
| png | 1839 | 0.087 | 93.123.818 |
| webp | 74 | 0.002 | 2.120.606 |
| gif | 8 | 0.035 | 37.923.775 |
| svg | 140 | 0.001 | 1.419.317 |
| pdf | 1 | 0.000 | 0 |
| css | 25 | 0.000 | 68.106 |
| js | 12 | 0.000 | 147.177 |
| font | 5 | 0.000 | 469.897 |

### (ii) Librería completa por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 1565 | 0.093 | 99.995.166 |
| png | 7805 | 0.272 | 292.082.000 |
| webp | 914 | 0.018 | 18.929.278 |
| gif | 57 | 0.036 | 39.043.429 |
| svg | 421 | 0.003 | 2.981.797 |
| pdf | 3 | 0.007 | 7.530.429 |
| video | 4 | 0.083 | 89.158.752 |
| otro | 5 | 0.053 | 56.413.767 |

### (iii) Originales por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
| jpg | 239 | 0.052 | 55.756.870 |
| png | 1241 | 0.093 | 99.744.263 |
| webp | 134 | 0.005 | 5.754.336 |
| gif | 9 | 0.035 | 38.019.777 |
| svg | 417 | 0.003 | 2.981.797 |
| pdf | 3 | 0.007 | 7.530.429 |
| video | 4 | 0.083 | 89.158.752 |
| otro | 5 | 0.053 | 56.413.767 |

`otro` de (ii)/(iii) incluye un `tar.gz` de **53,5 MB** y un `.sql.gz` de 0,3 MB (backups Hostinger, no se sirven en el front). Sin ellos, (iii) ≈ **0,278 GB**.

## 404

**129** URLs `/wp-content/` dieron 404 (todas en el CSV, `status=404`). Familias:

| Familia | n | Notas |
| --- | ---: | --- |
| `Auditoria-SEO_P1`…`P5` (2020/06) + tamaños | 40 | fichero ausente en disco |
| `IG_*` Instagram (2021/06) + tamaños | 32 | Perfiles, Nombre, Imagen, Biografia |
| `1366_2000.jpeg` + tamaños | 11 | |
| `pexels-ylanite-koppens-1152661` + tamaños | 11 | |
| Thumbs Elementor (`elementor/thumbs/`) | 16 | tamaños custom listados y no en disco |
| SVG sueltos (Tiktok-Ads, portadas Instagram) | 4 | |
| Fixtures de tests en el repo | 10 | no son de producción |
| 1 tamaño `mailchimp` citado en un podcast | 1 | |

Los 15 originales 404 de librería **no** se usan en el front. El 404 del podcast y los 10 de tests sí aparecen como `front` (cuerpo o repo).

## Coste Vercel Blob

Fuente leída el **28 oct 2026, 16:05–16:10 hora de Madrid (CET, UTC+1)**:

- [Vercel Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Pricing on Vercel](https://vercel.com/docs/pricing)
- [vercel.com/pricing](https://vercel.com/pricing)
- [Regional pricing](https://vercel.com/docs/pricing/regional-pricing)
- [iad1 (Washington D.C.)](https://vercel.com/docs/pricing/regional-pricing/iad1)

Tarifas oficiales (USD, sin impuestos):

| Recurso | Precio (doc / iad1) | Rango regional | Incluido Hobby | Incluido Pro |
| --- | --- | --- | --- | --- |
| Blob Storage Size | 0,023 USD / GB-mes | 0,023–0,041 | 1 GB/mes | Usage-based (crédito mensual; luego on-demand) |
| Blob Simple Operations | 0,40 USD / 1M | 0,35–0,56 | primeros 10.000 | Usage-based |
| Blob Advanced Operations | 5,00 USD / 1M | 4,50–7,00 | primeros 2.000 | Usage-based |
| Blob Data Transfer | 0,05 USD / GB (iad1) | 0,05–0,117 | primeros 10 GB | Incluido en Flat Rate CDN (1 TB/mes de equipo) |

Hobby: al superar el cupo se **bloquea** Blob (no hay overage). Pro: crédito mensual y luego on-demand.

**playful-headless** está en el team `playfuls-projects` (`team_WneR3BWaDf7kGBmCMUHb6I5z`, proyecto `prj_pLpYIo0J8pjz66nVSgl8yzjYFuow`, dominio `playfulagency.com`). Un team de Vercel no es Hobby. Se trata como **Pro**. Se informan los dos planes.

| Escenario | GB | Hobby almacenamiento / mes | Pro almacenamiento / mes | Hobby ¿cabe? | Escritura puntual (1 Advanced Op / archivo) | Transfer / 10 GB |
| --- | ---: | --- | ---: | --- | ---: | ---: |
| (i) Front | 0.143 | 0 USD (≤ 1 GB) | 0,0033 USD | sí | 0,0117 USD | 0,50 USD |
| (iii) Originales | 0.331 | 0 USD (≤ 1 GB) | 0,0076 USD | sí | 0,0103 USD | 0,50 USD |

No hay tráfico GA4 en este box. Transferencia: **0,50 USD por cada 10 GB** a 0,05 USD/GB (Hobby: 10 GB/mes incluidos; Pro: Flat Rate CDN). Escritura = N × 5 / 1.000.000 USD (put simple, sin multipart).

## Método

1. REST público, `per_page=100`, UA `PlayfulQA/1.0`, 1 req/s.
2. Deduplicado por URL (https, host canónico, sin hash). Solo paths `/wp-content/…` con fichero.
3. HEAD en serie (prioridad: front y originales sin `filesize`, luego el resto).
4. Nada se subió a Vercel Blob. WordPress no se modificó.

Script: `scripts/medir-imagenes-wp.mjs`. Inventario: `docs/migracion/imagenes-inventario.csv`.
