import fs from 'node:fs'
import path from 'node:path'

const V3_CONFIG_FILES = [
  'tailwind.config.js',
  'tailwind.config.ts',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
]

export function detectTailwindVersion(cwd: string): { version: 3 | 4; configPath?: string } {
  for (const file of V3_CONFIG_FILES) {
    if (fs.existsSync(path.join(cwd, file))) {
      return { version: 3, configPath: file }
    }
  }
  return { version: 4 }
}
