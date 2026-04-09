import fs from 'node:fs'
import path from 'node:path'

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

const LOCKFILES: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'bun.lockb': 'bun',
  'bun.lock': 'bun',
  'package-lock.json': 'npm',
}

export function detectPackageManager(cwd: string): PackageManager {
  for (const [lockfile, pm] of Object.entries(LOCKFILES)) {
    if (fs.existsSync(path.join(cwd, lockfile))) {
      return pm
    }
  }
  return 'npm'
}
