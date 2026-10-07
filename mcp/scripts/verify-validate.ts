// Phase 4 gate: the validate_code engine must (a) detect every forbidden
// pattern group from llms SECTION 1, and (b) report ZERO errors across all
// verified llms examples (false-positive sweep). Run: npm run verify-validate.
import { validateCode } from '../src/validate/engine.js'
import { loadComponents } from '../src/data/artifacts.js'

let failed = false
function check(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : ` — ${detail}`}`)
  if (!ok) failed = true
}

// --- (a) forbidden pattern groups: each fixture must trigger its rule --------

const FIXTURES: Array<{ group: string; rule: string; code: string }> = [
  {
    group: '1. HTML instead of components',
    rule: 'html-element',
    code: `export const A = () => <button className="bg-primary rounded-lg px-4 py-2">Save</button>`,
  },
  {
    group: '2. className overriding component styles',
    rule: 'visual-override',
    code: `import { Button } from '@7onic-ui/react'
export const A = () => <Button className="bg-primary-hover rounded-full">Go</Button>`,
  },
  {
    group: '3. Raw Tailwind colors',
    rule: 'raw-color',
    code: `export const A = () => <div className="bg-blue-500 text-gray-700 border-gray-200">x</div>`,
  },
  {
    group: '4. Dark mode prefix',
    rule: 'dark-prefix',
    code: `export const A = () => <div className="bg-background dark:bg-gray-900">x</div>`,
  },
  {
    group: '5. Arbitrary values',
    rule: 'arbitrary-value',
    code: `export const A = () => <div className="p-[17px] text-[13px] rounded-[7px] z-[999]">x</div>`,
  },
  {
    group: '6. Inline styles',
    rule: 'inline-style',
    code: `export const A = () => <div style={{ color: '#333', padding: '20px' }}>x</div>`,
  },
  {
    group: '7. @apply with raw values',
    rule: 'apply-raw',
    code: 'const css = `\n.btn { @apply bg-blue-500 px-4; }\n`',
  },
  {
    group: '8. Icon sizing with w/h',
    rule: 'icon-size',
    code: `export const A = () => <svg className="w-4 h-4 shrink-0" />`,
  },
  {
    group: '9. Radix direct import',
    rule: 'radix-import',
    code: `import * as Dialog from '@radix-ui/react-dialog'`,
  },
  {
    group: '10. Unnecessary component wrappers',
    rule: 'wrapper-component',
    code: `import { Button } from '@7onic-ui/react'
function MyButton(props: any) { return <Button {...props} /> }`,
  },
  // Self-check extras beyond the 10 groups.
  {
    group: 'SC#9 divide without token color',
    rule: 'divide-no-color',
    code: `export const A = () => <ul className="divide-y">{null}</ul>`,
  },
  {
    group: 'SC#10 opacity on element',
    rule: 'opacity-element',
    code: `export const A = () => <div className="bg-primary opacity-10">x</div>`,
  },
  {
    group: 'Token-first leading override',
    rule: 'leading-override',
    code: `export const A = () => <p className="text-sm leading-relaxed">x</p>`,
  },
  {
    group: 'Unknown class (not in whitelist)',
    rule: 'not-in-whitelist',
    code: `export const A = () => <div className="bg-violet-500 p-7">x</div>`,
  },
]

console.log('=== (a) forbidden pattern detection ===')
for (const f of FIXTURES) {
  const r = validateCode(f.code)
  const hit = r.violations.some((v) => v.rule === f.rule)
  check(f.group, hit, `expected rule "${f.rule}", got [${r.violations.map((v) => v.rule).join(', ') || 'none'}]`)
}

// ds-ignore suppression + locale smoke.
console.log('=== (b) ds-ignore + locale ===')
{
  const r = validateCode(`export const A = () => (
  <div
    // ds-ignore
    className="p-[17px]"
  >x</div>
)`)
  check('ds-ignore suppresses next line', r.violations.length === 0,
    `got [${r.violations.map((v) => `${v.rule}@${v.line}`).join(', ')}]`)
  const ja = validateCode(`export const A = () => <div className="dark:bg-gray-900">x</div>`, { locale: 'ja' })
  check('locale ja message', /dark: プレフィックス/.test(ja.violations[0]?.message ?? ''), ja.violations[0]?.message ?? 'no violation')
  const ko = validateCode(`export const A = () => <div className="p-[17px]">x</div>`, { locale: 'ko' })
  check('locale ko message', /임의 값/.test(ko.violations[0]?.message ?? ''), ko.violations[0]?.message ?? 'no violation')
}

// --- (c) llms examples: zero errors (false-positive sweep) -------------------

console.log('=== (c) llms example sweep (0 errors expected) ===')
const artifact = loadComponents()
let total = 0
let errorExamples = 0
let warningCount = 0
const errorDetails: string[] = []
const warningDetails: string[] = []
for (const comp of artifact.components) {
  for (const [i, ex] of comp.examples.entries()) {
    total += 1
    const r = validateCode(ex)
    if (r.errors > 0) {
      errorExamples += 1
      for (const v of r.violations.filter((x) => x.severity === 'error')) {
        errorDetails.push(`${comp.name}#${i} L${v.line} [${v.rule}] ${v.found}`)
      }
    }
    warningCount += r.warnings
    for (const v of r.violations.filter((x) => x.severity === 'warning')) {
      warningDetails.push(`${comp.name}#${i} L${v.line} [${v.rule}] ${v.found}`)
    }
  }
}
check(`llms examples: ${total} checked, errors in ${errorExamples}`, errorExamples === 0,
  `\n  ${errorDetails.slice(0, 40).join('\n  ')}`)
// Warnings are informational (not gated) — review that each one is intended.
console.log(`INFO  llms example warnings: ${warningCount}`)
for (const w of warningDetails.slice(0, 20)) console.log(`      ${w}`)

console.log(failed ? 'RESULT: FAIL' : 'RESULT: OK')
process.exit(failed ? 1 : 0)
