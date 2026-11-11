import { NextRequest, NextResponse } from 'next/server';
import { SubmissionValidationError } from '@/lib/contact/normalize';
import { buildQaFiltroGhlContactPayload } from '@/lib/qa-filtro/ghl-payload';
import { parseQaFiltroSubmission } from '@/lib/qa-filtro/parse-submission';
import { evaluateQaFiltro } from '@/lib/qa-filtro/qualify';
import { qaFiltroRouteEnabled } from '@/lib/qa-filtro/constants';

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
  if (!qaFiltroRouteEnabled()) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const answers = parseQaFiltroSubmission(body);
    const evaluation = evaluateQaFiltro(answers);
    normalizeSubmissionId(body.submissionId);

    const ghlPayload = buildQaFiltroGhlContactPayload(answers, evaluation.califTag);

    return NextResponse.json({
      success: true,
      outcome: evaluation.outcome,
      califTag: evaluation.califTag,
      ghlDryRun: true,
      ghlPayload,
    });
  } catch (error) {
    if (error instanceof SubmissionValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    console.error('QA filtro reunión: error inesperado', error);
    return NextResponse.json(
      { success: false, message: 'No pudimos procesar tus respuestas. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
