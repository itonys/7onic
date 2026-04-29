import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { findProjectRoot, writeConfig, configExists, type Config } from '../utils/config'
import { detectFramework, type Framework } from '../utils/detect-framework'
import { detectTailwind, type TailwindDetection } from '../utils/detect-tailwind'
import { detectPackageManager, type PackageManager } from '../utils/detect-pm'
import { installDeps } from '../utils/install-deps'
import { gracefulExit, userCancel } from '../utils/graceful-exit'
import { buildCssImports, requiredTokenImports } from '../utils/css-imports-builder'
import { wrapStarReset } from '../utils/star-reset-wrap'
import { parseJsonc } from '../utils/jsonc-parse'
import { findFirstExisting, hasDependency, pathExists } from '../utils/project-helpers'
import { scanViteTemplate, applyCleanup } from '../utils/vite-template-cleanup'

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const CSS_CANDIDATES = [
  'src/app/globals.css',
  'app/globals.css',
  'src/index.css',
  'src/styles/globals.css',
  'styles/globals.css',
] as const

const DEFAULT_CSS_PATH = 'src/app/globals.css'
const DEFAULT_COMPONENTS_ALIAS = '@/components/ui'
const DEFAULT_UTILS_ALIAS = '@/lib/utils'

const INSTALL_PAGE = 'https://7onic.design/components/installation'
const NEXT_TS_DOCS = 'https://nextjs.org/docs/app/api-reference/config/typescript'
const VITE_TS_DOCS = 'https://vitejs.dev/guide/features.html#typescript'

