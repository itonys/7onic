// Data-layer health check (Phase 1 verification).
// Usage: node dist/selfcheck.js [repoRoot]
// Prints the doc-site 14-category coverage, theme variable counts, and
// whitelist stats. Exits 1 when any category is missing.
// Re-exported as a library so tests can exercise the loader from dist.
import { loadDesignData, findRepoRoot } from './loader.js'
import { fileURLToPath } from 'node:url'
import * as path from 'node:path'

export { loadDesignData, findRepoRoot } from './loader.js'

function main(): void {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : findRepoRoot()
  const data = loadDesignData(root)

  console.log(`root: ${root}`)
  console.log('sources:')
  for (const s of data.sources) console.log(`  - ${path.relative(root, s)}`)

  console.log('\ncategory coverage (doc-site 14):')
  let missing = 0
  for (const c of data.coverage) {
    if (!c.present) missing++
    console.log(
      `  ${c.present ? 'OK ' : 'MISSING'} ${c.category.padEnd(14)} ${String(c.count).padStart(4)} tokens  (${c.tokenKeys.join(', ')})`,
    )
  }

  const light = Object.keys(data.themes.light).length
  const dark = Object.keys(data.themes.dark).length
  console.log(`\ntheme vars: light=${light} dark=${dark}`)
  console.log(
    `whitelist: ${data.whitelist.classes.length} classes, ${data.whitelist.variantPrefixes.length} variant prefixes`,
  )

  // Spot samples proving values flow through (used by the reload test).
  const textLight = data.themes.light['color-text']
  const textDark = data.themes.dark['color-text']
  console.log('\nsamples:')
  console.log(`  light --color-text: raw=${textLight?.raw} resolved=${textLight?.resolved}`)
  console.log(`  dark  --color-text: raw=${textDark?.raw} resolved=${textDark?.resolved}`)
  const wl = new Set(data.whitelist.classes)
  console.log(
    `  classes include: bg-primary=${wl.has('bg-primary')} text-sm=${wl.has('text-sm')} ` +
      `border=${wl.has('border')} font-semibold=${wl.has('font-semibold')} ` +
      `icon-sm=${wl.has('icon-sm')} animate-fade-in=${wl.has('animate-fade-in')}`,
  )

  if (missing > 0) {
    console.error(`\nRESULT: FAIL — ${missing} categories missing`)
    process.exit(1)
  }
  console.log('\nRESULT: OK — all 14 categories covered')
}

// Run only when executed directly (not when imported by tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
