import { canonicalForPath } from './canonical.ts';
import { ORGANIZATION_SCHEMA } from './organization-schema.mjs';

export const AGENCIA_UX_UI_SLUG = 'agencia-ux-ui';
export const AGENCIA_UX_UI_PATH = '/agencia-ux-ui';

/** Stable schema labels — Service NAME/TYPE from LISTA-WEB; breadcrumbName when they differ. */
export const AGENCIA_UX_UI_SERVICE = Object.freeze({
  slug: AGENCIA_UX_UI_SLUG,
  path: AGENCIA_UX_UI_PATH,
  name: 'Agencia UX/UI',
  breadcrumbName: 'Agencia UX/UI',
  serviceType: 'Diseño UX/UI',
});

/**
 * Sitemap service landings that emit Service + BreadcrumbList.
 * Service names follow LISTA-WEB; breadcrumbs use breadcrumbName.
 */
export const SERVICE_LANDING_SCHEMAS = Object.freeze({
  'agencia-ux-ui': AGENCIA_UX_UI_SERVICE,
  'agencia-seo': Object.freeze({
    slug: 'agencia-seo',
    path: '/agencia-seo',
    name: 'Agencia SEO',
    breadcrumbName: 'Agencia SEO',
    serviceType: 'SEO',
  }),
  'agencia-sem': Object.freeze({
    slug: 'agencia-sem',
    path: '/agencia-sem',
    name: 'Agencia SEM',
    breadcrumbName: 'Agencia SEM',
    serviceType: 'SEM',
  }),
  'agencia-diseno-web': Object.freeze({
    slug: 'agencia-diseno-web',
    path: '/agencia-diseno-web',
    name: 'Agencia diseño web',
    breadcrumbName: 'Agencia diseño web',
    serviceType: 'Web design',
  }),
  'agencia-e-commerce': Object.freeze({
    slug: 'agencia-e-commerce',
    path: '/agencia-e-commerce',
    name: 'Agencia ecommerce para venta directa',
    breadcrumbName: 'Agencia e-commerce',
    serviceType: 'E-commerce',
  }),
  'agencia-shopify': Object.freeze({
    slug: 'agencia-shopify',
    path: '/agencia-shopify',
    name: 'Agencia Shopify para marcas que ya venden',
    breadcrumbName: 'Agencia Shopify',
    serviceType: 'Shopify',
  }),
});

export type ServiceLandingSlug = keyof typeof SERVICE_LANDING_SCHEMAS;

export function isServiceLandingSlug(slug: string): slug is ServiceLandingSlug {
  return Object.prototype.hasOwnProperty.call(SERVICE_LANDING_SCHEMAS, slug);
}

export function getServiceLandingSchema(slug: string) {
  return isServiceLandingSlug(slug) ? SERVICE_LANDING_SCHEMAS[slug] : null;
}

export function buildServiceJsonLd(input: {
  name: string;
  path: string;
  serviceType: string;
  description?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: canonicalForPath(input.path),
    serviceType: input.serviceType,
    provider: {
      '@type': 'Organization',
      '@id': ORGANIZATION_SCHEMA['@id'],
      name: ORGANIZATION_SCHEMA.name,
      url: ORGANIZATION_SCHEMA.url,
    },
  };
}

export function buildBreadcrumbTrailJsonLd(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path.startsWith('http') ? crumb.path : canonicalForPath(crumb.path),
    })),
  };
}

export function buildBreadcrumbListJsonLd(input: {
  name: string;
  path: string;
}): Record<string, unknown> {
  return buildBreadcrumbTrailJsonLd([
    { name: 'Inicio', path: '/' },
    { name: input.name, path: input.path },
  ]);
}

export function buildServiceLandingJsonLd(
  slug: string,
  description?: string,
): { service: Record<string, unknown>; breadcrumb: Record<string, unknown> } | null {
  const schema = getServiceLandingSchema(slug);
  if (!schema) return null;
  return {
    service: buildServiceJsonLd({
      name: schema.name,
      path: schema.path,
      serviceType: schema.serviceType,
      description,
    }),
    breadcrumb: buildBreadcrumbListJsonLd({
      name: schema.breadcrumbName,
      path: schema.path,
    }),
  };
}

export function buildAgenciaUxUiJsonLd(description?: string): {
  service: Record<string, unknown>;
  breadcrumb: Record<string, unknown>;
} {
  const jsonLd = buildServiceLandingJsonLd(AGENCIA_UX_UI_SLUG, description);
  if (!jsonLd) {
    throw new Error('agencia-ux-ui missing from SERVICE_LANDING_SCHEMAS');
  }
  return jsonLd;
}

export function serializeServiceLandingJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
