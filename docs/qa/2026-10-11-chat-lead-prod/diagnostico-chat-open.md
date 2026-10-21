# Diagnóstico: `chat_open` no sale en GA4 Tiempo real

Repetición en producción el 11 oct 2026. Playwright Chromium headless. **No se envió el formulario.**

## Causa

El evento **sí sale del navegador y Google lo acepta (HTTP 204)**. No es un fallo de `send_to`, ni de orden (el `config` va antes), ni de mayúsculas/espacios.

Lo que Analytics vio a las 19:31 (`page_view`, `session_start`, `first_visit`) es el **primer collect automático** de la sesión (`_fv=1`, `_nsi=1`, `_ss=1`). El custom `chat_open` viaja en el **segundo** collect de la misma sesión (`_s=2`, mismo `cid`/`sid`) y recibe 204, pero:

1. El hit lleva Client Hints `HeadlessChrome` (`uafvl=…|HeadlessChrome;156.0.8078.4`) y `navigator.webdriver=true`. El filtro de bots de GA4 suele mostrar los eventos automáticos de esa carga y **ocultar los custom**.
2. No hay `_dbg` ni `ep.debug_mode`: **DebugView no lo lista**. Tiempo real tampoco muestra un evento filtrado como bot.
3. GTM **no tiene trigger ni etiqueta** para `chat_open`. Solo dispara `generate_lead` (GA4 Event) y el Google tag de `G-WH76RQWSCT` en `gtm.init`. No lo bloquea ni lo duplica. El evento va **por gtag directo**, como dijo el PR #227.
4. `page_path` va en el `gtag('event', …)` pero **no aparece como `ep.page_path`**. gtag lo trata como parámetro de config y solo queda `dp=/`. Eso no impide que el evento exista; sí impide filtrar por el parámetro custom que Analytics esperaba.

No hay arreglo en nuestro código que haga aparecer en Tiempo real un hit 204 ya enviado al `tid` correcto. Falta `send_to` no es la causa (`tid=G-WH76RQWSCT` ya va en el collect). El evento no sale antes del config.

## Horas de apertura (Europe/Madrid)

| Pasada | Apertura del chat | collect `chat_open` | Status |
|---|---|---|---|
| 1 (19:27, informe previo) | 19:27:11 | 19:27:16 | no se capturó la respuesta |
| 2 (diagnóstico con wrap) | 19:33:48 | — | gtag sí, collect no (wrap de dataLayer; inválido) |
| 3 (limpia, 12 s de espera) | **19:35:52** | **19:35:57** | **204** |

## Collect de `chat_open` (pasada 3)

- Host: `analytics.google.com` (no `region1`)
- Status: **204**
- Nombre: `en=chat_open` (minúsculas, sin espacios)

| Parámetro | `page_view` 19:35:48 | `chat_open` 19:35:57 |
|---|---|---|
| `tid` | `G-WH76RQWSCT` | `G-WH76RQWSCT` |
| `cid` | `749491838.1791740149` | **igual** |
| `sid` | `1791740148` | **igual** |
| `_s` | `1` | `2` |
| `seg` | `0` | `0` |
| `_et` | (no) | `4189` |
| `_dbg` / `ep.debug_mode` | no | no |
| `ep.page_path` | no | no |
| `dp` | `/` | `/` |

URL completa del collect `chat_open`:

```
https://analytics.google.com/g/collect?v=2&tid=G-WH76RQWSCT&gtm=45je6a72v887660124za200zd887660124xf1&_p=1791740148470&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAAAGQC&cid=749491838.1791740149&frm=0&pscdl=noapi&rcb=3&sr=1440x900&uaa=x86&uab=64&uafvl=Not%253AA-Brand%3B8.0.0.0%7CChromium%3B156.0.8078.4%7CHeadlessChrome%3B156.0.8078.4&uam=&uamb=0&uap=Linux&uapv=&uaw=0&ul=es-es&gaf=2&_s=2&tag_exp=100940059~115938466~115938469~118897920~118897930~120213116~120385422~120469145~120469153~121046263~121046271~121246026~121246034&dp=%2F&sid=1791740148&sct=1&seg=0&dl=https%3A%2F%2Fplayfulagency.com%2F&dt=Playful%20Agency%20%7C%20Hacemos%20tu%20Tienda%20Online%20o%20E-commerce&en=chat_open&_ee=1&_et=4189&tfd=9556
```

## Orden

1. `dataLayer` `gtm.js`
2. `gtag('js', …)`
3. `gtag('config', 'G-WH76RQWSCT', { page_path: '/' })`
4. collect `page_view` (`_fv=1&_nsi=1&_ss=1`) → 204
5. `gtm.dom` / `gtm.load`
6. apertura del bubble
7. `gtag('event', 'chat_open', { page_path: '/', event_timeout: 300 })`
8. collect `chat_open` → 204

## GTM (`GTM-MXHKJ4NW`)

- Google tag `G-WH76RQWSCT` en `gtm.init` (tag 4)
- GA4 Event `generate_lead` (tag 13), trigger `event = generate_lead`
- Un `gaawe` **pausado** (tag 5)
- Ads / Facebook en `/gracias`
- **Sin** trigger `chat_open` o `chat_lead`. Sin allow/block list que los toque.

## Arreglo

Ninguno. Sin PR de código, sin SHA de merge, sin hora READY.

Para verlo en GA4: Tiempo real o DebugView desde un Chrome normal (no headless), o marcar `debug_mode` solo en esa sesión. El filtro de bots no se arregla en el repo.
