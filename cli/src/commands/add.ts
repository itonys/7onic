import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { findProjectRoot, readConfig } from '../utils/config'
import { detectPackageManager } from '../utils/detect-pm'
import { installDeps } from '../utils/install-deps'
import { rewriteImports } from '../utils/rewrite-imports'
import { logger } from '../utils/logger'
import { registry, CHART_ALIASES, INSTALLABLE_COMPONENTS } from '../registry'
import type { RegistryItem } from '../registry/schema'

export async function add(args: string[]): Promise<void> {
  const cwd = process.cwd()
  const projectRoot = findProjectRoot(cwd)

  if (!projectRoot) {
    logger.error('No package.json found.')
    process.exit(1)
  }

  const config = readConfig(projectRoot)
  if (!config) {
    logger.error('No 7onic.json found. Run ' + pc.cyan('npx 7onic init') + ' first.')
    process.exit(1)
  }

  // Parse flags
  const flagAll = args.includes('--all')
  const flagOverwrite = args.includes('--overwrite')
  const flagYes = args.includes('--yes') || args.includes('-y')
  const componentArgs = args.filter(a => !a.startsWith('-'))

  if (!flagAll && componentArgs.length === 0) {
    logger.error('No components specified. Usage: ' + pc.cyan('npx 7onic add <component...>'))
    logger.info('Available: ' + INSTALLABLE_COMPONENTS.join(', '))
    process.exit(1)
  }

  // Resolve component names
  let requestedNames: string[]

  if (flagAll) {
    requestedNames = [...INSTALLABLE_COMPONENTS]
  } else {
    requestedNames = []
    for (const arg of componentArgs) {
      // Resolve chart aliases
      const resolved = CHART_ALIASES[arg] || arg

      // Validate name
      if (!registry[resolved]) {
        const suggestion = findSimilar(resolved, [...INSTALLABLE_COMPONENTS])
        logger.error(
          `Unknown component: ${arg}` +
          (suggestion ? `. Did you mean ${pc.cyan(suggestion)}?` : '')
        )
        process.exit(1)
      }

      // Check if internal-only (field)
      if (!INSTALLABLE_COMPONENTS.includes(resolved as any)) {
        logger.error(`${arg} is an internal component and cannot be added directly.`)
        process.exit(1)
      }

      if (!requestedNames.includes(resolved)) {
        requestedNames.push(resolved)
      }
    }
  }

  // Resolve full dependency tree
  let allComponents = resolveDependencies(requestedNames)

  // recharts warning for --all (before building file list)
  if (flagAll && !flagYes) {
    const hasRecharts = allComponents.some(n => registry[n].dependencies.includes('recharts'))
    if (hasRecharts) {
      const proceed = await p.confirm({
        message: 'Chart components require recharts (~200KB). Include them?',
      })
      if (p.isCancel(proceed) || !proceed) {
        allComponents = allComponents.filter(n => n !== 'chart')
      }
    }
  }

  // Resolve target directory
  const componentsDir = resolveAliasToDir(projectRoot, config.aliases.components)

  // Build file list + check existing
  const toAdd: { name: string; fileName: string; content: string; filePath: string; exists: boolean }[] = []

  for (const name of allComponents) {
    const item = registry[name]
    for (const file of item.files) {
      const filePath = path.join(componentsDir, file.path)
      toAdd.push({ name, fileName: file.path, content: file.content, filePath, exists: fs.existsSync(filePath) })
    }
  }

  const newFiles = toAdd.filter(f => !f.exists || flagOverwrite)
  const skippedFiles = toAdd.filter(f => f.exists && !flagOverwrite)

  if (newFiles.length === 0) {
    logger.info('All components already exist. Use --overwrite to replace.')
    process.exit(0)
  }

  // Collect npm dependencies (only for components still in the list)
  const allNpmDeps = new Set<string>()
  for (const name of allComponents) {
    for (const dep of registry[name].dependencies) {
      allNpmDeps.add(dep)
    }
  }

  // Filter out already installed deps
  const pkgJsonPath = path.join(projectRoot, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
  const installedDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
  const depsToInstall = [...allNpmDeps].filter(d => !installedDeps[d])

  // Show summary and confirm
  if (!flagYes) {
    const uniqueNew = [...new Set(newFiles.map(f => f.name))]
    const summary = [
      pc.bold('Components to add:'),
      ...uniqueNew.map(n => `  ${pc.green('+')} ${n}.tsx`),
    ]

    if (skippedFiles.length > 0) {
      const uniqueSkipped = [...new Set(skippedFiles.map(f => f.name))]
      summary.push(
        '',
        pc.dim('Skipped (already exist):'),
        ...uniqueSkipped.map(n => `  ${pc.dim('-')} ${n}.tsx`),
      )
    }

    if (depsToInstall.length > 0) {
      summary.push('', pc.bold('Dependencies to install:'), `  ${depsToInstall.join(', ')}`)
    }

    p.note(summary.join('\n'), 'Summary')

    const confirmed = await p.confirm({
      message: 'Proceed?',
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Cancelled.')
      process.exit(0)
    }
  }

  // Create components directory
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true })
  }

  // Copy files
  let addedCount = 0
  for (const entry of toAdd) {
    if (entry.exists && !flagOverwrite) continue

    const content = rewriteImports(entry.content, config.aliases.utils)
    fs.writeFileSync(entry.filePath, content, 'utf-8')
    addedCount++
    logger.success(`${entry.exists ? 'Overwrote' : 'Added'} ${entry.fileName}`)
  }

  // Install npm dependencies
  if (depsToInstall.length > 0) {
    const pm = detectPackageManager(projectRoot)
    const s = p.spinner()
    s.start(`Installing ${depsToInstall.length} dependencies (${pm})...`)
    try {
      installDeps(depsToInstall, { cwd: projectRoot, pm })
      s.stop('Dependencies installed')
    } catch (err) {
      s.stop('Failed to install dependencies')
      logger.error(String(err))
    }
  }

  // Post-install setup hints
  const addedNames = [...new Set(newFiles.map(f => f.name))]
  showSetupHints(addedNames)

  // Summary
  if (skippedFiles.length > 0) {
    logger.info(`${skippedFiles.length} file(s) skipped (already exist)`)
  }
  logger.break()
  logger.success(`Done! ${addedCount} component(s) added.`)
}

