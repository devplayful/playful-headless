# Local route-integrity gate

This read-only gate compares the routes tracked by a clean Git commit with the
reviewed route manifest and a local build artifact. It does not call Vercel,
WordPress or any other API and needs no environment variables or secrets.

The reviewed baseline is `a108e172b7d03eb612082ee222cb6ebc750d5fec`. A
candidate commit must descend from that baseline and be the clean checked-out
`HEAD`. The expected inventory lives in `config/expected-routes.json`; route
changes must update it deliberately in the same reviewed commit. Never generate
the expected inventory from the artifact, because doing so could bless a ghost
route.

## Usage

After a local Next build:

```sh
npm run verify:routes -- --artifact .next
```

After `vercel build`, without using the Vercel API:

```sh
npm run verify:routes -- --artifact .vercel/output
```

For an extracted Next manifest:

```sh
npm run verify:routes -- --artifact /path/to/app-paths-manifest.json
```

The command fails when the worktree is dirty, the commit is outside the baseline
lineage, tracked source routes differ from the expected manifest, the artifact
contains a route template with no exact source, a concrete artifact route is not
covered by a tracked dynamic source, or a critical route is absent.

Next's generated `/_not-found` route is the only artifact-only exception. The
exception is explicit and reviewed. For `.vercel/output`, function directories
are treated as route templates while static HTML files are treated as concrete
prerenders; a concrete blog or slug page is valid only when a tracked dynamic
route covers it.

## Review and rollback

Run the unit tests, TypeScript and `git diff --check` before review. This package
does not change application runtime, redirects, route handlers or deployment
configuration. Rollback is a revert of the tooling commit; no data, DNS or
Vercel state is involved.
