const DEFAULT_PAYLOAD_MS = 8_000;

/**
 * Try Payload when enabled; on timeout/error/empty fall back to snapshot (wordpress.ts).
 */
export async function withPayloadOrSnapshot<T>(
  usePayload: boolean,
  payloadFn: () => Promise<T | null | undefined>,
  snapshotFn: () => Promise<T>,
  timeoutMs = DEFAULT_PAYLOAD_MS,
): Promise<T> {
  if (!usePayload) return snapshotFn();

  try {
    const payloadPromise = payloadFn();
    const timed = Promise.race([
      payloadPromise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('payload_timeout')), timeoutMs);
      }),
    ]);
    const value = await timed;
    if (value === null || value === undefined) return snapshotFn();
    if (Array.isArray(value) && value.length === 0) return snapshotFn();
    return value as T;
  } catch {
    return snapshotFn();
  }
}