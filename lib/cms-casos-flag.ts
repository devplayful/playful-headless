/**
 * Flag único para leer /casos-de-exito/[slug] desde Payload
 * (Jumex, Odwalla y SoyTechno). Apagado = comportamiento actual:
 * WordPress para Jumex/Odwalla y SoyTechnoCaseStudy hardcodeado.
 */
export const CMS_CASOS_FROM_PAYLOAD_ENV = 'CMS_CASOS_FROM_PAYLOAD';

export function isCmsCasosFromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_CASOS_FROM_PAYLOAD_ENV] === 'true';
}
