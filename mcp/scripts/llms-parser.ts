// llms-full.txt parser (Phase 2, docs/roadmap/active/MCP-SERVER-PLAN.md).
// SECTION 3 (### header = 1 record, 41 measured incl. the AI Components
// category) → components.json. SECTION 1's "⛔ AI Rules" block → rules.json.
// Parse unit is the `###` header, NOT the src file (AlertModal ⊂ modal.tsx).

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropSpec {
  /** Prop table subject, e.g. "ChatInput.Field" for `| Prop (ChatInput.Field) |`. */
  target: string | null
  name: string
  type: string
  default: string
  description: string
  /** Union literal values when the type is a quoted-literal enum. */
  enumValues: string[] | null
}

export interface VariantSpec {
  target: string | null
  prop: string
  values: string[]
}

export interface ComponentRecord {
  name: string
  /** Header annotation, e.g. "Form Wrapper" from `### Field (Form Wrapper)`. */
  annotation: string | null
  category: string
  description: string
  /** Named-export import path (main or chart subpath). */
  importPath: string
  /** Non-7onic runtime deps the examples import from (e.g. recharts). */
  peerDeps: string[]
  /** Runtime symbols the examples import from 7onic packages. */
  symbols: string[]
  compound: boolean
  subComponents: string[]
  props: PropSpec[]
  /** Enum props — verify-drift compares these to src cva()/unions. */
  variants: VariantSpec[]
  /** Size prop rows kept verbatim. */
  sizeSpec: Array<{ target: string | null; values: string[]; description: string }>
  notes: string[]
  a11y: string[]
  related: string[]
  /** Doc-site pages (locale-less paths; Chart spans 4, Field/AlertModal none/shared). */
  docsUrls: string[]
  /** Verified JSX examples (verify-llms-examples passes over llms-full.txt). */
  examples: string[]
}

export interface RulesData {
  corePrinciple: string
  whitelist: Array<{ num: number; title: string; body: string }>
  decisionTree: string
  forbiddenPatterns: Array<{ label: string; examples: string[] }>
  customValueProtocol: string
  thirdPartyProtocol: string
  tokenFilesReadonly: string[]
  selfCheck: string[]
  docsReference: string
  /** Remaining SECTION 1 rule-adjacent subsections kept verbatim. */
  sections: Array<{ title: string; body: string }>
}

// ---------------------------------------------------------------------------
// Docs page mapping (measured against app/[locale]/components/)
// ---------------------------------------------------------------------------

const DOCS_PAGE_OVERRIDES: Record<string, string[]> = {
  RadioGroup: ['radio'],
  DropdownMenu: ['dropdown'],
  AlertModal: ['modal'], // documented on the Modal page
  Chart: ['line-chart', 'bar-chart', 'area-chart', 'pie-chart'],
  Field: [], // no dedicated page (S5 note: form utility sub-component)
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function docsPagesFor(name: string): string[] {
  const pages = DOCS_PAGE_OVERRIDES[name] ?? [kebab(name)]
  return pages.map((p) => `/components/${p}`)
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function sectionSlice(lines: string[], sectionNo: number): string[] {
  const start = lines.findIndex((l) => l.startsWith(`# ═══ SECTION ${sectionNo}:`))
  if (start === -1) throw new Error(`SECTION ${sectionNo} header not found`)
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('# ═══ SECTION ')) {
      end = i
      break
    }
  }
  return lines.slice(start + 1, end)
}

const ENUM_LITERAL = /^'[^']*'$/

