# Formulario → HighLevel: contrato de Preview aislado

El Preview permanece bloqueado por defecto. Para habilitar una prueba aislada, Vercel debe contener **solo en Preview**: `PREVIEW_CONTACT_SUBMISSIONS_ENABLED=true`, `PREVIEW_CONTACT_BACKEND_ISOLATED=true`, `HIGHLEVEL_TEST_MODE=true` y `WORDPRESS_API_URL=https://wpqa.playfulagency.com/wp-json`.

El código rechaza cualquier otro host, HTTP, puertos no estándar, rutas distintas de `/wp-json` y cualquier entorno que no sea Preview. `HIGHLEVEL_TEST_MODE=true` usa el gateway simulado: no crea contactos, oportunidades, tareas, emails ni SMS reales.

El WordPress de `wpqa` debe ser una instalación limpia con Gate 1.1, supresor de correo y sin webhooks, cron, GTM o Site Kit. Hasta que ese endpoint no exista y esté comprobado, la respuesta de Preview es un 503 antes de leer el formulario y no contacta WordPress, correo ni HighLevel.

La prueba E2E se considera válida solo si confirma un recibo Gate, una entrega simulada, una oportunidad simulada única y que Redis no contenga PII. Rollback: poner `PREVIEW_CONTACT_SUBMISSIONS_ENABLED=false`; no afecta Production.
