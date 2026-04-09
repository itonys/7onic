/**
 * Build cli/dist/index.js — 7onic CLI bundle
 *
 * Uses esbuild (bundled with tsup) to compile cli/src/index.ts
 * into a self-contained Node.js script with shebang.
 * All dependencies (@clack/prompts, picocolors) are bundled inline.
 */
const { buildSync } = require('esbuild')
const fs = require('fs')
const path = require('path')

const outfile = path.resolve(__dirname, '..', 'cli', 'dist', 'index.js')
const outdir = path.dirname(outfile)

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true })
}

buildSync({
  entryPoints: [path.resolve(__dirname, '..', 'cli', 'src', 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile,
  format: 'cjs',
  banner: {
    js: '#!/usr/bin/env node',
  },
})

console.log('✅ cli/dist/index.js built')
