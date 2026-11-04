import { NextResponse } from 'next/server';
import { buildJoseVCard } from '@/lib/jose-contact';

export function GET() {
  const body = buildJoseVCard();
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="jose-playful.vcf"',
      'X-Robots-Tag': 'noindex',
    },
  });
}
