/**
 * Tailwind detection.
 *
 * Per CLI-INIT-SCENARIOS ADR §3 — detect Tailwind via config
 * file (v3) or `package.json` dep (`tailwindcss`). Both absent = not
 * installed → caller aborts with install page link.
 */
import { findFirstExisting, hasDependency } from './project-helpers'

const V3_CONFIG_FILES = [
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
] as const

export type TailwindV3ConfigPath = (typeof V3_CONFIG_FILES)[number]

export type TailwindDetection =
  | { version: 3; configPath: TailwindV3ConfigPath }
  | { version: 4; configPath: null }

/**
 * Detect Tailwind installation + version. Returns `null` when neither
 * config file nor `tailwindcss` dep is present — abort caller-side.
 *
 * - v3 config exists → `{ version: 3, configPath }`
 * - No v3 config + `tailwindcss` dep → `{ version: 4, configPath: null }`
 * - Neither → `null`
 */
export function detectTailwind(cwd: string): TailwindDetection | null {
  const configPath = findFirstExisting(cwd, V3_CONFIG_FILES)
  if (configPath !== null) {
    return { version: 3, configPath }
  }
  if (hasDependency(cwd, 'tailwindcss')) {
    return { version: 4, configPath: null }
  }
  return null
}

/**
 * Legacy: silent v4 default when not detected. **Deprecated** — use
 * `detectTailwind` and abort on `null`. Kept for current `init.ts`
 * compatibility until Phase 4 restructure.
 *
 * @deprecated Use `detectTailwind` (which returns `null` when missing).
 */
export function detectTailwindVersion(cwd: string): { version: 3 | 4; configPath?: string } {
  const detected = detectTailwind(cwd)
  if (detected === null) return { version: 4 }
  if (detected.version === 3) return { version: 3, configPath: detected.configPath }
  return { version: 4 }
}
