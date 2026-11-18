import { getAllCaseStudies } from '@/services/wordpress';

/** Listing JSON para el hub de casos sin llamar a WordPress en el cliente. */
export async function GET() {
  const studies = await getAllCaseStudies();
  return Response.json(studies, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}