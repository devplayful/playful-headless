# Redirects 27 oct 2026 — pasarela y LP ERP

GO del CEO, 27 oct 2026, 22:03 (ajustado a las 22:07). Rama `cursor/redirects-pasarela-erp-2710`. Draft contra `main`. No merge y no producción.

## 301 (un solo salto)

| Origen | Destino | Query |
| --- | --- | --- |
| `/pasarela-de-pagos-venezuela` y `/pasarela-de-pagos-venezuela/` | `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce` | se conserva |
| `/lp/integraciones-pasarela-erp` y `/lp/integraciones-pasarela-erp/` | `/agencia-shopify` | se conserva (`gclid`, `utm_*`, …) |

No son 410. Google Ads sigue pudiendo aterrizar en `/lp/integraciones-pasarela-erp` y el middleware responde 301 al destino final.

`/lp/calentamiento` no entra en el mapa. Se queda como está.

Las reglas viven en `utils/unpublished-landing-redirect-map.json` y las carga `middleware.ts` en `PERMANENT_301`. La variante con barra (`/pasarela-de-pagos-venezuela/`) está **también** en el mapa, para que un solo 301 salga aunque se evalúe el mapa antes de quitar la barra. `resolveSingleHopRedirect` sigue resolviendo el hop único si el path llega ya normalizado.

## Enlace interno de Cashea

El post `/blog/tecnologia/cashea-para-comercios` **no está en WordPress**. La REST de `endpoint.playfulagency.com` devuelve `[]` para `slug=cashea-para-comercios`. En Next es un post local:

- ID local: `900001` (`CASHEA_COMERCIOS_LOCAL_POST` en `lib/blog-local-posts.ts`)
- Slug: `cashea-para-comercios`
- Cuerpo: `lib/blog-body-overrides.ts` (`CASHEA_COMERCIOS_BLOG_BODY_HTML`)

No hay edición WP que aplicar. El HTML se cambió en esta rama. Si más adelante el post se copia a WordPress, el GO de José puede usar el mismo antes/después.

### HTML de antes

```html
<a href="https://playfulagency.com/pasarela-de-pagos-venezuela">pasarela de pagos en Venezuela</a>
```

(dos anclas: el párrafo de apertura y el de SiTef / Banesco / Zelle)

### HTML de después (GO 28 oct 2026)

Párrafo 1 (ancla firmada):

```html
<a href="https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce">cómo integrar Zelle en tu ecommerce</a>
```

Párrafo 2 (SiTef / Instapago): un solo enlace a Zelle. Se quitó el de «pasarela de pagos en Venezuela»; queda el de «Zelle en Venezuela como método de pago para tu ecommerce». Contenido reescribirá esa frase.

```html
<p>En nuestra guía de pasarela de pagos en Venezuela comparamos SiTef, Instapago… en <a href="https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce">Zelle en Venezuela como método de pago para tu ecommerce</a> está cómo automatizar su validación.</p>
```

### Reescritura de plantilla (red de seguridad)

`decideBrokenInternalHref` reescribe `/pasarela-de-pagos-venezuela` **solo** si la fuente es `cashea-para-comercios`. El resto de posts no inventan destino (sigue en `SKIP_BROKEN_HREF_PATHS`).

La plantilla del post (`app/blog/[...slug]/page.tsx`) pasa `/blog/${category}/${postSlug}` a `rewriteInSitePageHrefs` para que ese mapa contextual se aplique.

`/lp/integraciones-pasarela-erp` sí tiene destino global (`/agencia-shopify`) por si aparece en HTML de WP.

## Fuera de alcance

- `/lp/calentamiento`
- Header, footer, layout raíz y CSS global
