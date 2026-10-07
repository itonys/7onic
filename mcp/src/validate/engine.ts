// validate_code engine (Phase 4): parse TSX with @babel/parser, extract every
// className (JSX attribute, cn()/clsx()/cva() args, template literals), and
// check each class against the live token whitelist + the llms SECTION 1
// forbidden patterns (rules.json is the rule SSOT; this file mechanizes its
// Self-Check list). Suppression: a line containing "ds-ignore" silences
// violations on that line and the next.
import { parse } from '@babel/parser'
import { loadDesignData } from '../data/loader.js'
import { loadComponents } from '../data/artifacts.js'
import type { Locale } from '../tools/tokens.js'
import { RULE_SEVERITY, formatMessage, type RuleId, type Severity } from './messages.js'

export interface Violation {
  rule: RuleId
  severity: Severity
  line: number
  found: string
  message: string
  fix: string
}

export interface ValidateResult {
  valid: boolean
  errors: number
  warnings: number
  violations: Violation[]
  summary: string
}

// --- class-level rules -------------------------------------------------------

// Variant prefixes that are legal and stripped before base-class checks.
const ALLOWED_VARIANT = new RegExp(
  '^(sm|md|lg|xl|2xl|hover|focus|focus-visible|focus-within|active|disabled|visited|checked|' +
  'required|invalid|first|last|odd|even|only|empty|placeholder|file|marker|selection|' +
  'before|after|motion-safe|motion-reduce|ltr|rtl|open|enabled|read-only|' +
  'group(-[\\w/[\\]-]+)?|peer(-[\\w/[\\]-]+)?|data-\\[[^\\]]*\\]|aria-\\[[^\\]]*\\])$',
)

