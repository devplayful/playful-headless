export const CMS_PAGINAS_B5_FROM_PAYLOAD_ENV = 'CMS_PAGINAS_B5_FROM_PAYLOAD';
export const CMS_PAGINAS_B5_PREVIEW_HEADER = 'x-cms-paginas-b5-preview';

export function isCmsPaginasB5FromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_PAGINAS_B5_FROM_PAYLOAD_ENV] === 'true';
}

export function paginasB5PayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}
