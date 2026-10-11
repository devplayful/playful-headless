import { canonicalForPath } from './canonical.ts';
import { ORGANIZATION_LOGO_URL, ORGANIZATION_SCHEMA } from './organization-schema.mjs';
import { CASE_STUDIES_HUB_PATH } from './case-study-hub.ts';
import { buildBreadcrumbTrailJsonLd } from './service-landing-jsonld.ts';

export const CASE_STUDY_BREADCRUMB_NAMES: Record<string, string> = {
  'jumex-shopify-dtc-ecommerce': 'Jumex Shopify DTC',
  'odwalla-shopify-dtc-ecommerce': 'Odwalla Shopify DTC',
  'soytechno-ecommerce-venezuela': 'SoyTechno Venezuela',
};

/** schema.org has no CaseStudy type; Article + articleSection is the valid pair. */
export function buildCaseStudyArticleJsonLd(input: {
  headline: string;
  description?: string;
  path: string;
  image?: string;
}): Record<string, unknown> {
  const url = canonicalForPath(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: input.image } : {}),
    url,
    mainEntityOfPage: url,
    articleSection: 'Caso de éxito',
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_SCHEMA['@id'],
      name: ORGANIZATION_SCHEMA.name,
      url: ORGANIZATION_SCHEMA.url,
      logo: {
        '@type': 'ImageObject',
        url: ORGANIZATION_LOGO_URL,
      },
    },
  };
}

export function buildCaseStudyBreadcrumbJsonLd(input: {
  name: string;
  path: string;
}): Record<string, unknown> {
  const slug = input.path.replace(/^\/casos-de-exito\//, '');
  return buildBreadcrumbTrailJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Casos de éxito', path: CASE_STUDIES_HUB_PATH },
    { name: CASE_STUDY_BREADCRUMB_NAMES[slug] || input.name, path: input.path },
  ]);
}

export function buildCaseStudiesHubBreadcrumbJsonLd(): Record<string, unknown> {
  return buildBreadcrumbTrailJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Casos de éxito', path: CASE_STUDIES_HUB_PATH },
  ]);
}