// Arbitrary values: ONLY layout height/width dimensions (whitelist rule #7).
const ARBITRARY_ALLOWED = /^(h|w|min-h|min-w|max-h|max-w|size|basis)-\[/

// Primitive color scales + white/black exist as tokens but app code must be
// semantic-first (forbidden pattern "Raw Tailwind colors").
const RAW_COLOR =
  /^(bg|text|border|ring|divide|fill|stroke|from|to|via|outline|accent|caret|decoration|shadow)-((gray|blue|green|yellow|red)-\d+|white|black)(\/\d+)?$/

const RAW_COLOR_SUGGESTIONS: Record<string, string> = {
  gray: 'muted / border / text-muted / bg-background-muted',
  blue: 'primary / info',
  green: 'success',
  yellow: 'warning',
  red: 'error',
  white: 'background / primary-foreground',
  black: 'foreground / text',
}

// Structural utilities (whitelist rule #3/#4) that carry no token values.
const STRUCTURAL_EXACT = new Set([
  'flex', 'inline-flex', 'grid', 'inline-grid', 'block', 'inline-block', 'inline',
  'hidden', 'container', 'contents', 'flow-root',
  'relative', 'absolute', 'fixed', 'sticky', 'static', 'isolate',
  'grow', 'grow-0', 'shrink', 'shrink-0', 'flex-1', 'flex-auto', 'flex-none', 'flex-initial',
  'truncate', 'underline', 'no-underline', 'overline', 'line-through',
  'italic', 'not-italic', 'antialiased', 'subpixel-antialiased',
  'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'sr-only', 'not-sr-only', 'outline', 'outline-none', 'ring-inset',
  'transform', 'transform-gpu', 'transform-none', 'transition', 'transition-none',
  'resize', 'resize-none', 'resize-x', 'resize-y', 'appearance-none',
  'bg-transparent', 'bg-current', 'bg-none', 'text-current', 'text-transparent',
  'border-transparent', 'border-current', 'fill-none', 'fill-current',
  'stroke-none', 'stroke-current', 'border-none', 'shadow-none', 'rounded-none',
])

const STRUCTURAL_PREFIX = new RegExp(
  '^(' +
  [
    'items-', 'justify-', 'content-', 'self-', 'place-',
    'flex-(row|col|wrap|nowrap|wrap-reverse|row-reverse|col-reverse)',
    'grid-cols-', 'grid-rows-', 'grid-flow-', 'col-', 'row-', 'order-',
    'object-', 'overflow-', 'overscroll-', 'whitespace-', 'break-', 'hyphens-',
    'align-', 'list-', 'table-', 'indent-',
    'cursor-', 'pointer-events-', 'select-', 'touch-', 'will-change-', 'snap-', 'scroll-',
    'transition-', 'ease-', 'delay-', 'animate-none',
    'rotate-', 'skew-', 'origin-',
    'line-clamp-', 'columns-', 'aspect-', 'basis-',
    'bg-gradient-to-', 'backdrop-',
    'text-(left|center|right|justify|start|end|ellipsis|clip|nowrap|wrap|balance|pretty)$',
    'decoration-(solid|dashed|dotted|double|wavy|from-font|auto|\\d)',
    'underline-offset-', 'ring-(0|1|2|4|8)$', 'ring-offset-\\d+$',
    'font-(sans|serif|mono)$',
    // Sizing keywords (rule #3): numeric w/h live in the whitelist already.
    '(w|h|min-w|min-h|max-w|max-h|size)-(full|screen|fit|min|max|auto|none|px|svh|dvh|lvh|svw|dvw|lvw|prose|xs|sm|md|lg|xl|\\dxl|\\d+/\\d+)$',
    '(m|mx|my|mt|mr|mb|ml|ms|me)-auto$',
    '(inset|top|right|bottom|left|start|end)-(auto|full|px|\\d+/\\d+)$',
    'z-auto$', 'opacity-0$', 'opacity-100$',
  ].join('|') +
  ')',
)

interface ClassHit {
  cls: string
  line: number
  /** Owning JSX element name when the class came from a className attribute. */
  owner: string | null
}

interface Ctx {
  whitelist: Set<string>
  componentNames: Set<string>
  colorNames: Set<string>
  iconClasses: string[]
  locale: Locale
  violations: Violation[]
  ignoredLines: Set<number>
  /** Fragment-wrap line correction (see the parse fallback). */
  lineShift: number
  headerLen: number
}

function report(ctx: Ctx, rule: RuleId, line: number, found: string, suggestion = '') {
  const real = ctx.lineShift > 0 && line > ctx.headerLen ? line - ctx.lineShift : line
  if (ctx.ignoredLines.has(real)) return
  const { message, fix } = formatMessage(rule, ctx.locale, found, suggestion)
  ctx.violations.push({ rule, severity: RULE_SEVERITY[rule], line: real, found, message, fix })
}

function checkClass(ctx: Ctx, hit: ClassHit) {
  const { cls, line } = hit
  if (!cls) return
  // Split variant prefixes, keeping bracketed segments intact.
  const parts = cls.split(/:(?![^[]*\])/)
  const base = parts.pop() as string
  for (const prefix of parts) {
    if (prefix === 'dark') return report(ctx, 'dark-prefix', line, cls)
    if (!ALLOWED_VARIANT.test(prefix)) return report(ctx, 'not-in-whitelist', line, cls, '')
  }
  if (/^-?leading-/.test(base)) return report(ctx, 'leading-override', line, cls)
  if (base.includes('[')) {
    if (!ARBITRARY_ALLOWED.test(base)) report(ctx, 'arbitrary-value', line, cls)
    return
  }
  const rawColor = base.match(RAW_COLOR)
  if (rawColor) {
    const scale = rawColor[2].startsWith('white') || rawColor[2].startsWith('black')
      ? rawColor[2]
      : (rawColor[3] ?? rawColor[2].split('-')[0])
    return report(ctx, 'raw-color', line, cls, RAW_COLOR_SUGGESTIONS[scale] ?? 'a semantic color token')
  }
  // Opacity modifier (rule #8): validate the base color class.
  const noMod = base.replace(/\/\d{1,3}$/, '')
  if (ctx.whitelist.has(noMod)) return
  if (STRUCTURAL_EXACT.has(noMod) || STRUCTURAL_PREFIX.test(noMod)) return
  // from-/to-/via- gradient stops with token colors (rule #4).
  const grad = noMod.match(/^(from|to|via)-(.+)$/)
  if (grad && ctx.colorNames.has(grad[2])) return
  report(ctx, 'not-in-whitelist', line, cls)
}

// Per-className-string rules (need the whole class list together).
function checkClassList(ctx: Ctx, classes: ClassHit[], line: number, owner: string | null) {
  const names = classes.map((c) => c.cls)
  const bases = names.map((n) => n.split(':').pop() as string)
  if (bases.some((b) => /^divide-(x|y)(-\d+)?$/.test(b)) && !bases.some((b) => /^divide-(?!x|y)/.test(b))) {
    report(ctx, 'divide-no-color', line, names.find((n) => /divide-(x|y)/.test(n)) ?? 'divide-y')
  }
  const opacity = bases.find((b) => /^opacity-\d+$/.test(b) && b !== 'opacity-0' && b !== 'opacity-100')
  const colored = bases.find((b) => /^(bg|text|border)-[a-z]/.test(b))
  if (opacity && colored) {
    report(ctx, 'opacity-element', line, `${colored} ${opacity}`, `${colored}/${opacity.split('-')[1]}`)
  }
  const wh = bases.map((b) => b.match(/^(w|h)-(\d+(?:\.\d+)?)$/)).filter(Boolean) as RegExpMatchArray[]
  const w = wh.find((m) => m[1] === 'w')
  const h = wh.find((m) => m[1] === 'h')
  if (w && h && w[2] === h[2] && parseFloat(w[2]) <= 8) {
    const px = parseFloat(w[2]) * 4
    const icon = ctx.iconClasses.length > 0 ? ctx.iconClasses.join(' / ') : 'icon-sm / icon-md'
    report(ctx, 'icon-size', line, `w-${w[2]} h-${h[2]} (${px}px)`, icon)
  }
  // Visual override on a 7onic component. Semantic text color (text-error on
  // a menu item) is a documented pattern — only identity-changing overrides
  // (background, border, radius, shadow) warn. Raw colors error separately.
  if (owner && ctx.componentNames.has(owner)) {
    const visual = bases.filter((b) =>
      /^(bg|border|ring|fill|stroke)-[a-z]/.test(b) ||
      /^(rounded|shadow)(-|$)/.test(b),
    )
    if (visual.length > 0) report(ctx, 'visual-override', line, owner, visual.join(' '))
  }
}

// --- AST walking -------------------------------------------------------------

const HTML_TO_COMPONENT: Record<string, string> = {
  button: '<Button>',
  input: '<Input> (or <Textarea>, <Checkbox>, <Switch>, <Slider>)',
  select: '<Select>',
  textarea: '<Textarea>',
  table: '<Table>',
  dialog: '<Modal> / <AlertModal>',
  progress: '<Progress>',
}

function walk(node: any, visit: (n: any) => void) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit)
    return
  }
  if (typeof node.type === 'string') visit(node)
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' ||
        key === 'trailingComments' || key === 'innerComments' || key === 'extra') continue
    walk(node[key], visit)
  }
}

