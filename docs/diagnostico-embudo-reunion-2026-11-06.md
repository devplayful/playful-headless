# Diagnóstico del embudo «Reservar reunión»

Lectura de `main` en `ca4cae0d12ac65c4bd1d58da7dc1db7be2c63046` (4 nov 2026, 17:32 CET) y del sitio en vivo solo con GET. No hay cambios de producción, ni envíos de formulario, ni selección de hueco.

Pulso de partida (Analytics, 30 oct–5 nov, leído el 6 nov 2026 a las 10:02 Madrid): 10 clics limpios en el CTA «Reservar reunión» (`cta_reunion_click`), 5 abandonos (`booking_abandon`) y 0 citas válidas (`book_appointment` / cita confirmada).

El nombre «Reservar reunión» es el título que tenía `/reunion-playful` hasta el 3 nov (`Reservar reunión | Playful Agency`). El evento de clic no mira ese título: clasifica el `href`. Hoy el título de `/reunion` es «Solicitar reunión». Los textos visibles del CTA varían (`Agendar Reunión con Playful`, `reserva una reunión`, `Cumplo estas condiciones: agendar sesión`).

## Recorrido que hay hoy en `main`

1. El clic en un enlace de reserva dispara `cta_reunion_click`, guarda intención de abandono y espera el callback de gtag (máximo 300 ms) antes de navegar en la misma pestaña.
2. El destino visible es `/reunion`, con la query de atribución de la página (solo `gclid`, `gbraid`, `wbraid`, `fbclid` y `utm_*`).
3. `/reunion-playful` responde 308 a `/reunion` y conserva la query. Ya no salta al widget.
4. `/reunion` pinta un formulario de precalificación. El iframe del calendario solo se monta si el API responde `qualified`.
5. El iframe apunta a `https://api.leadconnectorhq.com/widget/booking/NiVJSc7uIWJpcbq3Ppmf?timezone=Europe/Madrid&lang=es`.
6. `book_appointment` solo se envía si la ventana carga `/gracias?conv=Schedule`. El mensaje `msgsndr-booking-complete` del iframe no dispara ese evento.

Hasta el 3 nov por la mañana el paso 3 era otro: `/reunion-playful` era una página casi vacía que esperaba a GA4 (máximo 3 s) y hacía `location.replace` a `https://api.playfulagency.com/widget/bookings/reunion-playful`. Ese cambio cae dentro de la ventana del pulso.

