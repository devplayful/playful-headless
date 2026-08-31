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

Use Node 20.18 or newer. The canonical command removes the generated `.next`
directory before starting, builds, confirms that `HEAD` and the clean worktree
did not change, fingerprints the route inventory, writes an ignored provenance
file inside the newly created artifact, and immediately runs the gate:

```sh
npm run verify:routes:build
```

For a local Vercel Build Output v3 artifact, pass the build command without a
shell wrapper. The wrapper removes `.vercel/output` before invoking it:

```sh
node scripts/build-and-verify-routes.mjs --artifact .vercel/output -- vercel build
```

The Vercel adapter requires `.vercel/output/config.json`. A `routes[].src` to
dynamic `routes[].dest` mapping is only a candidate source relationship; a
concrete is accepted only when the same public path has either a static HTML
asset or a Vercel Prerender Function described by a sibling
`<name>.prerender-config.json`. Function symlinks are resolved to their source
template and cross-checked against any exact route mapping. Arbitrary public
assets and unbacked rewrites are not treated as prerenders.

For any non-standard `--artifact` path, the destination must not exist before
the command starts. This prevents an old artifact from being stamped by a build
command that exits successfully without producing output.

`npm run verify:routes -- --artifact PATH` only rechecks an artifact already
stamped by the same-job command. It rejects a missing stamp, a different HEAD or
any route-inventory change after the stamp.

## Separate lockfile gate

Dependency reproducibility is intentionally separate from route integrity:

```sh
npm run verify:lockfile
```

The gate copies only both package files into a disposable directory and runs a
real `npm ci` there, so existing `node_modules` cannot affect the result and the
worktree remains untouched. With Node 24.6.0 and npm 11.5.1 at this baseline,
`npm ci` exits successfully and the gate is green. npm does emit an
`ERESOLVE overriding peer dependency` warning for Tailwind's optional
`yaml@^2.4.2` peer because the installed root package is `yaml@1.10.2`.

This gate intentionally follows the `npm ci` exit status and does not turn
successful-install warnings into errors. Resolving that optional-peer warning,
or adopting a stricter dependency-tree policy such as requiring `npm ls --all`
to pass, belongs in a separately reviewed dependency change with its own tests.

## Failure conditions

The route gate fails for a dirty tree, wrong baseline lineage, source-manifest
drift, any missing source template, a ghost template, unknown or missing
concrete route/source pair, missing critical route, missing provenance, commit
mismatch or artifact fingerprint mismatch. Next's generated `/_not-found` is
the sole reviewed artifact-only exception.

The tooling changes no application route, handler, redirect, runtime setting or
deployment state. Rollback is a revert of the tooling commits.