/** Collect class strings (with line) from a className attribute value. */
function collectClassStrings(node: any, out: Array<{ text: string; line: number }>) {
  if (!node || typeof node !== 'object') return
  switch (node.type) {
    case 'StringLiteral':
      out.push({ text: node.value, line: node.loc?.start.line ?? 0 })
      return
    case 'TemplateLiteral':
      for (const q of node.quasis) {
        out.push({ text: q.value.cooked ?? q.value.raw, line: q.loc?.start.line ?? 0 })
      }
      for (const e of node.expressions) collectClassStrings(e, out)
      return
    case 'JSXExpressionContainer':
      return collectClassStrings(node.expression, out)
    case 'CallExpression': // cn() / clsx() / cva() / twMerge()
      for (const a of node.arguments) collectClassStrings(a, out)
      return
    case 'ConditionalExpression':
      collectClassStrings(node.consequent, out)
      collectClassStrings(node.alternate, out)
      return
    case 'LogicalExpression':
      collectClassStrings(node.right, out)
      return
    case 'ArrayExpression':
      for (const el of node.elements) collectClassStrings(el, out)
      return
    case 'ObjectExpression': // clsx({ 'p-4': cond })
      for (const p of node.properties) {
        if (p.type === 'ObjectProperty' && p.key?.type === 'StringLiteral') {
          out.push({ text: p.key.value, line: p.key.loc?.start.line ?? 0 })
        }
      }
      return
    default:
      return
  }
}

