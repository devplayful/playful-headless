# /agencia-e-commerce y enlaces de blog — GO 28 oct 2026

Rama `cursor/agencia-ecommerce-seo-2810-d6e9`. Draft contra `main`. No merge y no producción.
No se edita WordPress. Title, meta y H1 de `/agencia-e-commerce` no se tocan.

## Hecho en código (mecanismos que ya existían)

- H2 `Agencia E-commerce` → `Agencia e-commerce para marcas que ya venden en Venezuela, LATAM y España` (`utils/ecommerce-aeo-2810.ts`, solo ese slug).
- Hueco bajo el H2: `<p data-copy-pending="agencia-e-commerce-intro">COPY SIN FIRMAR</p>`.
- FAQ visible + JSON-LD: `¿Puedo trabajar con Playful si mi marca está en Caracas o en otra ciudad de Venezuela?` con respuesta `COPY SIN FIRMAR`.

## H2 de José (playful-copy #377) — preparado, sin activar

Hoy José **no ha firmado** el H2 de playful-copy #377. `ECOM_H2_JOSE` está vacío y el rewriter sigue con el comportamiento de la tanda 6: el H2 live `Agencia E-commerce` se sustituye por `Agencia e-commerce para marcas que ya venden en Venezuela, LATAM y España`, y el hueco `COPY SIN FIRMAR` va debajo.

Cuando José firme ese H2, el orden ya está cableado en `applyJoseThenTanda6H2Order` (`utils/ecommerce-aeo-2810.ts`):

1. El H2 firmado de José sustituye al H2 live `Agencia E-commerce`.
2. El H2 de la tanda 6 entra como H2 **nuevo** justo después.
3. El hueco de intro sigue debajo del H2 de la tanda 6, **antes** de `¿Buscas una Agencia e-Commerce que Hable Claro?`.

Para activarlo: poner el literal firmado en `ECOM_H2_JOSE`. No inventar la frase.

## Cintillos S3 — pendiente de playful-copy #380

Pedido: en `/blog/tecnologia/cintillos-de-promocion`, ancla `diseño de tu tienda en Shopify` → `/agencia-shopify`.

En el HTML live (28 oct, `PlayfulQA/1.0`, `?qa=1`) **esa frase no existe**. Tampoco hay «diseño de tu tienda» ni «tienda en Shopify» en el cuerpo. No se inventa. Cuando Contenido firme playful-copy #380 y la frase esté en el post (WP o rewriter que ya exista), se envuelve con `blog-landing-links.ts`. Hasta entonces, cero wrap.
- En la sección de casos: enlace a `/casos-de-exito/soytechno-ecommerce-venezuela` con ancla `ecommerce en Venezuela: el caso SoyTechno`.
- Schema Service: `areaServed` Venezuela / España / Latinoamérica. Sin LocalBusiness ni dirección.
- Blog, texto que ya existe en WP (se envuelve en render, `utils/blog-landing-links.ts`):
  1. `/blog/mas-vistos/que-es-una-agencia-de-sem` — `SEO Avanzado` → `/agencia-seo`
  2. `/blog/mas-vistos/diseno-web-de-paginas-web` — `navegación intuitiva` → `/agencia-ux-ui`
  3. `/blog/tecnologia/desarrollo-de-aplicaciones-web` — `experiencia de usuario óptima` → `/agencia-ux-ui`
- `/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian` — reescritura acotada (`utils/blog-seo-sem-agencia-seo-anchor.ts`):
  - ancla `Landing Page sobre SEO` → `posicionamiento SEO para ecommerce` hacia `/agencia-seo`
  - se quita el `<a href="/agencia-seo">` que solo envuelve la imagen (sin texto)

## No inventado (textos 6 y 7 del brief)

En la landing en vivo (28 oct, `PlayfulQA/1.0`, `?qa=1`) **no existen** estas frases:

| Pedido | Texto live en ese H3 |
| --- | --- |
| Enlazar `SEO para tu tienda online` a `/agencia-seo` | H3 `SEO que Encuentra a tus Clientes`. Cuerpo: `Trabajamos el SEO de tu e-commerce para que quienes buscan productos como los tuyos, te encuentren primero.` |
| Enlazar `diseño UX/UI de tu tienda` a `/agencia-ux-ui` | H3 `Diseño que Vende (y Convence)`. Cuerpo: `Diseñamos una tienda visualmente atractiva que haga que tus clientes quieran añadir al carrito y no mirar atrás.` |

Si Contenido firma esas anclas (o cambia el párrafo), se pueden envolver con el mismo rewriter slug-scoped. Hasta entonces no se inventan.

## Copy pendiente (test pre-release, skip para CI)

- Párrafo bajo el H2.
- Respuesta de la FAQ `¿Puedo trabajar con Playful si mi marca está en Caracas o en otra ciudad de Venezuela?` (visible y JSON-LD).
- H2 de José (playful-copy #377): aún sin firmar; el rewriter lo tiene preparado y desactivado.
- Ancla S3 de `/blog/tecnologia/cintillos-de-promocion` (`diseño de tu tienda en Shopify` → `/agencia-shopify`): espera el copy de playful-copy #380.

Test: `tests/agencia-e-commerce-seo-2810.test.mjs` → `pre-release: intro and FAQ answer must not ship COPY SIN FIRMAR` (skip documentado). Quitar el skip cuando Contenido firme. El assert falla con `COPY SIN FIRMAR`.
