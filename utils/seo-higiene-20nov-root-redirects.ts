import seoCruce2810Redirects from './seo-cruce-2810-redirect-map.json' with { type: 'json' };

/** Seven apex slugs from SEO higiene 20 nov — inlined into middleware merge for one-hop HTTP 301. */
export const SEO_HIGIENE_20NOV_ROOT_PATHS = Object.freeze([
  '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/cintillos-de-promocion',
  '/que-es-una-agencia-de-sem',
  '/publicidad-digital-en-tu-negocio',
  '/premios-cima-2026-soytechno-playful',
  '/los-5-problemas-de-e-commerce',
  '/actualizar-tu-e-commerce',
] as const);

export const SEO_HIGIENE_20NOV_ROOT_301: Record<string, string> = Object.freeze(
  Object.fromEntries(
    SEO_HIGIENE_20NOV_ROOT_PATHS.map((path) => {
      const dest = seoCruce2810Redirects[path];
      if (!dest) {
        throw new Error(`seo-higiene root redirect missing in map: ${path}`);
      }
      return [path, dest];
    }),
  ),
);