// Component tools (Phase 3): list_components / get_component /
// get_component_examples. Data = committed mcp/data/components.json
// (generated from llms-full.txt, drift-checked by verify-drift 4-way).
import { z } from 'zod'
import { loadComponents, type ComponentRecord } from '../data/artifacts.js'
import { componentIndex, normalizeQuery, searchWords } from '../search/fuzzy.js'

const CATEGORIES = [
  'Forms', 'Data Display', 'Layout', 'Overlay', 'Feedback', 'Navigation',
  'Charts', 'AI Components',
] as const

function importLines(rec: ComponentRecord): string[] {
  const first = rec.examples[0] ?? ''
  return first.split('\n').filter((l) => l.trim().startsWith('import '))
}

// --- list_components ---------------------------------------------------------

export const listComponentsSchema = {
  category: z.enum(CATEGORIES).optional().describe('Filter by category'),
  query: z.string().optional().describe('Fuzzy search (English/Japanese/Korean), e.g. "테이블 페이지네이션", "チャット入力"'),
}

export function listComponents(args: { category?: string; query?: string }) {
  const artifact = loadComponents()
  let list = artifact.components
  if (args.query) {
    list = searchWords(componentIndex(artifact, artifact.components), args.query, 10)
  }
  if (args.category) list = list.filter((c) => c.category === args.category)
  return {
    total: artifact.count,
    count: list.length,
    components: list.map((c) => ({
      name: c.name,
      category: c.category,
      ...(c.annotation ? { annotation: c.annotation } : {}),
      compound: c.compound,
      importPath: c.importPath,
      ...(c.peerDeps.length > 0 ? { peerDeps: c.peerDeps } : {}),
    })),
    hint: 'Call get_component for props/variants and get_component_examples for verified JSX before writing code.',
  }
}

// --- get_component -----------------------------------------------------------

export const getComponentSchema = {
  name: z.string().describe('Component name (e.g. "Button", "AlertModal", "Chart", "ChatMessage")'),
}

export function getComponent(args: { name: string }) {
  const artifact = loadComponents()
  const q = args.name.trim().toLowerCase()
  const rec = artifact.components.find((c) => c.name.toLowerCase() === q)
  if (!rec) {
    const near = searchWords(componentIndex(artifact, artifact.components), args.name, 3).map(
      (r) => r.name,
    )
    return { found: false, name: args.name, didYouMean: near }
  }
  const { examples: _e, symbols: _s, ...pub } = rec
  return {
    found: true,
    ...pub,
    importStatement: importLines(rec),
    ...(rec.peerDeps.includes('recharts')
      ? { peerDepsNote: 'Chart components require `npm install recharts` (optional peer) and import from the @7onic-ui/react/chart subpath.' }
      : {}),
    hint: 'Named exports only (no Card.Header compound JSX — the dotted names in subComponents are shorthand for the flat Named exports). Do not override visual styles via className — use the documented props.',
  }
}

// --- get_component_examples --------------------------------------------------

export const getComponentExamplesSchema = {
  name: z.string().describe('Component name'),
  scenario: z.string().optional().describe('Optional scenario filter, e.g. "donut", "controlled", "with icon"'),
}

export function getComponentExamples(args: { name: string; scenario?: string }) {
  const artifact = loadComponents()
  const q = args.name.trim().toLowerCase()
  const rec = artifact.components.find((c) => c.name.toLowerCase() === q)
  if (!rec) {
    const near = searchWords(componentIndex(artifact, artifact.components), args.name, 3).map(
      (r) => r.name,
    )
    return { found: false, name: args.name, didYouMean: near }
  }
  let examples = rec.examples
  if (args.scenario) {
    const words = normalizeQuery(args.scenario).toLowerCase().split(/\s+/).filter(Boolean)
    const scored = rec.examples
      .map((ex) => ({ ex, score: words.filter((w) => ex.toLowerCase().includes(w)).length }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
    if (scored.length > 0) examples = scored.map((s) => s.ex)
  }
  return {
    found: true,
    name: rec.name,
    examples,
    note: 'Examples are machine-verified against the published package (verify-llms-examples). Keep imports exactly as shown.',
  }
}
