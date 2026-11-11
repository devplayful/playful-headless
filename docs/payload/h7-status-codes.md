# H7 — Códigos de estado (sin seguir redirecciones)

Generado en VM local contra `next start` (build previo de la rama `cursor/payload-h7-integracion`), con **`VERCEL_ENV=preview`**, **sin** `VERCEL_AUTOMATION_BYPASS_SECRET` ni acceso al deployment protegido de Vercel.

Comando: `curl -sI` (sin `-L`). Base: `http://127.0.0.1:3456`.

> **CMS (`?cms=1`):** el rewrite Payload en middleware solo actúa en Preview. Sin `DATABASE_URL` en esta VM el HTML de páginas CMS no se validó; los códigos de redirect/410/301 del middleware sí se observan en cabeceras. Para regresiones de middleware ver `tests/h7-middleware-status.test.mjs`.

## Tabla resumida

| Ruta | `?cms=1` | HTTP | Location / notas |
|------|----------|------|------------------|
| `/reunion-playful` | — | **308** | `/reunion` |
| `/reunion-playful` | sí | **308** | `/reunion?cms=1` |
| `/test-blog` | — | **410** | cuerpo `Gone` |
| `/test-blog` | sí | **410** | igual (410 antes que rewrite CMS) |
| `/landing-page` | — | **410** | cuerpo `Gone` |
| `/landing-page` | sí | **410** | igual que sin `cms`; el 410 corre **antes** del bloque `?cms=1` / B5 |
| `/blog` | — | **200** | listing ISR |
| `/blog` | sí | **200** | no rewrite a `/blog/q` (solo `cms`) |
| `/blog?page=2` | — | **200** | rewrite interno a `/blog/q` (URL pública sin cambio) |
| `/blog?page=2` | sí | **200** | igual que prod + `cms` ignorado para el rewrite |
| `/blog/q` | — | **301** | `/blog` |
| `/blog/q` | sí | **301** | `/blog?cms=1` |
| `/blog/seo/tendencias-seo-2020` | — | **301** | `/blog/seo/aprende-todo-sobre-el-seo` |
| `/blog/seo/que-es-un-blog` | — | **301** | `/blog/seo/blog-corporativo-aumenta-el-trafico-de-tu-sitio-web` |
| `/blog/pautas-digitales/conoce-como-impulsar-tu-marca-online` | — | **301** | `/blog/pautas-digitales/guia-para-hacer-marketing-digital` |
| `/blog/pautas-digitales/por-que-incluir-la-transformacion-digital-en-mi-negocio` | — | **301** | `/blog/mas-vistos/ecosistema-digital-de-tu-marca` |
| `/blog/pautas-digitales/tipos-de-publicidad-online-conceptos-y-datos-curiosos` | — | **301** | `/blog/pautas-digitales/publicidad-digital-en-tu-negocio` |
| `/blog/seo/posicionamiento-organico-vs-pago` | — | **301** | `/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian` |
| `/seo-internacional` | — | **301** | `/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad` |
| `/blog/pautas-digitales/consejos-para-que-hagas-pautas-en-tus-post-de-instagram` | — | **301** | `/blog/otros/conoce-todo-sobre-instagram-ads` |

Las ocho últimas filas (301) son una muestra de las **22** entradas de `utils/seo-cruce-2810-redirect-map.json`.

## Comandos de reproducción

```bash
npm run build:direct
VERCEL_ENV=preview PORT=3456 npm run start
# otra terminal:
curl -sI http://127.0.0.1:3456/reunion-playful
```
