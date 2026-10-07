// verify-drift CLI (Phase 2) — FOUR-way consistency at export-symbol
// granularity (not file; AlertModal ⊂ modal.tsx):
//   1. llms-full.txt (via its committed parse: data/components.json)
//   2. src export symbols (src/components/ui/index.ts + chart.tsx subpath,
//      `X as Y` aliases included)
//   3. src CVA variant options (quoted keys handled) + TS string unions
//   4. CLI registry keys (cli/src/registry/index.ts) — 7onic-specific axis
// Documented-but-missing symbols/values fail (exit 1): the "feed the AI
// false data" worst case. Undocumented src/registry surface is warning-only.
// Usage: node dist/verify-drift.js [repoRoot]
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { findRepoRoot } from '../src/data/loader.js'
import type { ComponentRecord } from './llms-parser.js'

// ---------------------------------------------------------------------------
// src export extraction
// ---------------------------------------------------------------------------

/** Parse `export { A, B as C } from './file'` lines of ui/index.ts.
 *  Both the original and alias names are registered. */
function parseIndexExports(indexSrc: string): Map<string, string> {
  const symbolToFile = new Map<string, string>()
  const re = /^export \{([^}]+)\} from '\.\/([\w-]+)'/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(indexSrc)) !== null) {
    for (const raw of m[1].split(',')) {
      const entry = raw.trim()
      if (!entry) continue
      const alias = entry.match(/^(\S+)\s+as\s+(\S+)$/)
      if (alias) {
        symbolToFile.set(alias[1], m[2])
        symbolToFile.set(alias[2], m[2])
      } else {
        symbolToFile.set(entry, m[2])
      }
    }
  }
  return symbolToFile
}

/** Parse chart.tsx's local `export { ... }` block (no `from`). */
function parseChartExports(chartSrc: string): Set<string> {
  const symbols = new Set<string>()
  const re = /^export \{([\s\S]*?)\}\s*$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(chartSrc)) !== null) {
    for (const raw of m[1].split(',')) {
      const entry = raw.trim()
      if (!entry) continue
      const alias = entry.match(/^(\S+)\s+as\s+(\S+)$/)
      if (alias) {
        symbols.add(alias[1])
        symbols.add(alias[2])
      } else {
        symbols.add(entry)
      }
    }
  }
  return symbols
}

// ---------------------------------------------------------------------------
// CVA variants + TS unions (brace matcher handles quoted keys like '2xl')
// ---------------------------------------------------------------------------

type CvaVariants = Record<string, Set<string>>

function extractCvaVariants(source: string): CvaVariants[] {
  const results: CvaVariants[] = []
  const marker = /variants\s*:\s*\{/g
  let m: RegExpExecArray | null
  while ((m = marker.exec(source)) !== null) {
    const before = source.slice(Math.max(0, m.index - 20), m.index)
    if (/(default|compound)\s*$/i.test(before)) continue

    const variants: CvaVariants = {}
    let depth = 0
    let i = m.index + m[0].length - 1
    let currentProp: string | null = null
    let inString: string | null = null
    while (i < source.length) {
      const ch = source[i]
      if (inString) {
        if (ch === inString && source[i - 1] !== '\\') inString = null
        i++
        continue
      }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++
        continue
      }
      // Keys FIRST — quoted option keys ('2xl':) must not be swallowed by
      // the generic string-skip below.
      if (depth === 1 || depth === 2) {
        const keyMatch = source
          .slice(i, i + 80)
          .match(/^(?:'([^']+)'|"([^"]+)"|([\w$]+))\s*:/)
        if (keyMatch) {
          const key = keyMatch[1] ?? keyMatch[2] ?? keyMatch[3]
          if (depth === 1) {
            currentProp = key
            variants[key] = new Set()
          } else if (currentProp) {
            variants[currentProp].add(key)
          }
          i += keyMatch[0].length
          continue
        }
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        inString = ch
        i++
        continue
      }
      if (ch === '{') {
        depth++
        i++
        continue
      }
      if (ch === '}') {
        depth--
        if (depth === 0) break
        i++
        continue
      }
      i++
    }
    if (Object.keys(variants).length > 0) results.push(variants)
  }
  return results
}

