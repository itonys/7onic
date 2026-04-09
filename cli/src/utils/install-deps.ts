import { execSync } from 'node:child_process'
import type { PackageManager } from './detect-pm'

export function installDeps(
  deps: string[],
  options: { cwd: string; pm: PackageManager; dev?: boolean }
): void {
  if (deps.length === 0) return

  const { cwd, pm, dev } = options
  const devFlag = dev ? ' -D' : ''

  const commands: Record<PackageManager, string> = {
    npm: `npm install${devFlag} ${deps.join(' ')}`,
    pnpm: `pnpm add${devFlag} ${deps.join(' ')}`,
    yarn: `yarn add${devFlag} ${deps.join(' ')}`,
    bun: `bun add${devFlag} ${deps.join(' ')}`,
  }

  execSync(commands[pm], { cwd, stdio: 'pipe' })
}
