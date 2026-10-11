import { NextResponse } from 'next/server';
import { LLMS_FULL_TXT_BODY, LLMS_PLAIN_HEADERS } from '@/lib/llms-txt';

export function GET() {
  return new NextResponse(LLMS_FULL_TXT_BODY, {
    status: 200,
    headers: LLMS_PLAIN_HEADERS,
  });
}
