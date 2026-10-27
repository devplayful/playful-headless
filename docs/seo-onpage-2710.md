# SEO on-page 27 oct 2026 · Bloque 2

Encargo: GO del CEO, 27 oct 2026. Solo el brief on-page de Web (lista cerrada) sobre `/agencia-e-commerce`, Zelle y CIMA. Fuera de este doc: punto 0 (`/pasarela-de-pagos-venezuela`) y los bloques 1 y 3.

Nada de este lote se aplicó en WordPress. Cualquier cambio en `endpoint.playfulagency.com` sale en vivo. Lo que Next puede resolver (plantilla, rewrites por slug, schema, CTA de plantilla) va en esta rama. Lo que solo vive en WP queda aquí como payload para el GO de José.

## Confirmación · title y meta de `/agencia-e-commerce`

El live del 27 oct (y el HTML de `playfulagency.com/agencia-e-commerce?qa=1`) ya muestra:

- Title: `Agencia de ecommerce para marcas D2C | Playful`
- Meta: `Agencia de ecommerce para marcas que venden directo al consumidor: ordenamos tienda online, posicionamiento y diseño para vender más. Agenda tu llamada.`

Eso es el override de Next en `utils/page-seo-overrides.mjs` (opción A firmada, 46 / 152 caracteres), no el Yoast de WP. El Yoast de la página 85582 sigue clonado de Marketing Internacional:

- Title WP (antes = después; no tocar): `Marketing Internacional: Lleva tu negocio al mundo (sin complicaciones)`
- Meta WP (antes = después; no tocar): `Expandirte globalmente puede parecer complicado, pero con Playful Agency es pan comido. Te ayudamos a crear estrategias de Marketing Internacional que conectan con clientes.`

No se duplica el cambio de la card `1247n711e39`. ClickUp no se pudo leer en esta corrida (límite diario del MCP); la coincidencia es con el override ya mergeado en `main`.

## Aviso a SEO · CIMA y `/agencia-shopify`

SoyTechno no es Shopify: el propio post de Zelle (override firmado) y el caso `soytechno-ecommerce-venezuela` la describen como tienda WooCommerce. El ítem 8 del brief dice: si no es Shopify, usar `/agencia-e-commerce` (ya está en el cuerpo de CIMA, post 86564) y avisar a SEO. **No se inyecta** el anchor `agencia Shopify para marcas D2C`.

## Payloads WP (no aplicar sin GO de José)

Estos campos siguen en WP. Next ya pinta el resultado en apex. Si más adelante se quiere alinear el CMS, este es el payload exacto.

### Página `/agencia-e-commerce`

- ID: `85582`
- Tipo: `page` (Elementor)
- Slug: `agencia-e-commerce`

| Campo (widget heading) | Antes | Después |
| --- | --- | --- |
| H1 `elementor-heading-title` | `Tu Agencia e-Commerce para Resultados Reales` | `Agencia de ecommerce para marcas D2C que ya facturan` |
| Primer H2 `elementor-heading-title` | `Agencia E-commerce` | `¿Qué hace una agencia de ecommerce para una marca D2C?` |

La respuesta citable de 40-60 palabras bajo ese H2 **no** se escribe en WP hasta que Contenido entregue el texto. En Next hay un hueco visible.

Los enlaces `caso Jumex en Shopify` y `caso Odwalla en Shopify` se inyectan en Next en la sección «Marcas que han trabajado con nosotros» / «No confíes solo en nuestra palabra». No hay que editar el carrusel de logos en WP.

### Post Zelle

- ID: `86152`
- Tipo: `post`
- Slug: `zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`
- Fecha de publicación (no cambiar): `2025-04-22T19:28:54`

El cuerpo público lo pinta el override de Next (`lib/blog-body-overrides.ts`). **No editar** `content.rendered` ni Yoast en WP: el título/meta de apex ya los fija Next.

| Campo | Antes | Después |
| --- | --- | --- |
| Cuerpo (último bloque) | El HTML de WP no tiene el cierre de servicio; apex usa el override | Pendiente de Contenido: bloque de cierre + botón. Next ya deja el hueco y el anchor literal `integrar Zelle y pagos locales en tu tienda Shopify` → `/agencia-shopify`, botón → `/reunion-playful` |
| CTA de plantilla | No vive en WP; es `TwoColumnCtaSection` en Next | Destino `/reunion-playful`. Texto del botón: hueco de Contenido |

### Post CIMA

- ID: `86564`
- Tipo: `post`
- Slug: `premios-cima-2026-soytechno-playful`
- Fecha de publicación (no cambiar): `2026-10-20T07:10:05`

| Campo | Antes | Después |
| --- | --- | --- |
| `content.rendered` H3 `#que-son-los-premios-cima` | `<h3 id="que-son-los-premios-cima">¿Qué son los premios CIMA?</h3>` | `<p id="que-son-los-premios-cima"><strong>¿Qué son los premios CIMA?</strong></p>` (o equivalente sin etiqueta Hn). Next ya lo hace en render. |
| `content.rendered` H3 `#cuando-y-donde-fue-la-gala-faq` | `<h3 id="cuando-y-donde-fue-la-gala-faq">¿Cuándo y dónde fue la gala de los Premios CIMA 2026?</h3>` | Misma pregunta, sin Hn. Next ya lo hace. |
| `content.rendered` H3 `#quien-gano-faq` | `<h3 id="quien-gano-faq">¿Quién ganó los Premios CIMA 2026 en Plataforma de E-commerce?</h3>` | Misma pregunta, sin Hn. Next ya lo hace. |
| `content.rendered` H3 `#que-consiguio-soytechno-2025` | `<h3 id="que-consiguio-soytechno-2025">¿Qué consiguió SoyTechno en 2025?</h3>` | Misma pregunta, sin Hn. Next ya lo hace. |
| Enlace a `/agencia-shopify` | No hay | **No aplicar.** SoyTechno es WooCommerce. Se mantiene `/agencia-e-commerce`. |
| CTA de plantilla | No vive en WP | Destino `/reunion-playful`. Texto del botón: hueco de Contenido. |

El H2 que duplica el H1 en Zelle y CIMA sale de la plantilla del blog (`<h2>` visible con el mismo texto que el `<h1 class="sr-only">`). Next lo convierte en `<p>` solo en esos dos slugs. El resto de posts no cambia. No hay payload WP para eso.

## Fuera de alcance

- `/pasarela-de-pagos-venezuela` (punto 0): 404 y fuera del sitemap. Lo decide CEO o José.
- Bloques 1 y 3 del brief (briefs de Contenido y ángulos de LinkedIn).
- Reordenar el listado del blog o cambiar fechas de publicación.
