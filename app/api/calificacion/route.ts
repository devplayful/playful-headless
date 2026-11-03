import { NextRequest, NextResponse } from 'next/server';
import { SubmissionValidationError } from '@/lib/contact/normalize';
import { verifyRecaptcha, ContactDeliveryError } from '@/lib/contact/delivery';
import { calificacionAttributionFromRequest } from '@/lib/calificacion/attribution';
import { calificacionApiDryRun } from '@/lib/calificacion/dry-run';
import {
  buildCalificacionUpsertInput,
  syncCalificacionToHighLevel,
} from '@/lib/calificacion/sync-to-ghl';
import { buildCalificacionGhlContactPayload } from '@/lib/qa-filtro/ghl-payload';
import { parseQaFiltroSubmission } from '@/lib/qa-filtro/parse-submission';
import { evaluateQaFiltro } from '@/lib/qa-filtro/qualify';
import {
  HighLevelConfigurationError,
  readHighLevelConfig,
} from '@/lib/highlevel/config';
import {
  DryRunHighLevelGateway,
  HighLevelApiClient,
  HighLevelApiError,
} from '@/lib/highlevel/client';

function normalizeSubmissionId(value: unknown): string {
  if (typeof value !== 'string') {
    throw new SubmissionValidationError('El identificador del envío no es válido.');
  }
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(id)) {
    throw new SubmissionValidationError('El identificador del envío no es válido.');
  }
  return id;
}

export async function POST(request: NextRequest) {
  const dryRun = calificacionApiDryRun(request);

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: 'El cuerpo de la solicitud no es válido.' },
        { status: 400 },
      );
    }

    const answers = parseQaFiltroSubmission(body);
    const evaluation = evaluateQaFiltro(answers);
    normalizeSubmissionId(body.submissionId);

    if (!dryRun) {
      await verifyRecaptcha(body.recaptchaToken);
    }

    const attribution = calificacionAttributionFromRequest(body, request);
    const leadContext = {
      name: answers.name,
      email: answers.email,
      ...attribution,
    };

    const upsertPreview = buildCalificacionGhlContactPayload(answers, evaluation.califTag, {
      includeQaInterno: false,
    });

    if (dryRun) {
      const highLevel = readHighLevelConfig();
      const upsertInput = highLevel.enabled
        ? buildCalificacionUpsertInput(
          answers,
          evaluation.califTag,
          leadContext,
          highLevel,
        )
        : null;

      return NextResponse.json({
        success: true,
        outcome: evaluation.outcome,
        califTag: evaluation.califTag,
        ghlDryRun: true,
        ghlPayload: {
          upsertContact: upsertPreview,
          upsertInput,
        },
      });
    }

    const highLevel = readHighLevelConfig();
    if (!highLevel.enabled) {
      return NextResponse.json(
        { success: false, message: 'La integración comercial no está configurada completamente.' },
        { status: 503 },
      );
    }

    const gateway = highLevel.testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(highLevel.token, highLevel.timeoutMs);

    await syncCalificacionToHighLevel(
      answers,
      evaluation.califTag,
      leadContext,
      gateway,
      highLevel,
    );

    return NextResponse.json({
      success: true,
      outcome: evaluation.outcome,
      califTag: evaluation.califTag,
      ghlDryRun: highLevel.testMode,
    });
  } catch (error) {
    if (error instanceof SubmissionValidationError || error instanceof ContactDeliveryError) {
      const status = error instanceof ContactDeliveryError ? error.status : 400;
      return NextResponse.json({ success: false, message: error.message }, { status });
    }
    if (error instanceof HighLevelConfigurationError) {
      return NextResponse.json(
        { success: false, message: 'La integración comercial no está configurada completamente.' },
        { status: 503 },
      );
    }
    if (error instanceof HighLevelApiError) {
      console.error('HighLevel calificacion upsert:', error.operation, error.status);
    } else {
      console.error('Calificacion: error inesperado', error);
    }
    return NextResponse.json(
      { success: false, message: 'No pudimos procesar tus respuestas. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
