const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 150;
const DEFAULT_MAX_DELAY_MS = 1_000;

const TRANSIENT_STATUSES = new Set([408, 425, 429]);

export class WordPressUpstreamError extends Error {
  constructor(message, { url, status, attempts, cause } = {}) {
    super(message, { cause });
    this.name = 'WordPressUpstreamError';
    this.url = url;
    this.status = status;
    this.attempts = attempts;
  }
}

export function isTransientWordPressStatus(status) {
  return TRANSIENT_STATUSES.has(status) || (status >= 500 && status <= 599);
}

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function requestUrl(input) {
  return typeof input === 'string' || input instanceof URL ? String(input) : input.url;
}

/**
 * Fetch WordPress with a small, bounded retry budget for transient failures.
 *
 * A 404 is deliberately returned to the caller so it can be treated as a real
 * absence. Every other non-success response is an upstream failure. This keeps
 * temporary WordPress incidents from being converted into durable Next 404s.
 */
export async function wordpressFetch(input, init = {}, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const url = requestUrl(input);

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be an integer greater than zero');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(input, init);

      if (response.ok || response.status === 404) {
        return response;
      }

      const retryable = isTransientWordPressStatus(response.status);
      if (!retryable || attempt === maxAttempts) {
        throw new WordPressUpstreamError(
          `WordPress request failed with ${response.status} ${response.statusText}`,
          { url, status: response.status, attempts: attempt },
        );
      }

      // The retry will issue a fresh request; release the failed response body
      // first so repeated 5xx responses cannot retain HTTP connections.
      await response.body?.cancel().catch(() => {});
    } catch (error) {
      if (error instanceof WordPressUpstreamError) throw error;
      if (error?.name === 'AbortError') throw error;

      if (attempt === maxAttempts) {
        throw new WordPressUpstreamError(
          `WordPress request failed after ${attempt} attempts`,
          { url, attempts: attempt, cause: error },
        );
      }
    }

    const exponentialDelay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
    const jitter = Math.floor(random() * baseDelayMs);
    await sleep(Math.min(exponentialDelay + jitter, maxDelayMs));
  }

  throw new WordPressUpstreamError('WordPress request exhausted its retry budget', {
    url,
    attempts: maxAttempts,
  });
}
