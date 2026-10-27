# Analytics — bots/rastreo y reserva limpia (27 oct 2026)

Cambios **en código** (esta rama): el cliente etiqueta el tráfico y suprime conversiones de bot/QA. **No** se tocan nombres ni disparadores de GTM, ni GA4 Admin, ni Google Ads.

Los cambios de GTM/GA4 de esta nota los decide José, el CEO o Analytics. No los aplica el agente.

## Qué hace el código

- `traffic_type`: `qa` | `bot` | `user`
- `bot_suspect`: `true` solo con `navigator.webdriver` o UA headless/crawler conocido
- Se envían al `dataLayer` y a `gtag` (`set` + params de evento / `config` de page_view)
- Reutiliza `isQaTraffic` (`?qa=1` y UA `PlayfulQA/1.0`). QA sigue sin cargar GTM/gtag
- `page_view` y la carga de página **no** se bloquean para bots; solo se etiquetan
- Conversiones suprimidas si QA o bot: `generate_lead`, `cta_reunion_click`, `book_appointment`
- `book_appointment` se dispara **una vez** en `/gracias?conv=Schedule` (cookie o query `pa_booking_id`), con dedupe por `booking_id`. No se dispara en QA ni `bot_suspect`. No emite `generate_lead`

## Cambios manuales en GTM

1. **Renombrar tags cuyo nombre es una URL** (`agencia-shopify`, `home`, `gracias`, y equivalentes). El evento no debe llamarse como la ruta. Dejar el disparador como está; solo el nombre del tag / del evento.
2. **Quitar «Contactar» como evento clave** cuando el disparador es la vista de página de `/contactar-agencia-de-marketing-digital`. Ese hit es un page_view, no un lead. El lead de formulario sigue siendo `generate_lead`.
3. **No cambiar** los nombres de evento ni los disparadores que ya usa el sitio (`generate_lead`, `cta_reunion_click`, `cta_contact_click`, `page_view`, `book_appointment` vía dataLayer). El código no los ha renombrado.

## Cambios manuales en GA4

1. **Marcar `book_appointment` como evento clave** (conversión). Hoy la reserva se ve como `generate_lead` o como vista de `/gracias`.
2. **Crear un filtro de datos** de tráfico interno o de desarrollador que excluya `traffic_type` = `qa` o `traffic_type` = `bot` (o `bot_suspect` = `true`). Aplicarlo a la propiedad cuando se valide en un vista/filtro de prueba.
3. No crear el evento `book_appointment` a mano como “evento desde URL”. Lo emite el tracker en `/gracias?conv=Schedule`.

## Fuera de alcance (a propósito)

- Header, footer, layout raíz, CSS global
- JSX de `/gracias` (PR draft paralelo #369)
- GTM Admin, GA4 Admin, Google Ads
- Merge a `main` o producción
