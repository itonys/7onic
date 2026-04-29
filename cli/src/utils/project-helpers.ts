/**
 * Reusable filesystem + package.json helpers.
 *
 * Extracted to avoid duplication between framework / Tailwind detection
 * modules (DRY — CLI-REWRITE-PLAN Phase 2-B).
 */
import fs from 'node:fs'
import path from 'node:path'

/** Whether a path (relative to `cwd`) exists. Works for files and directories. */
export function pathExists(cwd: string, relativePath: string): boolean {
  return fs.existsSync(path.join(cwd, relativePath))
}

/**
 * Returns first existing path from `candidates` (relative to `cwd`), else `null`.
 * Generic over the candidate string literals so callers passing a `readonly`
 * tuple of literals get a narrowed return type instead of bare `string`.
 */
export function findFirstExisting<T extends string>(
  cwd: string,
  candidates: readonly T[],
): T | null {
  return candidates.find(file => pathExists(cwd, file)) ?? null
}

/**
 * Read merged dep map from `package.json` (`dependencies` + `devDependencies`).
 * Returns `null` when `package.json` is missing or malformed. Returns an empty
 * object when present but has no deps. Optional chaining guards against pkg
 * itself being `null` (e.g. literal `null` content) or arrays.
 */
export function readPackageDeps(cwd: string): Record<string, string> | null {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'))
    return { ...pkg?.dependencies, ...pkg?.devDependencies }
  } catch {
    return null
  }
}

/** Whether `package.json` declares the given dependency (any version). */
export function hasDependency(cwd: string, name: string): boolean {
  const deps = readPackageDeps(cwd)
  return deps !== null && typeof deps[name] === 'string'
}
