import type { WebsiteLead } from './types.ts';
import { WORDPRESS_DELIVERY_TIMEOUT_MS } from './timeouts.ts';

export class ContactDeliveryError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ContactDeliveryError';
  }
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

export async function deliverToWordPress(lead: WebsiteLead): Promise<void> {
  const wordpressUrl = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
  const token = process.env.WORDPRESS_CONTACT_TOKEN;
  if (!wordpressUrl || !token) {
    throw new ContactDeliveryError(503, 'El formulario no está disponible temporalmente.');
  }

  const response = await fetch(`${wordpressUrl}/playful/v1/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Playful-Contact-Token': token,
    },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      business: lead.business,
      message: lead.message,
    }),
    signal: AbortSignal.timeout(WORDPRESS_DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new ContactDeliveryError(502, 'No pudimos confirmar la entrega del mensaje.');
  }
}
