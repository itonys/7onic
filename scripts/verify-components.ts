/* eslint-disable no-console */
// verify-components.ts — Pre-publish component quality checker
// Checks deployment components for hardcoded values, unnecessary code,
// missing token usage, and dark mode compatibility.
// Usage: npm run verify:components

import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(__dirname, '..')
const UI_DIR = path.join(ROOT, 'src/components/ui')
const INDEX_FILE = path.join(UI_DIR, 'index.ts')

// ============================================================
// Token Exception allowlist (from TOKEN-EXCEPTIONS-INDEX.md)
// Files that are allowed to have hardcoded values
// ============================================================

const TOKEN_EXCEPTIONS: Record<string, Set<number>> = {
  // Exception #13: Avatar djb2 hash palette
  'avatar.tsx': new Set([13]),
  // Exception #14, #17: Chart bar radius, hover fade opacity + dark: theme selector (JS string, not CSS class)
  'chart.tsx': new Set([14, 16, 17, 19, 20, 22, 26, 0]),
  // Exception #23: Checkbox/Radio sm click area
  'checkbox.tsx': new Set([23]),
  'radio-group.tsx': new Set([23]),
  // Exception #24: CardImage overlay gradient
  'card.tsx': new Set([24]),
  // Exception #25: Badge remove button icon size
  'badge.tsx': new Set([25]),
  // Exception #27: Radix height CSS vars
  // (in figma-tokens.json, not in component code)
  // Exception #28: Modal/Drawer overlay bg-black/50
  'modal.tsx': new Set([28]),
  'drawer.tsx': new Set([28]),
  // Exception #36: Dropdown min-w-[8rem]
  'dropdown.tsx': new Set([36]),
  // Exception #30: Tooltip inverted glassmorphism
  'tooltip.tsx': new Set([30]),
  // Exception #31: Popover elevated glassmorphism
  'popover.tsx': new Set([31]),
  // Exception #32: Alert default icon 18px
  'alert.tsx': new Set([32]),
  // Exception #33: Toast layout numeric constants
  'toast.tsx': new Set([33]),
  // Exception #34: Spinner speed inline animationDuration
  'spinner.tsx': new Set([34]),
  // Navigation-menu: Radix collapsible inline style + layout constraints
  'navigation-menu.tsx': new Set([]),
  // Progress: value% dynamic inline style
  'progress.tsx': new Set([]),
  // Skeleton: width/height dynamic prop inline style
  'skeleton.tsx': new Set([]),
  // Table: wrapperClassName JSDoc example, not actual code
  'table.tsx': new Set([]),
}

// ============================================================
// Check definitions
// ============================================================

interface Issue {
  file: string
  line: number
  rule: string
  message: string
  severity: 'error' | 'warning'
}

// Hardcoded color classes (not semantic tokens)
// Semantic: bg-background, bg-primary, text-foreground, border-border, etc.
// Hardcoded: bg-gray-500, bg-white, bg-black, text-red-600, etc.
const HARDCODED_COLOR_PATTERN = /\b(?:bg|text|border|ring|shadow|outline|fill|stroke|from|to|via)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d+)?(?:\/\d+)?\b/g

// Hardcoded spacing/sizing with arbitrary values
const ARBITRARY_VALUE_PATTERN = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|w|h|min-w|min-h|max-w|max-h|top|bottom|left|right|inset|text)-\[\d+(?:px|rem|em)?\]/g

