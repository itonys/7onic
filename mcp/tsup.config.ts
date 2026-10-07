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
  // Self-contained bundle: consumers run `node dist/index.js` (or the
  // Claude Code plugin does) with NO npm install — all deps bundled in.
  noExternal: [/.*/],
  // dist/ is committed for zero-install distribution; no code splitting so
  // the committed output has no hash-named chunks (diff noise).
  splitting: false,
  minify: false,
  sourcemap: false,
  clean: true,
})
