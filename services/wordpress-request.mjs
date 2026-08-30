const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 150;
const DEFAULT_MAX_DELAY_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 8_000;

const TRANSIENT_STATUSES = new Set([408, 425, 429]);

export class WordPressUnavailableError extends Error {
  constructor(message, { url, status, attempts, cause } = {}) {
    super(message, { cause });
    this.name = 'WordPressUnavailableError';
    this.url = url;
    this.status = status;
    this.attempts = attempts;
  }
}

// Backwards-compatible name retained for callers/tests created in the first
// resilience patch.
export { WordPressUnavailableError as WordPressUpstreamError };

export function isTransientWordPressStatus(status) {
  return TRANSIENT_STATUSES.has(status) || (status >= 500 && status <= 599);
}

function abortReason(signal) {
  return signal.reason ?? new DOMException('The operation was aborted', 'AbortError');
}

function throwIfAborted(signal) {
  if (signal.aborted) throw abortReason(signal);
}

function defaultSleep(delayMs, signal) {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
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
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = requestUrl(input);
  const requestSignal = init.signal ?? (
    typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined
  );

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be an integer greater than zero');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('timeoutMs must be greater than zero');
  }

  if (requestSignal?.aborted) throw abortReason(requestSignal);

  const operationController = new AbortController();
  const onRequestAbort = () => operationController.abort(abortReason(requestSignal));
  requestSignal?.addEventListener('abort', onRequestAbort, { once: true });
  const deadlineTimer = setTimeout(() => {
    operationController.abort(new DOMException(
      `WordPress request exceeded its ${timeoutMs}ms deadline`,
      'TimeoutError',
    ));
  }, timeoutMs);
  const operationSignal = operationController.signal;

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        throwIfAborted(operationSignal);
        const response = await fetchImpl(input, { ...init, signal: operationSignal });

        if (response.ok || response.status === 404) {
          return response;
        }

        const retryable = isTransientWordPressStatus(response.status);
        if (!retryable || attempt === maxAttempts) {
          throw new WordPressUnavailableError(
            `WordPress request failed with ${response.status} ${response.statusText}`,
            { url, status: response.status, attempts: attempt },
          );
        }

        // The retry will issue a fresh request; release the failed response body
        // first so repeated 5xx responses cannot retain HTTP connections.
        await response.body?.cancel().catch(() => {});
      } catch (error) {
        if (error instanceof WordPressUnavailableError) throw error;
        if (operationSignal.aborted) {
          if (requestSignal?.aborted) throw abortReason(requestSignal);
          throw new WordPressUnavailableError(
            `WordPress request exceeded its ${timeoutMs}ms deadline`,
            { url, attempts: attempt, cause: abortReason(operationSignal) },
          );
        }
        if (error?.name === 'AbortError') throw error;

        if (attempt === maxAttempts) {
          throw new WordPressUnavailableError(
            `WordPress request failed after ${attempt} attempts`,
            { url, attempts: attempt, cause: error },
          );
        }
      }

      const exponentialDelay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const jitter = Math.floor(random() * baseDelayMs);
      try {
        await sleep(Math.min(exponentialDelay + jitter, maxDelayMs), operationSignal);
      } catch (error) {
        if (requestSignal?.aborted) throw abortReason(requestSignal);
        if (operationSignal.aborted) {
          throw new WordPressUnavailableError(
            `WordPress request exceeded its ${timeoutMs}ms deadline`,
            { url, attempts: attempt, cause: abortReason(operationSignal) },
          );
        }
        throw error;
      }
      if (operationSignal.aborted) {
        if (requestSignal?.aborted) throw abortReason(requestSignal);
        throw new WordPressUnavailableError(
          `WordPress request exceeded its ${timeoutMs}ms deadline`,
          { url, attempts: attempt, cause: abortReason(operationSignal) },
        );
      }
    }

    throw new WordPressUnavailableError('WordPress request exhausted its retry budget', {
      url,
      attempts: maxAttempts,
    });
  } finally {
    clearTimeout(deadlineTimer);
    requestSignal?.removeEventListener('abort', onRequestAbort);
  }
}

/** Fetch a WordPress REST collection while preserving absence vs outage. */
export async function wordpressFetchCollection(input, init = {}, options = {}) {
  const response = await wordpressFetch(input, init, options);
  if (response.status === 404) return { items: [], response };
  const items = await response.json();
  if (!Array.isArray(items)) {
    throw new WordPressUnavailableError('WordPress collection returned a non-array payload', {
      url: requestUrl(input),
      status: response.status,
      attempts: 1,
    });
  }
  return { items, response };
}
