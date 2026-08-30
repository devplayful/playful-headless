import type { WebsiteLead } from './types.ts';
import { WORDPRESS_DELIVERY_TIMEOUT_MS } from './timeouts.ts';

const WORDPRESS_DELIVERY_MAX_ATTEMPTS = 4;
const WORDPRESS_DELIVERY_RETRY_DELAY_MS = 500;

export class ContactDeliveryError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ContactDeliveryError';
  }
}

export class DeterministicContactDeliveryError extends ContactDeliveryError {
  constructor(
    public readonly upstreamStatus: number,
    status = 502,
    message = 'El sistema de entrega rechazó el mensaje. Puedes intentarlo de nuevo.',
  ) {
    super(status, message);
    this.name = 'DeterministicContactDeliveryError';
  }
}

export class UncertainContactDeliveryError extends ContactDeliveryError {
  constructor(status = 504) {
    super(status, 'No pudimos confirmar la respuesta del sistema de entrega.');
    this.name = 'UncertainContactDeliveryError';
  }
}

interface WordPressDeliveryOptions {
  fetchImpl?: typeof fetch;
  sleep?: (delayMs: number) => Promise<void>;
  idempotentRetriesEnabled?: boolean;
}

function isRetryableStatus(status: number): boolean {
  // A returned 5xx may have happened after an unknown plugin side effect, so
  // only retry statuses that the receipt protocol explicitly makes safe.
  return status === 408 || status === 409 || status === 429;
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function verifyRecaptcha(token: unknown): Promise<void> {
  if (typeof token !== 'string' || !token) {
    throw new ContactDeliveryError(400, 'Por favor, completa la verificación de seguridad.');
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    throw new ContactDeliveryError(503, 'La verificación de seguridad no está disponible temporalmente.');
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new ContactDeliveryError(502, 'No pudimos completar la verificación de seguridad.');
  }

  const result = await response.json() as { success?: boolean };
  if (result.success !== true) {
    throw new ContactDeliveryError(400, 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.');
  }
}

export async function deliverToWordPress(
  lead: WebsiteLead,
  options: WordPressDeliveryOptions = {},
): Promise<void> {
  const wordpressUrl = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
  const token = process.env.WORDPRESS_CONTACT_TOKEN;
  if (!wordpressUrl || !token) {
    throw new DeterministicContactDeliveryError(
      0,
      503,
      'El formulario no está disponible temporalmente.',
    );
  }

  const fetchImpl = options.fetchImpl || fetch;
  const wait = options.sleep || sleep;
  const idempotentRetriesEnabled = options.idempotentRetriesEnabled
    ?? process.env.WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED === 'true';
  const attempts = idempotentRetriesEnabled ? WORDPRESS_DELIVERY_MAX_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(`${wordpressUrl}/playful/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Playful-Contact-Token': token,
          'X-Playful-Submission-Id': lead.submissionId,
        },
        body: JSON.stringify({
          submission_id: lead.submissionId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          business: lead.business,
          message: lead.message,
        }),
        signal: AbortSignal.timeout(WORDPRESS_DELIVERY_TIMEOUT_MS),
      });

      if (response.ok) return;
      if (idempotentRetriesEnabled && isRetryableStatus(response.status) && attempt < attempts) {
        await wait(WORDPRESS_DELIVERY_RETRY_DELAY_MS * attempt);
        continue;
      }

      if (response.status >= 400 && response.status < 500
        && response.status !== 408 && response.status !== 409) {
        throw new DeterministicContactDeliveryError(response.status);
      }
      throw new UncertainContactDeliveryError(502);
    } catch (error) {
      if (error instanceof ContactDeliveryError) throw error;
      if (idempotentRetriesEnabled && attempt < attempts) {
        await wait(WORDPRESS_DELIVERY_RETRY_DELAY_MS * attempt);
        continue;
      }
      throw new UncertainContactDeliveryError();
    }
  }

  throw new UncertainContactDeliveryError();
}
