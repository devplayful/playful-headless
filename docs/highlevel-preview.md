# Formulario → HighLevel: paquete Preview

## Garantías del paquete

- `HIGHLEVEL_ENABLED=false` es el valor predeterminado. Sin activación explícita, el formulario conserva la entrega autenticada a WordPress y no llama a HighLevel.
- `HIGHLEVEL_TEST_MODE=true` sustituye el cliente remoto por un simulador sin red. Permite verificar el flujo en Preview sin crear contactos, oportunidades o tareas reales.
- La integración real usa únicamente variables de servidor. Los tokens, IDs internos, email, teléfono, nombre y mensaje nunca se envían a GA4/GTM ni vuelven en la respuesta del navegador.
- `generate_lead` se añade a `dataLayer` solo después de que la API confirme el flujo exitoso. El evento contiene únicamente `event` y `form_id`.
- Cada envío conserva un `submissionId` durante los reintentos. En el servidor solo se guarda su hash SHA-256.
- El estado de entrega y los checkpoints CRM usan un almacén Redis-compatible duradero. No existe un fallback en memoria para producción.
- Los leases de procesamiento son claves separadas y breves (30 segundos por defecto); el estado final conserva el TTL largo (7 días por defecto). Un proceso caído deja de bloquear los reintentos cuando vence su lease sin borrar el último checkpoint. La configuración rechaza un lease que no cubra dos requests CRM más el checkpoint Redis.
- HighLevel recibe `createNewIfDuplicateAllowed=false`. La búsqueda y creación de oportunidad se serializa con un lease compartido por contacto y pipeline. Solo se crea una oportunidad en `Consulta` si no existe ninguna.
- Una oportunidad existente no se mueve ni se degrada. Si aparecen dos o más oportunidades abiertas, el flujo se detiene para revisión manual.
- El primer origen y landing se completan campo a campo solo cuando el valor actual está vacío, también para contactos existentes. Nunca se incluyen en el upsert, por lo que un reintento no los sobrescribe. El origen reciente, UTM, landing, formulario y consentimientos se actualizan en cada consulta confirmada.
- Se añade una etiqueta de entrada web sin reemplazar las etiquetas existentes y se crea una siguiente acción con responsable y vencimiento SLA. La tarea lleva un marcador determinista del envío; si se pierde la respuesta de creación, el lease se conserva hasta expirar y el siguiente reintento la encuentra antes de intentar crear otra. La misma espera protege la reconciliación de una creación de oportunidad con respuesta incierta.

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

Si HighLevel falla después del paso 5, un reintento retoma el CRM sin volver a enviar WordPress. Si el proceso cae exactamente después de que WordPress acepta el mensaje y antes de guardar el paso 5, el endpoint WordPress actual no permite demostrar entrega exactamente-una-vez; cerrar ese último margen requiere que WordPress acepte y deduplique también `submissionId`.

## Estado de decisiones antes de activar

Resuelto en HighLevel:

- Pipeline canónico `D2C`, etapa `Consulta`, responsable José Reyes y SLA de referencia de 24 horas.
- Doce campos de atribución agrupados en `GTM Web` y etiqueta `website-inbound`.
- Seis prospectos fríos preservados en el pipeline legado y en una Smart List sin comunicaciones.

Pendiente antes de activar el flag en Preview:

1. Proporcionar un almacén Redis-compatible duradero y sin coste confirmado para Preview y producción.
2. Crear un token de integración privada de subcuenta con los permisos mínimos de contactos, oportunidades, etiquetas y tareas.
3. Confirmar en HighLevel el orden de deduplicación por email/teléfono de la ubicación. La API de upsert respeta esa configuración de la subcuenta.
4. Configurar las variables únicamente en Preview, ejecutar un envío sintético y obtener revisión independiente.
5. Mantener el comportamiento actual de reintento si CRM falla después de la entrega; la idempotencia evita repetir una entrega ya confirmada.
6. Completar la auditoría de workflows y automatizaciones descrita en `docs/highlevel-workflow-audit.md`; no activar si cualquiera de las cuatro mutaciones puede enrolar un contacto o producir comunicaciones.

No se incluyen secretos ni IDs inventados, y este paquete no migra ni elimina oportunidades existentes.
