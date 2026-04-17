/**
 * verify-publish.ts — Pre-publish validation script
 *
 * Tests the actual npm package by packing, installing in a temp directory,
 * and verifying imports work correctly. Ensures:
 * - Main entry works without recharts
 * - Chart entry fails gracefully without recharts
 * - Chart entry works with recharts
 * - All expected dist files exist
 * - TypeScript declarations are present
 */

import { execSync } from 'child_process'
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

import { tmpdir } from 'os'

const ROOT = process.cwd()
const TMP = join(tmpdir(), 'verify-publish-tmp')
const pkg = require(join(ROOT, 'package.json'))

let passed = 0
let failed = 0

function log(icon: string, msg: string) {
  console.log(`  ${icon} ${msg}`)
}

function pass(msg: string) {
  log('✅', msg)
  passed++
}

function fail(msg: string) {
  log('❌', msg)
  failed++
}

function run(cmd: string, cwd?: string): string {
  return execSync(cmd, { cwd: cwd ?? ROOT, stdio: 'pipe', encoding: 'utf-8' })
}

function cleanup() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true })
  // Clean up .tgz files in project root
  const tgz = readdirSync(ROOT).filter(f => f.endsWith('.tgz'))
  tgz.forEach(f => rmSync(join(ROOT, f)))
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('\n🔍 verify-publish: Pre-publish package validation\n')

// Clean up any previous runs
cleanup()

// ── Step 1: Check dist files exist ──────────────────────────────────────────

console.log('[1/5] Checking dist files...')

const requiredFiles = [
  'dist/index.js', 'dist/index.mjs', 'dist/index.d.ts',
  'dist/chart.js', 'dist/chart.mjs', 'dist/chart.d.ts',
]

for (const file of requiredFiles) {
  if (existsSync(join(ROOT, file))) {
    pass(file)
  } else {
    fail(`${file} — missing`)
  }
}

// ── Step 2: Verify recharts isolation ───────────────────────────────────────

console.log('\n[2/5] Verifying recharts isolation...')

const indexContent = run(`cat dist/index.js`)
const chartContent = run(`cat dist/chart.js`)

if (!indexContent.includes('recharts')) {
  pass('dist/index.js has NO recharts references')
} else {
  fail('dist/index.js contains recharts references — chart not properly separated')
}

if (chartContent.includes('recharts')) {
  pass('dist/chart.js has recharts references (external)')
} else {
  fail('dist/chart.js missing recharts references')
}

// ── Step 3: npm pack + install ──────────────────────────────────────────────

console.log('\n[3/5] Packing and installing...')

const packOutput = run('npm pack --json 2>/dev/null')
const packInfo = JSON.parse(packOutput)
const tgzName = packInfo[0]?.filename ?? `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`
const tgzPath = join(ROOT, tgzName)

if (!existsSync(tgzPath)) {
  fail(`Pack failed — ${tgzName} not found`)
  cleanup()
  process.exit(1)
}
pass(`Packed: ${tgzName}`)

// Create temp project
mkdirSync(TMP, { recursive: true })
writeFileSync(join(TMP, 'package.json'), JSON.stringify({
  name: 'verify-publish-test',
  private: true,
  dependencies: {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
  },
}))

run('npm install --ignore-scripts 2>/dev/null', TMP)
run(`npm install ${tgzPath} --ignore-scripts 2>/dev/null`, TMP)
pass('Installed in temp project')

// ── Step 4: Import tests ────────────────────────────────────────────────────

console.log('\n[4/5] Testing imports...')

// Test 1: Main import without recharts
try {
  const result = run(`node -e "const p = require('@7onic-ui/react'); console.log(Object.keys(p).length)"`, TMP)
  const count = parseInt(result.trim())
  if (count > 100) {
    pass(`Main import OK — ${count} exports (without recharts)`)
  } else {
    fail(`Main import returned only ${count} exports`)
  }
} catch (e: any) {
  fail(`Main import crashed: ${e.message?.split('\n')[0]}`)
}

// Test 2: Chart import without recharts (should fail)
try {
  run(`node -e "require('@7onic-ui/react/chart')"`, TMP)
  fail('Chart import should fail without recharts')
} catch {
  pass('Chart import correctly fails without recharts')
}

// Test 3: Install recharts and test chart import
run('npm install recharts --ignore-scripts 2>/dev/null', TMP)

try {
  const result = run(`node -e "const c = require('@7onic-ui/react/chart'); console.log(Object.keys(c).length)"`, TMP)
  const count = parseInt(result.trim())
  if (count > 5) {
    pass(`Chart import OK — ${count} exports (with recharts)`)
  } else {
    fail(`Chart import returned only ${count} exports`)
  }
} catch (e: any) {
  fail(`Chart import crashed with recharts: ${e.message?.split('\n')[0]}`)
}

// Test 4: Real bundle test — catches missing transitive deps (e.g. react-is)
// require() alone doesn't trigger deep module resolution; bundler does.
run('npm install esbuild --no-save --ignore-scripts 2>/dev/null', TMP)
try {
  run(`cat > bundle-test.mjs << 'EOF'
import { Chart, ChartContainer } from '@7onic-ui/react/chart'
console.log(typeof Chart, typeof ChartContainer)
EOF`, TMP)
  run(`./node_modules/.bin/esbuild bundle-test.mjs --bundle --platform=browser --external:react --external:react-dom --outfile=bundle-out.js 2>&1`, TMP)
  pass('Chart bundle test OK — all transitive deps resolvable')
} catch (e: any) {
  const msg = (e.stderr || e.message || '').split('\n').find((l: string) => /error|can't resolve/i.test(l)) || 'unknown error'
  fail(`Chart bundle failed — missing transitive dep: ${msg.trim()}`)
}

// ── Step 5: Type declarations ───────────────────────────────────────────────

console.log('\n[5/5] Checking type declarations...')

const indexDts = run('cat dist/index.d.ts')
const chartDts = run('cat dist/chart.d.ts')

if (indexDts.includes('Button') && indexDts.includes('Card')) {
  pass('index.d.ts exports Button, Card')
} else {
  fail('index.d.ts missing expected exports')
}

if (!indexDts.includes('ChartConfig') && !indexDts.includes('ChartBar')) {
  pass('index.d.ts has NO chart types (properly separated)')
} else {
  fail('index.d.ts still contains chart types')
}

if (chartDts.includes('ChartConfig') && chartDts.includes('ChartBar')) {
  pass('chart.d.ts exports ChartConfig, ChartBar')
} else {
  fail('chart.d.ts missing expected chart exports')
}

// ── Summary ─────────────────────────────────────────────────────────────────

cleanup()

console.log(`\n${'─'.repeat(50)}`)
console.log(`  Results: ${passed} passed, ${failed} failed`)

if (failed > 0) {
  console.log('  ❌ verify-publish FAILED — do not publish\n')
  process.exit(1)
} else {
  console.log('  ✅ verify-publish PASSED — safe to publish\n')
}
