# Paridad Home (`/`)

Mediciones ejecutadas desde el agente cloud el 2026-10-30. Script: `node scripts/paridad-home-compare.mjs` (adaptado del `cmp.py` de H4).

## Prod (referencia congelada)

- URL: `https://playfulagency.com/?qa=1`
- User-Agent: `PlayfulQA/1.0`
- HTML recibido: **106 144 bytes**
- Canonical en prod: `https://playfulagency.com/` (link rel=canonical presente en el HTML)

## Preview Payload (`?cms=1`)

**No medido en este entorno.** La preview de Vercel está protegida y no se dispuso de `PREVIEW_HOME_URL` ni de un volcado `PREVIEW_HOME_HTML` con `data-cms-source="payload"`.

No se afirma «0 diferencias» entre prod y preview hasta poder comparar ambos HTML.

## Bloques migrados a Payload (colección `home`, slug `main`)

| Bloque | Contenido en CMS |
|--------|------------------|
| `hero` | Miga, H1, párrafos (HTML inline), CTA |
| `premios-cima` | Variante `home` (imágenes estáticas `/images/premios-cima/…`) |
| `problemas` | Sección Material (H2, intro, 3 tarjetas, CTA) |
| `soluciones` | Sección Soluciones Playful (H2, intro, 3 tarjetas, CTA) |
| `casos` | Títulos del carrusel (datos de casos siguen desde WordPress) |
| `testimonios` | Copy de cabecera, lista de testimonios, logos de aliados |
| `blog` | H2 e intro del bloque (posts siguen desde WordPress / `getLatestBlogPosts`) |
| `cta` | TwoColumnCta final (colores, imagen local, textos, enlace booking) |

## Cómo repetir la comparación

```bash
# Solo prod (throttle 1 req/s)
node scripts/paridad-home-compare.mjs

# Con HTML de preview guardado
PREVIEW_HOME_HTML=/tmp/home-cms.html node scripts/paridad-home-compare.mjs

# O URL de preview accesible
PREVIEW_HOME_URL='https://…vercel.app/?cms=1' node scripts/paridad-home-compare.mjs
```

Compara texto visible, `alt`/`src` de imágenes, vídeos, canonical, JSON-LD, `<title>` y meta description.
