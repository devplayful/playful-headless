import {
  buildBookingWidgetUrl,
} from '../../utils/booking-attribution.ts';
import { isGa4CollectReady } from './booking-abandon.ts';

export const REUNION_PLAYFUL_REDIRECT_MAX_WAIT_MS = 3_000;
export const REUNION_PLAYFUL_REDIRECT_POLL_MS = 50;
export const REUNION_PLAYFUL_POST_GA_DELAY_MS = 120;

export type ReunionRedirectCookieIo = {
  read: (name: string) => string;
};

export function reunionPlayfulWidgetDestination(input: {
  search: string;
  lastCookie: string;
  firstCookie: string;
}): string {
  return buildBookingWidgetUrl({
    search: input.search,
    lastCookie: input.lastCookie || null,
    firstCookie: input.firstCookie || null,
  });
}

/**
 * Waits for GA4 config/collect readiness, then runs `go` (widget redirect).
 * Never blocks longer than REUNION_PLAYFUL_REDIRECT_MAX_WAIT_MS.
 */
export function scheduleReunionPlayfulRedirect(input: {
  go: () => void;
  isReady?: () => boolean;
  now?: () => number;
  setTimeoutFn?: (handler: () => void, ms: number) => number;
  clearTimeoutFn?: (id: number) => void;
  maxWaitMs?: number;
  pollMs?: number;
  postReadyDelayMs?: number;
}): () => void {
  const go = input.go;
  const isReady = input.isReady ?? isGa4CollectReady;
  const now = input.now ?? (() => Date.now());
  const setTimer = input.setTimeoutFn
    ?? ((handler: () => void, ms: number) => window.setTimeout(handler, ms));
  const clearTimer = input.clearTimeoutFn
    ?? ((id: number) => window.clearTimeout(id));
  const maxWaitMs = input.maxWaitMs ?? REUNION_PLAYFUL_REDIRECT_MAX_WAIT_MS;
  const pollMs = input.pollMs ?? REUNION_PLAYFUL_REDIRECT_POLL_MS;
  const postReadyDelayMs = input.postReadyDelayMs ?? REUNION_PLAYFUL_POST_GA_DELAY_MS;

  const started = now();
  let cancelled = false;
  let timer: number | undefined;

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    go();
  };

  const tick = () => {
    if (cancelled) return;
    if (isReady()) {
      timer = setTimer(finish, postReadyDelayMs);
      return;
    }
    if (now() - started >= maxWaitMs) {
      finish();
      return;
    }
    timer = setTimer(tick, pollMs);
  };

  tick();
  return () => {
    cancelled = true;
    if (timer !== undefined) clearTimer(timer);
  };
}
