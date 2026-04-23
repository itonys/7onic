import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { findProjectRoot, writeConfig, configExists, type Config } from '../utils/config'
import { detectTailwindVersion } from '../utils/detect-tailwind'
import { detectPackageManager } from '../utils/detect-pm'
import { installDeps } from '../utils/install-deps'
import { logger } from '../utils/logger'
import { scanViteTemplate, applyCleanup } from '../utils/vite-template-cleanup'

// Common CSS file locations to auto-detect
const CSS_CANDIDATES = [
  'src/app/globals.css',
  'app/globals.css',
  'src/index.css',
  'src/styles/globals.css',
  'styles/globals.css',
]

// cn() utility source
const CN_UTIL = `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

// v3 CSS token imports + Tailwind directives (for new file or files missing @tailwind)
// Uses all.css bundle (includes variables + themes)
const CSS_V3_IMPORTS = `@import '@7onic-ui/tokens/css/all.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
`

// v3 token-only imports (for injection into existing files that already have @tailwind directives)
const CSS_V3_TOKEN_ONLY = `@import '@7onic-ui/tokens/css/all.css';
`

// v4 CSS token imports (for new file creation — includes @import "tailwindcss")
const CSS_V4_IMPORTS = `@import "tailwindcss";
@import '@7onic-ui/tokens/css/variables.css';
@import '@7onic-ui/tokens/tailwind/v4.css';
`

// v4 token-only imports (for injection into existing files that may already have @import "tailwindcss")
const CSS_V4_TOKEN_ONLY = `@import '@7onic-ui/tokens/css/variables.css';
@import '@7onic-ui/tokens/tailwind/v4.css';
`

export async function init(args: string[]): Promise<void> {
  const flagYes = args.includes('--yes') || args.includes('-y')

  // Parse --tailwind flag (e.g. --tailwind v3 / --tailwind 3 / --tailwind v4)
  const tailwindFlagIdx = args.indexOf('--tailwind')
  const tailwindFlagRaw = tailwindFlagIdx !== -1 ? args[tailwindFlagIdx + 1] : null
  const forcedTailwindVersion: 3 | 4 | null =
    tailwindFlagRaw === 'v3' || tailwindFlagRaw === '3' ? 3
    : tailwindFlagRaw === 'v4' || tailwindFlagRaw === '4' ? 4
    : null

  p.intro(pc.bold('7onic init'))

  if (tailwindFlagIdx !== -1 && forcedTailwindVersion === null) {
    p.log.warn(`Invalid --tailwind value: "${tailwindFlagRaw ?? '(empty)'}". Use v3 or v4.`)
  }

  // 1. Find project root
  const cwd = process.cwd()
  const projectRoot = findProjectRoot(cwd)

  if (!projectRoot) {
    p.cancel('No package.json found. Run this command inside a project.')
    process.exit(1)
  }

  // 2. Check existing config
  if (configExists(projectRoot) && !flagYes) {
    const overwrite = await p.confirm({
      message: '7onic.json already exists. Overwrite?',
    })
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Init cancelled.')
      process.exit(0)
    }
  }

  // 3. TypeScript check
  const hasTsConfig = fs.existsSync(path.join(projectRoot, 'tsconfig.json'))
  if (!hasTsConfig) {
    p.cancel('tsconfig.json not found. 7onic requires TypeScript.')
    process.exit(1)
  }

  // 4. Detect Tailwind version
  const tw = detectTailwindVersion(projectRoot)

  // 5. Detect package manager
  const pm = detectPackageManager(projectRoot)

  // 6. Check @/ path alias (check both tsconfig.json and tsconfig.app.json for Vite)
  let hasPathAlias = false
  const TSCONFIG_CANDIDATES = ['tsconfig.json', 'tsconfig.app.json']
  for (const tc of TSCONFIG_CANDIDATES) {
    try {
      const raw = fs.readFileSync(path.join(projectRoot, tc), 'utf-8')
      if (raw.includes('"@/')) {
        hasPathAlias = true
        break
      }
    } catch { /* file not found, continue */ }
  }

  // Detect Vite project (has tsconfig.app.json + vite.config.ts/js)
  const viteConfigPath =
    fs.existsSync(path.join(projectRoot, 'vite.config.ts'))
      ? path.join(projectRoot, 'vite.config.ts')
      : fs.existsSync(path.join(projectRoot, 'vite.config.js'))
        ? path.join(projectRoot, 'vite.config.js')
        : null
  const isViteProject =
    fs.existsSync(path.join(projectRoot, 'tsconfig.app.json')) && viteConfigPath !== null

  let needsTypesNode = false

  if (!hasPathAlias) {
    if (isViteProject) {
      // Auto-patch tsconfig.app.json
      const tscPatch = patchTsconfigApp(path.join(projectRoot, 'tsconfig.app.json'))
      // Auto-patch vite.config.ts
      const vitePatch = patchViteConfig(viteConfigPath!)
      if (vitePatch) needsTypesNode = true

      if (tscPatch || vitePatch) {
        p.log.success('Configured @/ path alias in tsconfig.app.json and vite.config.ts')
      } else {
        p.log.warn(
          'Could not auto-configure @/ path alias. Add manually:\n' +
          '  tsconfig.app.json → compilerOptions.paths: { "@/*": ["./src/*"] }\n' +
          '  vite.config.ts → resolve: { alias: { "@": path.resolve(__dirname, "./src") } }'
        )
      }
    } else {
      // Next.js handles aliases automatically — no action needed
      p.log.warn(
        'No @/ path alias detected.\n' +
        '  Next.js: automatic (no action needed)\n' +
        '  Other: configure compilerOptions.paths in tsconfig.json'
      )
    }
  }

  // 7. Check @7onic-ui/react coexistence
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'))
    const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
    if (allDeps['@7onic-ui/react']) {
      p.log.info(
        '@7onic-ui/react detected — CLI copies source files for customization.\n' +
        '  Use one method per component to avoid duplicates.'
      )
    }
  } catch { /* ignore */ }

  // 8. Prompt user for config (or use defaults with --yes)
  const cssDefault = CSS_CANDIDATES.find(c => fs.existsSync(path.join(projectRoot, c))) || 'src/app/globals.css'

  let config: {
    componentsAlias: string
    utilsAlias: string
    tailwindVersion: number
    cssPath: string
  }

  if (flagYes) {
    const resolvedVersion = forcedTailwindVersion ?? tw.version
    config = {
      componentsAlias: '@/components/ui',
      utilsAlias: '@/lib/utils',
      tailwindVersion: resolvedVersion,
      cssPath: cssDefault,
    }
    p.log.info(`Using defaults: Tailwind v${resolvedVersion}, CSS: ${cssDefault}`)
  } else {
    config = await p.group(
      {
        componentsAlias: () =>
          p.text({
            message: 'Components path alias',
            placeholder: '@/components/ui',
            defaultValue: '@/components/ui',
          }),
        utilsAlias: () =>
          p.text({
            message: 'Utils path alias',
            placeholder: '@/lib/utils',
            defaultValue: '@/lib/utils',
          }),
        tailwindVersion: () =>
          p.select({
            message: `Tailwind version ${tw.configPath ? `(detected: v${tw.version})` : ''}`,
            options: [
              { value: 3, label: 'Tailwind v3' },
              { value: 4, label: 'Tailwind v4' },
            ],
            initialValue: forcedTailwindVersion ?? tw.version,
          }),
        cssPath: () =>
          p.text({
            message: 'CSS file path',
            placeholder: cssDefault,
            defaultValue: cssDefault,
          }),
      },
      {
        onCancel: () => {
          p.cancel('Init cancelled.')
          process.exit(0)
        },
      }
    )
  }

  const tailwindVersion = config.tailwindVersion as 3 | 4

  // 9. Install base dependencies
  const s = p.spinner()
  const baseDeps = ['@7onic-ui/tokens', 'lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority']

  s.start(`Installing dependencies (${pm})...`)
  try {
    installDeps(baseDeps, { cwd: projectRoot, pm })
    if (needsTypesNode) {
      installDeps(['@types/node'], { cwd: projectRoot, pm, dev: true })
    }
    s.stop('Dependencies installed')
  } catch (err) {
    s.stop('Failed to install dependencies')
    logger.error(String(err))
    process.exit(1)
  }

  // 10. CSS file processing
  const cssFullPath = path.join(projectRoot, config.cssPath)

  if (!fs.existsSync(cssFullPath)) {
    // Create new CSS file with token imports (v4 includes @import "tailwindcss")
    const cssDir = path.dirname(cssFullPath)
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true })
    }
    const cssImports = tailwindVersion === 3 ? CSS_V3_IMPORTS : CSS_V4_IMPORTS
    fs.writeFileSync(cssFullPath, cssImports, 'utf-8')
    p.log.success(`Created ${config.cssPath} with token imports`)
  } else {
    // Inject token imports into existing file
    const cssContent = fs.readFileSync(cssFullPath, 'utf-8')
    if (!cssContent.includes('@7onic-ui/tokens')) {
      if (tailwindVersion === 4) {
        // v4: token imports must come AFTER @import "tailwindcss"
        const twMatch = cssContent.match(/@import\s+["']tailwindcss["'].*\n/)
        if (twMatch) {
          // Insert token imports right after existing @import "tailwindcss"
          const insertAt = twMatch.index! + twMatch[0].length
          const updated = cssContent.slice(0, insertAt) + CSS_V4_TOKEN_ONLY + cssContent.slice(insertAt)
          fs.writeFileSync(cssFullPath, updated, 'utf-8')
        } else {
          // No tailwindcss import — prepend everything (tailwindcss + tokens)
          fs.writeFileSync(cssFullPath, CSS_V4_IMPORTS + '\n' + cssContent, 'utf-8')
        }
      } else {
        // v3: check if @tailwind directives already exist; use full or token-only variant
        const hasTailwindDirectives = /@tailwind\s+(base|components|utilities)/.test(cssContent)
        const v3Imports = hasTailwindDirectives ? CSS_V3_TOKEN_ONLY : CSS_V3_IMPORTS
        fs.writeFileSync(cssFullPath, v3Imports + '\n' + cssContent, 'utf-8')
      }

      p.log.success(`Added token imports to ${config.cssPath}`)
    } else {
      p.log.info(`Token imports already present in ${config.cssPath}`)
    }
  }

  // 10b. Vite template cleanup
  // Vite's `npm create vite` ships with unlayered CSS in src/index.css + src/App.css
  // that overrides all our Tailwind utilities (button bg, :root font-family, a color, h1 size, etc.).
  // Scan for exact pristine template blocks; if matched, offer to remove.
  if (isViteProject) {
    const scanResults = scanViteTemplate(projectRoot)
    if (scanResults.length > 0) {
      const totalMatches = scanResults.reduce((sum, r) => sum + r.matches.length, 0)
      const fileList = scanResults.map(r => {
        const blockLines = r.matches.map(m => `    • ${m.name} (L${m.startLine}–${m.endLine})`).join('\n')
        return `  ${pc.bold(r.file)}\n${blockLines}`
      }).join('\n')
      p.note(
        `Detected ${totalMatches} Vite template block${totalMatches === 1 ? '' : 's'} that override 7onic utilities:\n\n` +
        fileList + '\n\n' +
        pc.dim('  These blocks are from `npm create vite` boilerplate.\n') +
        pc.dim('  A .bak backup will be created before changes.'),
        'Vite Template Cleanup'
      )
      const approve = flagYes ? true : await p.confirm({
        message: 'Remove Vite template boilerplate?',
        initialValue: true,
      })
      if (p.isCancel(approve)) {
        p.cancel('Init cancelled.')
        process.exit(0)
      }
      if (approve) {
        for (const result of scanResults) {
          applyCleanup(result)
          p.log.success(`Cleaned ${result.file} (${result.matches.length} block${result.matches.length === 1 ? '' : 's'}) — backup at ${result.file}.bak`)
        }
      } else {
        p.log.info('Kept Vite template blocks. You may see style conflicts.')
      }
    }
  }

  // 11. Tailwind v3 config preset
  if (tailwindVersion === 3 && tw.configPath) {
    const configFullPath = path.join(projectRoot, tw.configPath)
    if (fs.existsSync(configFullPath)) {
      const configContent = fs.readFileSync(configFullPath, 'utf-8')
      if (!configContent.includes('@7onic-ui/tokens/tailwind/v3-preset')) {
        p.note(
          `Add the 7onic preset to your ${tw.configPath}:\n\n` +
          pc.dim(`  module.exports = {\n`) +
          pc.green(`    presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],\n`) +
          pc.dim(`    // ... rest of config\n`) +
          pc.dim(`  }`),
          'Tailwind v3 Setup'
        )
      } else {
        p.log.info('7onic preset already in Tailwind config')
      }
    }
  }

  // 12. cn() utility
  const utilsPath = resolveAliasPath(projectRoot, config.utilsAlias)
  if (utilsPath) {
    const utilsFullPath = utilsPath + '.ts'
    if (!fs.existsSync(utilsFullPath)) {
      const utilsDir = path.dirname(utilsFullPath)
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true })
      }
      fs.writeFileSync(utilsFullPath, CN_UTIL, 'utf-8')
      p.log.success(`Created ${path.relative(projectRoot, utilsFullPath)}`)
    } else {
      const utilsContent = fs.readFileSync(utilsFullPath, 'utf-8')
      if (!utilsContent.includes('tailwind-merge')) {
        p.log.warn(
          `${path.relative(projectRoot, utilsFullPath)} exists but does not import tailwind-merge.\n` +
          '  7onic components require cn() with tailwind-merge.'
        )
      } else {
        p.log.info('cn() utility already exists')
      }
    }
  }

  // 13. Write 7onic.json
  const finalConfig: Config = {
    $schema: 'https://7onic.design/schema/7onic.json',
    tailwind: {
      version: tailwindVersion,
      ...(tailwindVersion === 3 && tw.configPath ? { config: tw.configPath } : {}),
      css: config.cssPath,
    },
    aliases: {
      components: config.componentsAlias,
      utils: config.utilsAlias,
    },
  }

  writeConfig(projectRoot, finalConfig)
  p.log.success('Created 7onic.json')

  p.outro('Done! Run ' + pc.cyan('npx 7onic add <component>') + ' to add components.')
}

