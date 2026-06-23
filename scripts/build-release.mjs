// Packs the fork's publishable packages into tarballs for a GitHub Release and
// generates the pnpm.overrides block apps use to consume them.
//
// Why this exists: this is a fork of TinaCMS. We don't publish to the public
// @tinacms npm scope (it's upstream's). Instead we attach the built packages as
// tarballs to a GitHub Release, and consuming apps point pnpm.overrides at those
// asset URLs. Overrides apply graph-wide, so a single fork @tinacms/schema-tools
// is deduped across the tree while the excluded data-layer packages
// (@tinacms/graphql|datalayer|search) still resolve from upstream npm.
//
// Run via `pnpm release:pack`, which runs `pnpm types` first so every package's dist/
// holds the real tsc + tsc-alias declarations. A bare `pnpm build` only emits the
// @tinacms/scripts dev-mode stubs (`export * from "../src/..."`), which dangle once packed
// (files ships dist/ only) and break consumers with TS2305 "no exported member". This
// script hard-fails on any such surviving stub rather than publish a broken tarball.
//
// In CI, GITHUB_SERVER_URL / GITHUB_REPOSITORY are set by Actions; locally they fall back
// to the CYBR-ai repo so URLs are still valid.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Published set: Apache-2.0 packages our apps consume. Intentionally excludes the
// build-only @tinacms/scripts and the ambiguously-licensed data-layer packages
// (@tinacms/datalayer, @tinacms/graphql, @tinacms/search) — those come from upstream.
const PUBLISHED_PACKAGE_DIRS = [
  'packages/tinacms',
  'packages/@tinacms/app',
  'packages/@tinacms/auth',
  'packages/@tinacms/bridge',
  'packages/@tinacms/cli',
  'packages/@tinacms/mdx',
  'packages/@tinacms/metrics',
  'packages/@tinacms/schema-tools',
  'packages/@tinacms/vercel-previews',
  'packages/@tinacms/webpack-helpers',
]

const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
const repository = process.env.GITHUB_REPOSITORY || 'CYBR-ai/tinacms'

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

// A dev-mode declaration stub looks like `export * from "../src/index"` — it resolves only
// inside the monorepo where src/ sits beside dist/. Once packed with `files: ["dist"]` the
// target is gone and the re-export dangles. Walk dist/ and collect any .d.ts that still
// points up into ../src so we can refuse to publish it.
const SRC_STUB_RE = /from\s+['"]\.\.(?:\/\.\.)*\/src\//
const findDanglingStubs = (dir) => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...findDanglingStubs(full))
    } else if (entry.name.endsWith('.d.ts') && SRC_STUB_RE.test(fs.readFileSync(full, 'utf8'))) {
      out.push(full)
    }
  }
  return out
}

const rootVersion = readJson(path.join(repoRoot, 'packages/tinacms/package.json')).version
const tag = `v${rootVersion}`
const assetBaseUrl = `${serverUrl}/${repository}/releases/download/${tag}`

const outDir = path.join(repoRoot, 'release-artifacts')
fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

// npm auto-includes a package's LICENSE file in the tarball (even when `files`
// only lists dist/), but NOT a separate NOTICE. So the Apache-2.0 attribution +
// modification statement is prepended into the injected LICENSE itself.
const apacheBody = fs.readFileSync(path.join(repoRoot, 'LICENSE'), 'utf8')
const licenseWithNotice = `This package is a modified redistribution of TinaCMS
(${serverUrl}/tinacms/tinacms), Copyright Forestry.io Holdings Inc.,
distributed under the Apache License 2.0 reproduced below.

Modifications in this build are maintained by Pistachio / CYBR-ai
(${serverUrl}/${repository}) and are likewise distributed under the
Apache License 2.0.

----------------------------------------------------------------------

${apacheBody}`

const overrides = {}
const packed = []

