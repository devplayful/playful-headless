# Evidencia de ejecución: D2C y formulario → HighLevel

Fecha: 30 de agosto de 2026 (Europe/Madrid)

## Estado seguro

- La integración permanece desactivada por defecto (`HIGHLEVEL_ENABLED=false`).
- No se creó ningún contacto de prueba, no se activaron workflows y no se enviaron emails ni SMS.
- La rama local rebasada es `codex/highlevel-preview` y la rama remota limpia es `codex/highlevel-preview-v2`, ambas sobre `main` `a108e17`. La integración sigue sin merge ni activación productiva.

## Preservación del legado

- Ubicación HighLevel: `3sc1AO5Eju01llYk7Qpr`.
- Pipeline legado: `Z1LJMEK3hq9xdHR5F44n`, renombrado a `D2C LEGACY - prospeccion fria (no usar)`.
- Las seis oportunidades abiertas y su historial permanecen en el pipeline legado.
- Export: `/Users/josemreyes/Downloads/opportunities.csv`.
- SHA-256 del export: `61653a6ff1c3e66aeb2aecb3732dd101e8c8534d00a387a078d94c8812d52e9c`.
- Smart List: `Prospección fría — D2C legado (sin comunicaciones)` (`I2IO1LGYW0BkvTPcSvwc`), con seis contactos.

## Pipeline canónico

- Pipeline `D2C`: `zXzvEbbEaOQqftHWZwoz`.
- `Consulta` (10%): `42c02b84-2fc8-43c8-910f-268d00eb9fa0`.
- `Lead cualificado` (25%): `7a7d1c2b-a7d1-49c2-8db9-91ba104b2ba5`.
- `Reunión` (40%): `8f169c68-2d07-47ca-83e4-e8d18fa3edb3`.
- `Oportunidad` (60%): `3d2e3490-0bdd-4c88-96af-35b26ac59df6`.
- `Propuesta` (80%): `612569d1-4421-4083-b514-c606c7360164`.
- `Ganada` (100%): `c2c76fdc-f425-43db-86b3-f7707a347f98`.
- `Perdida` (0%): `7fbf1cab-05a0-43ab-a576-eb95fc794c98`.

## Campos de contacto

Los doce campos se agrupan en `GTM Web` y son de una sola línea para aceptar los valores normalizados del cliente server-only.

| Clave de configuración | Campo HighLevel | ID |
|---|---|---|
| `original_source` | Fuente original | `46rGGZIFjF6IjhFsgQkf` |
| `original_landing` | Landing original | `2XsX7DX5qprcs9cdq9FK` |
| `recent_source` | Fuente reciente | `22lwTrSD9NksHKfS05zG` |
| `recent_landing` | Landing reciente | `l4fC4ROH3LmUWOdF721y` |
| `utm_source` | UTM Source | `EVlAYyVaPU4jEwaYWObB` |
| `utm_medium` | UTM Medium | `CwCqIkbM3SyBBMOgMgEa` |
| `utm_campaign` | UTM Campaign | `HVF30jCmKSNs5d6vsPMn` |
| `utm_term` | UTM Term | `pWSxH0iQTVzmHRKlIado` |
| `utm_content` | UTM Content | `0l2W9ngKGz6BZ0gNmFXW` |
| `form_id` | ID de formulario | `re4FCksKLMnVqJMhiYYA` |
| `privacy_consent_at` | Consentimiento privacidad (fecha/hora) | `Fj462mI3xgCgSGRIOxYc` |
| `marketing_consent` | Consentimiento marketing | `H0XhGufYmNDBO3ggoUtU` |

- Etiqueta creada: `website-inbound`.
- Responsable disponible recomendado: José Reyes (`lfR8hYL6QnMfuzDciXcg`).
- El paquete usa una tarea `Responder consulta web` como siguiente acción. El valor de referencia probado para el SLA es 24 horas.

## Pruebas

- Commits funcionales locales rebasados: `7733317`, `0726ef6` y `1af9229`.
- TypeScript: correcto.
- Pruebas HighLevel: 10/10 correctas.
- La prueba integrada confirma entrega única, reintento idempotente, simulación CRM sin red y ausencia de nombre, email y teléfono en Redis.
- La compilación previa del paquete funcional terminó correctamente; las respuestas 500 observadas procedían del WordPress externo y no de este paquete.

## Activación y rollback

La activación queda bloqueada hasta disponer de una integración privada de HighLevel con alcance mínimo para contactos, oportunidades, etiquetas y tareas; un Redis REST duradero sin coste confirmado; y variables exclusivas de Preview. No se deben guardar secretos en Git.

Rollback inmediato: fijar `HIGHLEVEL_ENABLED=false`. Esto conserva la entrega autenticada a WordPress y evita llamadas a HighLevel. El pipeline legado, el export y la Smart List permiten recuperar o revisar los seis prospectos sin migrarlos ni borrarlos. Los commits locales pueden revertirse sin afectar HighLevel porque aún no se han publicado.
