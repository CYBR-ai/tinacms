# tinacms

## 3.9.6

### Patch Changes

- [#16](https://github.com/CYBR-ai/tinacms/pull/16) [`a567103`](https://github.com/CYBR-ai/tinacms/commit/a5671035087d640cd5140514ce8c2a943f6a44bc) Thanks [@ErlendS](https://github.com/ErlendS)! - Pin the transitive js-yaml 3.x copy to its patched release 3.15.0 (remediates GHSA-h67p-54hq-rp68 / CVE-2026-53550, a quadratic-complexity DoS in merge-key handling). The 3.x line is retained (kept on 3.x rather than forced to 4.x) so gray-matter's safeLoad API stays available; the 4.x copy remains pinned to 4.2.0.

## 0.0.1

Initial release of the CYBR-ai fork of TinaCMS.
