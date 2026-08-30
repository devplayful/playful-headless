# Formulario → HighLevel: paquete Preview

## Garantías del paquete

- `HIGHLEVEL_ENABLED=false` es el valor predeterminado. Sin activación explícita, el formulario conserva la entrega autenticada a WordPress y no llama a HighLevel.
- `HIGHLEVEL_TEST_MODE=true` sustituye el cliente remoto por un simulador sin red. Permite verificar el flujo en Preview sin crear contactos, oportunidades o tareas reales.
- LeadConnector External Tracking se mantiene en todo el sitio excepto `/contactar-agencia-de-marketing-digital`, porque su comportamiento documentado autocaptura cualquier `<form>` DOM antes de reCAPTCHA y del backend. El widget de chat usa un cargador separado y permanece activo también en esa ruta. Impacto aceptado para Preview: HighLevel no recibe el page-view nativo de esa única página; el resto del sitio conserva tracking.
- La integración real usa únicamente variables de servidor. Los tokens, IDs internos, email, teléfono, nombre y mensaje nunca se envían a GA4/GTM ni vuelven en la respuesta del navegador.
- `generate_lead` se añade a `dataLayer` solo después de que la API confirme el flujo exitoso. El evento contiene únicamente `event` y `form_id`.
- Cada envío conserva un `submissionId` durante los reintentos. En el servidor solo se guarda su hash SHA-256.
- El estado de entrega y los checkpoints CRM usan un almacén Redis-compatible duradero. No existe un fallback en memoria para producción.
- Antes de llamar a WordPress, Next.js persiste `delivery_pending`. Un timeout, fallo de transporte o 5xx pasa a `delivery_uncertain`; ambos estados bloquean cualquier reentrega durante el TTL, incluso después de vencer el lease corto. Solo un rechazo 4xx determinista elimina la reserva para permitir un intento corregido.
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

Si WordPress puede haber procesado el POST pero la respuesta no llega, la API devuelve `202 Pending Confirmation`: no afirma éxito final, no emite `generate_lead` y pide expresamente no reenviar. El navegador conserva el mismo `submissionId` en `sessionStorage`, por lo que una repetición o recarga consulta el recibo durable en lugar de generar otra entrega. Redis solo conserva el hash del identificador y el estado; nunca PII.

Si HighLevel falla después del paso 5, un reintento retoma el CRM sin volver a enviar WordPress. El endpoint WordPress incluido en este paquete acepta `submission_id`, conserva un recibo durante siete días y responde de forma idempotente a reintentos. El cliente servidor solo reintenta timeouts y respuestas transitorias cuando `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=true`.

El despliegue debe hacerse en este orden: (1) instalar primero el endpoint WordPress con recibos; (2) configurar el almacén durable `CONTACT_IDEMPOTENCY_*`; (3) desplegar Next.js, que ya envía `submission_id` pero mantiene los reintentos desactivados; (4) verificar en una prueba autorizada que WordPress responde con `X-Playful-Contact-Idempotency: v1`; y solo entonces (5) activar `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=true`. Activar la variable antes de actualizar WordPress puede duplicar correos ante un timeout.

## Estado de decisiones antes de activar

Resuelto en HighLevel:

- Pipeline canónico `D2C`, etapa `Consulta`, responsable José Reyes y SLA de referencia de 24 horas.
- Doce campos de atribución agrupados en `GTM Web` y etiqueta `website-inbound`.
- Seis prospectos fríos preservados en el pipeline legado y en una Smart List sin comunicaciones.

Pendiente antes de activar el flag en Preview:

1. Proporcionar un almacén Redis-compatible duradero y sin coste confirmado para Preview y producción. Es obligatorio para la reserva de entrega aunque `HIGHLEVEL_ENABLED=false`.
2. Crear un token de integración privada de subcuenta con los permisos mínimos de contactos, oportunidades, etiquetas y tareas.
3. Confirmar en HighLevel el orden de deduplicación por email/teléfono de la ubicación. La API de upsert respeta esa configuración de la subcuenta.
4. Configurar las variables únicamente en Preview, ejecutar un envío sintético y obtener revisión independiente.
5. Mantener el comportamiento actual de reintento si CRM falla después de la entrega; la idempotencia evita repetir una entrega ya confirmada.
6. Completar la auditoría de workflows y automatizaciones descrita en `docs/highlevel-workflow-audit.md`; no activar si cualquiera de las cuatro mutaciones puede enrolar un contacto o producir comunicaciones.
7. Verificar en el DOM y Network de Preview que `external-tracking.js` no carga en la ruta de contacto, que el loader del chat sí carga y que una navegación cliente desde/hacia esa ruta elimina/restaura solo External Tracking. Después de esa evidencia se puede establecer `HIGHLEVEL_CONTACT_FORM_AUTOCAPTURE_DISABLED=true`; mientras sea falso, `HIGHLEVEL_ENABLED=true` falla cerrado.

No se incluyen secretos ni IDs inventados, y este paquete no migra ni elimina oportunidades existentes.
