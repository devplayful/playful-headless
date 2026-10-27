# Paridad WP ↔ snapshot git (CMS_SOURCE=new)

Generado: 2026-10-27T11:47:01.130Z · Origen live: `https://endpoint.playfulagency.com/wp-json`

## Resumen

| Métrica | Valor |
| --- | --- |
| URLs auditadas (muestra) | 17 |
| OK | 17 |
| Con diferencias | 0 |
| Posts en snapshot | 135 |
| Casos en snapshot | 2 |

## Orden página 1 del blog (por date_gmt desc)

1. `/blog/otros/premios-cima-2026-soytechno-playful`
2. `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`
3. `/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad`
4. `/blog/tecnologia/cintillos-de-promocion`
5. `/blog/mas-vistos/los-5-problemas-de-e-commerce`
6. `/blog/tecnologia/actualizar-tu-e-commerce`
7. `/blog/tecnologia/crear-un-e-commerce`
8. `/blog/seo/google-y-su-inteligencia-artificial`
9. `/blog/mas-vistos/que-es-una-agencia-de-sem`
10. `/blog/mas-vistos/como-elegir-el-mejor-framework-para-tu-web`
11. `/blog/seo/optimizacion-multimedia`
12. `/blog/mas-vistos/diseno-web-de-paginas-web`

Comprobación solicitada: CIMA (86564) primero; Zelle (86152) en página 1.

- Primero global: `premios-cima-2026-soytechno-playful` (id 86564)
- Zelle en snapshot: sí

## Tabla de muestra

| URL | Estado | Campos con drift |
| --- | --- | --- |
| `/blog/otros/premios-cima-2026-soytechno-playful` | OK | — |
| `/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce` | OK | — |
| `/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad` | OK | — |
| `/blog/tecnologia/cintillos-de-promocion` | OK | — |
| `/blog/mas-vistos/los-5-problemas-de-e-commerce` | OK | — |
| `/blog/tecnologia/actualizar-tu-e-commerce` | OK | — |
| `/blog/tecnologia/crear-un-e-commerce` | OK | — |
| `/blog/seo/google-y-su-inteligencia-artificial` | OK | — |
| `/blog/mas-vistos/que-es-una-agencia-de-sem` | OK | — |
| `/blog/mas-vistos/como-elegir-el-mejor-framework-para-tu-web` | OK | — |
| `/blog/seo/optimizacion-multimedia` | OK | — |
| `/blog/mas-vistos/diseno-web-de-paginas-web` | OK | — |
| `/blog/seo/contenido-duplicado` | OK | — |
| `/blog/tecnologia/desarrollo-de-aplicaciones-web` | OK | — |
| `/blog/mas-vistos/rediseno-web` | OK | — |
| `/casos-de-exito/jumex-shopify-dtc-ecommerce` | OK | — |
| `/casos-de-exito/odwalla-shopify-dtc-ecommerce` | OK | — |

## Notas

- JSON-LD y enlaces internos se validan en CI (`test:canonical`, `blog-post-ssr`); este informe compara metadatos y H1 entre live y snapshot.
- Regenerar: `npm run cms:export` y luego `npm run cms:parity`.
