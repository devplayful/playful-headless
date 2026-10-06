# Encaje: home B2B sobre el diseño actual

Fecha: 4 oct 2026. Fuente del copy: playful-copy `pieces/home-b2b.md`, PR #156, SHA `37f2a9a`. Diseño de referencia: `main` de playful-headless (`app/page.tsx` y componentes de la home), SHA `9332d07`, que ya incluye el hero y el carrusel por `next/image` (#173) y el CTA de cierre por `next/image` (#170).

Los CTA de reunión de la pieza apuntan al widget (`https://api.playfulagency.com/widget/bookings/reunion-playful`). En la web el destino visible es `/reunion-playful`, que hace 302 al widget con la atribución. No se imprime la URL del widget.

## Frente al PR #174

El PR #174 (`feat(web): reescritura de la home (copy oct 2026)`, rama `cursor/home-rewrite-oct2026-831f`, SHA `fc28ac6`) monta **otra pieza**: `pieces/home-rewrite-oct2026.md` (playful-copy PR #151, SHA `9705970`). En `staging` esa home ya se sustituyó por el copy B2B. El #174 a `main` sigue abierto.

`home-b2b.md` es una variante B2B del mismo esqueleto (ocho bloques, mismos casos Jumex/Odwalla/SoyTechno, misma reunión de 30 a 40 minutos, mismos internados). No es el mismo texto: cambian title, meta, H1, antetítulo, problemas, método, testimonios, blog y CTA final. Title #174: 57 caracteres. Title B2B: 63. H1 #174: 56 caracteres («Tu tienda online, entregada a tiempo y lista para vender»). H1 B2B: 75 («La tienda online de tu marca, entregada a tiempo y conectada a tu operación»).

José firmó el copy B2B el 4 oct 2026 a las 16:33 (Madrid) y dio el GO para montarlo en staging. La fase B ya no es condicional: el texto literal del SHA `37f2a9a` entra en staging en cualquier caso. Nada en producción.

## Tabla de encaje (main actual → pieza B2B)

