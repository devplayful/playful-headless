import {
  defaultHubRenderFromPayload,
  generateCaseStudiesHubMetadata,
  renderCaseStudiesHub,
} from './hub-page';

export const revalidate = 3600;

export default async function CaseStudiesPage() {
  return renderCaseStudiesHub({
    renderFromPayload: defaultHubRenderFromPayload(),
  });
}

export async function generateMetadata() {
  return generateCaseStudiesHubMetadata();
}
