import { NextRequest, NextResponse } from 'next/server';
import {
  decideMetaCapiSchedule,
  postMetaCapiSchedule,
  type MetaCapiScheduleDecision,
} from '@/lib/analytics/meta-capi-schedule';

export const dynamic = 'force-dynamic';

function cookieRecord(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.value) out[cookie.name] = cookie.value;
  });
  return out;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || '';
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  if (request.method === 'GET' || request.method === 'HEAD') return null;
  const raw = await request.text();
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function skipResponse(decision: Extract<MetaCapiScheduleDecision, { sent: false }>) {
  return NextResponse.json(
    { sent: false, reason: decision.reason },
    { status: decision.status },
  );
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const body = await readBody(request);
  const decision = decideMetaCapiSchedule({
    search: url.search,
    body,
    cookies: cookieRecord(request),
    userAgent: request.headers.get('user-agent') || '',
    clientIp: clientIp(request),
    eventSourceUrl: typeof body?.event_source_url === 'string'
      ? body.event_source_url
      : request.headers.get('referer') || '',
  });

  if (!decision.sent) return skipResponse(decision);

  try {
    const result = await postMetaCapiSchedule(decision);
    if (!result.ok) {
      return NextResponse.json(
        { sent: false, reason: 'meta_rejected' },
        { status: 502 },
      );
    }
    return NextResponse.json({
      sent: true,
      event_name: 'Schedule',
      events_received: result.eventsReceived,
    });
  } catch {
    return NextResponse.json(
      { sent: false, reason: 'meta_unreachable' },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
