import { NextRequest, NextResponse } from 'next/server';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  deserializeAttributionCookie,
  preferStoredAttribution,
} from '@/lib/contact/attribution';
import { HighLevelConfigurationError } from '@/lib/highlevel/config';
import {
  eshowListaConfirmation,
  syncEshowListaToHighLevel,
  validateEshowLista,
  withEshowListaAttribution,
} from '@/lib/eshow-lista';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: 'El cuerpo de la solicitud no es válido.' },
      { status: 400 },
    );
  }

  const parsed = validateEshowLista(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, errors: parsed.errors },
      { status: 400 },
    );
  }

  const cookieFirst = deserializeAttributionCookie(request.cookies.get(ATTRIBUTION_COOKIE_FIRST)?.value);
  const cookieLast = deserializeAttributionCookie(request.cookies.get(ATTRIBUTION_COOKIE_LAST)?.value);
  const submittedOriginal = body.originalAttribution && typeof body.originalAttribution === 'object'
    ? body.originalAttribution as Record<string, unknown>
    : {};
  const submittedRecent = body.recentAttribution && typeof body.recentAttribution === 'object'
    ? body.recentAttribution as Record<string, unknown>
    : {};
  const originalAttribution = withEshowListaAttribution(
    preferStoredAttribution(cookieFirst, withEshowListaAttribution(submittedOriginal as never)),
  );
  const recentAttribution = withEshowListaAttribution(
    preferStoredAttribution(cookieLast, withEshowListaAttribution(submittedRecent as never)),
  );

  try {
    const sync = await syncEshowListaToHighLevel({
      name: parsed.name,
      email: parsed.email,
      originalAttribution,
      recentAttribution,
      consentCapturedAt: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      message: eshowListaConfirmation(parsed.name),
      crm: {
        wrote: sync.wrote,
        reason: sync.wrote ? undefined : sync.reason,
      },
    });
  } catch (error) {
    if (error instanceof HighLevelConfigurationError) {
      return NextResponse.json(
        { success: false, message: 'No pudimos guardar el alta. Inténtalo de nuevo en unos minutos.' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { success: false, message: 'No pudimos guardar el alta. Inténtalo de nuevo en unos minutos.' },
      { status: 502 },
    );
  }
}
