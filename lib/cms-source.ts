/**
 * Fuente de contenido para la migración CMS.
 * Por defecto WordPress (producción). Solo con CMS_SOURCE=new se lee el snapshot en git.
 */
export type CmsSource = 'wp' | 'new';

export function getCmsSource(): CmsSource {
  const raw = (process.env.CMS_SOURCE || 'wp').trim().toLowerCase();
  return raw === 'new' ? 'new' : 'wp';
}

export function useNewCmsSource(): boolean {
  return getCmsSource() === 'new';
}
