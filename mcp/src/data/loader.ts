// Phase 1 Data Layer (docs/roadmap/active/MCP-SERVER-PLAN.md).
// Loads the sync-tokens outputs AT RUNTIME so `npm run sync-tokens` is
// reflected in MCP answers without rebuilding dist/ (mtime-signature cache).
// Sources (read-only for the MCP — figma-tokens.json stays the only SSOT):
//   1. tokens/json/tokens.json            — flat name→value map per category
//   2. tokens/css/themes/{light,dark}.css — semantic CSS variables per theme
//   3. tokens/tailwind/v3-preset.js       — class↔token mapping + plugins
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One semantic CSS variable of a theme (e.g. --color-primary). */
export interface ThemeVar {
  /** Variable name without the leading `--` (e.g. "color-primary"). */
  name: string
  /** Raw CSS value as written (may contain var() references). */
  raw: string
  /** Value with var() references resolved to literals where possible. */
  resolved: string
}

/** Coverage row for one doc-site token category (plan Phase 1). */
export interface CategoryCoverage {
  /** Doc-site category id (= app/[locale]/design-tokens/<id>). */
  category: string
  /** tokens.json keys backing this category. */
  tokenKeys: string[]
  count: number
  present: boolean
}

export interface Whitelist {
  /** Exact utility class names derived from tokens (sorted, unique). */
  classes: string[]
  /** Allowed responsive/state variant prefixes (without trailing colon). */
  variantPrefixes: string[]
}

export interface DesignData {
  /** tokens.json content: category → name → value. */
  tokens: Record<string, Record<string, string>>
  /** Semantic theme variables parsed from themes/{light,dark}.css. */
  themes: { light: Record<string, ThemeVar>; dark: Record<string, ThemeVar> }
  /** Token-derived valid class whitelist (v3-preset + tokens.json 보충). */
  whitelist: Whitelist
  /** Flattened preset color scale: Tailwind color name → raw value. */
  colorScale: Record<string, string>
  /** Doc-site 14-category coverage report. */
  coverage: CategoryCoverage[]
  /** Absolute paths of the loaded source files (diagnostics). */
  sources: string[]
}

// ---------------------------------------------------------------------------
// Repo root resolution — works from mcp/dist (bundle), mcp/src (typecheck),
// and from a plugin cache copy where the token files sit at the same root.
// ---------------------------------------------------------------------------

export function findRepoRoot(startDir?: string): string {
  let dir = startDir ?? path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'tokens', 'json', 'tokens.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(
    `Could not locate repo root (tokens/json/tokens.json) above ${startDir ?? import.meta.url}`,
  )
}

function sourceFiles(root: string): string[] {
  return [
    path.join(root, 'tokens', 'json', 'tokens.json'),
    path.join(root, 'tokens', 'css', 'themes', 'light.css'),
    path.join(root, 'tokens', 'css', 'themes', 'dark.css'),
    path.join(root, 'tokens', 'tailwind', 'v3-preset.js'),
  ]
}

// ---------------------------------------------------------------------------
// Theme CSS parsing
// ---------------------------------------------------------------------------

/** Collect `--name: value;` declarations. Selectors/media queries are
 *  irrelevant here; dark.css declares each variable in two blocks (media
 *  query + manual override) with identical values, so last-write wins. */
function parseCssVars(css: string): Map<string, string> {
  const out = new Map<string, string>()
  const re = /--([\w-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css)) !== null) out.set(m[1], m[2].trim())
  return out
}

/** Resolve var(--x) against the theme's own vars, then primitive colors
 *  (tokens.json color map exposed as --color-{name}). Unresolvable pieces
 *  (color-mix with runtime vars, etc.) are left as-is. */
function resolveValue(
  value: string,
  themeVars: Map<string, string>,
  primitiveColors: Record<string, string>,
  depth = 0,
): string {
  if (depth > 5 || !value.includes('var(')) return value
  const next = value.replace(/var\(--([\w-]+)\)/g, (whole, name: string) => {
    const own = themeVars.get(name)
    if (own !== undefined) return own
    if (name.startsWith('color-')) {
      const primitive = primitiveColors[name.slice('color-'.length)]
      if (primitive !== undefined) return primitive
    }
    return whole
  })
  return next === value ? value : resolveValue(next, themeVars, primitiveColors, depth + 1)
}

function buildTheme(
  css: string,
  primitiveColors: Record<string, string>,
): Record<string, ThemeVar> {
  const parsed = parseCssVars(css)
  const theme: Record<string, ThemeVar> = {}
  for (const [name, raw] of parsed) {
    theme[name] = { name, raw, resolved: resolveValue(raw, parsed, primitiveColors) }
  }
  return theme
}

