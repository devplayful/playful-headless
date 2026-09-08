# Formulario → HighLevel: contrato de Preview aislado

El Preview permanece bloqueado por defecto. Hay dos caminos aislados, ambos exclusivos de Vercel Preview:

1. **Simulador sin dependencias externas (preferido mientras `wpqa` está pausado):** `PREVIEW_CONTACT_SIMULATOR_ENABLED=true`. Valida el contrato completo y devuelve una referencia opaca junto a evidencia de Gate, correo suprimido y HighLevel simulado. No lee reCAPTCHA, no hace solicitudes de red, no escribe Redis y no contacta WordPress, correo ni HighLevel. Fuera de `VERCEL_ENV=preview` el flag se ignora.
2. **Backend aislado:** `PREVIEW_CONTACT_SUBMISSIONS_ENABLED=true`, `PREVIEW_CONTACT_BACKEND_ISOLATED=true`, `HIGHLEVEL_TEST_MODE=true` y `WORDPRESS_API_URL=https://wpqa.playfulagency.com/wp-json`.

El código rechaza cualquier otro host, HTTP, puertos no estándar, rutas distintas de `/wp-json` y cualquier entorno que no sea Preview. `HIGHLEVEL_TEST_MODE=true` usa el gateway simulado: no crea contactos, oportunidades, tareas, emails ni SMS reales.

El WordPress de `wpqa` debe ser una instalación limpia con Gate 1.1, supresor de correo y sin webhooks, cron, GTM o Site Kit. Hasta que ese endpoint no exista y esté comprobado, la respuesta de Preview es un 503 antes de leer el formulario y no contacta WordPress, correo ni HighLevel.

La prueba de simulador se considera válida si el resultado muestra `gate=simulated-validated`, `email=suppressed`, un único `simulated-upsert`, la oportunidad `simulated-consulta` solo para un lead prioritario, `storage=none` y `externalRequests=false`. La referencia opaca es determinista para el mismo `submissionId`, por lo que un reintento no puede crear una segunda oportunidad. El artefacto no devuelve nombre, correo, teléfono ni mensaje.

Rollback del simulador: poner `PREVIEW_CONTACT_SIMULATOR_ENABLED=false`; no afecta Production. La prueba E2E contra `wpqa` se considera válida solo si confirma un recibo Gate, una entrega simulada, una oportunidad simulada única y que Redis no contenga PII.