const CN_UTIL = `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

/** "1 block" / "2 blocks" — pluralize for log messages. */
function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

// ────────────────────────────────────────────────────────────────────────────
// Flag parsing
// ────────────────────────────────────────────────────────────────────────────

interface ParsedArgs {
  flagYes: boolean
  forcedTailwindVersion: 3 | 4 | null
  invalidTailwindFlag: string | null
}

function parseArgs(args: string[]): ParsedArgs {
  const flagYes = args.includes('--yes') || args.includes('-y')
  const tailwindFlagIdx = args.indexOf('--tailwind')
  if (tailwindFlagIdx === -1) {
    return { flagYes, forcedTailwindVersion: null, invalidTailwindFlag: null }
  }
  const raw = args[tailwindFlagIdx + 1] ?? ''
  if (raw === 'v3' || raw === '3') return { flagYes, forcedTailwindVersion: 3, invalidTailwindFlag: null }
  if (raw === 'v4' || raw === '4') return { flagYes, forcedTailwindVersion: 4, invalidTailwindFlag: null }
  return { flagYes, forcedTailwindVersion: null, invalidTailwindFlag: raw }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

export async function init(args: string[]): Promise<void> {
  const { flagYes, forcedTailwindVersion, invalidTailwindFlag } = parseArgs(args)

  p.intro(pc.bold('7onic init'))

  if (invalidTailwindFlag !== null) {
    p.log.warn(`Invalid --tailwind value: "${invalidTailwindFlag || '(empty)'}". Use v3 or v4.`)
  }

  // Step 1: Project root
  const projectRoot = findProjectRoot(process.cwd())
  if (!projectRoot) {
    gracefulExit({
      message: 'No package.json found.',
      hint: 'Run this command inside a project directory.',
      link: INSTALL_PAGE,
    })
  }

  // Step 2: Existing 7onic.json overwrite confirmation
  if (configExists(projectRoot) && !flagYes) {
    const overwrite = await p.confirm({ message: '7onic.json already exists. Overwrite?' })
    if (p.isCancel(overwrite) || !overwrite) userCancel()
  }

  // Step 3: Framework detection (ADR §1) — abort if neither Next.js nor Vite
  const framework = detectFramework(projectRoot)
  if (!framework) {
    gracefulExit({
      message: 'We could not detect a supported framework (Next.js or Vite).',
      hint: 'Create a Next.js or Vite project first, then run `npx 7onic init` inside it.',
      link: INSTALL_PAGE,
    })
  }

  // Step 4: TypeScript check (ADR §2) — abort if tsconfig.json missing
  if (!pathExists(projectRoot, 'tsconfig.json')) {
    gracefulExit({
      message: '7onic requires TypeScript, but `tsconfig.json` was not found.',
      link: framework.kind === 'next' ? NEXT_TS_DOCS : VITE_TS_DOCS,
    })
  }

  // Step 5: Tailwind detection (ADR §3) — abort if missing
  const tailwind = detectTailwind(projectRoot)
  if (!tailwind) {
    gracefulExit({
      message: 'No Tailwind CSS configuration found.',
      hint: 'Install Tailwind first, then re-run `npx 7onic init`.',
      link: `${INSTALL_PAGE}#${framework.kind}-v4`,
    })
  }

  // Step 6: Package manager (ADR §4) — silent npm default
  const pm = detectPackageManager(projectRoot)

  // Step 7: Vite @/ alias auto-patch (ADR §5) — Vite only
  let needsTypesNode = false
  if (framework.kind === 'vite') {
    needsTypesNode = await ensureViteAlias(projectRoot, framework)
  }

  // Step 8: @7onic-ui/react coexistence info
  if (hasDependency(projectRoot, '@7onic-ui/react')) {
    p.log.info(
      '@7onic-ui/react detected — CLI copies source files for customization.\n' +
      '  Use one method per component to avoid duplicates.'
    )
  }

  // Step 9: Config prompt (or --yes defaults)
  const { tailwindVersion, cssPath, componentsAlias, utilsAlias } =
    await resolveConfig(projectRoot, { flagYes, forcedTailwindVersion, tailwind })

  // Step 10: Base dependencies install (ADR §6) — lucide-react removed
  await installBaseDeps(projectRoot, pm, needsTypesNode)

  // Step 11: CSS imports inject (ADR §7) — preserve user content, line-precise idempotency
  injectCssImports(projectRoot, cssPath, tailwindVersion)

  // Step 12: Vite stub cleanup (ADR §8) — auto + .bak + notification (no Y/n)
  if (framework.kind === 'vite') {
    cleanupViteStub(projectRoot)
  }

  // Step 13: `*` reset wrap (ADR §9) — Next + v4 only, auto + silent + .bak
  if (framework.kind === 'next' && tailwindVersion === 4) {
    wrapStarResetIfPresent(projectRoot, cssPath)
  }

  // Step 14: Tailwind v3 preset note (informational only)
  if (tailwindVersion === 3 && tailwind.version === 3) {
    showV3PresetNote(projectRoot, tailwind.configPath)
  }

  // Step 15: cn() utility (ADR §10)
  ensureCnUtility(projectRoot, utilsAlias)

  // Step 16: 7onic.json (ADR §11)
  // Only attach `config` field when user-chosen v3 matches detected v3 (config file present).
  const v3ConfigPath =
    tailwindVersion === 3 && tailwind.version === 3 ? tailwind.configPath : undefined

  const finalConfig: Config = {
    $schema: 'https://7onic.design/schema/7onic.json',
    tailwind: {
      version: tailwindVersion,
      ...(v3ConfigPath !== undefined ? { config: v3ConfigPath } : {}),
      css: cssPath,
    },
    aliases: {
      components: componentsAlias,
      utils: utilsAlias,
    },
  }
  writeConfig(projectRoot, finalConfig)
  p.log.success('Created 7onic.json')

  p.outro(`Done! Run ${pc.cyan('npx 7onic add <component>')} to add components.`)
}

// ────────────────────────────────────────────────────────────────────────────
// Step helpers
// ────────────────────────────────────────────────────────────────────────────

interface ResolveConfigOptions {
  flagYes: boolean
  forcedTailwindVersion: 3 | 4 | null
  tailwind: TailwindDetection
}

interface ResolvedConfig {
  componentsAlias: string
  utilsAlias: string
  tailwindVersion: 3 | 4
  cssPath: string
}

async function resolveConfig(
  projectRoot: string,
  { flagYes, forcedTailwindVersion, tailwind }: ResolveConfigOptions,
): Promise<ResolvedConfig> {
  const cssDefault =
    findFirstExisting(projectRoot, CSS_CANDIDATES) ?? DEFAULT_CSS_PATH

  if (flagYes) {
    const tailwindVersion = forcedTailwindVersion ?? tailwind.version
    p.log.info(`Using defaults: Tailwind v${tailwindVersion}, CSS: ${cssDefault}`)
    return {
      componentsAlias: DEFAULT_COMPONENTS_ALIAS,
      utilsAlias: DEFAULT_UTILS_ALIAS,
      tailwindVersion,
      cssPath: cssDefault,
    }
  }

  return await p.group(
    {
      componentsAlias: () =>
        p.text({ message: 'Components path alias', placeholder: DEFAULT_COMPONENTS_ALIAS, defaultValue: DEFAULT_COMPONENTS_ALIAS }),
      utilsAlias: () =>
        p.text({ message: 'Utils path alias', placeholder: DEFAULT_UTILS_ALIAS, defaultValue: DEFAULT_UTILS_ALIAS }),
      tailwindVersion: () =>
        p.select<3 | 4>({
          message: `Tailwind version (detected: v${tailwind.version})`,
          options: [
            { value: 3, label: 'Tailwind v3' },
            { value: 4, label: 'Tailwind v4' },
          ],
          initialValue: forcedTailwindVersion ?? tailwind.version,
        }),
      cssPath: () => p.text({ message: 'CSS file path', placeholder: cssDefault, defaultValue: cssDefault }),
    },
    { onCancel: () => userCancel() },
  )
}

