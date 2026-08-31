# Formulario → HighLevel: paquete Preview

## Garantías del paquete

- `CONTACT_PIPELINE_ENABLED=false` es el rollback predeterminado y no depende de Redis: realiza un solo intento autenticado a WordPress, no llama a HighLevel y nunca reenvía automáticamente. `HIGHLEVEL_ENABLED=false` apaga únicamente CRM cuando el pipeline duradero sí está activo.
- `HIGHLEVEL_TEST_MODE=true` sustituye el cliente remoto por un simulador sin red. Permite verificar el flujo en Preview sin crear contactos, oportunidades o tareas reales.
- LeadConnector External Tracking queda desactivado globalmente por defecto, porque su comportamiento documentado autocaptura cualquier `<form>` DOM antes de reCAPTCHA y del backend. Retirar el elemento al navegar no elimina listeners ya registrados, por lo que una exclusión solo por pathname no es segura. El widget de chat usa un cargador separado y permanece activo. Impacto temporal: HighLevel no recibe page-views nativos mientras el flag está apagado; GA4/GTM no cambia.
- La integración real usa únicamente variables de servidor. Los tokens, IDs internos, email, teléfono, nombre y mensaje nunca se envían a GA4/GTM ni vuelven en la respuesta del navegador.
- `generate_lead` se añade a `dataLayer` solo después de que la API confirme el flujo exitoso. El evento contiene únicamente `event` y `form_id`.
- Cada envío conserva un `submissionId` durante las comprobaciones. Redis guarda únicamente hashes SHA-256 del identificador y del contenido normalizado; si una recarga intenta reutilizar el identificador con valores distintos, el servidor exige iniciar una solicitud nueva.
- Con `CONTACT_PIPELINE_ENABLED=true`, el estado de entrega y los checkpoints CRM usan un almacén Redis-compatible duradero. No existe un fallback en memoria.
- Antes de llamar a WordPress, Next.js persiste `delivery_pending`. Un timeout, fallo de transporte o 5xx pasa a `delivery_uncertain`; ambos estados bloquean cualquier reentrega. Una comprobación manual consulta el endpoint sin efectos secundarios `/playful/v1/contact-receipt`: `completed` reanuda CRM sin correo nuevo, `processing` conserva el estado y `missing` libera la reserva para que el usuario inicie explícitamente otra solicitud. Solo un rechazo 4xx determinista elimina la reserva durante el primer intento.
- Los leases de procesamiento son claves separadas y breves (30 segundos por defecto); el estado final conserva el TTL largo (7 días por defecto). Un proceso caído deja de bloquear los reintentos cuando vence su lease sin borrar el último checkpoint. La configuración exige que el lease cubra el tramo más largo entre entrega WordPress o dos requests CRM, además del checkpoint Redis y un margen de seguridad.
- HighLevel recibe `createNewIfDuplicateAllowed=false`. La búsqueda y creación de oportunidad se serializa con un lease compartido por contacto y pipeline. Solo se crea una oportunidad en `Consulta` si no existe ninguna.
- Una oportunidad existente no se mueve ni se degrada. Si aparecen dos o más oportunidades abiertas, el flujo se detiene para revisión manual.
- El primer origen y landing se completan campo a campo solo cuando el valor actual está vacío, también para contactos existentes. Nunca se incluyen en el upsert y la secuencia lectura/escritura/checkpoint usa un lease compartido por contacto, por lo que dos fuentes concurrentes no pueden sobrescribirse. El origen reciente, UTM, landing, formulario y consentimientos se actualizan en cada consulta confirmada.
- Se añade una etiqueta de entrada web sin reemplazar las etiquetas existentes y se crea una siguiente acción con responsable y vencimiento SLA. La tarea lleva un marcador determinista del envío. Para oportunidad, tarea y atribución original, los resultados 5xx, de transporte o de parseo se consideran inciertos y conservan el lease hasta poder reconciliar; solo un 4xx confirma un rechazo determinista. El lease también se conserva si la creación remota se confirma pero falla su checkpoint Redis.

## Secuencia

1. Validación y consentimiento de privacidad obligatorio.
2. Verificación reCAPTCHA cerrada ante fallos.
3. Reserva duradera del identificador del envío.
4. Entrega autenticada a WordPress.
5. Confirmación duradera de la entrega.
6. Upsert del contacto y checkpoint del ID devuelto.
7. Lectura y relleno condicional de atribución original; checkpoint.
8. Adición idempotente de etiqueta; checkpoint.
9. Bajo exclusión mutua por contacto/pipeline, búsqueda y reutilización o creación en `Consulta`; checkpoint.
10. Bajo exclusión mutua por contacto/envío, búsqueda por marcador o creación de la tarea SLA; checkpoint.
11. Confirmación final durable, respuesta al navegador y emisión de `generate_lead` sin PII.

