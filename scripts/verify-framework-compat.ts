#!/usr/bin/env node
/**
 * verify-framework-compat.ts
 *
 * Guards the Next.js 15 + Tailwind v4 framework compat alias chain.
 * Renaming any of the protected variables or figma keys breaks dark mode
 * in Next.js projects (v0.3.1 regression root cause).
 *
 * Checks:
 *   1. figma-tokens.json must contain light.color.background.default and light.color.text.default
 *   2. variables.css must contain html:root block with --background and --foreground pointing at safe-island vars
 *   3. themes/light.css, themes/dark.css must use html:root selector (not plain :root)
 *   4. --color-background, --color-text must exist in both theme files
 *
 * Run:
 *   npm run verify:framework-compat
 *
 * Exits non-zero on any violation. Wired into prepublishOnly.
 *
 * See: docs/decisions/NEXTJS-FRAMEWORK-COMPAT-STRATEGY.md §11
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '..')
const FIGMA_JSON = resolve(ROOT, 'tokens/figma-tokens.json')
const VARIABLES_CSS = resolve(ROOT, 'tokens/css/variables.css')
const LIGHT_CSS = resolve(ROOT, 'tokens/css/themes/light.css')
const DARK_CSS = resolve(ROOT, 'tokens/css/themes/dark.css')

type Check = { name: string; pass: boolean; detail: string }
const results: Check[] = []

function check(name: string, pass: boolean, detail: string): void {
  results.push({ name, pass, detail })
}

// ============================================================
// 1. figma-tokens.json keys
// ============================================================

if (!existsSync(FIGMA_JSON)) {
  console.error('✗ figma-tokens.json not found at', FIGMA_JSON)
  process.exit(1)
}

const figma = JSON.parse(readFileSync(FIGMA_JSON, 'utf-8')) as {
  light?: { color?: { background?: Record<string, unknown>; text?: Record<string, unknown> } }
}

check(
  'figma-tokens.json has light.color.background.default',
  Boolean(figma.light?.color?.background?.default),
  'key: light.color.background.default — required for --color-background generation',
)
check(
  'figma-tokens.json has light.color.text.default',
  Boolean(figma.light?.color?.text?.default),
  'key: light.color.text.default — required for --color-text generation (safe-island var)',
)

// ============================================================
// 2. variables.css: html:root alias block, single-direction
// ============================================================

const varsCss = readFileSync(VARIABLES_CSS, 'utf-8')

check(
  'variables.css has html:root alias block',
  /html:root\s*\{[^}]*--background[^}]*--foreground[^}]*\}/s.test(varsCss),
  'block: html:root { --background: ...; --foreground: ...; }',
)
check(
  'variables.css --background points at --color-background (not --color-foreground)',
  /--background:\s*var\(--color-background\)/.test(varsCss),
  'expected: --background: var(--color-background);',
)
check(
  'variables.css --foreground points at --color-text (single-direction, avoids circular)',
  /--foreground:\s*var\(--color-text\)/.test(varsCss),
  'expected: --foreground: var(--color-text); NOT var(--color-foreground) (circular risk)',
)

// ============================================================
// 3. themes/*.css selector: html:root (not :root)
// ============================================================

const lightCss = readFileSync(LIGHT_CSS, 'utf-8')
const darkCss = readFileSync(DARK_CSS, 'utf-8')

check(
  'themes/light.css uses html:root selector (spec 0,1,1)',
  /^html:root\s*\{/m.test(lightCss) && !/^:root\s*\{/m.test(lightCss),
  'first block must be `html:root {` not `:root {` — loses cascade to Next.js @theme inline otherwise',
)
check(
  'themes/dark.css uses html:root[data-theme="dark"] (spec 0,2,1)',
  /html:root\[data-theme="dark"\]/.test(darkCss) && !/^:root\[data-theme="dark"\]/m.test(darkCss),
  'selector must be `html:root[data-theme="dark"]`',
)
check(
  'themes/dark.css uses html:root.dark (spec 0,2,1)',
  /html:root\.dark/.test(darkCss),
  'selector must be `html:root.dark`',
)
check(
  'themes/dark.css uses html:root:not([data-theme="light"]) (spec 0,2,1)',
  /html:root:not\(\[data-theme="light"\]\)/.test(darkCss),
  'selector must be `html:root:not([data-theme="light"])` inside @media',
)

// ============================================================
// 4. Safe-island variables present in both themes
// ============================================================

check(
  'themes/light.css defines --color-background',
  /--color-background:\s*/.test(lightCss),
  'required for alias chain resolution',
)
check(
  'themes/light.css defines --color-text',
  /--color-text:\s*/.test(lightCss),
  'required for alias chain resolution (safe-island)',
)
check(
  'themes/dark.css defines --color-background (dark override)',
  darkCss.split('--color-background:').length - 1 >= 2,
  'dark.css should define --color-background in both @media and manual blocks',
)
check(
  'themes/dark.css defines --color-text (dark override)',
  darkCss.split('--color-text:').length - 1 >= 2,
  'dark.css should define --color-text in both @media and manual blocks',
)

// ============================================================
// Report
// ============================================================

const passed = results.filter(r => r.pass).length
const failed = results.filter(r => !r.pass)

console.log('')
console.log('Framework Compat Verification (v0.3.2+)')
console.log('─'.repeat(60))
for (const r of results) {
  const icon = r.pass ? '✓' : '✗'
  console.log(`${icon} ${r.name}`)
  if (!r.pass) console.log(`  ↳ ${r.detail}`)
}
console.log('─'.repeat(60))
console.log(`${passed}/${results.length} checks passed`)

if (failed.length > 0) {
  console.error('')
  console.error('✗ Framework compat violations detected.')
  console.error('  See: docs/decisions/NEXTJS-FRAMEWORK-COMPAT-STRATEGY.md §11')
  console.error('  These guard the v0.3.1 → v0.3.2 regression fix.')
  process.exit(1)
}

console.log('')
console.log('✓ All framework compat checks passed.')
process.exit(0)