| Sección | Componente en main | Clase | Ajuste |
|---|---|---|---|
| Title / meta | `generateMetadata` (Yoast + fallback) | CABE con ajuste menor | Se sustituye por el title (63) y la meta (150) firmados. No es un bloque visual. |
| 1. Hero | `app/page.tsx` (2 columnas + `next/image`) | CABE con ajuste menor | H1 54 → 75 (+21). Antetítulo 15 → 100 (+85). De 2 párrafos (212 + 299) a subtítulo 181 + 3 párrafos (197 + 132 + 139) + microcopia 169. De 1 CTA al formulario a 2 CTA (reunión `/reunion-playful` + formulario) + microcopia. Se conserva `/images/playful-imagen-banner.png` por `next/image`. |
| 2. Problemas | `MaterialServicesSection` (3 tarjetas) | CABE con ajuste menor | Siguen 3 tarjetas y 3 H3. H2 53 → 78 (+25). Intro 105 → 231 (+126). H3 +16 a +42. Cada tarjeta pasa de 1 párrafo (~168) a 2 (hasta 213 + 169 y 291 + 119). Mismas 3 ilustraciones. CTA al formulario → `/reunion-playful`. |
| 3. Cómo trabajamos | `SolucionesPlayful` (3 tarjetas) | CABE con ajuste menor | Siguen 3 tarjetas y 3 H3. H2 57 → 80 (+23). Intro 205 → 126 (−79). La tarjeta 2 pasa de 1 párrafo (144) a 4 (285 + 209 + 196 + 193) con internados a `/agencia-e-commerce` y `/pasarela-de-pago-ecommerce`. Mismas 3 ilustraciones. CTA → `/reunion-playful`. |
| 4. Casos | `CarouselResultados` (`next/image`, N casos WP) | CABE con ajuste menor | De N fichas WP a 3 tarjetas literales (SoyTechno, Jumex, Odwalla). H2 57 → 47 (−10). Intro 192 → 246 (+54). H3 24 → 45 (+21). Se conserva el carrusel y el `next/image` del #173. El carrusel recorta la descripción a 3 líneas (`line-clamp-3`); el copy literal va en el DOM. |
| 5. Testimonios | `TestimonialsSection` (carrusel ~12 fichas) | CABE con ajuste menor | H2 30 → 70 (+40). Intro 205 → 108 (−97). El carrusel pasa de ~12 citas (ONG y Google Ads) a las 2 citas literales (266 y 256). Se muestra el cargo, que el diseño actual ya tenía en datos y no pintaba. |
| 5b. Destacados fijos | No existía en main | Ajuste mínimo hecho | Parrilla de 2 columnas con las mismas fichas blancas (`rounded-3xl`, sombra, avatar, estrellas, tipografía `#4A4453`) que el carrusel; el H2, la intro y las 2 citas salen en el HTML inicial. |
| 6. Aliados | Mismo bloque, H3 + logos | CABE tal cual | Título 29 → 39 (+10). Mismos 7 logos. |
| 7. Blog | `BlogRelatedPostsSection` | CABE tal cual | H2 55 → 77 (+22). Intro 271 → 200 (−71). Mismo CTA «Ver más artículos» a `/blog`. Mismas tapas del listado. |
| 8. CTA final | `TwoColumnCtaSection` (`next/image` #170) | CABE con ajuste menor | H2 51 → 57 (+6). El subtítulo 89 se sustituye por un párrafo de 341 (+252) más un segundo de 144. El segundo H2 (70) pasa a H3 (39). De 1 CTA al formulario a 2 (reunión `/reunion-playful` + formulario). Se conserva `/images/imagen-nueva-cta-home.png` por `next/image`. |

## Recuento

- CABE tal cual: 2 (Aliados, Blog).
- CABE con ajuste menor: 6 secciones visuales más title/meta.
- NECESITA DISEÑO resuelto con ajuste mínimo: 1 (parrilla de 2 testimonios destacados).

## Ajuste de diseño, una línea por sección

- Title / meta: se dejan los de la pieza firmada; no hay cambio visual.
- Hero: mismo bloque de 2 columnas; el H1 visible sustituye al `p` + `sr-only` y entran el segundo CTA y la microcopia, sin tocar el `next/image`.
- Problemas: mismas 3 tarjetas e ilustraciones; cada una admite 2 párrafos y el botón apunta a `/reunion-playful`.
- Cómo trabajamos: mismas 3 tarjetas; la del medio alarga el cuerpo para los internados, sin grid nuevo.
- Casos: se conserva el carrusel y el `next/image`; se quita el `line-clamp-3` en la home para que el copy literal quepa entero (`fullDescription`).
- Testimonios: H2 e intro de la pieza; las 2 citas ya no van al carrusel.
- Destacados: parrilla de 2 columnas reutilizando ficha, avatar, estrellas y color `#4A4453` del sistema actual.
- Aliados: solo cambia el H3; mismos logos y carrusel.
- Blog: mismos H2, intro y botón, con el texto de la pieza.
- CTA final: misma caja de 2 columnas e imagen `#170`; entra el segundo párrafo, el H3 y el CTA secundario.

GO de José el 4 oct 2026 a las 16:33. El PR a `main` sigue en draft. Staging lleva el texto literal del SHA `37f2a9a`.

## Imágenes que se conservan

- Hero: `/images/playful-imagen-banner.png` (`next/image`, `priority`, `fetchPriority="high"`).
- Problemas: `/images/diseno-confuso-obsoleto.png`, `/images/velocidad-carga-lenta.png`, `/images/errores-tecnicos-bugs.png`.
- Cómo trabajamos: `/images/desarrollo-web-a-medida.png`, `/images/optimizacion-experiencia-usuario.png`, `/images/seo-integrado.png`.
- Casos: tapas de Jumex, Odwalla y SoyTechno por `featuredTapaForSlug` / WP, pintadas con `next/image` fill en el carrusel.
- CTA final: `/images/imagen-nueva-cta-home.png` (`next/image`, sin `priority`).
- Testimonios / aliados: avatar y logos actuales.

## CTA y destinos

| Sitio | Pieza | Destino en web |
|---|---|---|
| Hero principal, Problemas, Método, CTA final | widget `reunion-playful` | `/reunion-playful` |
| Hero secundario, CTA final secundario | `/contactar-agencia-de-marketing-digital` | igual |
| Internado Shopify | `/agencia-shopify` | igual |
| Internado e-commerce | `/agencia-e-commerce` | igual |
| Pagos VE | `/pasarela-de-pago-ecommerce` | igual |
| Casos | `/casos-de-exito/...` | igual |
| Blog | `/blog` | igual |

## Estado

El copy literal está montado. El único hueco de diseño (2 destacados fijos) se resolvió con la parrilla mínima del sistema visual actual. El PR #174 a `main` no se cierra.
