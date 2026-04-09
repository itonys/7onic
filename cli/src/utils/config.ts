import fs from 'node:fs'
import path from 'node:path'

export interface Config {
  $schema?: string
  tailwind: {
    version: 3 | 4
    config?: string
    css: string
  }
  aliases: {
    components: string
    utils: string
  }
}

const CONFIG_FILE = '7onic.json'

/** Walk up from cwd to find the nearest package.json */
export function findProjectRoot(cwd: string): string | null {
  let dir = path.resolve(cwd)
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  return null
}

export function readConfig(cwd: string): Config | null {
  const configPath = path.join(cwd, CONFIG_FILE)
  if (!fs.existsSync(configPath)) return null
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    return null
  }
}

export function writeConfig(cwd: string, config: Config): void {
  const configPath = path.join(cwd, CONFIG_FILE)
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

export function configExists(cwd: string): boolean {
  return fs.existsSync(path.join(cwd, CONFIG_FILE))
}
