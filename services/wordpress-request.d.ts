export interface WordPressFetchOptions {
  fetchImpl?: typeof fetch;
  sleep?: (delayMs: number) => Promise<void>;
  random?: () => number;
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export class WordPressUpstreamError extends Error {
  readonly url?: string;
  readonly status?: number;
  readonly attempts?: number;
}

export function isTransientWordPressStatus(status: number): boolean;

export function wordpressFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } },
  options?: WordPressFetchOptions,
): Promise<Response>;