for (const dir of PUBLISHED_PACKAGE_DIRS) {
  const pkgDir = path.join(repoRoot, dir)
  const pkgJson = readJson(path.join(pkgDir, 'package.json'))

  // Most packages emit to dist/ and must be built first. A few legitimately don't
  // (e.g. @tinacms/app ships src and is bundled by the CLI; @tinacms/webpack-helpers
  // ships a root index.js), so only require dist when the manifest points there.
  const pointsAtDist =
    (pkgJson.files || []).some((f) => f === 'dist' || f.startsWith('dist/')) ||
    /(^|\/)dist\//.test(pkgJson.main || '') ||
    /(^|\/)dist\//.test(pkgJson.module || '')
  if (pointsAtDist && !fs.existsSync(path.join(pkgDir, 'dist'))) {
    throw new Error(`${pkgJson.name}: dist/ missing — run "pnpm build" before packing.`)
  }

  // Refuse to ship dev-mode declaration stubs. The real declarations come from the `types`
  // task (tsc + tsc-alias); if any survive pointing at ../src, the build order was wrong
  // (build ran after types). See the header note.
  const distDir = path.join(pkgDir, 'dist')
  if (fs.existsSync(distDir)) {
    const stubs = findDanglingStubs(distDir)
    if (stubs.length) {
      throw new Error(
        `${pkgJson.name}: ${stubs.length} declaration file(s) still re-export from ../src ` +
          `(dev-mode stubs that dangle once packed). Run "pnpm types" so tsc emits real ` +
          `declarations before packing.\n` +
          stubs.map((f) => `  - ${path.relative(pkgDir, f)}`).join('\n')
      )
    }
  }

  // Apache-2.0 compliance: ensure every tarball ships a LICENSE carrying the
  // attribution + modification statement. Track what we add so the working tree
  // is left clean afterwards. Leave any pre-existing LICENSE untouched.
  const addedFiles = []
  const licenseDest = path.join(pkgDir, 'LICENSE')
  if (!fs.existsSync(licenseDest)) {
    fs.writeFileSync(licenseDest, licenseWithNotice)
    addedFiles.push(licenseDest)
  }

  let tarball
  try {
    // pnpm rewrites workspace:* deps to concrete versions in the packed manifest.
    const stdout = execFileSync(
      'pnpm',
      ['pack', '--pack-destination', outDir],
      { cwd: pkgDir, encoding: 'utf8' }
    )
    tarball = stdout
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.endsWith('.tgz'))
      .pop()
    if (!tarball) throw new Error(`could not determine tarball name from:\n${stdout}`)
    tarball = path.basename(tarball)
  } finally {
    for (const f of addedFiles) fs.rmSync(f, { force: true })
  }

  overrides[pkgJson.name] = `${assetBaseUrl}/${tarball}`
  packed.push({ name: pkgJson.name, version: pkgJson.version, tarball })
  console.log(`packed ${pkgJson.name}@${pkgJson.version} -> ${tarball}`)
}

// The pnpm.overrides block apps paste into their package.json.
fs.writeFileSync(
  path.join(outDir, 'pnpm-overrides.json'),
  `${JSON.stringify({ pnpm: { overrides } }, null, 2)}\n`
)

const installMd = `# Installing the CYBR-ai TinaCMS fork (${tag})

These packages are published as tarballs attached to this GitHub Release. Consume
them by adding a \`pnpm.overrides\` block to your app's \`package.json\`, then
\`pnpm install\`. Overrides apply graph-wide, so every fork package dedupes to a
single copy.

\`\`\`json
${JSON.stringify({ pnpm: { overrides } }, null, 2)}
\`\`\`

Then declare the packages you use directly, e.g.:

\`\`\`jsonc
"dependencies": { "tinacms": "${rootVersion}" },
"devDependencies": { "@tinacms/cli": "${packed.find((p) => p.name === '@tinacms/cli')?.version ?? ''}" }
\`\`\`

> \`@tinacms/graphql\`, \`@tinacms/datalayer\`, and \`@tinacms/search\` are intentionally
> **not** overridden — they resolve from upstream npm.

## Private-repo note

Release-asset URLs on a private repo require authentication. In CI, fetch with a token
that can read this repo, or mirror the tarballs to a registry your apps can reach.

## Packed packages

${packed.map((p) => `- \`${p.name}@${p.version}\` — \`${p.tarball}\``).join('\n')}
`

fs.writeFileSync(path.join(outDir, 'INSTALL.md'), installMd)

console.log(`\nWrote ${packed.length} tarball(s) + pnpm-overrides.json + INSTALL.md to ${outDir}`)
console.log(`Release tag: ${tag}`)
