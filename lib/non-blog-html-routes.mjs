const HTML_ROUTE_PATTERN = /^\/[a-z0-9-/]*$/i;

function isHtmlPageRoute(route) {
  if (!route || typeof route !== 'string') return false;
  if (!HTML_ROUTE_PATTERN.test(route)) return false;
  if (route.includes('[')) return false;
  if (route.startsWith('/blog')) return false;
  if (route.startsWith('/api/')) return false;
  if (/\.(ico|png|svg|xml|txt|webmanifest)$/i.test(route)) return false;
  return true;
}

/**
 * HTML document routes from config/expected-routes.json, excluding blog and assets.
 */
export function nonBlogHtmlRoutesFromManifest(manifest) {
  const routes = new Set();

  for (const route of manifest.sourceRoutes ?? []) {
    if (isHtmlPageRoute(route)) routes.add(route);
  }

  for (const [template, concretes] of Object.entries(manifest.governedConcreteRoutes ?? {})) {
    if (String(template).startsWith('/blog')) continue;
    for (const route of concretes ?? []) {
      if (isHtmlPageRoute(route)) routes.add(route);
    }
  }

  return [...routes].sort((a, b) => a.localeCompare(b, 'en'));
}
