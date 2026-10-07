// MCP resources (Phase 3): pre-rendered markdown views over the committed
// artifacts + live token data. Three resources — rules/core (the ⛔ AI rules),
// tokens/cheatsheet (whitelist classes per category), components/catalog
// (name/category/import index). Content is derived, never hand-written here.
import { loadDesignData } from '../data/loader.js'
import { loadComponents, loadRules } from '../data/artifacts.js'
import { tokenIndex } from '../search/fuzzy.js'

export interface ResourceDef {
  uri: string
  name: string
  description: string
  render: () => string
}

function renderRulesCore(): string {
  const { rules } = loadRules()
  const lines: string[] = ['# 7onic Design System — Core AI Rules', '']
  lines.push('## Core Principle', '', rules.corePrinciple, '')
  lines.push('## Whitelist — ONLY these class groups are allowed', '')
  for (const w of rules.whitelist) lines.push(`${w.num}. **${w.title}** — ${w.body}`)
  lines.push('', '## Decision Tree', '', rules.decisionTree, '')
  lines.push('## Forbidden Patterns', '')
  for (const f of rules.forbiddenPatterns) {
    lines.push(`- **${f.label}**${f.examples.length ? `: \`${f.examples.join('` · `')}\`` : ''}`)
  }
  lines.push('', '## Custom Value Protocol', '', rules.customValueProtocol, '')
  lines.push('## Third-party Component Protocol', '', rules.thirdPartyProtocol, '')
  lines.push('## Read-only Token Files', '')
  for (const f of rules.tokenFilesReadonly) lines.push(`- \`${f}\``)
  lines.push('', '## Self-check Before Returning Code', '')
  rules.selfCheck.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('', rules.docsReference)
  return lines.join('\n')
}

function renderTokenCheatsheet(): string {
  const data = loadDesignData()
  const { entries } = tokenIndex(data)
  const byCategory = new Map<string, typeof entries>()
  for (const e of entries) {
    const list = byCategory.get(e.category) ?? []
    list.push(e)
    byCategory.set(e.category, list)
  }
  const lines: string[] = [
    '# 7onic Token Cheatsheet',
    '',
    'Token NAMES are the API — values are user-configurable. Never hardcode values.',
    'Semantic colors switch light/dark via CSS variables — never use the dark: prefix.',
    'Typography tokens pair font-size + line-height — never override with leading-*.',
    '',
  ]
  for (const [category, list] of byCategory) {
    lines.push(`## ${category} (${list.length})`, '')
    for (const e of list) {
      const cls = e.classes.length > 0 ? e.classes.join(' ') : '(CSS var only)'
      const dark = e.valueDark ? ` / dark: ${e.valueDark}` : ''
      lines.push(`- \`${e.name}\` → ${cls} — ${e.value}${dark}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function renderComponentCatalog(): string {
  const artifact = loadComponents()
  const byCategory = new Map<string, typeof artifact.components>()
  for (const c of artifact.components) {
    const list = byCategory.get(c.category) ?? []
    list.push(c)
    byCategory.set(c.category, list)
  }
  const lines: string[] = [
    `# 7onic Component Catalog (${artifact.count})`,
    '',
    'Named exports only. Call get_component / get_component_examples before writing code.',
    '',
  ]
  for (const [category, list] of byCategory) {
    lines.push(`## ${category} (${list.length})`, '')
    for (const c of list) {
      const extras = [
        c.annotation,
        c.compound ? `${c.subComponents.length} sub-components` : null,
        c.peerDeps.length > 0 ? `peer: ${c.peerDeps.join(', ')}` : null,
      ].filter(Boolean).join(' · ')
      lines.push(`- **${c.name}**${extras ? ` (${extras})` : ''} — \`${c.importPath}\` — ${c.description}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

export const RESOURCES: ResourceDef[] = [
  {
    uri: 'design://7onic/rules/core',
    name: '7onic core AI rules',
    description: 'Whitelist system, forbidden patterns, custom-value protocol, self-check list.',
    render: renderRulesCore,
  },
  {
    uri: 'design://7onic/tokens/cheatsheet',
    name: '7onic token cheatsheet',
    description: 'All design tokens with their utility classes and current values, grouped by category.',
    render: renderTokenCheatsheet,
  },
  {
    uri: 'design://7onic/components/catalog',
    name: '7onic component catalog',
    description: 'All 41 components with category, import path, and one-line description.',
    render: renderComponentCatalog,
  },
]
