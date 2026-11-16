export const CMS_EQUIPO_FROM_PAYLOAD_ENV = 'CMS_EQUIPO_FROM_PAYLOAD';

export function isCmsEquipoFromPayload(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[CMS_EQUIPO_FROM_PAYLOAD_ENV] === 'true';
}

export function shouldRenderEquipoFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsEquipoFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}