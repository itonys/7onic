/* eslint-disable no-console */
// verify-docs.ts — Component documentation page verifier
// Checks component doc pages against figma-tokens.json (source of truth),
// generated CSS files, and source components.
// Usage: npx tsx scripts/verify-docs.ts [--component <name>]

import * as fs from 'node:fs'
import * as path from 'node:path'

// ============================================================
// Config
// ============================================================

const ROOT = path.resolve(__dirname, '..')
const COMPONENTS_DIR = path.join(ROOT, 'app/components')
const FIGMA_TOKENS = path.join(ROOT, 'tokens/figma-tokens.json')
const CSS_FILES = [
  path.join(ROOT, 'tokens/css/variables.css'),
  path.join(ROOT, 'tokens/css/themes/light.css'),
  path.join(ROOT, 'tokens/css/themes/dark.css'),
  path.join(ROOT, 'tokens/tailwind/v4-theme.css'),
]

// Pages that are not component pages (skip them)
const SKIP_PAGES = new Set(['installation', 'theming'])

// Known non-exported sub-components
const INTERNAL_SUBCOMPONENTS = [
  'SwitchThumb',
  'SliderTrack',
  'SliderRange',
  'SliderThumb',
  'CheckboxIndicator',
  'RadioIndicator',
]

// ============================================================
// Types
// ============================================================

interface Issue {
  file: string
  line: number
  rule: string
  severity: 'error' | 'warning'
  message: string
}

// ============================================================
// Token loaders
// ============================================================

