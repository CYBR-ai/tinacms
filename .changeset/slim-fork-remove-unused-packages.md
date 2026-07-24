---
"tinacms": minor
---

Remove unused packages from the fork to shrink the dependency/vulnerability surface: drop `@tinacms/auth`, `@tinacms/vercel-previews`, and `@tinacms/webpack-helpers` (none are reachable from the `tinacms` or `@tinacms/cli` packages our apps consume), and drop the dead `next` devDependency from `tinacms`.
