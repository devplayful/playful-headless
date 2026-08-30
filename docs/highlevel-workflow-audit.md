# Auditoría previa de automatizaciones HighLevel

Objetivo: demostrar, antes de activar la integración real, que **upsert de contacto**, **adición de `website-inbound`**, **creación/reutilización de oportunidad en D2C/Consulta** y **creación de tarea** no inscriben al contacto en un workflow existente ni generan efectos secundarios. Esta revisión no se ha ejecutado contra HighLevel desde el repositorio.

## Inventario que se debe exportar o capturar

Para cada workflow de la subcuenta, incluidos borradores y publicados, registrar:

- ID, nombre, carpeta, estado, versión publicada, fecha de última edición y propietario.
- Trigger, filtros del trigger, permiso de reentrada y ventanas horarias.
- Todas las acciones, ramas y objetivos de `Go To`, incluidas acciones que invocan otro workflow.
- Historial de ejecuciones/enrolamientos y contactos actualmente activos o en espera.

Revisar además campañas, triggers heredados, recetas/snapshots instalados, Conversation AI, webhooks y automatizaciones de calendario que puedan operar fuera del listado principal de Workflows.

## Triggers que requieren inspección explícita

Buscar tanto coincidencias exactas como reglas sin filtro o con filtro amplio:

- `Contact Created`, `Contact Changed` y cambios en cualquiera de los 12 campos `GTM Web`.
- `Tag Added`, en especial `website-inbound`, y condiciones que acepten cualquier etiqueta.
- `Opportunity Created/Added`, `Opportunity Changed`, cambios de status o stage, pipeline `D2C` y etapa `Consulta`.
- `Task Added/Created` o reglas basadas en tareas pendientes.
- Triggers derivados que puedan cumplirse después del upsert: Smart Lists, segmentos, campos vacíos/no vacíos, responsable, fuente, UTM o consentimiento.

En cada workflow alcanzable, identificar acciones con impacto externo o mutaciones encadenadas: email, SMS, WhatsApp, llamadas, voicemail, anuncios/audiencias, webhooks, notificaciones, asignación, alta en campaña, add/remove tag, update contact, create/update opportunity, create task y alta en otro workflow.

## Configuración y datos que condicionan la prueba

- Política de deduplicación de contactos por email y teléfono, incluida la prioridad cuando cada dato coincide con contactos distintos.
- IDs reales de ubicación, pipeline D2C, etapa Consulta, propietario, etiqueta y los 12 campos personalizados; confirmar que no proceden de otra subcuenta.
- Usuario/responsable predeterminado, zona horaria y SLA.
- Proveedores y números de envío conectados (email, SMS, WhatsApp/telefonía) y límites de envío.
- Contactos existentes que ya tengan `website-inbound`, oportunidades abiertas duplicadas o tareas con marcadores `[playful-submission:…]`.
- Integraciones privadas, webhooks y aplicaciones con capacidad de reaccionar a cambios de contacto u oportunidad.

## Prueba controlada y criterio de aprobación

Usar preferentemente una subcuenta sandbox clonada sin canales de envío. Si se debe probar en la subcuenta real, pausar primero cualquier automatización candidata y usar email/teléfono sintéticos controlados.

Ejecutar por separado y con un identificador de prueba único:

1. Upsert de contacto nuevo.
2. Reintento del mismo upsert y upsert de un contacto existente con atribución original ya informada.
3. Adición de `website-inbound` dos veces.
4. Creación de oportunidad D2C/Consulta y repetición de búsqueda/reutilización.
5. Creación de tarea con marcador y recuperación después de simular respuesta perdida.

Capturar antes y después: historial/audit log del contacto, enrolamientos y execution logs de workflows, Conversations y mensajes salientes, tags, campos, oportunidades, tareas, webhooks recibidos y cambios de responsable.

La activación solo se aprueba si en cada operación hay **cero enrolamientos inesperados, cero mensajes o llamadas, cero webhooks no previstos y cero mutaciones fuera del contacto/oportunidad/tarea esperados**. Con evidencia incompleta, mantener `HIGHLEVEL_ENABLED=false`.

## Evidencia mínima para revisión

- Export o capturas fechadas del inventario y definición de cada workflow candidato.
- Matriz `operación → triggers evaluados → enrolamientos → efectos`, aun cuando todos sean cero.
- IDs de los registros sintéticos y timestamps para correlacionar audit logs, sin copiar PII real al repositorio.
- Nombre de quien revisa y quien aprueba, fecha, entorno y versión de workflows auditada.
