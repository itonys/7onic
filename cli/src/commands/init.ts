import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { findProjectRoot, writeConfig, configExists, type Config } from '../utils/config'
import { detectTailwindVersion } from '../utils/detect-tailwind'
import { detectPackageManager } from '../utils/detect-pm'
import { installDeps } from '../utils/install-deps'
import { logger } from '../utils/logger'

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

// v3 CSS token imports
const CSS_V3_IMPORTS = `@import '@7onic-ui/tokens/css/variables.css';
@import '@7onic-ui/tokens/css/themes/light.css';
@import '@7onic-ui/tokens/css/themes/dark.css';
`

// v4 CSS token imports
const CSS_V4_IMPORTS = `@import '@7onic-ui/tokens/css/variables.css';
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

  // 6. Check @/ path alias
  let hasPathAlias = false
  try {
    const tsConfigRaw = fs.readFileSync(path.join(projectRoot, 'tsconfig.json'), 'utf-8')
    hasPathAlias = tsConfigRaw.includes('"@/')
  } catch { /* ignore */ }

  if (!hasPathAlias) {
    p.log.warn(
      'No @/ path alias detected in tsconfig.json.\n' +
      '  Components use @/lib/utils — make sure your project has path aliases configured.\n' +
      '  Next.js: automatic. Vite: add resolve.alias in vite.config.ts'
    )
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
    s.stop('Dependencies installed')
  } catch (err) {
    s.stop('Failed to install dependencies')
    logger.error(String(err))
    process.exit(1)
  }

  // 10. CSS file processing
  const cssFullPath = path.join(projectRoot, config.cssPath)
  const cssImports = tailwindVersion === 3 ? CSS_V3_IMPORTS : CSS_V4_IMPORTS

  if (!fs.existsSync(cssFullPath)) {
    // Create CSS file with token imports
    const cssDir = path.dirname(cssFullPath)
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true })
    }
    fs.writeFileSync(cssFullPath, cssImports, 'utf-8')
    p.log.success(`Created ${config.cssPath} with token imports`)
  } else {
    // Add token imports if not present
    const cssContent = fs.readFileSync(cssFullPath, 'utf-8')
    if (!cssContent.includes('@7onic-ui/tokens')) {
      fs.writeFileSync(cssFullPath, cssImports + '\n' + cssContent, 'utf-8')
      p.log.success(`Added token imports to ${config.cssPath}`)
    } else {
      p.log.info(`Token imports already present in ${config.cssPath}`)
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
