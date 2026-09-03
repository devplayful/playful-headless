import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_FORM_ID } from '@/lib/contact/types';
import {
  normalizeWebsiteLead,
  SubmissionValidationError,
} from '@/lib/contact/normalize';
import {
  checkWordPressReceipt,
  ContactDeliveryError,
  DeterministicContactDeliveryError,
  deliverToWordPress,
  verifyRecaptcha,
} from '@/lib/contact/delivery';
import {
  RedisRestIdempotencyStore,
  SubmissionInProgressError,
  SubmissionPayloadMismatchError,
} from '@/lib/contact/idempotency';
import {
  ContactPipelineConfigurationError,
  isContactPipelineEnabled,
  readContactPipelineConfig,
} from '@/lib/contact/config';
import { pendingConfirmationResponse } from '@/lib/contact/api-response';
import {
  ContactPipelineUnavailableBeforeDeliveryError,
  DeliveryReceiptMissingError,
  processContactPipeline,
} from '@/lib/contact/orchestrator';
import {
  HighLevelConfigurationError,
  readHighLevelConfig,
} from '@/lib/highlevel/config';
import {
  DryRunHighLevelGateway,
  HighLevelApiClient,
  HighLevelApiError,
} from '@/lib/highlevel/client';
import {
  AmbiguousOpportunityError,
  syncWebsiteLeadToHighLevel,
} from '@/lib/highlevel/workflow';

function success(crmSynced: boolean, dryRun: boolean, replayed: boolean) {
  return NextResponse.json({
    success: true,
    message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.',
    crm: { synced: crmSynced, dryRun },
    analytics: {
      generateLead: true,
      formId: CONTACT_FORM_ID,
    },
    replayed,
  });
}

function pendingConfirmation(replayed: boolean, dryRun: boolean) {
  const response = pendingConfirmationResponse(replayed, dryRun);
  return NextResponse.json(response.body, { status: response.status });
}

function requestedReconciliation(body: Record<string, unknown>): boolean {
  const action = body.submissionAction;
  if (action === undefined || action === 'submit') return false;
  if (action === 'reconcile') return true;
  throw new SubmissionValidationError('La acción solicitada no es válida.');
}

async function processRedisFreeRollback(
  lead: ReturnType<typeof normalizeWebsiteLead>,
  reconcileOnly: boolean,
) {
  if (reconcileOnly) {
    try {
      const receipt = await checkWordPressReceipt(lead);
      if (receipt === 'completed') return success(false, false, true);
      if (receipt === 'missing') throw new DeliveryReceiptMissingError();
      return pendingConfirmation(true, false);
    } catch (error) {
      if (error instanceof DeliveryReceiptMissingError) throw error;
      return pendingConfirmation(true, false);
    }
  }

  try {
    await deliverToWordPress(lead, { idempotentRetriesEnabled: false });
    return success(false, false, false);
  } catch (error) {
    if (error instanceof DeterministicContactDeliveryError) throw error;
    return pendingConfirmation(false, false);
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: 'El cuerpo de la solicitud no es válido. No se ha enviado el mensaje.' },
        { status: 400 },
      );
    }
    const lead = normalizeWebsiteLead(body);
    const reconcileOnly = requestedReconciliation(body);
    await verifyRecaptcha(body.recaptchaToken);

    if (!isContactPipelineEnabled()) {
      return await processRedisFreeRollback(lead, reconcileOnly);
    }

    const contactPipeline = readContactPipelineConfig();
    const store = new RedisRestIdempotencyStore(
      contactPipeline.redisRestUrl,
      contactPipeline.redisRestToken,
      contactPipeline.idempotencyTtlSeconds,
      contactPipeline.leaseSeconds,
    );
    const highLevel = readHighLevelConfig();
    if (!highLevel.enabled) {
      const result = await processContactPipeline(lead, {
        store,
        deliver: deliverToWordPress,
        reconcileDelivery: checkWordPressReceipt,
        dryRun: false,
        reconcileOnly,
      });
      return result.deliveryStatus === 'pending_confirmation'
        ? pendingConfirmation(result.replayed, result.dryRun)
        : success(false, false, result.replayed);
    }

    const gateway = highLevel.testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(highLevel.token, highLevel.timeoutMs);

    const result = await processContactPipeline(lead, {
      store,
      deliver: deliverToWordPress,
      reconcileDelivery: checkWordPressReceipt,
      syncCrm: (submission, control) => syncWebsiteLeadToHighLevel(
        submission,
        gateway,
        highLevel,
        new Date(),
        control,
      ).then(() => undefined),
      dryRun: highLevel.testMode,
      reconcileOnly,
    });
    return result.deliveryStatus === 'pending_confirmation'
      ? pendingConfirmation(result.replayed, result.dryRun)
      : success(result.crmSynced, result.dryRun, result.replayed);
  } catch (error) {
    if (error instanceof SubmissionValidationError || error instanceof ContactDeliveryError) {
      const status = error instanceof ContactDeliveryError ? error.status : 400;
      return NextResponse.json({ success: false, message: error.message }, { status });
    }
    if (error instanceof SubmissionInProgressError) {
      return NextResponse.json(
        { success: false, retryable: true, message: 'El envío ya está en proceso. Inténtalo de nuevo en unos segundos.' },
        { status: 409 },
      );
    }
    if (error instanceof DeliveryReceiptMissingError
      || error instanceof SubmissionPayloadMismatchError) {
      return NextResponse.json(
        {
          success: false,
          startNewSubmission: true,
          message: error.message,
        },
        { status: 409 },
      );
    }
    if (error instanceof ContactPipelineUnavailableBeforeDeliveryError) {
      return NextResponse.json(
        {
          success: false,
          retryable: true,
          message: 'No pudimos iniciar el envío. WordPress no fue contactado; inténtalo de nuevo.',
        },
        { status: 503 },
      );
    }
    if (error instanceof HighLevelConfigurationError
      || error instanceof ContactPipelineConfigurationError) {
      console.error('Configuración del pipeline de contacto incompleta:', error.message);
      return NextResponse.json(
        { success: false, message: 'La integración comercial no está configurada completamente.' },
        { status: 503 },
      );
    }
    if (error instanceof AmbiguousOpportunityError) {
      console.error('HighLevel requiere revisión manual: múltiples oportunidades abiertas.');
    } else if (error instanceof HighLevelApiError) {
      console.error('HighLevel no confirmó una operación:', error.operation, error.status);
    } else {
      console.error('El pipeline de contacto no pudo completar una operación segura.');
    }
    return NextResponse.json(
      { success: false, retryable: true, message: 'El mensaje fue procesado, pero falta confirmar el registro comercial. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
