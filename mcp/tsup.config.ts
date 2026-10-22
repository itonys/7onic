import { defineConfig } from 'tsup'

export default defineConfig({
  // selfcheck.js: data-layer health-check CLI (Phase 1) and the loader
  // entry used by in-process reload tests.
  entry: {
    index: 'src/index.ts',
    selfcheck: 'src/data/selfcheck.ts',
    'build-data': 'scripts/build-data.ts',
    'verify-drift': 'scripts/verify-drift.ts',
    'verify-validate': 'scripts/verify-validate.ts',
    e2e: 'scripts/e2e.ts',
  },
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  // Self-contained bundle: consumers run `node dist/index.mjs` (or the
  // Claude Code plugin does) with NO npm install — all deps bundled in.
  noExternal: [/.*/],
  // dist/ is committed for zero-install distribution; no code splitting so
  // the committed output has no hash-named chunks (diff noise).
  splitting: false,
  minify: false,
  sourcemap: false,
  clean: true,
  // Emit .mjs: the Claude Code plugin cache (ai-kit/ materialized) has no
  // package.json, so a .js ESM bundle there is read as CommonJS and exits on
  // Node <20.19. .mjs is ESM on every Node version. plugin.json runs index.mjs.
  outExtension: () => ({ js: '.mjs' }),
  // Keep dist/index.js as a one-line bridge for manual setups documented as
  // `node <repo>/mcp/dist/index.js` (mcp/package.json declares "type": "module").
  async onSuccess() {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(
      new URL('./dist/index.js', import.meta.url),
      "// Bridge for manual MCP setups that point at dist/index.js — the server is index.mjs.\nimport './index.mjs'\n",
    )
  },
})