Si WordPress puede haber procesado el POST pero la respuesta no llega, la API devuelve `202 Pending Confirmation`: no afirma éxito final ni emite `generate_lead`. El navegador mantiene bloqueados los valores originales, reinicia el challenge consumido y ofrece dos acciones manuales: comprobar el recibo sin reenviar o iniciar una solicitud distinta con un identificador nuevo. No existe polling ni reenvío automático. Redis solo conserva el hash del identificador y el estado; nunca PII.

Si HighLevel falla después del paso 5, una comprobación manual retoma CRM sin volver a enviar WordPress. Playful Contact Gate 1.1.0 acepta `submission_id`, conserva un recibo sin PII durante siete días, expone la consulta autenticada sin efectos secundarios y responde idempotentemente antes o después del callback existente. No requiere editar `functions.php`. Next exige `X-Playful-Contact-Idempotency: v1` antes de aceptar cualquier 2xx; cuando los reintentos están activos, realiza además un preflight inicial y vuelve a consultar el recibo antes de cada segundo intento, exigiendo el protocolo en cada respuesta. Si falta, falla antes de escribir o conserva el resultado como incierto sin reintentar.

El despliegue debe hacerse en este orden: (1) actualizar primero Playful Contact Gate a 1.1.0 siguiendo `docs/wordpress-contact-gate-idempotency.md`; (2) comprobar que el endpoint directo sigue en 403 y que una consulta de recibo inexistente devuelve 404 + `X-Playful-Contact-Idempotency: v1`; (3) desplegar Next.js con `CONTACT_PIPELINE_ENABLED=false`, `HIGHLEVEL_ENABLED=false` y reintentos apagados; (4) configurar el almacén durable `CONTACT_IDEMPOTENCY_*`; (5) activar `CONTACT_PIPELINE_ENABLED=true`; (6) ejecutar la prueba controlada de recibo/entrega; y solo entonces (7) activar `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=true`. El preflight runtime impide iniciar un envío con reintentos si la capacidad 1.1.0 no está disponible.

## Estado de decisiones antes de activar

Resuelto en HighLevel:

- Pipeline canónico `D2C`, etapa `Consulta`, responsable José Reyes y SLA de referencia de 24 horas.
- Doce campos de atribución agrupados en `GTM Web` y etiqueta `website-inbound`.
- Seis prospectos fríos preservados en el pipeline legado y en una Smart List sin comunicaciones.

Pendiente antes de activar el flag en Preview:

1. Proporcionar un almacén Redis-compatible duradero y sin coste confirmado para Preview y producción. Es obligatorio solo cuando `CONTACT_PIPELINE_ENABLED=true`; el rollback permanece operativo sin Redis.
2. Crear un token de integración privada de subcuenta con los permisos mínimos de contactos, oportunidades, etiquetas y tareas.
3. Confirmar en HighLevel el orden de deduplicación por email/teléfono de la ubicación. La API de upsert respeta esa configuración de la subcuenta.
4. Configurar las variables únicamente en Preview, ejecutar un envío sintético y obtener revisión independiente.
5. Mantener el comportamiento actual de reintento si CRM falla después de la entrega; la idempotencia evita repetir una entrega ya confirmada.
6. Completar la auditoría de workflows y automatizaciones descrita en `docs/highlevel-workflow-audit.md`; no activar si cualquiera de las cuatro mutaciones puede enrolar un contacto o producir comunicaciones.
7. Mantener `NEXT_PUBLIC_HIGHLEVEL_EXTERNAL_TRACKING_ENABLED=false` hasta desactivar globalmente **Form Submissions** en HighLevel. Verificar después, incluida navegación SPA, que el loader del chat permanece, que no aparece `external_form_submission` y que los page-views vuelven sin autocaptura. Solo con esa evidencia se pueden establecer `HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED=true` y, si se desea recuperar page-views, `NEXT_PUBLIC_HIGHLEVEL_EXTERNAL_TRACKING_ENABLED=true`; mientras la confirmación del servidor sea falsa, `HIGHLEVEL_ENABLED=true` falla cerrado.

No se incluyen secretos ni IDs inventados, y este paquete no migra ni elimina oportunidades existentes.

## Rollback por capas

1. `HIGHLEVEL_ENABLED=false`: detiene nuevas mutaciones CRM; la entrega duradera y Redis siguen activos.
2. `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=false`: detiene reintentos automáticos; Next sigue exigiendo el header v1 para aceptar un 2xx.
3. `CONTACT_PIPELINE_ENABLED=false`: desactiva Redis y CRM, conserva un solo intento WordPress y el estado neutral ante timeout. External Tracking permanece apagado y Gate 1.1.0 permanece instalado.
4. Ante una regresión del handler o del frontend, redeploy exacto de la versión productiva anterior. Gate 1.0.1 solo puede restaurarse después de ese redeploy; el flag por sí solo no elimina la dependencia del header v1. Conservar los recibos existentes.