// ---------------------------------------------------------------------------
// v3-preset loading (runtime require, cache-busted so a regenerated preset
// is re-read while the server process stays alive)
// ---------------------------------------------------------------------------

interface PresetShape {
  theme?: { extend?: Record<string, unknown> }
  plugins?: Array<(api: { addUtilities: (u: Record<string, unknown>) => void }) => void>
}

function loadPreset(presetPath: string): PresetShape {
  const resolved = require.resolve(presetPath)
  if (require.cache && require.cache[resolved]) delete require.cache[resolved]
  return require(presetPath) as PresetShape
}

/** Run preset plugins with a stub API to harvest the utility class names
 *  they register (icon-*, focus-ring, animate-*, ...). */
function collectPluginClasses(preset: PresetShape): string[] {
  const classes: string[] = []
  for (const plugin of preset.plugins ?? []) {
    plugin({
      addUtilities(utilities) {
        for (const selector of Object.keys(utilities)) {
          if (selector.startsWith('.')) classes.push(selector.slice(1))
        }
      },
    })
  }
  return classes
}

// ---------------------------------------------------------------------------
// Whitelist generation
// ---------------------------------------------------------------------------

/** Flatten a Tailwind nested color object into name → raw value
 *  ({ primary: { DEFAULT, hover } } → { primary, primary-hover }). */
function flattenColors(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key
    if (typeof value === 'string') {
      if (name) out[name] = value
    } else if (value && typeof value === 'object') {
      Object.assign(out, flattenColors(value as Record<string, unknown>, name))
    }
  }
  return out
}

// Color-accepting utility families (Tailwind v3 core plugins in use here).
const COLOR_UTILS = [
  'bg', 'text', 'border', 'border-t', 'border-r', 'border-b', 'border-l',
  'divide', 'ring', 'ring-offset', 'outline', 'fill', 'stroke',
  'accent', 'caret', 'decoration', 'placeholder', 'shadow',
  'from', 'via', 'to',
]

// Families fed by the spacing scale.
const SPACING_UTILS = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end',
  'w', 'h', 'size', 'basis', 'translate-x', 'translate-y',
]

const NEGATIVE_SPACING_UTILS = new Set([
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end',
  'translate-x', 'translate-y',
])

const ROUNDED_SIDES = ['', '-t', '-r', '-b', '-l', '-tl', '-tr', '-br', '-bl', '-s', '-e']
const BORDER_SIDES = ['border', 'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y']

// Responsive prefixes come from tokens.json breakpoints; states are the
// llms.txt whitelist's state-prefix set plus common Radix data attributes.
const STATE_PREFIXES = [
  'hover', 'focus', 'focus-visible', 'focus-within', 'active', 'disabled',
  'visited', 'first', 'last', 'odd', 'even',
  'group-hover', 'group-focus', 'peer-checked', 'peer-focus',
  'aria-selected', 'aria-expanded', 'aria-checked', 'aria-disabled',
  'data-[state=open]', 'data-[state=closed]', 'data-[state=checked]',
  'data-[state=active]', 'data-[disabled]',
]

function generateWhitelist(
  tokens: Record<string, Record<string, string>>,
  preset: PresetShape,
): { whitelist: Whitelist; colorScale: Record<string, string> } {
  const extend = (preset.theme?.extend ?? {}) as Record<string, Record<string, unknown>>
  const classes = new Set<string>()
  const add = (family: string, key: string) => {
    classes.add(key === 'DEFAULT' ? family : `${family}-${key}`)
  }

  // Colors — preset nested object → every color-accepting family.
  const colorScale = flattenColors((extend.colors ?? {}) as Record<string, unknown>)
  for (const name of Object.keys(colorScale)) {
    for (const util of COLOR_UTILS) classes.add(`${util}-${name}`)
  }

  // Typography. fontWeight is absent from the preset (Tailwind defaults
  // match the tokens) — supplemented from tokens.json.
  for (const key of Object.keys(extend.fontSize ?? {})) add('text', key)
  for (const key of Object.keys(extend.fontFamily ?? {})) add('font', key)
  for (const key of Object.keys(tokens.fontWeight ?? {})) add('font', key)

  // Spacing scale across all spacing families (+ negative forms).
  for (const key of Object.keys(extend.spacing ?? {})) {
    for (const util of SPACING_UTILS) {
      classes.add(`${util}-${key}`)
      if (NEGATIVE_SPACING_UTILS.has(util) && key !== '0') classes.add(`-${util}-${key}`)
    }
  }

  // Radius with all corner/side variants.
  for (const key of Object.keys(extend.borderRadius ?? {})) {
    for (const side of ROUNDED_SIDES) {
      classes.add(key === 'DEFAULT' ? `rounded${side}` : `rounded${side}-${key}`)
    }
  }

  // Border widths — also preset-absent, supplemented from tokens.json
  // ("1" maps to the Tailwind DEFAULT, i.e. bare `border`).
  for (const key of Object.keys(tokens.borderWidth ?? {})) {
    for (const side of BORDER_SIDES) classes.add(key === '1' ? side : `${side}-${key}`)
    classes.add(key === '1' ? 'divide-x' : `divide-x-${key}`)
    classes.add(key === '1' ? 'divide-y' : `divide-y-${key}`)
  }

  // Effect/misc scales straight from the preset.
  for (const key of Object.keys(extend.boxShadow ?? {})) add('shadow', key)
  for (const key of Object.keys(extend.zIndex ?? {})) add('z', key)
  for (const key of Object.keys(extend.opacity ?? {})) add('opacity', key)
  for (const key of Object.keys(extend.transitionDuration ?? {})) add('duration', key)
  for (const key of Object.keys(extend.transitionTimingFunction ?? {})) add('ease', key)
  for (const key of Object.keys(extend.scale ?? {})) {
    add('scale', key)
    add('scale-x', key)
    add('scale-y', key)
  }
  for (const key of Object.keys(extend.animation ?? {})) add('animate', key)

  // Plugin-registered utilities (icon-*, animate-*, focus-ring, ...).
  for (const cls of collectPluginClasses(preset)) classes.add(cls)

  // Breakpoints are preset-absent too (Tailwind defaults = the tokens).
  const variantPrefixes = [...Object.keys(tokens.breakpoint ?? {}), ...STATE_PREFIXES]

  return {
    whitelist: { classes: [...classes].sort(), variantPrefixes },
    colorScale,
  }
}