/** `'a' \| 'b'` (markdown-escaped) → ["a","b"], or null when not a pure enum. */
function parseEnumValues(typeCell: string): string[] | null {
  const cleaned = typeCell.replace(/`/g, '').replace(/\\\|/g, '|').trim()
  const parts = cleaned.split('|').map((p) => p.trim())
  if (parts.length < 2) return null
  if (!parts.every((p) => ENUM_LITERAL.test(p))) return null
  return parts.map((p) => p.slice(1, -1))
}

const ESCAPED_PIPE_PLACEHOLDER = '\u0001'

/** Split a markdown table row on unescaped pipes (literal pipes are `\|`). */
function splitTableRow(line: string): string[] {
  return line
    .replace(/\\\|/g, ESCAPED_PIPE_PLACEHOLDER)
    .split('|')
    .slice(1, -1)
    .map((c) => c.split(ESCAPED_PIPE_PLACEHOLDER).join('\\|').trim())
}

/** Split a Sub-components list on commas OUTSIDE parens, then strip each
 *  entry's parenthetical annotation. */
function splitSubComponents(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of text) {
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  parts.push(cur)
  return parts
    .map((p) => p.replace(/\(.*?\)/g, '').trim())
    // 7onic docs list sub-components in dot shorthand ("Select.Trigger")
    // while the library is Named-export-only — normalize to SelectTrigger.
    .map((p) => p.replace(/\./g, ''))
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// SECTION 3 → ComponentRecord[]
// ---------------------------------------------------------------------------

export function parseComponents(llmsFull: string): ComponentRecord[] {
  const lines = sectionSlice(llmsFull.split('\n'), 3)
  const records: ComponentRecord[] = []
  let category = ''
  let header: string | null = null
  let block: string[] = []

  const flush = () => {
    if (header !== null) records.push(parseBlock(header, category, block))
    block = []
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush()
      header = null
      category = line.slice(3).trim()
    } else if (line.startsWith('### ')) {
      flush()
      header = line.slice(4).trim()
    } else if (header !== null) {
      block.push(line)
    }
  }
  flush()

  for (const rec of records) {
    rec.related = records
      .filter((r) => r.category === rec.category && r.name !== rec.name)
      .map((r) => r.name)
  }
  return records
}

function parseBlock(header: string, category: string, blockLines: string[]): ComponentRecord {
  const m = header.match(/^(.+?)\s*\((.+)\)\s*$/)
  const name = (m ? m[1] : header).trim()
  const annotation = m ? m[2].trim() : null

  const examples: string[] = []
  const props: PropSpec[] = []
  const notes: string[] = []
  const descriptionLines: string[] = []
  let subComponents: string[] = []
  let sawContent = false

  let i = 0
  while (i < blockLines.length) {
    const line = blockLines[i]

    if (line.trim().startsWith('```')) {
      const fence: string[] = []
      i++
      while (i < blockLines.length && !blockLines[i].trim().startsWith('```')) {
        fence.push(blockLines[i])
        i++
      }
      i++
      examples.push(fence.join('\n'))
      sawContent = true
      continue
    }

    if (/^\|\s*Prop/.test(line)) {
      const headerCells = splitTableRow(line)
      const targetMatch = headerCells[0]?.match(/^Prop\s*\((.+)\)$/)
      const target = targetMatch ? targetMatch[1].trim() : null
      i += 2 // header + divider
      while (i < blockLines.length && blockLines[i].startsWith('|')) {
        const cells = splitTableRow(blockLines[i])
        if (cells.length >= 4) {
          props.push({
            target,
            name: cells[0],
            type: cells[1],
            default: cells[2],
            description: cells[3],
            enumValues: parseEnumValues(cells[1]),
          })
        }
        i++
      }
      sawContent = true
      continue
    }

    const trimmed = line.trim()
    if (trimmed.startsWith('**Sub-components:**')) {
      subComponents = splitSubComponents(trimmed.slice('**Sub-components:**'.length))
    } else if (trimmed.startsWith('**')) {
      notes.push(trimmed)
    } else if (trimmed && trimmed !== '---' && !sawContent) {
      descriptionLines.push(trimmed)
    } else if (trimmed && trimmed !== '---') {
      notes.push(trimmed)
    }
    i++
  }

  // Imports from examples: 7onic packages → importPath + symbols,
  // other packages (recharts etc.) → peerDeps; react excluded.
  const symbols: string[] = []
  const peerDeps = new Set<string>()
  let importPath = ''
  const importRe = /import\s*\{([\s\S]*?)\}\s*from\s*'([^']+)'/g
  for (const example of examples) {
    let im: RegExpExecArray | null
    while ((im = importRe.exec(example)) !== null) {
      const module = im[2]
      const names = im[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (module.startsWith('@7onic-ui/')) {
        if (!importPath) importPath = module
        for (const n of names) {
          if (n.startsWith('type ')) continue
          if (!symbols.includes(n)) symbols.push(n)
        }
      } else if (module !== 'react') {
        peerDeps.add(module)
      }
    }
  }

  const variants: VariantSpec[] = props
    .filter((p) => p.enumValues !== null)
    .map((p) => ({ target: p.target, prop: p.name, values: p.enumValues as string[] }))

  const sizeSpec = props
    .filter((p) => p.name === 'size')
    .map((p) => ({ target: p.target, values: p.enumValues ?? [], description: p.description }))

  const a11y = notes.filter((n) =>
    /aria|a11y|accessib|keyboard|screen reader|role=|focus trap/i.test(n),
  )

  return {
    name,
    annotation,
    category,
    description: descriptionLines.join(' '),
    importPath,
    peerDeps: [...peerDeps].sort(),
    symbols,
    compound: subComponents.length > 0,
    subComponents,
    props,
    variants,
    sizeSpec,
    notes,
    a11y,
    related: [],
    docsUrls: docsPagesFor(name),
    examples,
  }
}