/**
 * Resolve full dependency tree using topological sort.
 * Handles:
 * - registryDependencies (forward): button → button-group
 * - reverseDependencies (backward): button-group → button
 */
function resolveDependencies(names: string[]): string[] {
  const resolved = new Set<string>()
  const visited = new Set<string>()

  function visit(name: string) {
    if (visited.has(name)) return
    visited.add(name)

    const item = registry[name]
    if (!item) return

    // Forward deps: components this one imports
    for (const dep of item.registryDependencies) {
      visit(dep)
    }

    // Reverse deps: if this is a wrapper, also add the wrapped component
    for (const dep of item.reverseDependencies) {
      visit(dep)
    }

    resolved.add(name)
  }

  for (const name of names) {
    visit(name)
  }

  return [...resolved]
}

/**
 * Resolve @/components/ui alias to absolute directory path.
 */
function resolveAliasToDir(projectRoot: string, alias: string): string {
  if (!alias.startsWith('@/')) {
    return path.join(projectRoot, alias)
  }

  const relative = alias.slice(2) // Remove @/

  // Try common source directories
  for (const srcDir of ['src', 'app', '.']) {
    const candidate = path.join(projectRoot, srcDir, relative)
    if (fs.existsSync(candidate)) return candidate
  }

  // Default to src/ for new projects
  return path.join(projectRoot, 'src', relative)
}

/**
 * Find similar component name for typo suggestions.
 */
function findSimilar(input: string, candidates: readonly string[]): string | null {
  let best: string | null = null
  let bestScore = 0

  for (const name of candidates) {
    const score = similarity(input.toLowerCase(), name.toLowerCase())
    if (score > bestScore && score > 0.4) {
      bestScore = score
      best = name
    }
  }

  return best
}

/** Simple string similarity (Dice coefficient) */
function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigrams = new Set<string>()
  for (let i = 0; i < a.length - 1; i++) bigrams.add(a.slice(i, i + 2))

  let matches = 0
  for (let i = 0; i < b.length - 1; i++) {
    if (bigrams.has(b.slice(i, i + 2))) matches++
  }

  return (2 * matches) / (a.length - 1 + b.length - 1)
}

/**
 * Show post-install setup hints for specific components.
 */
function showSetupHints(names: string[]): void {
  if (names.includes('toast')) {
    p.note(
      `Add ${pc.cyan('<Toaster />')} to your root layout:\n\n` +
      pc.dim(`  import { Toaster } from '${pc.reset('@/components/ui/toast')}'\n\n`) +
      pc.dim(`  export default function Layout({ children }) {\n`) +
      pc.dim(`    return (\n`) +
      pc.dim(`      <>\n`) +
      pc.dim(`        {children}\n`) +
      pc.green(`        <Toaster />\n`) +
      pc.dim(`      </>\n`) +
      pc.dim(`    )\n`) +
      pc.dim(`  }`),
      'Toast Setup'
    )
  }

  if (names.includes('tooltip')) {
    p.note(
      `Wrap your app with ${pc.cyan('<Tooltip.Provider>')}:\n\n` +
      pc.dim(`  import { Tooltip } from '${pc.reset('@/components/ui/tooltip')}'\n\n`) +
      pc.dim(`  export default function Layout({ children }) {\n`) +
      pc.dim(`    return (\n`) +
      pc.green(`      <Tooltip.Provider>\n`) +
      pc.dim(`        {children}\n`) +
      pc.green(`      </Tooltip.Provider>\n`) +
      pc.dim(`    )\n`) +
      pc.dim(`  }`),
      'Tooltip Setup'
    )
  }
}
