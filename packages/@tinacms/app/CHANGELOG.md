# @tinacms/app

## 2.5.14

### Patch Changes

- [#28](https://github.com/CYBR-ai/tinacms/pull/28) [`4d7cb2b`](https://github.com/CYBR-ai/tinacms/commit/4d7cb2b4c890b57dcaf684bbb5bc53d7230b993c) Thanks [@ErlendS](https://github.com/ErlendS)! - The admin preview route now resolves its path against the admin's own origin. When the resolved value points elsewhere the preview stays on the site root, raises a warning, and replaces the rejected address in history so neither the address bar nor the back button keeps pointing at the other site.

  The origin trusted for the admin-to-preview message channel is now the admin's own origin rather than one derived from the preview URL, so a URL cannot nominate the origin it is then trusted from.

  The active-field lookup also guards against a preview whose document it cannot read (a cross-origin or sandboxed frame), where it previously threw and unmounted the admin.

- Updated dependencies [[`4d7cb2b`](https://github.com/CYBR-ai/tinacms/commit/4d7cb2b4c890b57dcaf684bbb5bc53d7230b993c)]:
  - tinacms@3.14.1

## 2.5.13

### Patch Changes

- Updated dependencies [[`d4b1939`](https://github.com/CYBR-ai/tinacms/commit/d4b1939018cd0d68a2e3c4646fdc67969a31ce02)]:
  - tinacms@3.11.0

## 2.5.12

### Patch Changes

- Updated dependencies [[`d1ce357`](https://github.com/CYBR-ai/tinacms/commit/d1ce357be53393b0becadd78ad73cdd32a815a28)]:
  - tinacms@3.10.1

## 2.5.11

### Patch Changes

- Updated dependencies [[`71428d8`](https://github.com/CYBR-ai/tinacms/commit/71428d826e8e442ea0cad58c87fc2c18a18074e6)]:
  - tinacms@3.10.0

## 2.5.10

### Patch Changes

- Updated dependencies [[`62b8c98`](https://github.com/CYBR-ai/tinacms/commit/62b8c98cdc2624fb1401bc52a08ba2451d957540)]:
  - tinacms@3.9.7

## 2.5.9

### Patch Changes

- Updated dependencies [[`a567103`](https://github.com/CYBR-ai/tinacms/commit/a5671035087d640cd5140514ce8c2a943f6a44bc)]:
  - tinacms@3.9.6

## 0.0.1

Initial release of the CYBR-ai fork of TinaCMS.
