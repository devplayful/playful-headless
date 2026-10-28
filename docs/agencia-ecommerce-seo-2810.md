# /agencia-e-commerce y enlaces de blog — GO 28 oct 2026

Rama `cursor/agencia-ecommerce-seo-2810-d6e9`. Draft contra `main`. No merge y no producción.
No se edita WordPress. Title, meta y H1 de `/agencia-e-commerce` no se tocan.

Copy de playful-copy PR #380 SHA `11b38dc` (`pieces/2026-10-28-seo-enlaces-ve.md`): SEO OK, estado **borrador para redline de José**. Cada bloque nuevo lleva `PENDIENTE_FIRMA_JOSE_380`. Test prerelease: `tests/prerelease-firma-jose-380-ecom.test.mjs` (fuera de `test:canonical`).

## Hecho en código (`utils/ecommerce-aeo-2810.ts`, solo ese slug)

- H2 `Agencia E-commerce` → `Agencia e-commerce para marcas que ya venden en Venezuela, LATAM y España`.
- Párrafo bajo el H2 (literal #380, marca `PENDIENTE_FIRMA_JOSE_380`): «Trabajamos desde Venezuela con marcas que ya venden online…» con ancla `SoyTechno` a `/casos-de-exito/soytechno-ecommerce-venezuela`.
- `¿Buscas una Agencia e-Commerce que Hable Claro?` se queda después.
- FAQ visible + JSON-LD: pregunta `¿Puedo trabajar con Playful si mi marca está en Caracas o en otra ciudad de Venezuela?`. Respuesta literal #380. En JSON-LD el enlace es `<a href="https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela">el caso SoyTechno</a>`.
- En casos: `/casos-de-exito/soytechno-ecommerce-venezuela` con ancla `ecommerce en Venezuela: el caso SoyTechno`.
- Schema Service: `areaServed` Venezuela / España / Latinoamérica. Sin LocalBusiness ni dirección.

## H2 de José (playful-copy #377) — preparado, sin activar

`ECOM_H2_JOSE` está vacío. Hoy el H2 live se sustituye por el de la tanda 6 y el párrafo #380 va debajo. Cuando José firme #377, `applyJoseThenTanda6H2Order` ya tiene el orden: H2 de José, H2 de tanda 6, párrafo, luego `¿Buscas una Agencia e-Commerce que Hable Claro?`.

## Enlaces de cuerpo (wrap en render, no se edita WP)

Los 4 que ya existían se mantienen (`utils/blog-landing-links.ts` + `blog-seo-sem-agencia-seo-anchor.ts`).

Appends de playful-copy #380 (`utils/blog-seo-380-appends.ts`), solo si el original está en el HTML live:

| Id | Post | Original live | Qué se hace |
| --- | --- | --- | --- |
| E1 | `/blog/tecnologia/desarrollo-de-aplicaciones-web` | `Pero antes de dar este paso es necesario que evalúes si es realmente lo que necesitas.` | Añade la frase de agencia e-commerce. |
| E2 | `/blog/mas-vistos/que-es-una-agencia-de-sem` | `y estamos aquí para ayudarte a alcanzar tus metas.` | Añade «ecommerce que ya vende». |
| E3 | `/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian` | `Lo ideal, es combinar ambas estrategias para conseguir los objetivos deseados.` | Sustituye por la frase + «estrategia para tu tienda online». |
| S1 | `/blog/tecnologia/crear-un-e-commerce` | Live: `<strong>Shopify</strong> ofrece soporte 24/7, lo que te da tranquilidad si algo sale mal.` (la frase sin `<strong>` no es contigua) | Sustituye por «Si montas una tienda en Shopify…». |
| S2 | `/blog/mas-vistos/los-5-problemas-de-e-commerce` | Live: `<strong>Solución:</strong> Optimizar el proceso de compra es clave.` | Añade «checkout de tu tienda Shopify». |
| S3 | `/blog/tecnologia/cintillos-de-promocion` | `aprovechen al máximo las ofertas que tienes para ellos.` | Añade «diseño de tu tienda en Shopify». |

## No inventado (D6 y D7)

En la landing en vivo **no existen** «SEO para tu tienda online» ni «diseño UX/UI de tu tienda». No se inventan.

## Fuera de alcance

- Merge / quitar draft / producción
- Edición en WordPress
- Header, footer, layout raíz, CSS global, middleware
- Inventar D6/D7 o el H2 de playful-copy #377
