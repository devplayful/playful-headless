import { notFound } from 'next/navigation';
import {
  generateCaseStudiesHubMetadata,
  renderCaseStudiesHub,
} from '../../casos-de-exito/hub-page';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function PreviewCmsCasosHubPage() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  return renderCaseStudiesHub({
    renderFromPayload: true,
  });
}

export async function generateMetadata() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  return generateCaseStudiesHubMetadata();
}
