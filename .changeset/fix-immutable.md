---
"tinacms": patch
---

Pin the transitive immutable 5.x copy to its patched release 5.1.9 (remediates GHSA-xvcm-6775-5m9r / CVE-2026-59880, a hash-collision algorithmic-complexity DoS in Immutable.Map/Set). It is pulled in via @graphql-codegen -> @ardatan/relay-compiler (immutable ^5.1.5); the range-targeted override (>=5.0.0 <5.1.8 -> 5.1.9) was widened from the prior 5.1.5 pin to cover the full vulnerable range. The immutable 3.x copy (pinned to 3.8.3) is unaffected by this advisory and left in place.
