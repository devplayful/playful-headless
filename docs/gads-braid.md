# gclid / gbraid / wbraid → widget GHL (campos ocultos)

Web W1–W2 (27 oct 2026). Ops usa esta tabla para el punto **O1**: en el formulario del calendario `NiVJSc7uIWJpcbq3Ppmf`, cada campo oculto debe «Rellenar con parámetro de consulta» con el **nombre exacto** de la columna «Parámetro en la URL del widget».

La web **no** escribe en GHL. Solo manda query string al widget
`https://api.playfulagency.com/widget/bookings/reunion-playful`.

## De dónde sale cada valor

1. URL actual (`/reunion-playful` o la página desde la que se hace el hop).
2. Si falta, cookie de último toque `pa_attr_lt` (90 días).
3. Si falta, cookie de primer toque `pa_attr_ft` (90 días). El primer toque **no se sobrescribe**.

`gbraid` y `wbraid` viven en esas mismas cookies, junto a `gclid`, `fbclid` y `utm_*`.

## Qué se manda y con qué nombre

| Parámetro en la URL del widget | Valor | Campo GHL (contacto) |
|---|---|---|
| `gclid` | Clic id de Ads (URL o cookies) | — (también llega crudo) |
| `gbraid` | GBRAID iOS (URL o cookies) | — |
| `wbraid` | WBRAID iOS (URL o cookies) | — |
| `fbclid` | Clic id de Meta (ya se enviaba) | `fbclid` |
| `utm_source` | UTM reciente (URL o cookies) | `utm_source` |
| `utm_medium` | UTM reciente | `utm_medium` |
| `utm_campaign` | UTM reciente | `utm_campaign` |
| `utm_term` | UTM reciente | `utm_term` |
| `utm_content` | UTM reciente | `utm_content` |
| `gclid_web` | Mismo valor que `gclid` | `gclid_web` |
| `ft_gclid` | Primer toque | `ft_gclid` |
| `lt_gclid` | Último toque | `lt_gclid` |
| `ft_gbraid` | Primer toque | `ft_gbraid` |
| `lt_gbraid` | Último toque | `lt_gbraid` |
| `ft_wbraid` | Primer toque | `ft_wbraid` |
| `lt_wbraid` | Último toque | `lt_wbraid` |
| `ft_utm_source` | Primer toque | `ft_utm_source` |
| `lt_utm_source` | Último toque | `lt_utm_source` |
| `ft_utm_medium` | Primer toque | `ft_utm_medium` |
| `lt_utm_medium` | Último toque | `lt_utm_medium` |
| `ft_utm_campaign` | Primer toque | `ft_utm_campaign` |
| `lt_utm_campaign` | Último toque | `lt_utm_campaign` |
| `ft_utm_term` | Primer toque | `ft_utm_term` |
| `lt_utm_term` | Último toque | `lt_utm_term` |
| `ft_utm_content` | Primer toque | `ft_utm_content` |
| `lt_utm_content` | Último toque | `lt_utm_content` |

Reglas:

- No se envía una clave si el valor está vacío. No hay duplicados.
- Si el hop ya trae `ft_*` / `lt_*` / `gclid_web`, se respetan (no se pisan).
- El resto de query (`timezone`, `foo`, `msclkid`, `ttclid`, `pa_booking_id`, `qa`, …) no se toca.
- `/reunion-playful` sigue copiando `gclid`, `gbraid`, `wbraid`, `fbclid` y `utm_*` desde la URL de la página. Los alias `ft_*` / `lt_*` / `gclid_web` se añaden al construir la URL del widget.

## Código

- Cookies y 90 días: `lib/contact/attribution.ts` (`pa_attr_ft`, `pa_attr_lt`).
- Query del hop y del widget: `utils/booking-attribution.ts` (`BOOKING_QUERY_KEYS`, `GHL_WIDGET_ALIAS_KEYS`, `buildBookingWidgetUrl`).
