# Local route-integrity gate

This fail-closed gate compares a clean Git `HEAD`, the reviewed route manifest
and an artifact produced in the same local job. It does not call the Vercel API
and needs no secrets. The reviewed baseline is
`a108e172b7d03eb612082ee222cb6ebc750d5fec`.

`config/expected-routes.json` governs three independent inventories:

- all 16 source templates, including the four dynamic templates;
- 12 critical routes that must exist in the artifact;
- every concrete ISR/SSG route and its exact source template (108 at the
  baseline build).

The concrete list is deliberate. In particular, `/[slug]` cannot legitimize an
arbitrary root route. A new WordPress page or blog prerender fails until its
exact route/source pair is reviewed in the expected manifest.

## Required same-job command

Use Node 20.18 or newer. The canonical command builds, confirms that `HEAD` and
the clean worktree did not change, fingerprints the route inventory, writes an
ignored provenance file inside the artifact, and immediately runs the gate:

```sh
npm run verify:routes:build
```

For a local Vercel Build Output v3 artifact, pass the build command without a
shell wrapper:

```sh
node scripts/build-and-verify-routes.mjs --artifact .vercel/output -- vercel build
```

The Vercel adapter requires `.vercel/output/config.json`. It uses `routes[].src`
and `routes[].dest` to distinguish a dynamic template from an exact ISR
concrete, then cross-checks function directories and static route files. It does
not treat arbitrary public assets as routes.

`npm run verify:routes -- --artifact PATH` only rechecks an artifact already
stamped by the same-job command. It rejects a missing stamp, a different HEAD or
any route-inventory change after the stamp.

## Separate lockfile gate

Dependency reproducibility is intentionally separate from route integrity:

```sh
npm run verify:lockfile
```

At this baseline the command fails closed because `package.json` and
`package-lock.json` are already out of sync (`yaml@2.9.0` is missing from the
lock). The gate copies only both package files into a disposable directory and runs a
real `npm ci` there, so existing `node_modules` cannot mask the mismatch and the
worktree remains untouched. This branch records the red gate and does not edit
the lockfile. Repair
must happen in a separate dependency-only change before CI can require both
gates as green.

## Failure conditions

The route gate fails for a dirty tree, wrong baseline lineage, source-manifest
drift, any missing source template, a ghost template, unknown or missing
concrete route/source pair, missing critical route, missing provenance, commit
mismatch or artifact fingerprint mismatch. Next's generated `/_not-found` is
the sole reviewed artifact-only exception.

The tooling changes no application route, handler, redirect, runtime setting or
deployment state. Rollback is a revert of the tooling commits.
