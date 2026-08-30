# WordPress REST resilience guardrails

## Build budget

- `main` baseline observed before this package: approximately **33 seconds**.
- First fail-closed implementation with fully serial generation: approximately **69 seconds**.
- The fully serial result was safe but doubled build time, so the selected ceiling is **2 concurrent static pages in one worker**.
- Final clean validation with that ceiling on 2026-08-30: **59.46 seconds**, 122/122 pages.
- Warning budget: **60 seconds**. Investigate WordPress latency, payload size, or unexpected page growth if a representative build exceeds it.
- Hard validation budget: **90 seconds**, enforced directly by `npm run build`, the command used by Vercel/CI. `npm run build:direct` exists only for diagnosis. A timeout must fail validation; it must not be “fixed” by raising concurrency without new load evidence.
- On timeout the guard signals the complete POSIX process group, waits five seconds, and sends `SIGKILL` to the group. The integration test includes a descendant that ignores `SIGTERM` and verifies that it cannot survive as an orphan.

The budget covers `next build`, not dependency installation. The 100-post WordPress response is currently about 4.7 MB and exceeds Next's 2 MB data-cache limit; reducing that manifest remains a separate P1 optimization.

## Availability behavior

- WordPress requests have one 8-second operation deadline covering fetch attempts and backoff.
- 408, 425, 429, 5xx, and network errors receive at most three attempts with bounded jitter.
- Caller cancellation interrupts both an active fetch and retry backoff; no subsequent request is allowed.
- A REST 404 or a successful empty collection is an absence. Persistent upstream failure throws `WordPressUnavailableError`.
- Slug pages may render a 404 only after confirmed absence. Build inventory failures stop the build.

## Rollback

Revert the build guard/concurrency commit independently from the error-semantics commit. Do not restore the former `catch -> null/[]` behavior unless a different explicit availability strategy replaces it.
