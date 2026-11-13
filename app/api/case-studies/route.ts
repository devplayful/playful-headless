import { NextResponse } from 'next/server';
import { getAllCaseStudies } from '@/services/wordpress';

export async function GET() {
  try {
    const casos = await getAllCaseStudies();
    return NextResponse.json(casos);
  } catch (error) {
    console.error('case-studies', error);
    return NextResponse.json([], { status: 503 });
  }
}
