import { NextResponse } from 'next/server'
import { buildSitemapXml } from '@/utils/apex-sitemap'

export function GET() {
  return new NextResponse(buildSitemapXml(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
