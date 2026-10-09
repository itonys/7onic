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

const ROOT = path.resolve(__dirname, '..')
const outfile = path.resolve(__dirname, '..', 'cli', 'dist', 'index.js')
const outdir = path.dirname(outfile)
const cliPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'cli', 'package.json'), 'utf-8'))

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
  // Prefer ESM entry — `jsonc-parser` ships UMD with `require(./impl/...)` at
  // runtime, which esbuild can't statically resolve. The ESM build uses
  // proper `import` statements that esbuild can bundle correctly.
  mainFields: ['module', 'main'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    '__CLI_VERSION__': JSON.stringify(cliPkg.version),
    // AI Kit payloads for `init --claude` (source of truth: ai-kit/).
    // Injected at build time so the CLI stays self-contained offline —
    // rebuild (npm run build:7onic) whenever the ai-kit files change.
    '__AI_KIT_FILES__': JSON.stringify({
      'skills/7onic-setup/SKILL.md': fs.readFileSync(
        path.join(ROOT, 'ai-kit/skills/7onic-setup/SKILL.md'), 'utf8'),
      'skills/7onic-design/SKILL.md': fs.readFileSync(
        path.join(ROOT, 'ai-kit/skills/7onic-design/SKILL.md'), 'utf8'),
      'agents/design-agent.md': fs.readFileSync(
        path.join(ROOT, 'ai-kit/agents/design-agent.md'), 'utf8'),
    }),
  },
})

console.log('✅ cli/dist/index.js built')
