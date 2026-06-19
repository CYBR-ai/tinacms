# Releasing the fork & consuming it in other apps

This repo is a fork of TinaCMS. We do **not** publish to the public `@tinacms` npm
scope (that belongs to upstream). Instead, merging to `main` produces a **GitHub
Release** with the fork's packages attached as tarballs, and other apps consume those
tarballs via `pnpm.overrides`.

## How a release is cut

Versioning uses [Changesets](https://github.com/changesets/changesets) and runs in
[`.github/workflows/release.yml`](.github/workflows/release.yml):

1. Add a changeset on your feature branch: `pnpm exec changeset` (pick packages + bump).
2. Merge the feature branch to `main`. The workflow opens/updates a **"Version Packages"**
   PR that bumps versions and writes changelogs.
3. Merge the **Version Packages** PR. The workflow then:
   - runs `pnpm run release:pack` ([`scripts/build-release.mjs`](scripts/build-release.mjs))
     to build one tarball per published package,
   - tags the release `v<tinacms version>`,
   - creates a GitHub Release with all `*.tgz` files + `pnpm-overrides.json` + install notes.

The release step is idempotent: a normal push to `main` with no pending changesets does
nothing once the tag for the current version already exists.

### Published packages

`tinacms`, `@tinacms/app`, `@tinacms/auth`, `@tinacms/bridge`, `@tinacms/cli`,
`@tinacms/mdx`, `@tinacms/metrics`, `@tinacms/schema-tools`, `@tinacms/vercel-previews`,
`@tinacms/webpack-helpers`.

**Not published** (resolved from upstream npm): `@tinacms/graphql`, `@tinacms/datalayer`,
`@tinacms/search` (ambiguous "Tina Data Layer" license — confirm before publishing these),
and `@tinacms/scripts` (build-only).

### Repo settings / secrets

- Enable **Settings → Actions → General → "Allow GitHub Actions to create and approve pull
  requests"** so the default `GITHUB_TOKEN` can open the Version Packages PR. Otherwise
  supply a PAT or GitHub App token to the `changesets/action` step.

## Consuming the fork in another app

1. Open the latest GitHub Release and copy the `pnpm` block from `pnpm-overrides.json`
   (also printed in the release notes) into the app's `package.json`:

   ```jsonc
   "pnpm": {
     "overrides": {
       "tinacms": "https://github.com/CYBR-ai/tinacms/releases/download/v<ver>/tinacms-<ver>.tgz",
       "@tinacms/schema-tools": "https://github.com/CYBR-ai/tinacms/releases/download/v<ver>/tinacms-schema-tools-<ver>.tgz"
       // ...every published package
     }
   }
   ```

2. Declare what you import directly (versions are ignored once overridden, but keep them
   for clarity):

   ```jsonc
   "dependencies": { "tinacms": "<ver>" },
   "devDependencies": { "@tinacms/cli": "<ver>" }
   ```

3. `pnpm install`. Overrides apply graph-wide, so the fork's `@tinacms/schema-tools` is
   deduped to a single copy; `@tinacms/graphql|datalayer|search` come from upstream npm.

### Private-repo caveat

If this repo is private, release-asset URLs require authentication. Provide a token that
can read the repo in CI (or mirror the tarballs to a registry your apps can reach). Moving
to a private registry — e.g. GitHub Packages under a matching org, which removes the
per-package override block entirely — is the recommended next step if friction grows.

## License

The published packages are Apache-2.0. `release:pack` injects a `LICENSE` into every
tarball, prefaced with an attribution + modification statement, to satisfy the license's
redistribution terms.