// Console statements
const CONSOLE_PATTERN = /\bconsole\.\w+\s*\(/g

// TODO/FIXME/HACK comments
const TODO_PATTERN = /\/\/\s*(?:TODO|FIXME|HACK|XXX|TEMP|DEBUG)\b/gi

// Commented-out code (lines starting with // followed by code-like patterns)
const COMMENTED_CODE_PATTERN = /^(\s*)\/\/\s*(?:import |export |const |let |var |function |return |if |else |for |while |switch |<[A-Z])/

// Inline style objects (potential CSP issues)
const INLINE_STYLE_PATTERN = /\bstyle\s*=\s*\{\s*\{/g

// dark: class usage (might indicate manual dark mode override instead of semantic tokens)
const DARK_CLASS_PATTERN = /\bdark:/g

// ============================================================
// Checks
// ============================================================

function checkFile(filePath: string, content: string, fileName: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')
  const hasExceptions = TOKEN_EXCEPTIONS[fileName]

  lines.forEach((line, i) => {
    const lineNum = i + 1

    // Skip import lines for color checks
    const trimmed = line.trim()
    if (trimmed.startsWith('import ') || trimmed.startsWith('// ')) {
      // Still check TODO/FIXME in comments
      const todoMatch = trimmed.match(TODO_PATTERN)
      if (todoMatch) {
        issues.push({
          file: fileName,
          line: lineNum,
          rule: 'no-todo',
          message: `TODO/FIXME comment: "${trimmed.slice(0, 80)}"`,
          severity: 'warning',
        })
      }

      // Check commented-out code (but not regular comments)
      if (COMMENTED_CODE_PATTERN.test(trimmed)) {
        issues.push({
          file: fileName,
          line: lineNum,
          rule: 'no-commented-code',
          message: `Possible commented-out code: "${trimmed.slice(0, 80)}"`,
          severity: 'warning',
        })
      }
      return
    }

    // 1. Hardcoded color classes
    const colorMatches = line.match(HARDCODED_COLOR_PATTERN)
    if (colorMatches && !hasExceptions) {
      for (const match of colorMatches) {
        issues.push({
          file: fileName,
          line: lineNum,
          rule: 'no-hardcoded-color',
          message: `Hardcoded color class: "${match}" — use semantic token`,
          severity: 'error',
        })
      }
    } else if (colorMatches && hasExceptions) {
      // Has exceptions — log as info but don't error
      // (already registered in TOKEN-EXCEPTIONS-INDEX)
    }

    // 2. Arbitrary values (potential token violation)
    const arbitraryMatches = line.match(ARBITRARY_VALUE_PATTERN)
    if (arbitraryMatches) {
      for (const match of arbitraryMatches) {
        // Skip known exceptions
        if (hasExceptions) continue
        issues.push({
          file: fileName,
          line: lineNum,
          rule: 'no-arbitrary-value',
          message: `Arbitrary value: "${match}" — use design token`,
          severity: 'warning',
        })
      }
    }

    // 3. Console statements
    if (CONSOLE_PATTERN.test(line)) {
      issues.push({
        file: fileName,
        line: lineNum,
        rule: 'no-console',
        message: `Console statement found: "${trimmed.slice(0, 60)}"`,
        severity: 'error',
      })
    }

    // 4. TODO/FIXME
    const todoMatch = line.match(TODO_PATTERN)
    if (todoMatch) {
      issues.push({
        file: fileName,
        line: lineNum,
        rule: 'no-todo',
        message: `TODO/FIXME comment: "${trimmed.slice(0, 80)}"`,
        severity: 'warning',
      })
    }

    // 5. Commented-out code
    if (COMMENTED_CODE_PATTERN.test(line)) {
      issues.push({
        file: fileName,
        line: lineNum,
        rule: 'no-commented-code',
        message: `Possible commented-out code: "${trimmed.slice(0, 80)}"`,
        severity: 'warning',
      })
    }

    // 6. Inline styles (CSP concern)
    if (INLINE_STYLE_PATTERN.test(line)) {
      // Skip known exceptions (spinner speed, etc.)
      if (hasExceptions) return
      issues.push({
        file: fileName,
        line: lineNum,
        rule: 'no-inline-style',
        message: `Inline style object — potential CSP issue`,
        severity: 'warning',
      })
    }

    // 7. dark: class (should use semantic tokens instead)
    const darkMatches = line.match(DARK_CLASS_PATTERN)
    if (darkMatches && !hasExceptions) {
      issues.push({
        file: fileName,
        line: lineNum,
        rule: 'dark-class-usage',
        message: `Manual dark: class — verify semantic token isn't available`,
        severity: 'warning',
      })
    }
  })

  return issues
}

// ============================================================
// Index.ts export completeness check
// ============================================================

function checkExports(): Issue[] {
  const issues: Issue[] = []

  if (!fs.existsSync(INDEX_FILE)) {
    issues.push({
      file: 'index.ts',
      line: 0,
      rule: 'missing-index',
      message: 'index.ts not found',
      severity: 'error',
    })
    return issues
  }

  const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8')
  const componentFiles = fs.readdirSync(UI_DIR)
    .filter((f) => f.endsWith('.tsx') && f !== 'index.ts')

  for (const file of componentFiles) {
    const baseName = file.replace('.tsx', '')
    // Check if the component is exported from index.ts
    if (!indexContent.includes(`'./${baseName}'`) && !indexContent.includes(`"./${baseName}"`)) {
      issues.push({
        file: 'index.ts',
        line: 0,
        rule: 'missing-export',
        message: `Component "${baseName}" not exported from index.ts`,
        severity: 'error',
      })
    }
  }

  return issues
}

// ============================================================
// Main
// ============================================================

function run() {
  console.log('🔍 Verifying deployment components...\n')

  const allIssues: Issue[] = []

  // Check each component file
  const files = fs.readdirSync(UI_DIR).filter((f) => f.endsWith('.tsx'))

  for (const file of files) {
    const filePath = path.join(UI_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const issues = checkFile(filePath, content, file)
    allIssues.push(...issues)
  }

  // Check index.ts exports
  allIssues.push(...checkExports())

  // ── Summary ──
  const errors = allIssues.filter((i) => i.severity === 'error')
  const warnings = allIssues.filter((i) => i.severity === 'warning')

  // Group by file
  const byFile = new Map<string, Issue[]>()
  for (const issue of allIssues) {
    const list = byFile.get(issue.file) || []
    list.push(issue)
    byFile.set(issue.file, list)
  }

  if (allIssues.length === 0) {
    console.log('✅ All deployment components are clean — ready for publish')
    process.exit(0)
  }

  // Print by file
  for (const [file, issues] of byFile) {
    console.log(`  ${file}`)
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '✗' : '⚠'
      const lineStr = issue.line > 0 ? `:${issue.line}` : ''
      console.log(`    ${icon} ${file}${lineStr} [${issue.rule}] ${issue.message}`)
    }
    console.log()
  }

  console.log(`Results: ${errors.length} error(s), ${warnings.length} warning(s)\n`)

  if (errors.length > 0) {
    console.error(`❌ Component verification failed — ${errors.length} error(s) must be fixed`)
    process.exit(1)
  } else {
    console.log('⚠ Component verification passed with warnings — review before publish')
    process.exit(0)
  }
}

run()