/**
 * Patch tsconfig.app.json to add @/* path alias (JSONC-safe).
 * Returns true if the file was modified.
 */
function patchTsconfigApp(tsconfigPath: string): boolean {
  try {
    const raw = fs.readFileSync(tsconfigPath, 'utf-8')
    // Strip JSONC comments and trailing commas before parsing
    const clean = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,(\s*[}\]])/g, '$1')
    const tc = JSON.parse(clean)
    if (!tc.compilerOptions) tc.compilerOptions = {}
    const existingPaths = tc.compilerOptions.paths ?? {}
    if (existingPaths['@/*']) return false // already configured
    tc.compilerOptions.paths = { '@/*': ['./src/*'], ...existingPaths }
    fs.writeFileSync(tsconfigPath, JSON.stringify(tc, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

/**
 * Patch vite.config.ts to add path import and resolve.alias for @/*.
 * Returns true if the file was modified.
 */
function patchViteConfig(viteConfigPath: string): boolean {
  try {
    let content = fs.readFileSync(viteConfigPath, 'utf-8')

    // Already has @ alias — skip
    if (
      content.includes("'@'") || content.includes('"@"') ||
      content.includes("'@/*'") || content.includes('"@/*"') ||
      content.includes('resolve:')
    ) return false

    // Add `import path from 'path'` after last import statement
    if (
      !content.includes("import path from 'path'") &&
      !content.includes('import path from "path"')
    ) {
      const importMatches = [...content.matchAll(/^import .+$/gm)]
      const lastImport = importMatches.at(-1)
      if (lastImport?.index !== undefined) {
        const insertAt = lastImport.index + lastImport[0].length
        content = content.slice(0, insertAt) + "\nimport path from 'path'" + content.slice(insertAt)
      }
    }

    // Add resolve.alias before the final }) of defineConfig
    const lastClose = content.lastIndexOf('\n})')
    if (lastClose === -1) return false

    const beforeClose = content.slice(0, lastClose).trimEnd()
    const comma = beforeClose.endsWith(',') ? '' : ','
    const resolveBlock =
      `${comma}\n  resolve: {\n    alias: { '@': path.resolve(__dirname, './src') },\n  },`
    content = content.slice(0, lastClose) + resolveBlock + content.slice(lastClose)

    fs.writeFileSync(viteConfigPath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}

/**
 * Resolve @/path alias to absolute filesystem path.
 * Handles @/lib/utils → src/lib/utils (common Next.js/Vite pattern)
 */
function resolveAliasPath(projectRoot: string, alias: string): string | null {
  if (!alias.startsWith('@/')) return null

  const relative = alias.slice(2) // Remove @/

  // Try common source directories
  for (const srcDir of ['src', 'app', '.']) {
    const candidate = path.join(projectRoot, srcDir, relative)
    // Check if parent dir exists (file itself may not exist yet)
    if (fs.existsSync(path.dirname(candidate)) || srcDir === 'src') {
      return path.join(projectRoot, srcDir, relative)
    }
  }

  // Default to src/
  return path.join(projectRoot, 'src', relative)
}
