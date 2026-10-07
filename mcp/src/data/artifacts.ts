// Runtime loader for the committed build-data artifacts (Phase 3).
// mcp/data/*.json come from scripts/build-data.ts — read at runtime with an
// mtime cache so a re-run reaches a living server without rebuilding dist/.
import * as fs from 'node:fs'
import * as path from 'node:path'
import { findRepoRoot } from './loader.js'
// Type-only import (erased at compile time) — single type source.
import type { ComponentRecord, RulesData } from '../../scripts/llms-parser.js'

export type { ComponentRecord, RulesData }

export interface ComponentsArtifact {
  generatedFrom: string
  sourceHash: string
  count: number
  components: ComponentRecord[]
}

export interface RulesArtifact {
  generatedFrom: string
  sourceHash: string
  rules: RulesData
}

const cache = new Map<string, { mtimeMs: number; data: unknown }>()

function loadJson<T>(file: string): T {
  const mtimeMs = fs.statSync(file).mtimeMs
  const hit = cache.get(file)
  if (hit && hit.mtimeMs === mtimeMs) return hit.data as T
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as T
  cache.set(file, { mtimeMs, data })
  return data
}

export function loadComponents(rootDir?: string): ComponentsArtifact {
  const root = rootDir ?? findRepoRoot()
  return loadJson<ComponentsArtifact>(path.join(root, 'mcp', 'data', 'components.json'))
}

export function loadRules(rootDir?: string): RulesArtifact {
  const root = rootDir ?? findRepoRoot()
  return loadJson<RulesArtifact>(path.join(root, 'mcp', 'data', 'rules.json'))
}
