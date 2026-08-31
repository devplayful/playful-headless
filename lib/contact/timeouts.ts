export const WORDPRESS_DELIVERY_TIMEOUT_MS = 10_000;
export const IDEMPOTENCY_REQUEST_TIMEOUT_MS = 5_000;
export const LEASE_SAFETY_MARGIN_MS = 5_000;
export const WORDPRESS_DELIVERY_MAX_ATTEMPTS = 4;
export const WORDPRESS_DELIVERY_RETRY_DELAY_MS = 500;

export function wordpressDeliveryProtocolMaximumMs(idempotentRetriesEnabled: boolean): number {
  const attempts = idempotentRetriesEnabled ? WORDPRESS_DELIVERY_MAX_ATTEMPTS : 1;
  const receiptChecks = idempotentRetriesEnabled ? attempts : 0;
  const backoffMs = idempotentRetriesEnabled
    ? WORDPRESS_DELIVERY_RETRY_DELAY_MS * ((attempts - 1) * attempts) / 2
    : 0;
  return (attempts + receiptChecks) * WORDPRESS_DELIVERY_TIMEOUT_MS + backoffMs;
}

export function contactDeliveryLeaseMinimumMs(idempotentRetriesEnabled: boolean): number {
  // The lease starts before the post-acquisition GET and durable reservation.
  // It must then cover the complete WordPress protocol, its final Redis
  // checkpoint/release, and an explicit scheduling margin.
  const reservationSetupMs = IDEMPOTENCY_REQUEST_TIMEOUT_MS * 2;
  const finalCheckpointMs = IDEMPOTENCY_REQUEST_TIMEOUT_MS;
  return reservationSetupMs
    + wordpressDeliveryProtocolMaximumMs(idempotentRetriesEnabled)
    + finalCheckpointMs
    + LEASE_SAFETY_MARGIN_MS;
}
