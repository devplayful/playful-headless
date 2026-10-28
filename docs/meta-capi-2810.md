# Meta CAPI Schedule · tanda 16 (28 oct 2026)

Rama `cursor/meta-capi-schedule-2810`. Draft. Sin merge y sin producción. Este documento describe la configuración externa; **no se ha tocado GTM, Meta ni GHL en vivo**.

## Endpoint

`GET` y `POST` `/api/meta/capi/schedule` (Vercel, `app/api/meta/capi/schedule/route.ts`).

Envía `Schedule` a la Conversions API:

- `event_id` = `pa_booking_id` (query, body o cookie). La variable GTM `pa_booking_id` y el tag 9 **no se modifican**; solo se lee el valor.
- `user_data.fbp` / `user_data.fbc` desde `_fbp` / `_fbc` (o el body).
- `em` / `ph` SHA-256 a partir de la cookie `pa_booking_ec` **solo si hay consentimiento**. En este repo **no hay CMP ni Consent Mode**. Hasta que exista, el endpoint **no envía** `em` ni `ph`.
- Token: `META_CAPI_ACCESS_TOKEN` (server-only). No se crea ni se pide en este encargo. Si falta, el endpoint responde **503** y no llama a Meta.
- Pixel: `META_PIXEL_ID` o, si no está, `NEXT_PUBLIC_META_PIXEL_ID`. Si faltan las dos, **503**.
- QA: `?qa=1` o User-Agent `PlayfulQA/1.0`. Si existe `META_CAPI_TEST_EVENT_CODE`, se manda como `test_event_code`. Si no existe, **no envía nada** (`200`, `qa_missing_test_event_code`).

## Qué dispara el endpoint

Dos disparadores posibles. **No se ha configurado GHL.**

### 1. Webhook de GHL · cita creada

En GHL: Calendar → el calendario `reunion-playful` → webhook / workflow «Appointment booked» → `POST https://playfulagency.com/api/meta/capi/schedule` con JSON que incluya `pa_booking_id` (o `appointment.id`).

- **A favor:** no depende de que el visitante llegue a `/gracias`. Cubre cierres de pestaña y fallos de red en el thank-you.
- **En contra:** la petición la hace GHL, no el navegador. No viajan `_fbp` / `_fbc` ni `pa_booking_ec` salvo que el workflow las reenvíe. Sin esos click ids la coincidencia y la deduplicación con el píxel son peores.

### 2. Llamada desde `/gracias`

En `/gracias?conv=Schedule&pa_booking_id=…` (tras el hop del calendario) un `fetch` same-origin:

```html
<script>
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get('pa_booking_id');
  if (!id) return;
  fetch('/api/meta/capi/schedule?pa_booking_id=' + encodeURIComponent(id), {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pa_booking_id: id,
      event_source_url: location.href
    })
  });
})();
</script>
```

- **A favor:** el navegador envía `_fbp`, `_fbc` y `pa_booking_ec`. El `event_id` es el mismo `pa_booking_id` que lee el tag 8. Es la vía que hace posible «Navegador y servidor» deduplicado.
- **En contra:** si el usuario no carga `/gracias`, no hay evento servidor.

### Opción más fiable

**Llamada desde `/gracias` como vía principal** (mismas cookies y mismo `event_id` que el tag 8) y, cuando José lo autorice, el webhook de GHL como respaldo si se pueden reenviar `pa_booking_id`, `_fbp` y `_fbc`. No configurar GHL en este PR.

Este PR **no** añade el `fetch` a `app/gracias/page.tsx`. Se publica el snippet; el cableado en página o en GTM queda a GO de José.

## Tag 8 (GTM) · HTML exacto

Tag HTML nuevo (reemplazo del tag 8 actual). Se publica en GTM-MXHKJ4NW **solo con el GO de José**. Reutiliza la variable `pa_booking_id` sin modificarla. El tag 9 no se toca.

```html
<script>
fbq('track','Schedule',{},{eventID: {{pa_booking_id}}});
</script>
```

Trigger actual del tag 8: `/gracias` con `conv=Schedule`. No cambiar el trigger en este encargo.

## Verificación

En Events Manager → **Probar eventos**, una reserva de prueba debe mostrar `Schedule` como **«Navegador y servidor»**, deduplicado, con el mismo `event_id` (`pa_booking_id`).

Pasos (cuando existan token, `test_event_code` y el GO de José para el tag 8):

1. Abrir Probar eventos del píxel `853899051744740`.
2. Reservar en `/reunion-playful` y aterrizar en `/gracias?conv=Schedule&pa_booking_id=…`.
3. Comprobar el evento navegador (tag 8 con `eventID`) y el evento servidor (CAPI).
4. Confirmar un solo `Schedule` deduplicado, no dos filas independientes.

## `utm_id` → GHL (solo documentación)

`/reunion-playful` ya captura el query en la cookie `pa_attr_*` (campo `landing`) y ahora reenvía `utm_id` al widget igual que el resto de `utm_*`.

El mapeo a campos de contacto en GHL **no se configura aquí**. Hoy existen:

| Query | Campo GHL (contacto) | ID vivo (Ops, 2026-08-30) |
|---|---|---|
| `utm_source` | UTM Source | `EVlAYyVaPU4jEwaYWObB` |
| `utm_medium` | UTM Medium | `CwCqIkbM3SyBBMOgMgEa` |
| `utm_campaign` | UTM Campaign | `HVF30jCmKSNs5d6vsPMn` |
| `utm_term` | UTM Term | `pWSxH0iQTVzmHRKlIado` |
| `utm_content` | UTM Content | `0l2W9ngKGz6BZ0gNmFXW` |
| `utm_id` | *(no existe)* | Crear campo y mapear el query `utm_id` del widget |

Verificación pedida: entrar con `?utm_source=facebook&utm_id=123`, reservar, y ver los 6 UTM en el contacto. Eso requiere el campo y el mapeo en GHL, fuera de este PR.

## Fuera de este PR

- VisitaCalificada y `app/lp/agencia-shopify` → PR #372.
- Lead: no hay `<form>` en las páginas del brief.
- GTM en la landing de producción: se comprueba después del merge.
- Header, footer, layout raíz, CSS global y middleware: no se tocan.
