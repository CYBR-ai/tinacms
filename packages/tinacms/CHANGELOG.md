# tinacms

## 3.11.0

### Minor Changes

- [#25](https://github.com/CYBR-ai/tinacms/pull/25) [`d4b1939`](https://github.com/CYBR-ai/tinacms/commit/d4b1939018cd0d68a2e3c4646fdc67969a31ce02) Thanks [@ErlendS](https://github.com/ErlendS)! - Remove the unused SQLite search-index export and TinaCloud search uploader from the fork. Local search remains memory-backed, and self-hosted projects can still provide custom database and search clients explicitly.

## 3.10.1

### Patch Changes

- [#23](https://github.com/CYBR-ai/tinacms/pull/23) [`d1ce357`](https://github.com/CYBR-ai/tinacms/commit/d1ce357be53393b0becadd78ad73cdd32a815a28) Thanks [@ErlendS](https://github.com/ErlendS)! - Remediate remaining Dependabot alerts. Bumped react-router/react-router-dom to 7.18.0; refreshed body-parser to 1.20.6; pinned postcss 8.5.12, dompurify 3.4.12, protobufjs 7.6.5, js-yaml 4.3.0, immutable 4.3.9, linkify-it 5.0.2, brace-expansion 1.1.16/2.1.2/5.0.7.

## 3.10.0

### Minor Changes

- [#21](https://github.com/CYBR-ai/tinacms/pull/21) [`71428d8`](https://github.com/CYBR-ai/tinacms/commit/71428d826e8e442ea0cad58c87fc2c18a18074e6) Thanks [@ErlendS](https://github.com/ErlendS)! - Remove unused packages from the fork to shrink the dependency/vulnerability surface: drop `@tinacms/auth`, `@tinacms/vercel-previews`, and `@tinacms/webpack-helpers` (none are reachable from the `tinacms` or `@tinacms/cli` packages our apps consume), and drop the dead `next` devDependency from `tinacms`.

## 3.9.7

### Patch Changes

- [#18](https://github.com/CYBR-ai/tinacms/pull/18) [`62b8c98`](https://github.com/CYBR-ai/tinacms/commit/62b8c98cdc2624fb1401bc52a08ba2451d957540) Thanks [@ErlendS](https://github.com/ErlendS)! - Pin the transitive immutable 5.x copy to its patched release 5.1.9 (remediates GHSA-xvcm-6775-5m9r / CVE-2026-59880, a hash-collision algorithmic-complexity DoS in Immutable.Map/Set). It is pulled in via @graphql-codegen -> @ardatan/relay-compiler (immutable ^5.1.5); the range-targeted override (>=5.0.0 <5.1.8 -> 5.1.9) was widened from the prior 5.1.5 pin to cover the full vulnerable range. The immutable 3.x copy (pinned to 3.8.3) is unaffected by this advisory and left in place.

## 3.9.6

### Patch Changes

- [#16](https://github.com/CYBR-ai/tinacms/pull/16) [`a567103`](https://github.com/CYBR-ai/tinacms/commit/a5671035087d640cd5140514ce8c2a943f6a44bc) Thanks [@ErlendS](https://github.com/ErlendS)! - Pin the transitive js-yaml 3.x copy to its patched release 3.15.0 (remediates GHSA-h67p-54hq-rp68 / CVE-2026-53550, a quadratic-complexity DoS in merge-key handling). The 3.x line is retained (kept on 3.x rather than forced to 4.x) so gray-matter's safeLoad API stays available; the 4.x copy remains pinned to 4.2.0.

## 0.0.1

Initial release of the CYBR-ai fork of TinaCMS.