const BASE_DEPS = ['@7onic-ui/tokens', 'clsx', 'tailwind-merge', 'class-variance-authority'] as const

async function installBaseDeps(projectRoot: string, pm: PackageManager, needsTypesNode: boolean): Promise<void> {
  const s = p.spinner()
  s.start(`Installing dependencies (${pm})...`)
  try {
    installDeps([...BASE_DEPS], { cwd: projectRoot, pm })
    if (needsTypesNode) installDeps(['@types/node'], { cwd: projectRoot, pm, dev: true })
    s.stop('Dependencies installed')
  } catch (err) {
    s.stop('Failed to install dependencies')
    gracefulExit({
      message: 'Failed to install dependencies.',
      hint: err instanceof Error ? err.message : String(err),
    })
  }
}

function injectCssImports(projectRoot: string, cssPath: string, version: 3 | 4): void {
  const cssFullPath = path.join(projectRoot, cssPath)

  if (!fs.existsSync(cssFullPath)) {
    fs.mkdirSync(path.dirname(cssFullPath), { recursive: true })
    fs.writeFileSync(cssFullPath, buildCssImports({ version, includeTailwind: true }), 'utf-8')
    p.log.success(`Created ${cssPath} with token imports`)
    return
  }

  const content = fs.readFileSync(cssFullPath, 'utf-8')
  const required = requiredTokenImports(version)
  const missing = required.filter(line => !content.includes(line))

  if (missing.length === 0) {
    p.log.info(`Token imports already present in ${cssPath}`)
    return
  }

  const updated = mergeCssImports(content, missing, version)
  fs.writeFileSync(cssFullPath, updated, 'utf-8')
  p.log.success(`Added token imports to ${cssPath}`)
}

