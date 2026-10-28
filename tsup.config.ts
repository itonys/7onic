import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { defineConfig, type Options } from 'tsup'

const USE_CLIENT = '"use client";\n'

// esbuild keeps the 'use client' directive of entry modules and the banner adds one
// more, so entry files start with it twice. Drop the duplicate line and shift the
// source map by the same line (its first lines carry no mappings).
function dedupeUseClient(dir: string) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, name.name)
    if (name.isDirectory()) {
      dedupeUseClient(file)
      continue
    }
    if (!file.endsWith('.mjs')) continue
    const code = readFileSync(file, 'utf8')
    if (!code.startsWith(USE_CLIENT + USE_CLIENT)) continue
    writeFileSync(file, code.slice(USE_CLIENT.length))
    const mapFile = `${file}.map`
    if (existsSync(mapFile)) {
      const map = JSON.parse(readFileSync(mapFile, 'utf8'))
      if (map.mappings.startsWith(';')) {
        map.mappings = map.mappings.slice(1)
        writeFileSync(mapFile, JSON.stringify(map))
      }
    }
  }
}

const alias = { '@': path.resolve(__dirname, 'src') }
const external = ['react', 'react-dom', '@radix-ui/*', 'recharts']

// Public entry points (package.json "exports"): dist/index.* and dist/chart.*
const publicEntries = {
  index: 'src/components/ui/index.ts',
  chart: 'src/components/ui/chart.tsx',
}

// ESM only: every component file is its own entry so esbuild code splitting keeps
// components in separate modules. dist/index.mjs then re-exports from per-component
// files, and a consumer bundler drops the components it never imports.
// A single-file bundle cannot be tree-shaken well: top-level forwardRef/cva calls
// and displayName assignments count as side effects.
const componentEntries = Object.fromEntries(
  readdirSync('src/components/ui')
    .filter((file) => file.endsWith('.tsx') && file !== 'chart.tsx')
    .map((file) => [`components/${file.replace(/\.tsx$/, '')}`, `src/components/ui/${file}`]),
)

const shared: Options = {
  sourcemap: true,
  external,
  esbuildOptions(options) {
    options.alias = alias
  },
  // Next.js rewrites tsconfig.json "jsx" to "react-jsx" for the docs site.
  // tsconfig.lib.json keeps the library on the settings it has always shipped
  // with (classic React.createElement output, React.JSX.Element in .d.ts).
  tsconfig: 'tsconfig.lib.json',
}

export default defineConfig([
  {
    // CommonJS + type declarations: one file per public entry, as before
    ...shared,
    entry: publicEntries,
    format: ['cjs'],
    dts: true,
    splitting: false,
    clean: false,
  },
  {
    ...shared,
    entry: { ...publicEntries, ...componentEntries },
    format: ['esm'],
    dts: false,
    splitting: true,
    clean: false,
    // Bundling drops module-level directives; every output file (entries and shared
    // chunks) is client code, so restore the directive for React Server Components.
    banner: { js: '"use client";' },
    async onSuccess() {
      dedupeUseClient('dist')
    },
  },
])
