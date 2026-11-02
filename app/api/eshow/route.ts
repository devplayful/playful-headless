import { NextRequest, NextResponse } from 'next/server';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  deserializeAttributionCookie,
  preferStoredAttribution,
} from '@/lib/contact/attribution';
import { HighLevelConfigurationError } from '@/lib/highlevel/config';
import { ESHOW_LANDING_FORM } from '@/lib/eshow-landing-copy';
import {
  ESHOW_LANDING_FORM_ID,
  formatMadridOffsetIso,
  syncEshowLandingToHighLevel,
  validateEshowLanding,
  withEshowLandingAttribution,
} from '@/lib/eshow-landing';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: ESHOW_LANDING_FORM.submitError },
      { status: 400 },
    );
  }

  const parsed = validateEshowLanding(body);
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
  const originalAttribution = withEshowLandingAttribution(
    preferStoredAttribution(cookieFirst, withEshowLandingAttribution(submittedOriginal as never)),
  );
  const recentAttribution = withEshowLandingAttribution(
    preferStoredAttribution(cookieLast, withEshowLandingAttribution(submittedRecent as never)),
  );

  try {
    const sync = await syncEshowLandingToHighLevel({
      name: parsed.name,
      email: parsed.email,
      originalAttribution,
      recentAttribution,
      consentCapturedAt: formatMadridOffsetIso(),
    });
    return NextResponse.json({
      success: true,
      analytics: {
        generateLead: true,
        formId: ESHOW_LANDING_FORM_ID,
      },
      crm: {
        wrote: sync.wrote,
        reason: sync.wrote ? undefined : sync.reason,
        ...(sync.wrote
          ? { contactId: sync.contactId, tag: sync.tag }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof HighLevelConfigurationError) {
      return NextResponse.json(
        { success: false, message: ESHOW_LANDING_FORM.submitError },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { success: false, message: ESHOW_LANDING_FORM.submitError },
      { status: 502 },
    );
  }
}
