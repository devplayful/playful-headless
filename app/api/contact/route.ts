import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_FORM_ID } from '@/lib/contact/types';
import {
  normalizeWebsiteLead,
  SubmissionValidationError,
} from '@/lib/contact/normalize';
import {
  ContactDeliveryError,
  deliverToWordPress,
  verifyRecaptcha,
} from '@/lib/contact/delivery';
import {
  RedisRestIdempotencyStore,
  SubmissionInProgressError,
} from '@/lib/contact/idempotency';
import {
  ContactPipelineConfigurationError,
  readContactPipelineConfig,
} from '@/lib/contact/config';
import { pendingConfirmationResponse } from '@/lib/contact/api-response';
import { processContactPipeline } from '@/lib/contact/orchestrator';
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

function pendingConfirmation(replayed: boolean) {
  const response = pendingConfirmationResponse(replayed);
  return NextResponse.json(response.body, { status: response.status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = normalizeWebsiteLead(body);
    await verifyRecaptcha(body.recaptchaToken);

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
        dryRun: false,
      });
      return result.deliveryStatus === 'pending_confirmation'
        ? pendingConfirmation(result.replayed)
        : success(false, false, result.replayed);
    }

    const gateway = highLevel.testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(highLevel.token, highLevel.timeoutMs);

    const result = await processContactPipeline(lead, {
      store,
      deliver: deliverToWordPress,
      syncCrm: (submission, control) => syncWebsiteLeadToHighLevel(
        submission,
        gateway,
        highLevel,
        new Date(),
        control,
      ).then(() => undefined),
      dryRun: highLevel.testMode,
    });
    return result.deliveryStatus === 'pending_confirmation'
      ? pendingConfirmation(result.replayed)
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