function mergeCssImports(content: string, missingLines: readonly string[], version: 3 | 4): string {
  const block = missingLines.join('\n') + '\n'
  if (version === 4) {
    // Insert after existing `@import "tailwindcss"` if present, else prepend full v4 block.
    const twMatch = content.match(/@import\s+["']tailwindcss["'].*\n/)
    if (twMatch) {
      const insertAt = (twMatch.index ?? 0) + twMatch[0].length
      return content.slice(0, insertAt) + block + content.slice(insertAt)
    }
    return `${buildCssImports({ version: 4, includeTailwind: true })}\n${content}`
  }
  // v3: prepend missing token imports (do not duplicate `@tailwind` directives if present).
  const hasTailwindDirectives = /@tailwind\s+(base|components|utilities)/.test(content)
  if (hasTailwindDirectives) return `${block}\n${content}`
  return `${buildCssImports({ version: 3, includeTailwind: true })}\n${content}`
}

function cleanupViteStub(projectRoot: string): void {
  const scanResults = scanViteTemplate(projectRoot)
  if (scanResults.length === 0) return

  for (const result of scanResults) {
    applyCleanup(result)
  }

  const summary = scanResults
    .map(r => `  ${r.file} (${pluralize(r.matches.length, 'block')})`)
    .join('\n')
  const backups = scanResults.map(r => `${r.file}.bak`).join(', ')
  p.log.success(
    `Vite template boilerplate cleaned\n${summary}\n  Backup: ${backups}\n  Restore from .bak files if needed.`,
  )
}

function wrapStarResetIfPresent(projectRoot: string, cssPath: string): void {
  const fullPath = path.join(projectRoot, cssPath)
  if (!fs.existsSync(fullPath)) return

  const original = fs.readFileSync(fullPath, 'utf-8')
  const { wrappedCount, output } = wrapStarReset(original)
  if (wrappedCount === 0) return

  fs.writeFileSync(fullPath + '.bak', original, 'utf-8')
  fs.writeFileSync(fullPath, output, 'utf-8')
  p.log.success(
    `Wrapped \`*\` reset in @layer base (Tailwind v4 conflict prevention)\n  ${cssPath} (${pluralize(wrappedCount, 'block')})\n  Backup: ${cssPath}.bak`,
  )
}

function showV3PresetNote(projectRoot: string, configPath: string): void {
  const configFullPath = path.join(projectRoot, configPath)
  if (!fs.existsSync(configFullPath)) return

  const content = fs.readFileSync(configFullPath, 'utf-8')
  if (content.includes('@7onic-ui/tokens/tailwind/v3-preset')) {
    p.log.info('7onic preset already in Tailwind config')
    return
  }
  p.note(
    `Add the 7onic preset to your ${configPath}:\n\n` +
      pc.dim(`  module.exports = {\n`) +
      pc.green(`    presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],\n`) +
      pc.dim(`    // ... rest of config\n`) +
      pc.dim(`  }`),
    'Tailwind v3 Setup',
  )
}

function ensureCnUtility(projectRoot: string, utilsAlias: string): void {
  const utilsPath = resolveAliasPath(projectRoot, utilsAlias)
  if (!utilsPath) {
    p.log.warn(
      `Skipping cn() utility — utils alias "${utilsAlias}" must start with "@/".\n` +
        '  Re-run with a `@/`-prefixed alias, or create the cn() helper manually.',
    )
    return
  }

  const utilsFullPath = utilsPath + '.ts'
  const relPath = path.relative(projectRoot, utilsFullPath)

  if (!fs.existsSync(utilsFullPath)) {
    fs.mkdirSync(path.dirname(utilsFullPath), { recursive: true })
    fs.writeFileSync(utilsFullPath, CN_UTIL, 'utf-8')
    p.log.success(`Created ${relPath}`)
    return
  }

  const content = fs.readFileSync(utilsFullPath, 'utf-8')
  if (!content.includes('tailwind-merge')) {
    p.log.warn(
      `${relPath} exists but does not import tailwind-merge.\n` +
        '  7onic components require cn() with tailwind-merge.',
    )
    return
  }
  p.log.info('cn() utility already exists')
}

// ────────────────────────────────────────────────────────────────────────────
// Vite alias auto-patch (ADR §5) — JSONC-safe, separated tsconfig vs vite.config
// ────────────────────────────────────────────────────────────────────────────

/**
 * Ensure `@/` alias is configured in both `tsconfig.app.json` and `vite.config.*`.
 * Returns true if `@types/node` should be installed (vite.config patched).
 *
 * Per ADR §5: separated checks (Gap A — tsconfig vs vite.config independent),
 * `parseJsonc` for URL-safe JSONC parsing, explicit error with manual setup
 * hint on patch failure.
 */
async function ensureViteAlias(projectRoot: string, framework: Framework & { kind: 'vite' }): Promise<boolean> {
  // Pick tsconfig: app variant (Vite standard) > root tsconfig (fallback).
  const tsconfigName = framework.hasTsconfigApp ? 'tsconfig.app.json' : 'tsconfig.json'
  const tsconfigPath = path.join(projectRoot, tsconfigName)
  const viteConfigPath = path.join(projectRoot, framework.configPath)

  const tsconfigHasAlias = readTsconfigAlias(tsconfigPath)
  const viteHasAlias = readViteAlias(viteConfigPath)

  if (tsconfigHasAlias && viteHasAlias) {
    p.log.info('@/ path alias already configured (tsconfig + vite.config)')
    return false
  }

  let viteWasPatched = false
  const failures: string[] = []

  if (!tsconfigHasAlias) {
    const result = patchTsconfigAlias(tsconfigPath)
    if (!result.ok) failures.push(`${tsconfigName}: ${result.error}`)
  }
  if (!viteHasAlias) {
    const result = patchViteConfigAlias(viteConfigPath)
    if (!result.ok) failures.push(`${framework.configPath}: ${result.error}`)
    else viteWasPatched = true
  }

  if (failures.length > 0) {
    const lines = [
      'Could not auto-configure @/ path alias:',
      ...failures.map(f => `  ${f}`),
      '',
      'Add manually:',
      `  ${tsconfigName} → compilerOptions.paths: { "@/*": ["./src/*"] }`,
      `  ${framework.configPath} → resolve: { alias: { "@": path.resolve(__dirname, "./src") } }`,
    ]
    p.log.warn(lines.join('\n'))
    return viteWasPatched
  }

  p.log.success(`Configured @/ path alias in ${tsconfigName} and ${framework.configPath}`)
  return viteWasPatched
}

type PatchResult =
  | { ok: true }
  | { ok: false; error: string }

function readTsconfigAlias(tsconfigPath: string): boolean {
  if (!fs.existsSync(tsconfigPath)) return false
  try {
    const raw = fs.readFileSync(tsconfigPath, 'utf-8')
    const tc = parseJsonc<{ compilerOptions?: { paths?: Record<string, unknown> } }>(raw)
    return Boolean(tc.compilerOptions?.paths?.['@/*'])
  } catch {
    return false
  }
}

function readViteAlias(viteConfigPath: string): boolean {
  if (!fs.existsSync(viteConfigPath)) return false
  const content = fs.readFileSync(viteConfigPath, 'utf-8')
  // Precise detection: an `@` alias declaration (key) inside resolve.alias —
  // not just any `resolve:` substring (which previously false-skipped when
  // unrelated aliases existed). Looks for `'@':` or `"@":` patterns.
  return /['"]@['"]\s*:/.test(content)
}

function patchTsconfigAlias(tsconfigPath: string): PatchResult {
  if (!fs.existsSync(tsconfigPath)) {
    return { ok: false, error: 'file not found' }
  }
  try {
    const raw = fs.readFileSync(tsconfigPath, 'utf-8')
    const tc = parseJsonc<{ compilerOptions?: { paths?: Record<string, string[]> } }>(raw)
    const compilerOptions = tc.compilerOptions ?? {}
    const existingPaths = compilerOptions.paths ?? {}
    const updated = {
      ...tc,
      compilerOptions: {
        ...compilerOptions,
        paths: { '@/*': ['./src/*'], ...existingPaths },
      },
    }
    fs.writeFileSync(tsconfigPath, JSON.stringify(updated, null, 2) + '\n', 'utf-8')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

function patchViteConfigAlias(viteConfigPath: string): PatchResult {
  if (!fs.existsSync(viteConfigPath)) {
    return { ok: false, error: 'file not found' }
  }
  try {
    let content = fs.readFileSync(viteConfigPath, 'utf-8')

    // Add `import path from 'path'` after the last import (if absent).
    if (!/import\s+path\s+from\s+['"]path['"]/.test(content)) {
      const importMatches = [...content.matchAll(/^import .+$/gm)]
      const lastImport = importMatches.at(-1)
      if (lastImport?.index !== undefined) {
        const insertAt = lastImport.index + lastImport[0].length
        content = content.slice(0, insertAt) + "\nimport path from 'path'" + content.slice(insertAt)
      }
    }

    // Find `defineConfig({` and walk to its matching `}` (handles minimal
    // `defineConfig({})`, single-line, multi-line, and nested objects).
    const openRegex = /defineConfig\s*\(\s*\{/
    const openMatch = openRegex.exec(content)
    if (!openMatch) {
      return { ok: false, error: 'could not find `defineConfig({ ... })` — manual setup required' }
    }
    const braceOpenIdx = openMatch.index + openMatch[0].length - 1
    const closeIdx = findMatchingBrace(content, braceOpenIdx)
    if (closeIdx === -1) {
      return { ok: false, error: 'unmatched braces in `defineConfig({})` — manual setup required' }
    }

    const before = content.slice(0, closeIdx).trimEnd()
    const lastChar = before.slice(-1)
    const comma = lastChar === '{' || lastChar === ',' ? '' : ','
    const resolveBlock = `${comma}\n  resolve: {\n    alias: { '@': path.resolve(__dirname, './src') },\n  },\n`
    content = before + resolveBlock + content.slice(closeIdx)

    fs.writeFileSync(viteConfigPath, content, 'utf-8')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Walk from an opening `{` to its matching `}`. Returns index of `}` or -1. */
function findMatchingBrace(source: string, openIdx: number): number {
  let depth = 1
  for (let i = openIdx + 1; i < source.length; i++) {
    const c = source[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

// ────────────────────────────────────────────────────────────────────────────
// Alias path resolution
// ────────────────────────────────────────────────────────────────────────────

/**
 * Resolve `@/path` alias to filesystem path. Returns `null` for non-`@/`
 * aliases (callers skip cn() creation in that case).
 *
 * Assumes `@/*` maps to `./src/*` — the convention `7onic init` configures
 * via auto-patch (Vite) or that Next.js sets by default. Custom mappings
 * (e.g. `@/*: ["./*"]`) are out of scope; the user can move the file
 * manually.
 */
function resolveAliasPath(projectRoot: string, alias: string): string | null {
  if (!alias.startsWith('@/')) return null
  return path.join(projectRoot, 'src', alias.slice(2))
}