| Momento (Madrid) | Commit | Qué cambió en el embudo |
| --- | --- | --- |
| 3 nov 2026, 00:35 | `44765cf` (#395) | `book_appointment` pasa a `gtag` con `send_to` y acepta `?conv=Schedule?conv=Schedule` |
| 3 nov 2026, 15:39 | `dd7d0d2` (#404) | `/reunion` pasa a ser el formulario. El calendario solo sale si hay calificación |
| 3 nov 2026, 15:56 | `45f1161` (#405) | El 308 de servidor sustituye a la redirección cliente hacia el widget |

No consta en el repo el minuto exacto del deploy de Vercel. El HTML vivo del 6 nov ya es el de estos commits.

## Lecturas HTTP (GET, sin JavaScript)

Hora de Madrid en el momento de cada petición. User-Agent `PlayfulDiagnosticoLectura/1.0`. Ninguna petición ejecuta la página, así que no genera `page_view`, clic ni reserva.

| Hora Madrid | URL | Status | Tiempo | Qué se vio |
| --- | --- | --- | --- | --- |
| 2026-11-06 10:38:56 CET | `https://playfulagency.com/reunion` | 200 | 0,327 s | Título «Solicitar reunión». HTML del formulario. Sin iframe de calendario |
| 2026-11-06 10:38:56 CET | `https://playfulagency.com/reunion/` | 301 | 0,261 s | `Location: /reunion` |
| 2026-11-06 10:38:56 CET | `https://playfulagency.com/reunion-playful` | 308 | 0,159 s | `Location: /reunion` |
| 2026-11-06 10:38:57 CET | `https://playfulagency.com/reunion-playful/` | 308 | 0,190 s | `Location: /reunion` |
| 2026-11-06 10:38:57 CET | `https://playfulagency.com/reunion-playful?utm_source=diagnostico-lectura&utm_medium=get` | 308 | 0,262 s | `Location: /reunion?utm_source=diagnostico-lectura&utm_medium=get` |
| 2026-11-06 10:38:57 CET | `https://playfulagency.com/contactar` | 404 | 0,154 s | No existe esa ruta |
| 2026-11-06 10:38:57 CET | `https://playfulagency.com/contacto` | 301 | 0,215 s | `Location: /contactar-agencia-de-marketing-digital` |
| 2026-11-06 10:38:57 CET | `https://playfulagency.com/contactar-agencia-de-marketing-digital` | 200 | 0,331 s | Formulario de contacto. No es el calendario |
| 2026-11-06 10:38:58 CET | `https://playfulagency.com/eshow` | 200 | 0,288 s | Alta al boletín del eShow. Sin enlace a `/reunion` |
| 2026-11-06 10:38:58 CET | `https://playfulagency.com/gracias?conv=Schedule` | 200 | 0,319 s | `X-Frame-Options: DENY`. GA4 `G-WH76RQWSCT` en el HTML |
| 2026-11-06 10:38:58 CET | `https://api.leadconnectorhq.com/widget/booking/NiVJSc7uIWJpcbq3Ppmf?timezone=Europe/Madrid&lang=es` | 200 | 0,252 s | Mismo calendario que la URL antigua. Ver payload más abajo |
| 2026-11-06 10:38:59 CET | `https://api.playfulagency.com/widget/bookings/reunion-playful` | 200 | 0,733 s | Mismo id `NiVJSc7uIWJpcbq3Ppmf`, slug `reunion-playful` |
| 2026-11-06 10:38:59 CET | `https://www.playfulagency.com/reunion` | 308 | 0,291 s | `Location: https://playfulagency.com/reunion` |
| 2026-11-06 10:39:38 CET | `https://playfulagency.com/_next/static/chunks/app/reunion/page-695923eb7ce6335a.js` | 200 | 0,175 s | El bundle sí incluye el site key de reCAPTCHA y el id del calendario |
| 2026-11-06 10:41:18 CET | `https://stcdn.leadconnectorhq.com/_preview/C_uFv02-.js` | 200 | 0,334 s | Runtime del widget, 828 KB. Redirige con `window.top.location` si se llama |
| 2026-11-06 10:41:33 CET | `https://playfulagency.com/blog/otros/eshow-madrid-2026` | 200 | 0,180 s | Enlace vivo: `<a href="/reunion-playful">reserva una reunión</a>` |

`/reunion`, `/gracias` y el resto de páginas de Vercel leídas arriba envían `X-Frame-Options: DENY` (`next.config.js` líneas 76-79). El HTML del widget de LeadConnector no trae esa cabecera: se puede embeber.

El shell del widget y su JS responden en menos de un segundo. La hipótesis «el widget no se sirve o tarda en servir el documento» queda por debajo del resto. No se pidió el listado de huecos ni se abrió el widget en un navegador.

## Hipótesis, de más probable a menos

### 1. Quien califica tampoco puede cerrar una cita: el horario servido es 00:00–00:00

Probabilidad alta para las 0 citas de toda la semana, con una reserva: el payload es del 6 nov, no un histórico del 30 oct.

Las dos URLs del widget (la del embed y la antigua `api.playfulagency.com`) devuelven el mismo calendario, «Reunión con Playful», id `NiVJSc7uIWJpcbq3Ppmf`, slug `reunion-playful`. En el JSON `__NUXT_DATA__` de las 10:38:

- `auto_confirm` es `false`. `is_active` es `true`. `deleted` es `false`.
- `enable_office_hours` es `true`.
- `open_hours` del calendario es un objeto vacío.
- El horario por sede, de lunes a viernes (días 1 a 5), tiene `open_hour`, `open_minute`, `close_hour` y `close_minute` en 0. La ventana dura cero minutos. No hay sábado ni domingo.
- `allow_booking_after` es 1 día. `slot_duration` es 30 minutos. Tope de 1 cita por hueco y 3 por día.
- `event_type` es `RoundRobin_OptimizeForAvailability`, con un solo miembro.

Si HighLevel trata esa ventana como cerrada, el calendario se ve y no ofrece hora. Eso encaja con clics, con abandonos de quien vuelve, y con cero citas tanto antes del formulario (30 oct–3 nov) como después. El mensaje de gracias del propio widget dice que la solicitud no queda confirmada y que el equipo contactará. Con `auto_confirm: false`, una solicitud guardada en GHL puede no contar como cita válida.

Evidencia de código del destino del iframe: `lib/calificacion/constants.ts` líneas 1-2 y `lib/calificacion/calendar-widget-url.ts` líneas 5-13. El horario no está en el repo: está en el HTML del widget leído a las 10:38:58.

Comprobación sin tocar producción: un GET al endpoint público de huecos libres de ese calendario (sin elegir hora y sin POST). Si la respuesta viene vacía en días laborables futuros, la hipótesis queda cerrada. En paralelo, en el calendario de GHL, mirar el historial de citas y de solicitudes del 30 oct al 5 nov. No crear una cita de prueba en el calendario de producción. El calendario de QA (`AR82Tqlm75JTU8QMk5ID`, solo preview) no sirve para afirmar qué huecos tenía producción.

### 2. Desde el 3 nov por la tarde el CTA no abre el calendario

Probabilidad alta para los clics del 3 nov (tras el deploy) al 5 nov, que incluyen el eShow (4 y 5 nov).

`/reunion` renderiza el formulario y no el iframe. El iframe entra solo con `outcome === 'qualified'` (`app/reunion/ReunionCalificacionClient.tsx` líneas 127-157 y `app/reunion/ReunionCalendarEmbed.tsx` líneas 5-17). El HTML de las 10:38:56 contiene «Esto es una solicitud», «¿Ya vendes?», «Facturación mensual» y el botón «Continuar». No contiene `data-reunion-calendar`, ni el id `NiVJSc7uIWJpcbq3Ppmf`, ni una etiqueta `iframe`.

`evaluateQaFiltro` (`lib/qa-filtro/qualify.ts` líneas 24-59) solo deja ver el calendario si se cumplen todas:

- ya vende (online, física o ambas). «Aún no vendo» es rechazo;
- no es revendedor ni agencia;
- no tiene los dos canales por debajo de 10k USD;
- responde que no vende en tiendas de terceros o distribuidores. `thirdParty === 'si'` cae en `review` antes de mirar la facturación, también con un canal por encima de 250k (`tests/qa-filtro/qualify.test.ts` líneas 32-44);
- al menos un canal está en 50–100k, 100–250k o más de 250k. El corte es `QA_FILTRO_REVENUE_CUTOFF_USD = 50_000` (`lib/qa-filtro/constants.ts` línea 3).

`rejected` enseña una guía y no el calendario. `review` enseña «Te escribimos en 1 día laborable» y tampoco el calendario. Esos dos desenlaces son un abandono del calendario aunque la persona haya terminado el formulario.

El 308 está en `middleware.ts` líneas 178-180. El comentario de `utils/booking.ts` líneas 11-14 sigue diciendo que `/reunion-playful` hace 302 al widget. El comportamiento vivo es el del middleware, no el del comentario.

Comprobación sin producir reservas: en GA4, partir `cta_reunion_click` por día, con corte el 3 nov a las 16:00 Madrid. En GHL, contar contactos ya creados con etiquetas `calif-pendiente`, `calif-limite` y `calif-no` entre el 3 y el 5 nov (solo lectura). No hacer POST a `/api/calificacion` en producción: crea o actualiza un contacto. Los desenlaces se pueden rehacer en local con `tests/qa-filtro/qualify.test.ts`.

### 3. `book_appointment` puede quedarse en cero aunque la cita exista

Probabilidad alta como explicación de las 0 citas en Analytics, sobre todo del 30 oct al 3 nov a las 00:35. Después de esa hora depende de si el widget llega a navegar a `/gracias`.

El evento solo sale de `pushBookAppointmentOnce` si `readConvParam(search) === 'Schedule'` (`lib/analytics/book-appointment.ts` líneas 32-34 y 145-167). Lo monta `BookAppointmentTracker` en `/gracias` (`components/BookAppointmentTracker.tsx` líneas 14-27). Hace falta que la ventana superior cargue esa URL.

Hasta el merge de las 00:35 del 3 nov, el código anterior exigía `conv === 'Schedule'` con `URLSearchParams` y solo hacía `dataLayer.push({ event: 'book_appointment' })`, sin `gtag` ni `send_to`. GHL a veces entregaba `?conv=Schedule?conv=Schedule`. Ese valor no pasaba el filtro, así que la cita podía existir y el evento no. El arreglo está en el commit `44765cf`. No cubre hacia atrás los días 30 oct–2 nov del pulso.

Hoy el payload del widget (10:38:58) guarda dos cosas a la vez:

- `form_submit_redirect_url`: `https://playfulagency.com/gracias?conv=Schedule`
- `form_submit_type`: `ThankYouMessage`

Con tipo mensaje, el widget puede quedarse en su propia pantalla de gracias y no navegar. El runtime (`C_uFv02-.js`, 10:41:18) sí sabe hacer `window.top.location.href` y, al hacerlo, copia la query del widget sobre la URL de destino. Eso explica el `conv` duplicado cuando la redirección se construye a mano, y también que `X-Frame-Options: DENY` no bloquee ese salto: el destino es la ventana superior, no el iframe. Si el tipo sigue siendo `ThankYouMessage` y esa función no se llama, `/gracias` no llega a cargarse y `book_appointment` no se envía.

`BookingWidgetAttribution` escucha `msgsndr-booking-complete` y no hace nada con él: solo contesta a `fetch-query-params` (`components/BookingWidgetAttribution.tsx` líneas 102-113). El comentario del componente dice que la confirmación no trae email ni `contactId` fiables y que no hace upsert. Tampoco manda el evento de GA4.

El script inyectado en el calendario (`code_block`, cookie `pa_booking_id` / `pa_booking_ec` con `Domain=playfulagency.com`) corre dentro de `api.leadconnectorhq.com`. El navegador rechaza esa cookie de otro sitio. No impide por sí solo el evento, porque sin `pa_booking_id` el dedupe es uno por sesión en `conv=Schedule`. Sí deja ciega la medición mejorada.

Comprobación sin reservas nuevas: en GA4, páginas vistas de `/gracias` cuyo `page_location` contenga `conv=Schedule` entre el 30 oct y el 5 nov, al lado de `book_appointment`. Si hay páginas vistas y cero eventos antes del 3 nov a las 00:35, el parser antiguo es la causa de esa parte. Si no hay páginas vistas en toda la ventana, el widget no está llevando a nadie a `/gracias` (tipo `ThankYouMessage` o el calendario sin huecos de la hipótesis 1). Contrastar con las citas ya existentes en GHL, en solo lectura. No completar una reserva de producción para «ver si salta el evento».

### 4. El formulario es un abandono real, y `booking_abandon` no cuenta la otra mitad

Probabilidad alta para los 5 abandonos, y explica por qué los otros 5 no son citas.

El formulario pide nombre, email, seis respuestas obligatorias (¿ya vendes?, plataforma, facturación online, facturación del resto de canales, tipo de negocio, terceros), la casilla de privacidad y reCAPTCHA v2 (`app/reunion/ReunionCalificacionClient.tsx` líneas 163-328). El equipo es el único campo opcional. El bundle de las 10:39:38 incluye el site key, así que en producción el checkbox se pinta. El servidor exige token (`lib/contact/delivery.ts` líneas 62-65): sin marcarlo, el POST responde 400 y la persona se queda en el formulario. Si HighLevel falla, la respuesta es 502 con «No pudimos procesar tus respuestas» (`app/api/calificacion/route.ts` líneas 127-135) y el calendario no se muestra aunque las respuestas habrían calificado.

El texto de arriba del formulario dice que es una solicitud y no una reunión confirmada (`ReunionCalificacionClient.tsx` líneas 48-49). El CTA que trajeron decía reservar o agendar.

`booking_abandon` no se dispara al cerrar la pestaña. Se dispara en una visita posterior al apex, si la intención tiene más de 20 s y la ruta no es `/gracias` (`lib/analytics/booking-abandon.ts` líneas 291-347). Si la página de destino carga antes de esos 20 s, el resultado es `too_soon` y el reintento se corta: solo sigue esperando cuando falta GA4, no cuando falta edad (líneas 368-372). La cookie dura 30 minutos (líneas 8-11). Quien cierra `/reunion`, quien vuelve al día siguiente o quien no pasa de nuevo por el apex no suma abandono. Los 5 que no están en `booking_abandon` ni en `book_appointment` caben en ese silencio. También puede contar como abandono quien termina el formulario, recibe `rejected` y abre la guía del blog: es otra página del apex, más de 20 s después, y no es `/gracias`.

Antes del 3 nov el abandono medía otra cosa: volver al apex después de haber salido al widget, no abandonar un formulario.

Comprobación sin visitas al widget: en GA4, desglosar `booking_abandon` por `seconds_since_click` y por `page_path` del clic, y cruzarlo con el día (antes y después del 3 nov 16:00). No hace falta reproducir el clic en producción. El umbral de 20 s y el corte en `too_soon` se leen en el test `tests/analytics-booking-abandon.test.ts`.

### 5. Hay pasos de más en las rutas hermanas, y uno de ellos es un 404

Probabilidad media. No explica sola las 0 citas, y sí una parte de los abandonos según la puerta de entrada.

- `/contactar` responde 404 (10:38:57). La ruta real es `/contactar-agencia-de-marketing-digital`. `/contacto` hace 301 hacia ella (`middleware.ts` líneas 48-49). El botón de cabecera sigue yendo al formulario de contacto, no a la reunión (`components/HeaderClient.tsx` líneas 102-109). Ese clic es `cta_contact_click`, no `cta_reunion_click`.
- Tras el contacto, `/gracias` sin `conv=Schedule` ofrece «Cumplo estas condiciones: agendar sesión» y apunta otra vez a `/reunion` (`app/gracias/page.tsx` líneas 57-59). Quien llega del formulario de contacto se encuentra un segundo formulario, el de calificación.
- `/eshow` (200 a las 10:38:58) es el alta al boletín. No enlaza el calendario. El artículo `https://playfulagency.com/blog/otros/eshow-madrid-2026` (200 a las 10:41:33) sí: «reserva una reunión» apunta a `/reunion-playful`, que hoy es el 308 al formulario. El mismo enlace está en `lib/eshow-madrid-2026.ts` línea 241. Durante el 4 y el 5 nov esa puerta caía en la hipótesis 2.
- `/reunion/` añade un 301 y `www` un 308 antes del 200. Son un salto más, ambos rápidos (menos de 0,3 s). Poco peso al lado del formulario.
- Hasta el 3 nov a las 15:56, `/reunion-playful` esperaba hasta 3 s a que GA4 estuviera listo y entonces sustituía la página por el widget (`REUNION_PLAYFUL_REDIRECT_MAX_WAIT_MS` sigue en `lib/analytics/reunion-playful-redirect.ts` líneas 8-10, pero el middleware ya no usa ese salto). Una pantalla en blanco de hasta 3 s cabe como abandono de la primera mitad de la ventana. El 308 actual tarda 0,16 s.

La query no bloquea la reserva. `bookingHrefFromPageSearch` copia solo las claves de atribución (`utils/booking-attribution.ts` líneas 12-22 y 277-279). El 308 del 6 nov conservó `utm_source` y `utm_medium`. El `src` inicial del iframe no las lleva (`lib/calificacion/calendar-widget-url.ts` líneas 6-13); `BookingWidgetAttribution` las añade en cliente si el iframe llega a montarse. Si se pierden, se pierde la atribución del anuncio, no la cita.

Comprobación: en GA4, `cta_reunion_click` por `link_url` y por `page_path` en la ventana. Si `link_url` es `/reunion` o `/reunion-playful` y `page_path` es el artículo de eShow o `/gracias`, el paso extra es ese. No hace falta pulsar el CTA. `/contactar` ya está confirmado como 404 por el GET de las 10:38:57; no reintentar con un formulario.

### 6. El iframe recorta el calendario en el móvil

Probabilidad baja mientras las hipótesis 1 y 2 sigan en pie: solo afecta a quien ya pasó el filtro y ve el iframe.

El widget trae `iframeResizer.contentWindow.min.js`. La página padre no carga el resizer y fija la altura: en móvil `min-height: 920px` y `height: min(920px, 78vh)`; desde 768 px, 880 px (`app/reunion/reunion-calificacion.css` líneas 41-50). El `min-height` gana al `78vh`, así que el marco mide al menos 920 px. El orden del widget es calendario (posición 0) y después formulario (posición 1). El botón del widget está en inglés: «Schedule Meeting». El consentimiento de marketing del calendario está activado. Si el segundo paso no cabe y el resizer no actúa en el padre, el botón de confirmar puede quedar fuera sin scroll interno.

En `/reunion` el chat de LeadConnector se oculta (`reunion-calificacion.css` líneas 3-11). Eso no quita el calendario.

Comprobación: captura del iframe en el calendario de QA, en un deploy de preview, con un viewport de móvil, sin elegir hueco y sin enviar el formulario de producción. No abrir el calendario de producción en el navegador: una visita con JavaScript contaría en Analytics y, si se llega a confirmar, sería una reserva falsa.

## Qué no explica el pulso

- El documento del widget no está caído ni lento en estas lecturas: 200 en 0,25 s (LeadConnector) y 0,73 s (dominio antiguo), y el JS en 0,33 s.
- La query de los CTA se reenvía en el 308. No es la causa de una cita que no se crea.
- `cta_reunion_click` sí está llegando (hay 10). La espera de 300 ms (`lib/analytics/gtag-event.ts` línea 11 y `lib/analytics/cta-click.ts` líneas 185-198) no es el agujero de esta ventana.

## Orden sugerido para cerrarlas

1. GET de huecos libres del calendario de producción, sin elegir ninguno. Resuelve la hipótesis 1.
2. Lectura en GHL de citas y de contactos `calif-*` ya existentes, 30 oct–5 nov. Separa «no se pudo reservar» de «se reservó y GA4 no lo vio».
3. En GA4, `cta_reunion_click`, `booking_abandon` y vistas de `/gracias` con `conv=Schedule`, partidos el 3 nov a las 16:00 Madrid. Separa la hipótesis 2, la 3 y la 4.
4. Dejar el móvil y el 404 de `/contactar` para después. No cambian el hecho de que el calendario, cuando se sirve, publica un horario de duración cero y un gracias que no es una redirección.