// ---------------------------------------------------------------------------
// SECTION 1 "⛔ AI Rules" → RulesData
// ---------------------------------------------------------------------------

interface Subsection {
  title: string
  body: string[]
}

function splitSubsections(lines: string[]): Subsection[] {
  const subs: Subsection[] = []
  let current: Subsection | null = null
  for (const line of lines) {
    const h = line.match(/^(##|###)\s+(.+)$/)
    if (h) {
      if (current) subs.push(current)
      current = { title: h[2].trim(), body: [] }
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) subs.push(current)
  return subs
}

function bodyText(sub: Subsection | undefined): string {
  return (sub?.body ?? []).join('\n').trim()
}

export function parseRules(llmsFull: string): RulesData {
  const lines = sectionSlice(llmsFull.split('\n'), 1)
  const subs = splitSubsections(lines)
  const find = (prefix: string) => subs.find((s) => s.title.includes(prefix))

  // Whitelist: `1. **Title** — body...` numbered bold items.
  const whitelistBody = find('Whitelist — ONLY')?.body ?? []
  const whitelist: Array<{ num: number; title: string; body: string }> = []
  let current: { num: number; title: string; body: string[] } | null = null
  for (const line of whitelistBody) {
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(.*)$/)
    if (m) {
      if (current) whitelist.push({ ...current, body: current.body.join('\n').trim() })
      current = { num: Number(m[1]), title: m[2].trim(), body: m[3] ? [m[3]] : [] }
    } else if (current && line.trim()) {
      current.body.push(line)
    } else if (current && !line.trim()) {
      whitelist.push({ ...current, body: current.body.join('\n').trim() })
      current = null
    }
  }
  if (current) whitelist.push({ ...current, body: current.body.join('\n').trim() })

  // Forbidden patterns: `// ❌ label` comment groups inside the tsx fence.
  const forbiddenBody = find('❌ Forbidden Patterns')?.body ?? []
  const forbiddenPatterns: Array<{ label: string; examples: string[] }> = []
  let inFence = false
  let group: { label: string; examples: string[] } | null = null
  for (const line of forbiddenBody) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (!inFence) continue
    const lm = line.match(/^\/\/\s*❌\s*(.+)$/)
    if (lm) {
      if (group) forbiddenPatterns.push(group)
      group = { label: lm[1].trim(), examples: [] }
    } else if (group && line.trim()) {
      group.examples.push(line)
    }
  }
  if (group) forbiddenPatterns.push(group)

  // Self-Check `- [ ]` items + trailing "When in doubt" docs pointer.
  const selfCheckBody = find('Self-Check')?.body ?? []
  const selfCheck = selfCheckBody
    .map((l) => l.match(/^-\s*\[\s*\]\s*(.+)$/)?.[1]?.trim())
    .filter((x): x is string => Boolean(x))
  const doubtIdx = selfCheckBody.findIndex((l) => l.includes('When in doubt'))
  const docsReference =
    doubtIdx === -1
      ? ''
      : selfCheckBody
          .slice(doubtIdx)
          .filter((l) => l.trim() !== '---')
          .join('\n')
          .trim()

  // Read-only generated token files (backticked names in the customization note).
  const custBody = bodyText(find('Token Customization'))
  const tokenFilesReadonly = [
    ...new Set(
      [...custBody.matchAll(/`([\w.-]+\.(?:css|js|mjs|ts|json|d\.ts))`/g)].map((mm) => mm[1]),
    ),
  ]

  const consumed = new Set([
    'Core Principle',
    'Whitelist — ONLY These Are Allowed',
    'Decision Tree — For Every UI Element',
    '❌ Forbidden Patterns',
    'When User Requests Custom Values',
    'Third-Party Libraries',
    "Token Customization Is the User's Responsibility",
    'Self-Check (after writing ANY code)',
    'How to Start',
    '⛔ AI Rules — Whitelist System',
  ])
  const sections = subs
    .filter((s) => !consumed.has(s.title))
    .map((s) => ({ title: s.title, body: s.body.join('\n').trim() }))

  return {
    corePrinciple: bodyText(find('Core Principle')),
    whitelist,
    decisionTree: bodyText(find('Decision Tree')),
    forbiddenPatterns,
    customValueProtocol: bodyText(find('When User Requests Custom Values')),
    thirdPartyProtocol: bodyText(find('Third-Party Libraries')),
    tokenFilesReadonly,
    selfCheck,
    docsReference,
    sections,
  }
}
