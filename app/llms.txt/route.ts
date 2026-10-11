import { NextResponse } from 'next/server';
import { LLMS_PLAIN_HEADERS, LLMS_TXT_BODY } from '@/lib/llms-txt';

export function GET() {
  return new NextResponse(LLMS_TXT_BODY, {
    status: 200,
    headers: LLMS_PLAIN_HEADERS,
  });
}
