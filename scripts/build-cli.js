/**
 * Build tokens/cli/sync.js — User-facing CLI bundle
 *
 * Uses esbuild (bundled with tsup) to compile cli-sync.ts
 * into a self-contained Node.js script with shebang.
 */
const { buildSync } = require('esbuild')
const fs = require('fs')
const path = require('path')

const outfile = path.resolve(__dirname, '..', 'tokens', 'cli', 'sync.js')
const outdir = path.dirname(outfile)

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true })
}

buildSync({
  entryPoints: [path.resolve(__dirname, 'cli-sync.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile,
  format: 'cjs',
  banner: {
    js: '#!/usr/bin/env node',
  },
})

console.log('✅ tokens/cli/sync.js built')
