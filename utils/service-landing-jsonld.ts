import { canonicalForPath } from './canonical.ts';
import { ORGANIZATION_SCHEMA } from './organization-schema.mjs';

export const AGENCIA_UX_UI_SLUG = 'agencia-ux-ui';
export const AGENCIA_UX_UI_PATH = '/agencia-ux-ui';

/** Stable schema labels — same wording already used in the WP menu. */
export const AGENCIA_UX_UI_SERVICE = Object.freeze({
  slug: AGENCIA_UX_UI_SLUG,
  path: AGENCIA_UX_UI_PATH,
  name: 'Agencia UX/UI',
  serviceType: 'Diseño UX/UI',
});

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

export function buildBreadcrumbListJsonLd(input: {
  name: string;
  path: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://playfulagency.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: input.name,
        item: canonicalForPath(input.path),
      },
    ],
  };
}

export function buildAgenciaUxUiJsonLd(description?: string): {
  service: Record<string, unknown>;
  breadcrumb: Record<string, unknown>;
} {
  return {
    service: buildServiceJsonLd({
      name: AGENCIA_UX_UI_SERVICE.name,
      path: AGENCIA_UX_UI_SERVICE.path,
      serviceType: AGENCIA_UX_UI_SERVICE.serviceType,
      description,
    }),
    breadcrumb: buildBreadcrumbListJsonLd({
      name: AGENCIA_UX_UI_SERVICE.name,
      path: AGENCIA_UX_UI_SERVICE.path,
    }),
  };
}

export function serializeServiceLandingJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
