import {
  isWordPressMeterEnabled,
  recordWordPressFetch,
  installWordPressFetchMeterExitHook,
} from '../scripts/wp-fetch-meter.mjs';

const DEFAULT_MAX_ATTEMPTS = 3;
const BUILD_MAX_ATTEMPTS = 2;
const DEFAULT_BASE_DELAY_MS = 150;
const DEFAULT_MAX_DELAY_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 8_000;
const BUILD_TIMEOUT_MS = 20_000;
/** Extra 5xx/network retries across the whole `next build`, not per page. */
const BUILD_GLOBAL_RETRY_BUDGET = 8;

installWordPressFetchMeterExitHook();

let remainingBuildRetries = BUILD_GLOBAL_RETRY_BUDGET;
let buildRetryBudgetInitialized = false;

/**
 * Resolve the WordPress REST deadline.
 *
 * Runtime stays at 8s. `next build` uses 20s because the deadline covers
 * fetch + retries + backoff, and the heaviest build collection
 * (`posts?_fields=…` listing pages, ~0.05–0.53 MB) already takes
 * ~1–2s on a healthy origin — a single transient retry would miss 8s.
 * `WORDPRESS_REQUEST_TIMEOUT_MS` wins when set to a positive number.
 */
export function resolveWordPressRequestTimeoutMs(env = process.env) {
  const fromEnv = Number(env.WORDPRESS_REQUEST_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  if (env.NEXT_PHASE === 'phase-production-build') return BUILD_TIMEOUT_MS;
  return DEFAULT_TIMEOUT_MS;
}

export function isWordPressProductionBuild(env = process.env) {
  return env.NEXT_PHASE === 'phase-production-build';
}

export function resolveWordPressMaxAttempts(env = process.env) {
  const fromEnv = Number(env.WORDPRESS_MAX_ATTEMPTS);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  if (isWordPressProductionBuild(env)) return BUILD_MAX_ATTEMPTS;
  return DEFAULT_MAX_ATTEMPTS;
}

export function resolveWordPressBuildRetryBudget(env = process.env) {
  const fromEnv = Number(env.WORDPRESS_BUILD_RETRY_BUDGET);
  if (Number.isInteger(fromEnv) && fromEnv >= 0) return fromEnv;
  return BUILD_GLOBAL_RETRY_BUDGET;
}

export function resetWordPressBuildRetryBudget(env = process.env) {
  remainingBuildRetries = resolveWordPressBuildRetryBudget(env);
  buildRetryBudgetInitialized = true;
  return remainingBuildRetries;
}

export function remainingWordPressBuildRetries() {
  return remainingBuildRetries;
}

/**
 * Extra attempts (not the first GET) share one process-wide budget during
 * `next build`. Runtime keeps the per-request cap so a single 5xx still
 * retries without multiplying across 100 static pages.
 */
export function consumeWordPressBuildRetry(env = process.env) {
  if (!isWordPressProductionBuild(env)) return true;
  if (!buildRetryBudgetInitialized) {
    resetWordPressBuildRetryBudget(env);
  }
  if (remainingBuildRetries <= 0) return false;
  remainingBuildRetries -= 1;
  return true;
}

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

async function cancelResponseBody(response) {
  await response?.body?.cancel().catch(() => {});
}

function bufferedResponse(response, body) {
  return new Response(body.byteLength > 0 ? body : null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * Fetch WordPress with a small, bounded retry budget for transient failures.
 *
 * A 404 is deliberately returned to the caller so it can be treated as a real
 * absence. Every other non-success response is an upstream failure. This keeps
 * temporary WordPress incidents from being converted into durable Next 404s.
 */
async function wordpressRequest(input, init, options, consumeResponse) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  const maxAttempts = options.maxAttempts ?? resolveWordPressMaxAttempts();
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? resolveWordPressRequestTimeoutMs();
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
      let response;
      try {
        throwIfAborted(operationSignal);
        response = await fetchImpl(input, { ...init, signal: operationSignal });

        if (response.ok || response.status === 404) {
          // Keep both body I/O and its interpretation inside the operation
          // deadline. A body stream can fail after fetch has resolved with
          // headers, and that failure must consume the same retry budget.
          return await consumeResponse(response, { attempt, url });
        }

        const retryable = isTransientWordPressStatus(response.status);
        if (!retryable || attempt === maxAttempts || !consumeWordPressBuildRetry()) {
          throw new WordPressUnavailableError(
            `WordPress request failed with ${response.status} ${response.statusText}`,
            { url, status: response.status, attempts: attempt },
          );
        }

        // The retry will issue a fresh request; release the failed response body
        // first so repeated 5xx responses cannot retain HTTP connections.
        await cancelResponseBody(response);
      } catch (error) {
        // This also covers bodies that fail while being read. Release whatever
        // remains before either retrying or reporting the final failure.
        await cancelResponseBody(response);
        if (error instanceof WordPressUnavailableError) throw error;
        if (operationSignal.aborted) {
          if (requestSignal?.aborted) throw abortReason(requestSignal);
          throw new WordPressUnavailableError(
            `WordPress request exceeded its ${timeoutMs}ms deadline`,
            { url, attempts: attempt, cause: abortReason(operationSignal) },
          );
        }
        if (error?.name === 'AbortError') throw error;

        if (attempt === maxAttempts || !consumeWordPressBuildRetry()) {
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

export async function wordpressFetch(input, init = {}, options = {}) {
  return wordpressRequest(input, init, options, async (response, { url }) => {
    const body = await response.arrayBuffer();
    if (isWordPressMeterEnabled()) {
      recordWordPressFetch({ url, status: response.status, bytes: body.byteLength });
    }
    return bufferedResponse(response, body);
  });
}

/** Fetch a WordPress REST collection while preserving absence vs outage. */
export async function wordpressFetchCollection(input, init = {}, options = {}) {
  return wordpressRequest(input, init, options, async (response, { attempt, url }) => {
    if (response.status !== 200) {
      throw new WordPressUnavailableError(
        `WordPress collection failed with ${response.status} ${response.statusText}`,
        { url, status: response.status, attempts: attempt },
      );
    }

    const body = await response.arrayBuffer();
    if (isWordPressMeterEnabled()) {
      recordWordPressFetch({ url, status: response.status, bytes: body.byteLength });
    }
    let items;
    try {
      items = JSON.parse(new TextDecoder().decode(body));
    } catch (error) {
      throw new WordPressUnavailableError('WordPress collection returned invalid JSON', {
        url,
        status: response.status,
        attempts: attempt,
        cause: error,
      });
    }
    if (!Array.isArray(items)) {
      throw new WordPressUnavailableError('WordPress collection returned a non-array payload', {
        url,
        status: response.status,
        attempts: attempt,
      });
    }
    return { items, response: bufferedResponse(response, body) };
  });
}