// Extract all token paths from figma-tokens.json → CSS variable names
function getFigmaTokenPaths(): Set<string> {
  const raw = JSON.parse(fs.readFileSync(FIGMA_TOKENS, 'utf-8'))
  const paths = new Set<string>()

  function walk(obj: Record<string, unknown>, prefix: string) {
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}-${key}` : key
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const record = val as Record<string, unknown>
        // Leaf token node has "value" and "type"
        if ('value' in record && 'type' in record) {
          paths.add(`--${currentPath}`)
        } else {
          walk(record, currentPath)
        }
      }
    }
  }

  // Walk primitive and semantic sections with appropriate prefixes
  if (raw.primitive) {
    // primitive.color.* → --color-*
    if (raw.primitive.color) walk(raw.primitive.color, 'color')
    // primitive.spacing.* → --spacing-*
    if (raw.primitive.spacing) walk(raw.primitive.spacing, 'spacing')
    // primitive.radius.* → --radius-*
    if (raw.primitive.radius) walk(raw.primitive.radius, 'radius')
    // primitive.fontSize.* → --font-size-*
    if (raw.primitive.fontSize) walk(raw.primitive.fontSize, 'font-size')
    // primitive.fontWeight.* → --font-weight-*
    if (raw.primitive.fontWeight) walk(raw.primitive.fontWeight, 'font-weight')
    // primitive.fontFamily.* → --font-family-*
    if (raw.primitive.fontFamily) walk(raw.primitive.fontFamily, 'font-family')
    // primitive.lineHeight.* → --line-height-*
    if (raw.primitive.lineHeight) walk(raw.primitive.lineHeight, 'line-height')
    // primitive.opacity.* → --opacity-*
    if (raw.primitive.opacity) walk(raw.primitive.opacity, 'opacity')
    // primitive.easing.* → --easing-*
    if (raw.primitive.easing) walk(raw.primitive.easing, 'easing')
    // primitive.duration.* → --duration-*
    if (raw.primitive.duration) walk(raw.primitive.duration, 'duration')
  }

  if (raw.semantic) {
    // semantic.color.* → --color-*
    if (raw.semantic.color) walk(raw.semantic.color, 'color')
    // semantic.shadow.* → --shadow-*
    if (raw.semantic.shadow) walk(raw.semantic.shadow, 'shadow')
    // semantic.typography.* → --typography-*
    if (raw.semantic.typography) {
      const walkTypography = (obj: Record<string, unknown>, prefix: string) => {
        for (const [key, val] of Object.entries(obj)) {
          const currentPath = `${prefix}-${key}`
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            const record = val as Record<string, unknown>
            if ('value' in record && 'type' in record) {
              paths.add(`--${currentPath}-font-size`)
              paths.add(`--${currentPath}-line-height`)
              paths.add(`--${currentPath}-font-weight`)
              paths.add(`--${currentPath}-font-family`)
            } else {
              walkTypography(record, currentPath)
            }
          }
        }
      }
      walkTypography(raw.semantic.typography, 'typography')
    }
  }

  return paths
}

// Extract CSS variable declarations from generated files
function getCssVariables(): Set<string> {
  const vars = new Set<string>()
  const re = /^\s*(--[\w-]+)\s*:/gm
  for (const cssFile of CSS_FILES) {
    if (!fs.existsSync(cssFile)) continue
    const content = fs.readFileSync(cssFile, 'utf-8')
    let m: RegExpExecArray | null
    while ((m = re.exec(content)) !== null) {
      vars.add(m[1])
    }
    re.lastIndex = 0
  }
  return vars
}

function getComponentPages(): string[] {
  const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory() && !SKIP_PAGES.has(e.name))
    .map(e => e.name)
    .filter(name => {
      const pagePath = path.join(COMPONENTS_DIR, name, 'page.tsx')
      return fs.existsSync(pagePath)
    })
}

function readLines(filePath: string): string[] {
  return fs.readFileSync(filePath, 'utf-8').split('\n')
}

// ============================================================
// Check 1: Icon names — no "Icon" suffix
// ============================================================

function checkIconNames(lines: string[], filePath: string): Issue[] {
  const issues: Issue[] = []
  const iconSuffixRe = /<([A-Z][a-zA-Z]*Icon)\s*[/> ]/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    if (line.includes('import ')) continue
    if (line.includes('IconButton')) continue

    iconSuffixRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = iconSuffixRe.exec(line)) !== null) {
      const iconName = m[1]
      if (iconName === 'LucideIcon' || iconName === 'TablerIcon') continue
      const correctName = iconName.replace(/Icon$/, '')
      issues.push({
        file: filePath,
        line: i + 1,
        rule: 'icon-name',
        severity: 'error',
        message: `<${iconName}> should be <${correctName}> (Lucide icons have no "Icon" suffix)`,
      })
    }
  }
  return issues
}

// ============================================================
// Check 2: CSS variables — must exist in figma-tokens OR generated CSS
// ============================================================

// Check if a page is a chart component page (uses ChartContainer/Recharts)
function isChartPage(lines: string[]): boolean {
  return lines.some(l => l.includes('ChartContainer') || l.includes('Recharts'))
}

// Collect all --color-* variables referenced in a chart page
// These are runtime-generated by ChartContainer via <ChartStyle> injection
// and don't exist in figma-tokens.json or static CSS files
function extractChartColorVars(lines: string[]): Set<string> {
  const vars = new Set<string>()
  const content = lines.join('\n')
  const re = /var\((--color-[\w-]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    vars.add(m[1])
  }
  return vars
}

function checkCssVariables(
  lines: string[],
  filePath: string,
  figmaVars: Set<string>,
  cssVars: Set<string>,
): Issue[] {
  const issues: Issue[] = []
  const varRefRe = /var\((--[\w-]+)\)/g

  // For chart pages, collect all --color-* vars (runtime-generated by ChartContainer)
  const chartPage = isChartPage(lines)
  const chartColorVars = chartPage ? extractChartColorVars(lines) : new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    varRefRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = varRefRe.exec(line)) !== null) {
      const varName = m[1]
      // Skip Tailwind internals
      if (varName.startsWith('--tw-')) continue

      // Skip ChartContainer runtime-generated --color-* variables
      // These are injected at runtime via <ChartStyle> and won't exist in static files
      if (chartColorVars.has(varName)) continue

      // Check: exists in generated CSS files (includes v4 aliases)?
      if (cssVars.has(varName)) continue

      // Check: traceable to figma-tokens.json?
      if (figmaVars.has(varName)) continue

      issues.push({
        file: filePath,
        line: i + 1,
        rule: 'css-variable',
        severity: 'error',
        message: `var(${varName}) — not in figma-tokens.json or generated CSS`,
      })
    }
  }
  return issues
}

// ============================================================
// Check 3: Related component links — target must exist
// ============================================================

function checkComponentLinks(lines: string[], filePath: string): Issue[] {
  const issues: Issue[] = []
  const linkRe = /href=["'](\/components\/([a-z-]+))["']/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    linkRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = linkRe.exec(line)) !== null) {
      const href = m[1]
      const compName = m[2]
      if (SKIP_PAGES.has(compName)) continue
      const targetPage = path.join(COMPONENTS_DIR, compName, 'page.tsx')
      if (!fs.existsSync(targetPage)) {
        issues.push({
          file: filePath,
          line: i + 1,
          rule: 'link-target',
          severity: 'warning',
          message: `Link to ${href} but ${compName}/page.tsx does not exist`,
        })
      }
    }
  }
  return issues
}

// ============================================================
// Check 4: Non-exported sub-component references
// ============================================================

function checkSubComponentRefs(lines: string[], filePath: string): Issue[] {
  const issues: Issue[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const subComp of INTERNAL_SUBCOMPONENTS) {
      const pattern = `<${subComp}`
      if (line.includes(pattern)) {
        if (line.includes('\uFF08\u5185\u90E8\uFF09') || line.includes('\uFF08\u53C2\u7167\u7528\uFF09') || line.includes('internal')) {
          continue
        }
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('{/*')) {
          continue
        }
        issues.push({
          file: filePath,
          line: i + 1,
          rule: 'internal-subcomponent',
          severity: 'warning',
          message: `<${subComp}> is not exported — use （内部）/（参照用） label or avoid in user-facing code`,
        })
      }
    }
  }
  return issues
}

// ============================================================
// Check 5: Quick Stats cards count
// ============================================================

function checkQuickStats(lines: string[], filePath: string): Issue[] {
  const issues: Issue[] = []
  const content = lines.join('\n')

  const statCardRe = /statCards|stats.*=.*\[/i
  if (statCardRe.test(content)) {
    const arrayMatch = content.match(/(?:statCards|stats)\s*=\s*\[([\s\S]*?)\]/i)
    if (arrayMatch) {
      const arrayContent = arrayMatch[1]
      const objectCount = (arrayContent.match(/\{/g) || []).length
      if (objectCount !== 4) {
        const lineIdx = lines.findIndex(l => /statCards|stats.*=.*\[/i.test(l))
        issues.push({
          file: filePath,
          line: lineIdx + 1,
          rule: 'quick-stats',
          severity: 'warning',
          message: `Quick Stats should have 4 cards, found ${objectCount}`,
        })
      }
    }
  }

  return issues
}

// ============================================================
// Main
// ============================================================

function main() {
  const args = process.argv.slice(2)
  const targetComponent = args.includes('--component')
    ? args[args.indexOf('--component') + 1]
    : null

  console.log('\n  verify-docs — Component Documentation Verifier\n')

  // Load token sources
  const figmaVars = getFigmaTokenPaths()
  console.log(`  [figma-tokens.json] ${figmaVars.size} token paths`)

  const cssVars = getCssVariables()
  console.log(`  [CSS files]         ${cssVars.size} CSS variables`)

  // Get component pages
  let pages = getComponentPages()
  if (targetComponent) {
    pages = pages.filter(p => p === targetComponent)
    if (pages.length === 0) {
      console.error(`  Component "${targetComponent}" not found`)
      process.exit(1)
    }
  }
  console.log(`  [Pages]             ${pages.length} component pages\n`)

  const allIssues: Issue[] = []

  for (const page of pages) {
    const pagePath = path.join(COMPONENTS_DIR, page, 'page.tsx')
    const lines = readLines(pagePath)

    const pageIssues: Issue[] = [
      ...checkIconNames(lines, pagePath),
      ...checkCssVariables(lines, pagePath, figmaVars, cssVars),
      ...checkComponentLinks(lines, pagePath),
      ...checkSubComponentRefs(lines, pagePath),
      ...checkQuickStats(lines, pagePath),
    ]

    if (pageIssues.length > 0) {
      console.log(`  ${page}/page.tsx — ${pageIssues.length} issue(s)`)
      for (const issue of pageIssues) {
        const icon = issue.severity === 'error' ? 'ERR' : 'WARN'
        console.log(`     [${icon}] [${issue.rule}] L${issue.line}: ${issue.message}`)
      }
      console.log()
    } else {
      console.log(`  OK ${page}/page.tsx`)
    }

    allIssues.push(...pageIssues)
  }

  // Summary
  console.log('\n' + '-'.repeat(60))
  const errors = allIssues.filter(i => i.severity === 'error')
  const warnings = allIssues.filter(i => i.severity === 'warning')
  console.log(`  Total: ${allIssues.length} issues (${errors.length} errors, ${warnings.length} warnings)`)

  if (errors.length > 0) {
    console.log('\n  FAILED\n')
    process.exit(1)
  } else if (warnings.length > 0) {
    console.log('\n  Passed with warnings\n')
    process.exit(0)
  } else {
    console.log('\n  All checks passed!\n')
    process.exit(0)
  }
}

main()
