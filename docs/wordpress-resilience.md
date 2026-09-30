# WordPress REST resilience guardrails

## Build budget

- `main` baseline observed before this package: approximately **33 seconds**.
- First fail-closed implementation with fully serial generation: approximately **69 seconds**.
- The fully serial result was safe but doubled build time, so the selected ceiling is **2 concurrent static pages in one worker**.
- Clean local validation with that ceiling on 2026-08-30: **59.46 seconds**, 122/122 pages. A later Vercel run compiled, collected data, and reached 60/122 static pages without a WordPress failure, but the old 90-second wall-clock guard killed it while it was still progressing.
- Warning budget: **90 seconds**. Crossing it is diagnostic and does not terminate a build that is still progressing.
- Inactivity budget: **90 seconds without stdout/stderr activity**. This catches a blocked build while allowing slower shared runners to continue when Next is reporting progress.
- Absolute validation budget: **300 seconds**, enforced directly by `npm run build`, as a final bound even if a faulty process keeps emitting output. `npm run build:direct` exists only for diagnosis.
- On timeout the guard signals the complete POSIX process group, waits five seconds, and sends `SIGKILL` to the group. The integration test includes a descendant that ignores `SIGTERM` and verifies that it cannot survive as an orphan.

The budget covers `next build`, not dependency installation. The redirect inventory requests only `slug`, `_links`, and `_embedded`: the measured 100-post response fell from **4,699,612 bytes** to **656,357 bytes**, below Next's 2 MB data-cache limit. `_links` is retained because WordPress requires it to materialize `_embedded` terms.

Blog listings no longer request `content` or a full `_embed`. Measured 2026-09-30 against endpoint.playfulagency.com (GET only):

- `posts?per_page=100&_embed=wp:featuredmedia,wp:term,author` → **3,553,996 bytes** (over the 2 MB Next data-cache ceiling).
- `posts?per_page=100&_fields=id,slug,categories` (generateStaticParams) → **8,107 bytes**.
- `posts?per_page=100&_fields` listing (no embed) → **54,402 bytes**.
- Featured media and authors resolve in separate `_fields` requests so every build payload stays under **1.5 MB**.

## Availability behavior

- WordPress requests have one 8-second operation deadline covering fetch attempts and backoff (20 s during `next build`, #151).
- Runtime: 408, 425, 429, 5xx, and network errors receive at most three attempts with bounded jitter.
- `next build`: at most **two** attempts per request, plus a process-wide budget of **8** extra 5xx/network retries, so pagination cannot multiply 3× retries across every page.
- Caller cancellation interrupts both an active fetch and retry backoff; no subsequent request is allowed.
- Only a successful `200 []` collection is an absence. A collection 404 and persistent upstream failures throw `WordPressUnavailableError`.
- Slug pages may render a 404 only after confirmed absence. Build inventory failures stop the build.

## Rollback

Revert the build guard/concurrency commit independently from the error-semantics commit. Do not restore the former `catch -> null/[]` behavior unless a different explicit availability strategy replaces it.
