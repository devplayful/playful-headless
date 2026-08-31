# Playful Contact Gate 1.1.0 — instalación y rollback

## Alcance

La versión 1.1.0 añade el recibo idempotente al plugin que ya autentica `POST /playful/v1/contact`. No requiere modificar `functions.php`, cambiar el secreto ni desactivar el gate. Una solicitud sin `submission_id` ni `X-Playful-Submission-Id` conserva exactamente el flujo legacy.

Cuando existe identificador, el plugin valida que cuerpo y cabecera coincidan y que el formato sea de 20–100 caracteres alfanuméricos, guion o guion bajo. El option name contiene únicamente SHA-256 del identificador; el valor contiene solo estado y timestamps, nunca nombre, email, teléfono, mensaje, secreto ni el identificador original. `autoload` permanece desactivado.

## Contrato

- Primera solicitud válida: claim atómico `processing` antes del callback.
- Callback 2xx: el plugin persiste `completed` antes de servir la respuesta y añade `X-Playful-Contact-Idempotency: v1`.
- Repetición completada: `200`, `replayed: true`, sin ejecutar el callback.
- Solicitud concurrente o estado incierto: `409`, `Retry-After: 1`, sin ejecutar el callback.
- Rechazo 4xx determinista: libera el claim para una corrección manual.
- Timeout, 408/409/425/429, 5xx o respuesta no interpretable: conserva el claim; no presume que el callback careció de efectos.
- Cada generación se limpia tras siete días mediante WP-Cron. La limpieza comprueba `created_at`, por lo que un evento antiguo no puede borrar otra generación.

## Instalación WP-first

1. Guardar una copia identificada del archivo activo de Playful Contact Gate 1.0.1 y un respaldo de base de datos. No cambiar el secreto ni la opción de enforcement.
2. Sustituir únicamente el archivo del plugin por `wordpress-contact-gate.php` 1.1.0. Mantener el plugin activo.
3. Validar sintaxis PHP en el hosting y comprobar que WordPress sigue mostrando el plugin activo y el secreto configurado. No copiar código adicional a `functions.php`.
4. Confirmar que un POST directo sin credencial sigue devolviendo `403 playful_contact_gate_forbidden`.
5. En una prueba expresamente autorizada, enviar un identificador nuevo y confirmar `200` con `X-Playful-Contact-Idempotency: v1`; repetir el mismo identificador y confirmar `200`, `replayed: true` y un solo correo.
6. Solo después de esa evidencia, establecer `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=true` en el entorno Next.js correspondiente. Hasta entonces debe permanecer `false`.

La instalación del plugin no activa HighLevel, no cambia reCAPTCHA y no envía ninguna comunicación por sí sola. Las comprobaciones de los pasos 4–5 se realizan únicamente dentro de una ventana autorizada.

## Rollback

1. Primero establecer `WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED=false` en Next.js. Esto devuelve el cliente a un único intento y evita confiar en un recibo que WordPress ya no serviría.
2. Restaurar el archivo respaldado de Playful Contact Gate 1.0.1. No modificar el secreto ni el enforcement.
3. Confirmar que el acceso directo continúa en `403` y que el flujo autenticado legacy conserva su comportamiento anterior.
4. No borrar los options `playful_contact_receipt_*` durante el rollback. Son inertes, no contienen PII ni secretos y constituyen evidencia para reconciliar entregas inciertas. Su retirada posterior requiere una decisión separada; al mantener 1.1.0, WP-Cron los limpia a los siete días.

El rollback no requiere editar `functions.php`, cambiar DNS, tocar correos ni eliminar respaldos.
