/**
 * Framework detection.
 *
 * Per CLI-INIT-SCENARIOS ADR §1 — explicit Next.js + Vite
 * detection. shadcn pattern: abort with link if neither detected.
 */
import { findFirstExisting, hasDependency, pathExists } from './project-helpers'

const NEXT_CONFIG_FILES = [
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
] as const

const NEXT_APP_DIR_CANDIDATES = ['app', 'src/app'] as const

const VITE_CONFIG_FILES = [
  'vite.config.ts',
  'vite.config.js',
] as const

export type NextConfigPath = (typeof NEXT_CONFIG_FILES)[number]
export type ViteConfigPath = (typeof VITE_CONFIG_FILES)[number]

export type Framework =
  | {
      kind: 'next'
      /** App Router (Next 13+) vs Pages Router (legacy). */
      router: 'app' | 'pages'
      /** Found `next.config.*` path (relative to cwd). `null` when detected via dep only. */
      configPath: NextConfigPath | null
    }
  | {
      kind: 'vite'
      /** `vite.config.{ts,js}` path (relative to cwd). */
      configPath: ViteConfigPath
      /** `tsconfig.app.json` exists — Vite + React standard. */
      hasTsconfigApp: boolean
    }

function detectNext(cwd: string): Framework | null {
  const configPath = findFirstExisting(cwd, NEXT_CONFIG_FILES)
  if (configPath === null && !hasDependency(cwd, 'next')) return null

  const router: 'app' | 'pages' =
    findFirstExisting(cwd, NEXT_APP_DIR_CANDIDATES) !== null ? 'app' : 'pages'
  return { kind: 'next', router, configPath }
}

function detectVite(cwd: string): Framework | null {
  const configPath = findFirstExisting(cwd, VITE_CONFIG_FILES)
  if (configPath === null) return null

  return {
    kind: 'vite',
    configPath,
    hasTsconfigApp: pathExists(cwd, 'tsconfig.app.json'),
  }
}

/**
 * Detect supported framework. Returns `null` when neither Next.js nor Vite
 * is present — caller should `gracefulExit` with install page link.
 *
 * Detection order: Next.js → Vite. Mutually exclusive in practice; if
 * both somehow present, Next wins.
 */
export function detectFramework(cwd: string): Framework | null {
  return detectNext(cwd) ?? detectVite(cwd)
}
