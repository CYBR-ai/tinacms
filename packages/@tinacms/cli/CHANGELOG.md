# @tinacms/cli

## 3.0.1

### Patch Changes

- [#28](https://github.com/CYBR-ai/tinacms/pull/28) [`ebd2265`](https://github.com/CYBR-ai/tinacms/commit/ebd2265409e86f0bf90167cddc79fab078cfb3bd) Thanks [@ErlendS](https://github.com/ErlendS)! - Values written into the generated client are now emitted as JS literals rather than being interpolated between quotes. A branch name that contains a quote, a backslash or a newline is kept as part of the URL string instead of changing the surrounding code. The same applies to the token, the cache directory and the error policy.

- Updated dependencies [[`4d7cb2b`](https://github.com/CYBR-ai/tinacms/commit/4d7cb2b4c890b57dcaf684bbb5bc53d7230b993c)]:
  - tinacms@3.14.1
  - @tinacms/app@2.5.14

## 2.6.0

### Minor Changes

- [#25](https://github.com/CYBR-ai/tinacms/pull/25) [`d4b1939`](https://github.com/CYBR-ai/tinacms/commit/d4b1939018cd0d68a2e3c4646fdc67969a31ce02) Thanks [@ErlendS](https://github.com/ErlendS)! - Remove the unused SQLite search-index export and TinaCloud search uploader from the fork. Local search remains memory-backed, and self-hosted projects can still provide custom database and search clients explicitly.

### Patch Changes

- Updated dependencies [[`d4b1939`](https://github.com/CYBR-ai/tinacms/commit/d4b1939018cd0d68a2e3c4646fdc67969a31ce02)]:
  - tinacms@3.11.0
  - @tinacms/app@2.5.13

## 2.5.7

### Patch Changes

- Updated dependencies [[`d1ce357`](https://github.com/CYBR-ai/tinacms/commit/d1ce357be53393b0becadd78ad73cdd32a815a28)]:
  - tinacms@3.10.1
  - @tinacms/app@2.5.12

## 2.5.6

### Patch Changes

- Updated dependencies [[`71428d8`](https://github.com/CYBR-ai/tinacms/commit/71428d826e8e442ea0cad58c87fc2c18a18074e6)]:
  - tinacms@3.10.0
  - @tinacms/app@2.5.11

## 2.5.5

### Patch Changes

- Updated dependencies [[`62b8c98`](https://github.com/CYBR-ai/tinacms/commit/62b8c98cdc2624fb1401bc52a08ba2451d957540)]:
  - tinacms@3.9.7
  - @tinacms/app@2.5.10

## 2.5.4

### Patch Changes

- Updated dependencies [[`a567103`](https://github.com/CYBR-ai/tinacms/commit/a5671035087d640cd5140514ce8c2a943f6a44bc)]:
  - tinacms@3.9.6
  - @tinacms/app@2.5.9

## 0.0.1

Initial release of the CYBR-ai fork of TinaCMS.
