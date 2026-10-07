// build-data CLI (Phase 2).
// public/llms-full.txt → mcp/data/components.json + mcp/data/rules.json.
// data/ is a committed build artifact — never edit by hand; change the
// source (llms-full.txt) and re-run. Usage: node dist/build-data.js [root]
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { parseComponents, parseRules } from './llms-parser.js'
import { findRepoRoot } from '../src/data/loader.js'

// SECTION 3 `###` headers, measured 2026-10-02 (37 + AI Components 4).
// The "(41)" section title and this guard move together.
const EXPECTED_COMPONENT_COUNT = 41

function main(): void {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : findRepoRoot()
  const llmsPath = path.join(root, 'public', 'llms-full.txt')
  const llmsFull = fs.readFileSync(llmsPath, 'utf8')
  const sourceHash = crypto.createHash('sha256').update(llmsFull).digest('hex')

  const components = parseComponents(llmsFull)
  const rules = parseRules(llmsFull)

  // Chart subpath records require recharts (optional peer in package.json,
  // install note lives outside the component block) — inject explicitly.
  for (const c of components) {
    if (c.importPath.endsWith('/chart') && !c.peerDeps.includes('recharts')) {
      c.peerDeps.push('recharts')
    }
  }

  if (components.length !== EXPECTED_COMPONENT_COUNT) {
    console.error(
      `FAIL: parsed ${components.length} components, expected ${EXPECTED_COMPONENT_COUNT}`,
    )
    console.error(components.map((c) => c.name).join(', '))
    process.exit(1)
  }

  const problems: string[] = []
  for (const c of components) {
    if (!c.importPath) problems.push(`${c.name}: no 7onic import found in examples`)
    if (c.examples.length === 0) problems.push(`${c.name}: no examples`)
    if (c.props.length === 0) problems.push(`${c.name}: no props table`)
  }
  if (rules.whitelist.length !== 9) problems.push(`whitelist items: ${rules.whitelist.length} (expected 9 — #9 is the 7onic-specific token-first/leading-* rule)`)
  if (rules.selfCheck.length !== 10) problems.push(`selfCheck items: ${rules.selfCheck.length} (expected 10)`)
  if (rules.forbiddenPatterns.length === 0) problems.push('no forbidden patterns parsed')
  if (problems.length > 0) {
    console.error('FAIL: parser sanity checks:')
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }

  const dataDir = path.join(root, 'mcp', 'data')
  fs.mkdirSync(dataDir, { recursive: true })
  const meta = { generatedFrom: 'public/llms-full.txt', sourceHash }
  fs.writeFileSync(
    path.join(dataDir, 'components.json'),
    JSON.stringify({ ...meta, count: components.length, components }, null, 2) + '\n',
  )
  fs.writeFileSync(
    path.join(dataDir, 'rules.json'),
    JSON.stringify({ ...meta, rules }, null, 2) + '\n',
  )

  const compound = components.filter((c) => c.compound).length
  console.log(
    `components.json: ${components.length} records (compound ${compound} / standalone ${components.length - compound})`,
  )
  console.log(
    `rules.json: whitelist ${rules.whitelist.length} · forbidden ${rules.forbiddenPatterns.length} · selfCheck ${rules.selfCheck.length} · extra sections ${rules.sections.length}`,
  )
  console.log(`sourceHash: ${sourceHash.slice(0, 16)}…`)
  console.log('OK')
}

main()