/** All string-literal unions in a file (`= 'a' | 'b'`) — fallback for enum
 *  props backed by TS types + class maps instead of cva. */
function extractUnionTypes(source: string): Array<Set<string>> {
  const results: Array<Set<string>> = []
  const re = /=\s*('[^']+'(?:\s*\|\s*'[^']+')+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    results.push(new Set(m[1].split('|').map((p) => p.trim().slice(1, -1))))
  }
  return results
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface ComponentsJson {
  sourceHash: string
  count: number
  components: ComponentRecord[]
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function main(): void {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : findRepoRoot()
  const { sourceHash, components } = JSON.parse(
    fs.readFileSync(path.join(root, 'mcp', 'data', 'components.json'), 'utf8'),
  ) as ComponentsJson

  const errors: string[] = []
  const warnings: string[] = []

  // 0. Freshness: llms-full.txt must match the hash recorded at build time.
  const llmsFull = fs.readFileSync(path.join(root, 'public', 'llms-full.txt'), 'utf8')
  const currentHash = crypto.createHash('sha256').update(llmsFull).digest('hex')
  if (currentHash !== sourceHash) {
    errors.push(
      `data/components.json is STALE (recorded ${sourceHash.slice(0, 12)}…, current ${currentHash.slice(0, 12)}…) — re-run build-data.`,
    )
  }

  // 1. Export symbol sets.
  const uiDir = path.join(root, 'src', 'components', 'ui')
  const symbolToFile = parseIndexExports(fs.readFileSync(path.join(uiDir, 'index.ts'), 'utf8'))
  const chartExports = parseChartExports(fs.readFileSync(path.join(uiDir, 'chart.tsx'), 'utf8'))

  // 2. Documented symbols (example imports + Sub-components) must exist.
  const documented = new Set<string>()
  for (const rec of components) {
    const isChart = rec.importPath.endsWith('/chart')
    const exportSet = isChart ? chartExports : new Set(symbolToFile.keys())
    for (const symbol of [...rec.symbols, ...rec.subComponents]) {
      documented.add(symbol)
      if (!exportSet.has(symbol)) {
        errors.push(`${rec.name}: documented symbol "${symbol}" not exported from ${rec.importPath}`)
      }
    }
  }

  // 3. Reverse: exported Uppercase symbols not documented anywhere.
  for (const symbol of symbolToFile.keys()) {
    if (/^[A-Z]/.test(symbol) && !documented.has(symbol)) {
      warnings.push(`undocumented export (main): ${symbol} (./${symbolToFile.get(symbol)})`)
    }
  }
  for (const symbol of chartExports) {
    if (/^[A-Z]/.test(symbol) && !documented.has(symbol)) {
      warnings.push(`undocumented export (chart): ${symbol}`)
    }
  }

  // 4. CVA/union variants vs documented enum props.
  const parsedCache = new Map<string, { cva: CvaVariants[]; unions: Array<Set<string>> }>()
  const parsedFor = (file: string) => {
    if (!parsedCache.has(file)) {
      const source = fs.readFileSync(path.join(uiDir, `${file}.tsx`), 'utf8')
      parsedCache.set(file, { cva: extractCvaVariants(source), unions: extractUnionTypes(source) })
    }
    return parsedCache.get(file) as { cva: CvaVariants[]; unions: Array<Set<string>> }
  }

  let compared = 0
  let uncompared = 0
  for (const rec of components) {
    const isChart = rec.importPath.endsWith('/chart')
    const files = isChart
      ? ['chart']
      : [...new Set(rec.symbols.map((s) => symbolToFile.get(s)).filter((f): f is string => Boolean(f)))]
    const cvaList = files.flatMap((f) => parsedFor(f).cva)
    const unionList = files.flatMap((f) => parsedFor(f).unions)

    for (const variant of rec.variants) {
      const docValues = new Set(variant.values)
      const setEquals = (s: Set<string>) =>
        s.size === docValues.size && [...docValues].every((v) => s.has(v))
      const candidates = cvaList.filter((v) => variant.prop in v)
      if (candidates.length === 0) {
        if (unionList.some(setEquals)) compared++
        else uncompared++
        continue
      }
      compared++
      if (candidates.some((v) => setEquals(v[variant.prop]))) continue
      if (unionList.some(setEquals)) continue // union+map backing shadowed by same-named cva prop
      const superset = candidates.find((v) => [...docValues].every((val) => v[variant.prop].has(val)))
      const label = `${rec.name}.${variant.prop}${variant.target ? ` (${variant.target})` : ''}`
      if (superset) {
        const extra = [...superset[variant.prop]].filter((v) => !docValues.has(v))
        warnings.push(`${label}: src CVA has undocumented values [${extra.join(', ')}]`)
      } else {
        const best = candidates[0]
        const missing = [...docValues].filter((v) => !best[variant.prop].has(v))
        errors.push(
          `${label}: documented values [${missing.join(', ')}] missing in src CVA (src has [${[...best[variant.prop]].join(', ')}])`,
        )
      }
    }
  }

  // 5. CLI registry axis (7onic-specific): every record must have a registry
  //    entry (record name kebab-cased, or a documented page alias), and
  //    registry component keys should be documented somewhere.
  const registrySrc = fs.readFileSync(path.join(root, 'cli', 'src', 'registry', 'index.ts'), 'utf8')
  // Entries look like `  'accordion': {\n    name: 'accordion',` — requiring
  // the `name:` line right after avoids matching object keys inside the
  // embedded component source template literals.
  const registryKeys = new Set(
    [...registrySrc.matchAll(/^  ['"]([\w-]+)['"]: \{\s*\n\s*name:/gm)].map((mm) => mm[1]),
  )
  const RECORD_TO_REGISTRY: Record<string, string[]> = {
    // Measured against cli/src/registry/index.ts keys (40 entries).
    Chart: ['chart'],
    DropdownMenu: ['dropdown'],
    AlertModal: ['modal'], // ships inside the modal entry (modal.tsx)
  }
  const coveredKeys = new Set<string>()
  for (const rec of components) {
    const candidates = RECORD_TO_REGISTRY[rec.name] ?? [kebab(rec.name)]
    const hit = candidates.filter((k) => registryKeys.has(k))
    hit.forEach((k) => coveredKeys.add(k))
    if (hit.length === 0) {
      warnings.push(`${rec.name}: no CLI registry entry (tried: ${candidates.join(', ')})`)
    }
  }
  const uncoveredRegistry = [...registryKeys].filter((k) => !coveredKeys.has(k))
  if (uncoveredRegistry.length > 0) {
    warnings.push(`registry keys without a documented record: ${uncoveredRegistry.join(', ')}`)
  }

  // Report
  console.log(`records: ${components.length} · documented symbols: ${documented.size}`)
  console.log(`src exports: main ${symbolToFile.size} · chart ${chartExports.size} · registry keys ${registryKeys.size}`)
  console.log(`variant props compared: ${compared} · uncompared (no CVA/union backing): ${uncompared}`)
  if (warnings.length > 0) {
    console.log(`\nWARNINGS (${warnings.length}):`)
    for (const w of warnings) console.log(`  ⚠ ${w}`)
  }
  if (errors.length > 0) {
    console.error(`\nERRORS (${errors.length}):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    console.error('\nRESULT: FAIL')
    process.exit(1)
  }
  console.log('\nRESULT: OK')
}

main()