// ---------------------------------------------------------------------------
// Coverage — the 14 doc-site categories (app/[locale]/design-tokens/*)
// ---------------------------------------------------------------------------

const DOC_CATEGORIES: Array<{ category: string; tokenKeys: string[] }> = [
  { category: 'colors', tokenKeys: ['color'] },
  { category: 'typography', tokenKeys: ['fontSize', 'lineHeight', 'fontWeight', 'fontFamily'] },
  { category: 'spacing', tokenKeys: ['spacing'] },
  { category: 'shadows', tokenKeys: ['shadow'] },
  { category: 'opacity', tokenKeys: ['opacity'] },
  { category: 'radius', tokenKeys: ['borderRadius'] },
  { category: 'border-width', tokenKeys: ['borderWidth'] },
  { category: 'icon-sizes', tokenKeys: ['iconSize'] },
  { category: 'breakpoints', tokenKeys: ['breakpoint'] },
  { category: 'z-index', tokenKeys: ['zIndex'] },
  { category: 'duration', tokenKeys: ['duration'] },
  { category: 'easing', tokenKeys: ['easing'] },
  { category: 'scale', tokenKeys: ['scale'] },
  { category: 'animation', tokenKeys: ['animation'] },
]

function buildCoverage(tokens: Record<string, Record<string, string>>): CategoryCoverage[] {
  return DOC_CATEGORIES.map(({ category, tokenKeys }) => {
    const count = tokenKeys.reduce(
      (sum, key) => sum + Object.keys(tokens[key] ?? {}).length,
      0,
    )
    return { category, tokenKeys, count, present: count > 0 }
  })
}

// ---------------------------------------------------------------------------
// Public API with mtime-signature cache
// ---------------------------------------------------------------------------

const cache = new Map<string, { signature: string; data: DesignData }>()

function mtimeSignature(files: string[]): string {
  return files.map((f) => `${f}:${fs.statSync(f).mtimeMs}`).join('|')
}

/**
 * Load and merge the token sources. Cached per repo root; invalidated when
 * any source file's mtime changes, so a long-running MCP server picks up
 * `npm run sync-tokens` output on the next tool call.
 */
export function loadDesignData(rootDir?: string): DesignData {
  const root = rootDir ?? findRepoRoot()
  const files = sourceFiles(root)
  const signature = mtimeSignature(files)

  const hit = cache.get(root)
  if (hit && hit.signature === signature) return hit.data

  const [tokensPath, lightPath, darkPath, presetPath] = files
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8')) as Record<
    string,
    Record<string, string>
  >
  const primitiveColors = tokens.color ?? {}
  const themes = {
    light: buildTheme(fs.readFileSync(lightPath, 'utf8'), primitiveColors),
    dark: buildTheme(fs.readFileSync(darkPath, 'utf8'), primitiveColors),
  }
  const preset = loadPreset(presetPath)
  const { whitelist, colorScale } = generateWhitelist(tokens, preset)
  const coverage = buildCoverage(tokens)

  const data: DesignData = { tokens, themes, whitelist, colorScale, coverage, sources: files }
  cache.set(root, { signature, data })
  return data
}