function jsxName(node: any): string | null {
  const n = node?.name
  if (!n) return null
  if (n.type === 'JSXIdentifier') return n.name
  if (n.type === 'JSXMemberExpression') return `${n.object?.name ?? ''}.${n.property?.name ?? ''}`
  return null
}

function isPassthroughWrapper(fnNode: any, componentNames: Set<string>): string | null {
  let body = fnNode.body
  if (body?.type === 'BlockStatement') {
    const returns = body.body.filter((s: any) => s.type === 'ReturnStatement')
    if (body.body.length !== 1 || returns.length !== 1) return null
    body = returns[0].argument
  }
  if (body?.type === 'ParenthesizedExpression') body = body.expression
  if (body?.type !== 'JSXElement') return null
  const opening = body.openingElement
  const name = jsxName(opening)
  if (!name || !componentNames.has(name)) return null
  const attrs = opening.attributes ?? []
  const hasSpread = attrs.some((a: any) => a.type === 'JSXSpreadAttribute')
  if (!hasSpread || attrs.length > 2) return null
  if ((body.children ?? []).some((c: any) => c.type !== 'JSXText' || c.value.trim() !== '')) return null
  return name
}

// --- entry -------------------------------------------------------------------

export function validateCode(code: string, opts: { locale?: Locale } = {}): ValidateResult {
  const locale: Locale = opts.locale ?? 'en'
  const data = loadDesignData()
  const artifact = loadComponents()
  const componentNames = new Set<string>()
  for (const c of artifact.components) {
    componentNames.add(c.name)
    for (const s of c.subComponents) componentNames.add(s)
    for (const s of c.symbols) componentNames.add(s)
  }

  const ignoredLines = new Set<number>()
  code.split('\n').forEach((text, i) => {
    if (text.includes('ds-ignore')) {
      ignoredLines.add(i + 1)
      ignoredLines.add(i + 2)
    }
  })

  const ctx: Ctx = {
    whitelist: new Set(data.whitelist.classes),
    componentNames,
    colorNames: new Set(Object.keys(data.colorScale)),
    iconClasses: Object.keys(data.tokens.iconSize ?? {}).map((k) => `icon-${k}`),
    locale,
    violations: [],
    ignoredLines,
    lineShift: 0,
    headerLen: 0,
  }

  const PARSE_OPTS = {
    sourceType: 'module' as const,
    plugins: ['jsx', 'typescript'] as Array<'jsx' | 'typescript'>,
    errorRecovery: true,
  }
  let ast
  let lineShift = 0 // applied to lines after the import header (fragment wrap)
  let headerLen = 0
  try {
    try {
      ast = parse(code, PARSE_OPTS)
    } catch {
      // llms-style snippets put multiple adjacent JSX roots after the imports —
      // invalid as a module. Retry with the JSX body wrapped in a fragment.
      const lines = code.split('\n')
      let lastImport = -1
      lines.forEach((l, i) => {
        if (/^\s*import[\s{]/.test(l)) lastImport = i
      })
      headerLen = lastImport + 1
      const wrapped = [
        ...lines.slice(0, headerLen),
        'const __ds_wrap = <>',
        ...lines.slice(headerLen),
        '</>',
      ].join('\n')
      lineShift = 1
      ast = parse(wrapped, PARSE_OPTS)
    }
    ctx.lineShift = lineShift
    ctx.headerLen = headerLen
  } catch (e) {
    return {
      valid: false,
      errors: 1,
      warnings: 0,
      violations: [{
        rule: 'not-in-whitelist', severity: 'error', line: 0, found: 'parse error',
        message: `Could not parse the code as TSX: ${(e as Error).message}`,
        fix: 'Pass a valid TSX/JSX snippet or file content.',
      }],
      summary: 'parse error',
    }
  }

  walk(ast.program, (node) => {
    if (node.type === 'ImportDeclaration' && typeof node.source?.value === 'string') {
      if (node.source.value.startsWith('@radix-ui/')) {
        report(ctx, 'radix-import', node.loc?.start.line ?? 0, node.source.value)
      }
      return
    }
    if (node.type === 'JSXOpeningElement') {
      const name = jsxName(node)
      const line = node.loc?.start.line ?? 0
      // Styled native elements only — a bare <button aria-label> inside a
      // component slot is legitimate (measured against the llms examples).
      const hasClassName = (node.attributes ?? []).some(
        (a: any) => a.type === 'JSXAttribute' && (a.name?.name === 'className' || a.name?.name === 'class'),
      )
      if (name && HTML_TO_COMPONENT[name] && hasClassName) {
        report(ctx, 'html-element', line, name, HTML_TO_COMPONENT[name])
      }
      for (const attr of node.attributes ?? []) {
        if (attr.type !== 'JSXAttribute') continue
        const attrName = attr.name?.name
        if (attrName === 'style' && attr.value?.type === 'JSXExpressionContainer' &&
            attr.value.expression?.type === 'ObjectExpression' &&
            attr.value.expression.properties.length > 0) {
          report(ctx, 'inline-style', attr.loc?.start.line ?? line, 'style={{...}}')
        }
        if (attrName === 'className' || attrName === 'class') {
          const strings: Array<{ text: string; line: number }> = []
          collectClassStrings(attr.value, strings)
          const hits: ClassHit[] = []
          for (const s of strings) {
            for (const cls of s.text.split(/\s+/).filter(Boolean)) {
              hits.push({ cls, line: s.line, owner: name })
            }
          }
          for (const hit of hits) checkClass(ctx, hit)
          if (hits.length > 0) checkClassList(ctx, hits, hits[0].line, name)
        }
      }
      return
    }
    // cva()/cn() calls outside JSX attributes (variant definitions).
    if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' &&
        ['cva', 'cn', 'clsx', 'twMerge'].includes(node.callee.name)) {
      const strings: Array<{ text: string; line: number }> = []
      for (const a of node.arguments) collectClassStrings(a, strings)
      for (const s of strings) {
        for (const cls of s.text.split(/\s+/).filter(Boolean)) {
          checkClass(ctx, { cls, line: s.line, owner: null })
        }
      }
      return
    }
    // Pass-through wrapper components.
    if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionExpression') {
      const wrapped = isPassthroughWrapper(node, componentNames)
      if (wrapped) report(ctx, 'wrapper-component', node.loc?.start.line ?? 0, wrapped)
    }
  })

  // @apply with raw values (CSS-in-template strings).
  code.split('\n').forEach((text, i) => {
    const m = text.match(/@apply\s+([^;`"']*)/)
    if (!m) return
    const line = i + 1
    if (ignoredLines.has(line)) return
    const bad = m[1].split(/\s+/).find((c) =>
      /(gray|blue|green|yellow|red)-\d+/.test(c) || c.includes('['),
    )
    if (bad) report(ctx, 'apply-raw', line, bad)
  })

  // De-duplicate identical (rule, line, found) triples from repeated strings.
  const seen = new Set<string>()
  const violations = ctx.violations.filter((v) => {
    const key = `${v.rule}|${v.line}|${v.found}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => a.line - b.line)

  const errors = violations.filter((v) => v.severity === 'error').length
  const warnings = violations.length - errors
  return {
    valid: errors === 0,
    errors,
    warnings,
    violations,
    summary: errors === 0 && warnings === 0
      ? 'No design-system violations found.'
      : `${errors} error(s), ${warnings} warning(s).`,
  }
}
