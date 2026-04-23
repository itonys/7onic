#!/usr/bin/env node
/**
 * verify-llms-examples.ts
 *
 * Scans all llms*.txt files for code blocks, extracts:
 *   1. import { X, Y } from '@7onic-ui/react'  (or '@7onic-ui/react/chart')
 *   2. JSX usage: <Component>, </Component>, <Component />
 *   3. Dot-notation: <Card.Header> etc. (should NOT exist post-v0.3.0)
 *
 * Compares against actual library exports from src/components/ui/index.ts
 * + src/components/ui/chart.tsx
 *
 * Reports:
 *   - orphan imports (imported but not used in the same block)
 *   - under-imports (used in JSX but not imported)
 *   - phantom exports (imported name does not exist in library)
 *   - compound JSX leak (<Card.Header>) — breaks v0.3.0+ named-primary policy
 *
 * Run: npx tsx scripts/verify-llms-examples.ts
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(__dirname, '..')
const LLMS_FILES = [
  'llms.txt',
  'public/llms.txt',
  'public/llms-full.txt',
  'public/llms-cli.txt',
].map(p => resolve(ROOT, p))

// ============================================================
// 1. Collect library exports (source of truth)
// ============================================================

function collectExports(): Set<string> {
  const exports = new Set<string>()
  const indexFile = readFileSync(resolve(ROOT, 'src/components/ui/index.ts'), 'utf-8')
  // match: export { A, B, C, ... } from '...'
  const exportRe = /export\s*\{\s*([^}]+)\s*\}/g
  let m: RegExpExecArray | null
  while ((m = exportRe.exec(indexFile)) !== null) {
    m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).forEach(name => {
      if (name && !name.startsWith('type ')) exports.add(name)
    })
  }
  // Also add chart.tsx named exports
  const chartFile = readFileSync(resolve(ROOT, 'src/components/ui/chart.tsx'), 'utf-8')
  const chartExportRe = /export\s+(?:const|function|type)\s+(\w+)/g
  while ((m = chartExportRe.exec(chartFile)) !== null) {
    exports.add(m[1])
  }
  // chart.tsx also does `export { X }`
  const chartBlockRe = /export\s*\{\s*([^}]+)\s*\}/g
  while ((m = chartBlockRe.exec(chartFile)) !== null) {
    m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).forEach(name => {
      if (name && !name.startsWith('type ')) exports.add(name)
    })
  }
  return exports
}

// ============================================================
// 2. Parse code blocks from llms file
// ============================================================

type CodeBlock = {
  file: string
  startLine: number
  lang: string
  body: string
}

function extractCodeBlocks(filePath: string): CodeBlock[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const blocks: CodeBlock[] = []
  let inBlock = false
  let lang = ''
  let start = 0
  let buf: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!inBlock && line.startsWith('```')) {
      lang = line.slice(3).trim()
      start = i + 1
      buf = []
      inBlock = true
      continue
    }
    if (inBlock && line.startsWith('```')) {
      blocks.push({ file: filePath, startLine: start, lang, body: buf.join('\n') })
      inBlock = false
      buf = []
      continue
    }
    if (inBlock) buf.push(line)
  }
  return blocks
}

// ============================================================
// 3. Parse imports from a code block
// ============================================================

type ImportStmt = {
  names: string[]
  source: string
}

function parseImports(body: string): ImportStmt[] {
  const result: ImportStmt[] = []
  // match: import { A, B, C } from '...'   (tolerate multiline)
  const re = /import\s*\{\s*([^}]+?)\s*\}\s*from\s*['"]([^'"]+)['"]/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const names = m[1]
      .split(',')
      .map(s => s.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
      .filter(Boolean)
    result.push({ names, source: m[2] })
  }
  return result
}

// ============================================================
// 4. Parse JSX usage
// ============================================================

function parseJSX(body: string): Set<string> {
  const used = new Set<string>()
  // Match <ComponentName (PascalCase start, word chars) with optional dot-notation
  const jsxRe = /<([A-Z][\w]*(?:\.[A-Z][\w]*)?)\b/g
  let m: RegExpExecArray | null
  while ((m = jsxRe.exec(body)) !== null) {
    used.add(m[1])
  }
  return used
}

// ============================================================
// 5. Verify block
// ============================================================

type Finding = {
  file: string
  line: number
  kind: 'orphan_import' | 'under_import' | 'phantom_export' | 'compound_jsx_leak'
  name: string
  detail: string
}

function verifyBlock(block: CodeBlock, libExports: Set<string>): Finding[] {
  const findings: Finding[] = []
  const imports = parseImports(block.body)
  // Only consider imports from @7onic-ui packages
  const relevantImports = imports.filter(i =>
    i.source.startsWith('@7onic-ui/react')
  )
  if (relevantImports.length === 0) return findings

  const importedNames = new Set<string>()
  relevantImports.forEach(i => i.names.forEach(n => importedNames.add(n)))

  const jsxUsed = parseJSX(block.body)

  // 1. Compound JSX leak: <Card.Header> etc.
  jsxUsed.forEach(used => {
    if (used.includes('.')) {
      findings.push({
        file: block.file,
        line: block.startLine,
        kind: 'compound_jsx_leak',
        name: used,
        detail: `Compound JSX syntax "<${used}>" — v0.3.0+ removed this. Use Named <${used.replace(/\./, '')}> instead`,
      })
    }
  })

  // 2. Orphan imports (imported, not used anywhere in block)
  //    Check general identifier usage (not just JSX) — covers Object.assign, props passing, etc.
  //    Also skip teaching-style blocks (imports without any JSX or identifier usage at all — pattern demo).
  const hasJsx = jsxUsed.size > 0
  importedNames.forEach(imp => {
    const looksLikeComponent = /^[A-Z]/.test(imp) && !imp.endsWith('Variants') && !imp.endsWith('Props') && !imp.endsWith('Map') && !imp.endsWith('Config')
    if (!looksLikeComponent) return
    // Check appearance beyond the import statement itself
    const importLinePattern = new RegExp(`import[^}]*\\b${imp}\\b[^}]*from`, 's')
    const importLine = block.body.match(importLinePattern)?.[0] ?? ''
    const bodyWithoutImport = block.body.replace(importLine, '')
    // Match identifier use: <Imp, </Imp, JSX use; OR `Imp,` / `Imp.` / `Imp(` / `: Imp` / `as Imp` (general ref)
    const usePattern = new RegExp(`\\b${imp}\\b`)
    const usedSomewhere = usePattern.test(bodyWithoutImport)
    // Teaching block heuristic: if block has NO JSX at all AND imports 2+ components
    // then it's likely an "import pattern demo" — skip
    const isTeachingDemo = !hasJsx && importedNames.size >= 2
    if (!usedSomewhere && !isTeachingDemo) {
      findings.push({
        file: block.file,
        line: block.startLine,
        kind: 'orphan_import',
        name: imp,
        detail: `Imported but not used anywhere in block`,
      })
    }
  })

  // 3. Under-imports (used in JSX but not imported) — only flag PascalCase that's a real export
  jsxUsed.forEach(used => {
    if (used.includes('.')) return // handled above
    // Skip common native/builtin: Fragment, TooltipProvider etc. if they're native
    if (!importedNames.has(used) && libExports.has(used)) {
      findings.push({
        file: block.file,
        line: block.startLine,
        kind: 'under_import',
        name: used,
        detail: `Used in JSX but not imported from @7onic-ui/react`,
      })
    }
  })

  // 4. Phantom exports (imported name doesn't exist in library)
  importedNames.forEach(imp => {
    // Skip hooks (use*) and lowercase utilities (toast, ...)
    if (imp.startsWith('use')) return
    if (!/^[A-Z]/.test(imp)) return
    // Skip type-like things that are in library exports too
    if (!libExports.has(imp)) {
      findings.push({
        file: block.file,
        line: block.startLine,
        kind: 'phantom_export',
        name: imp,
        detail: `Not exported from library`,
      })
    }
  })

  return findings
}

// ============================================================
// 6. Main
// ============================================================

const libExports = collectExports()
console.log(`Library exports loaded: ${libExports.size} names\n`)

const allFindings: Finding[] = []
let totalBlocks = 0
let totalWith7onic = 0

for (const file of LLMS_FILES) {
  const blocks = extractCodeBlocks(file)
  totalBlocks += blocks.length
  for (const block of blocks) {
    const findings = verifyBlock(block, libExports)
    if (parseImports(block.body).some(i => i.source.includes('@7onic-ui'))) {
      totalWith7onic++
    }
    allFindings.push(...findings)
  }
}

// Group by file + kind
const byFile = new Map<string, Finding[]>()
for (const f of allFindings) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file)!.push(f)
}

console.log(`────────────────────────────────────────────`)
console.log(`Total code blocks: ${totalBlocks}`)
console.log(`Blocks importing from @7onic-ui: ${totalWith7onic}`)
console.log(`Total findings: ${allFindings.length}`)
console.log(`────────────────────────────────────────────\n`)

for (const [file, findings] of byFile) {
  const relPath = file.replace(ROOT + '/', '')
  console.log(`\n## ${relPath} — ${findings.length} findings`)
  const byKind = new Map<string, Finding[]>()
  for (const f of findings) {
    if (!byKind.has(f.kind)) byKind.set(f.kind, [])
    byKind.get(f.kind)!.push(f)
  }
  for (const [kind, list] of byKind) {
    console.log(`\n### ${kind} (${list.length})`)
    for (const f of list.slice(0, 20)) {
      console.log(`  L${f.line}: ${f.name} — ${f.detail}`)
    }
    if (list.length > 20) console.log(`  ... and ${list.length - 20} more`)
  }
}

process.exit(allFindings.length > 0 ? 1 : 0)
