/**
 * @7onic-ui/tokens CLI — User-facing token sync
 *
 * Reads figma-tokens.json and generates distribution files.
 * Does NOT inject into globals.css (that is docs-site only).
 *
 * Usage:
 *   npx sync-tokens [options]
 *
 * Options:
 *   --input <path>    Path to figma-tokens.json (default: ./figma-tokens.json)
 *   --output <dir>    Output directory (default: ./)
 *   --force           Skip confirmation prompts
 *   --dry-run         Preview without writing files
 *   --help            Show help
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  validateTokens,
  printTokenWarnings,
  generateVariablesCss,
  generateThemeLight,
  generateThemeDark,
  generateV3Preset,
  generateV4Theme,
  generateJsTokens,
  generateTypeDefinitions,
  generateNormalizedJson,
  generateCssBundle,
  generateV4Bundle,
  parseExistingVars,
  detectBreakingChanges,
  formatBreakingChanges,
  formatDiff,
  generateDeprecatedAliases,
  promptUser,
  readJsonFile,
} from './sync-tokens'

import type { FigmaTokens } from './sync-tokens'

// ============================================================
// CLI Argument Parsing
// ============================================================

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const parsed = {
    input: './figma-tokens.json',
    output: './',
    force: false,
    dryRun: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        parsed.input = args[++i] ?? parsed.input
        break
      case '--output':
        parsed.output = args[++i] ?? parsed.output
        break
      case '--force':
        parsed.force = true
        break
      case '--dry-run':
        parsed.dryRun = true
        break
      case '--help':
      case '-h':
        parsed.help = true
        break
    }
  }

  return parsed
}

function showHelp(): void {
  console.log(`
@7onic-ui/tokens — Design Token Sync CLI

Usage:
  npx sync-tokens [options]

Options:
  --input <path>    Path to figma-tokens.json (default: ./figma-tokens.json)
  --output <dir>    Output directory (default: ./)
  --force           Skip confirmation prompts
  --dry-run         Preview changes without writing files
  --help, -h        Show this help message

Generated files:
  css/variables.css          All CSS custom properties + framework baseline (html body reset)
  css/themes/light.css       Light theme semantic colors
  css/themes/dark.css        Dark theme semantic colors
  css/all.css                All-in-one CSS bundle
  tailwind/v3-preset.js      Tailwind CSS v3 preset
  tailwind/v4-theme.css      Tailwind CSS v4 theme
  tailwind/v4.css            All-in-one Tailwind v4 bundle
  js/index.js                CommonJS token exports
  js/index.mjs               ESM token exports
  types/index.d.ts           TypeScript type definitions
  json/tokens.json           Flat resolved JSON

Example:
  npx sync-tokens --input ./design/figma-tokens.json --output ./tokens/
`)
}

// ============================================================
// File Writer (output-relative)
// ============================================================

type WriteStatus = 'new' | 'updated' | 'unchanged'

function writeOutputFile(outputDir: string, relativePath: string, content: string): WriteStatus {
  const fullPath = path.resolve(outputDir, relativePath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  let status: WriteStatus
  if (!fs.existsSync(fullPath)) {
    status = 'new'
  } else {
    const existing = fs.readFileSync(fullPath, 'utf-8')
    status = existing === content ? 'unchanged' : 'updated'
  }

  fs.writeFileSync(fullPath, content)
  return status
}

function formatStatusBadge(status: WriteStatus): string {
  if (status === 'new') return '(NEW)'
  if (status === 'updated') return '(updated)'
  return '(unchanged)'
}

// ============================================================
// Main
// ============================================================

async function cliMain(): Promise<void> {
  const opts = parseArgs(process.argv)

  if (opts.help) {
    showHelp()
    return
  }

  const inputPath = path.resolve(opts.input)
  const outputDir = path.resolve(opts.output)

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ figma-tokens.json not found: ${inputPath}`)
    console.error('   Use --input <path> to specify the location.')
    process.exit(1)
  }

  console.log('🔄 sync-tokens: Reading figma-tokens.json...')
  console.log(`   Input:  ${inputPath}`)
  console.log(`   Output: ${outputDir}`)
  console.log('')

  const tokens = readJsonFile<FigmaTokens>(inputPath)

  // Token Validation
  console.log('🔍 Validating tokens...')
  const tokenWarnings = validateTokens(tokens)
  const hasErrors = tokenWarnings.some((w) => w.level === 'error')

  if (hasErrors) {
    printTokenWarnings(tokenWarnings)
    console.error('\n❌ Token validation failed with errors. Fix the issues above before syncing.')
    process.exit(1)
  }

  // Breaking Change & Diff Detection
  let deprecatedCss = ''
  const existingVarsCssPath = path.join(outputDir, 'css/variables.css')
  const existingCss = fs.existsSync(existingVarsCssPath)
    ? fs.readFileSync(existingVarsCssPath, 'utf-8')
    : ''

  if (existingCss) {
    const oldVars = parseExistingVars(existingCss)
    const newCss = generateVariablesCss(tokens)
    const newVars = parseExistingVars(newCss)

    const changes = detectBreakingChanges(oldVars, newVars)
    const hasBreaking = changes.removed.size > 0 || changes.renamed.length > 0
    const hasAnyChange = hasBreaking || changes.added.size > 0 || changes.changed.length > 0

    // Show diff summary
    if (hasAnyChange) {
      console.log(formatDiff(changes))
    }

    // Breaking change prompt
    if (hasBreaking) {
      console.log(formatBreakingChanges(changes))
      if (!opts.force) {
        const proceed = await promptUser('')
        if (!proceed) {
          console.log('❌ Aborted.')
          process.exit(1)
        }
      }
    }

    // Generate deprecated aliases for renames
    deprecatedCss = generateDeprecatedAliases(changes)
    if (deprecatedCss) {
      console.log(`📝 Generating deprecated aliases (${changes.renamed.length} renames)...`)
    }
  }

  // Generate all distribution files
  console.log('📝 Generating files...')

  const variablesCss = generateVariablesCss(tokens)
  const themeLight = generateThemeLight(tokens)
  const themeDark = generateThemeDark(tokens)
  const v3Preset = generateV3Preset(tokens)
  const v4Theme = generateV4Theme(tokens)
  const jsTokens = generateJsTokens(tokens)
  const typeDefs = generateTypeDefinitions(tokens)
  const normalizedJson = generateNormalizedJson(tokens)
  const cssBundle = generateCssBundle()
  const v4Bundle = generateV4Bundle()

  if (opts.dryRun) {
    console.log('\n--- DRY RUN: No files written ---')
    printTokenWarnings(tokenWarnings)
    console.log('\nFiles that would be generated:')
    console.log('   📄 css/variables.css')
    console.log('   📄 css/themes/light.css')
    console.log('   📄 css/themes/dark.css')
    console.log('   📄 tailwind/v3-preset.js')
    console.log('   📄 tailwind/v4-theme.css')
    console.log('   📄 js/index.js')
    console.log('   📄 js/index.mjs')
    console.log('   📄 types/index.d.ts')
    console.log('   📄 json/tokens.json')
    console.log('   📄 css/all.css (bundle)')
    console.log('   📄 tailwind/v4.css (bundle)')
    console.log('\n✅ Dry run complete.')
    return
  }

  // Write files — collect status per file for clear user visibility
  const statuses: Array<{ label: string; status: WriteStatus }> = [
    { label: 'css/variables.css',         status: writeOutputFile(outputDir, 'css/variables.css', variablesCss) },
    { label: 'css/themes/light.css',      status: writeOutputFile(outputDir, 'css/themes/light.css', themeLight) },
    { label: 'css/themes/dark.css',       status: writeOutputFile(outputDir, 'css/themes/dark.css', themeDark) },
    { label: 'tailwind/v3-preset.js',     status: writeOutputFile(outputDir, 'tailwind/v3-preset.js', v3Preset) },
    { label: 'tailwind/v4-theme.css',     status: writeOutputFile(outputDir, 'tailwind/v4-theme.css', v4Theme) },
    { label: 'js/index.js',               status: writeOutputFile(outputDir, 'js/index.js', jsTokens.cjs) },
    { label: 'js/index.mjs',              status: writeOutputFile(outputDir, 'js/index.mjs', jsTokens.esm) },
    { label: 'types/index.d.ts',          status: writeOutputFile(outputDir, 'types/index.d.ts', typeDefs) },
    { label: 'json/tokens.json',          status: writeOutputFile(outputDir, 'json/tokens.json', normalizedJson) },
    { label: 'css/all.css (bundle)',      status: writeOutputFile(outputDir, 'css/all.css', cssBundle) },
    { label: 'tailwind/v4.css (bundle)',  status: writeOutputFile(outputDir, 'tailwind/v4.css', v4Bundle) },
  ]

  // Write deprecated aliases if any renames detected
  if (deprecatedCss) {
    const depStatus = writeOutputFile(outputDir, 'css/deprecated.css', deprecatedCss)
    statuses.push({ label: 'css/deprecated.css (backwards compat)', status: depStatus })
  }

  printTokenWarnings(tokenWarnings)

  // Summary: count per status + per-file listing
  const newCount = statuses.filter(s => s.status === 'new').length
  const updatedCount = statuses.filter(s => s.status === 'updated').length
  const unchangedCount = statuses.filter(s => s.status === 'unchanged').length

  console.log('')
  console.log(`✅ sync-tokens complete: ${newCount} new, ${updatedCount} updated, ${unchangedCount} unchanged`)
  for (const { label, status } of statuses) {
    const fullLabel = path.relative('.', path.join(outputDir, label.replace(/ \(.*\)/, '')))
    const suffix = label.includes('(bundle)') ? ' (bundle)' : label.includes('(backwards compat)') ? ' (backwards compat)' : ''
    console.log(`   📄 ${fullLabel}${suffix} ${formatStatusBadge(status)}`)
  }
}

cliMain().catch((err) => {
  console.error('❌ sync-tokens failed:', err.message)
  process.exit(1)
})
