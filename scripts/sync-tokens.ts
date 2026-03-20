/**
 * sync-tokens.ts — Design token synchronization script
 *
 * Reads figma-tokens.json and generates:
 *   - tokens/css/variables.css
 *   - tokens/tailwind/v3-preset.js
 *   - tokens/tailwind/v4-theme.css
 *   - src/styles/globals.css (semantic light/dark marker-based injection)
 *
 * Usage:
 *   npx tsx scripts/sync-tokens.ts [--brand <name>] [--force] [--dry-run]
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline'

// ============================================================
// Types
// ============================================================

interface TokenValue {
  value: string | number | object | object[]
  type: string
  $extensions?: Record<string, unknown>
  [key: string]: unknown
}

interface ShadowLayer {
  x: string
  y: string
  blur: string
  spread: string
  color: string
  type?: string
}

interface FigmaTokens {
  primitive: Record<string, unknown>
  semantic: Record<string, unknown>
  light: { color: Record<string, Record<string, TokenValue>> } & Record<string, unknown>
  dark: { color: Record<string, Record<string, TokenValue>> } & Record<string, unknown>
  $themes: unknown[]
  $metadata: Record<string, unknown>
}

// ============================================================
// Constants
// ============================================================

const ROOT = path.resolve(__dirname, '..')
const TOKENS_PATH = path.join(ROOT, 'tokens/figma-tokens.json')
const VARIABLES_CSS_PATH = path.join(ROOT, 'tokens/css/variables.css')
const V3_PRESET_PATH = path.join(ROOT, 'tokens/tailwind/v3-preset.js')
const V4_THEME_PATH = path.join(ROOT, 'tokens/tailwind/v4-theme.css')
const GLOBALS_CSS_PATH = path.join(ROOT, 'src/styles/globals.css')
const THEME_LIGHT_PATH = path.join(ROOT, 'tokens/css/themes/light.css')
const THEME_DARK_PATH = path.join(ROOT, 'tokens/css/themes/dark.css')
const JS_CJS_PATH = path.join(ROOT, 'tokens/js/index.js')
const JS_ESM_PATH = path.join(ROOT, 'tokens/js/index.mjs')
const TYPES_PATH = path.join(ROOT, 'tokens/types/index.d.ts')
const JSON_PATH = path.join(ROOT, 'tokens/json/tokens.json')
const CSS_ALL_PATH = path.join(ROOT, 'tokens/css/all.css')
const V4_ALL_PATH = path.join(ROOT, 'tokens/tailwind/v4.css')
const BRANDS_DIR = path.join(ROOT, 'tokens/brands')
const DOCS_SITE_CSS_PATH = path.join(ROOT, 'src/styles/docs-site.css')

const SEMANTIC_LIGHT_START = '/* === SYNC-TOKENS: SEMANTIC-LIGHT START === */'
const SEMANTIC_LIGHT_END = '/* === SYNC-TOKENS: SEMANTIC-LIGHT END === */'
const SEMANTIC_DARK_START = '/* === SYNC-TOKENS: SEMANTIC-DARK START === */'
const SEMANTIC_DARK_END = '/* === SYNC-TOKENS: SEMANTIC-DARK END === */'
const FORCE_LIGHT_START = '/* === SYNC-TOKENS: FORCE-LIGHT START === */'
const FORCE_LIGHT_END = '/* === SYNC-TOKENS: FORCE-LIGHT END === */'

// ============================================================
// Token Validation (reusable for user CLI distribution)
//
// TODO: Must include in user distribution CLI
//   - validateTokens()   : validate figma-tokens.json (hardcoded hex, invalid refs)
//   - printTokenWarnings(): print validation results to console
//   - In user CLI, abort generation on level === 'error' (process.exit(1))
//   - Extract these two functions into a separate module for export
// ============================================================

interface TokenWarning {
  level: 'warn' | 'error'
  theme: string
  category: string
  variant: string
  value: string
  message: string
}

/**
 * Validate figma-tokens.json for issues.
 * This function is designed to be reusable in the user-facing CLI.
 *
 * Checks:
 * 1. Semantic colors with hardcoded hex (should use {primitive.color.*} references)
 * 2. Semantic colors referencing non-existent primitives
 */
function validateTokens(tokens: FigmaTokens): TokenWarning[] {
  const warnings: TokenWarning[] = []
  const p = tokens.primitive as Record<string, unknown>
  const colorData = p.color as Record<string, unknown> | undefined

  // Collect all valid primitive color paths for reference validation
  const validPrimitivePaths = new Set<string>()
  if (colorData) {
    for (const [palette, paletteData] of Object.entries(colorData)) {
      if (palette.startsWith('$')) continue
      if (paletteData && typeof paletteData === 'object' && 'value' in (paletteData as TokenValue)) {
        validPrimitivePaths.add(`primitive.color.${palette}`)
      } else if (paletteData && typeof paletteData === 'object') {
        for (const shade of Object.keys(paletteData as Record<string, unknown>)) {
          if (shade.startsWith('$')) continue
          validPrimitivePaths.add(`primitive.color.${palette}.${shade}`)
        }
      }
    }
  }

  // Check semantic colors in light and dark themes
  for (const theme of ['light', 'dark'] as const) {
    const themeData = tokens[theme]
    if (!themeData?.color) continue

    for (const [category, catData] of Object.entries(themeData.color)) {
      if (category.startsWith('$') || !catData) continue

      for (const [variant, token] of Object.entries(catData as Record<string, TokenValue>)) {
        if (variant.startsWith('$')) continue
        const val = String((token as TokenValue).value)

        // Check 1: Hardcoded hex in semantic color
        if (val.startsWith('#') || (val.match(/^[0-9a-fA-F]{3,8}$/) && !val.startsWith('{'))) {
          warnings.push({
            level: 'warn',
            theme,
            category,
            variant,
            value: val,
            message: `Hardcoded hex value. Should reference {primitive.color.*}`,
          })
          continue
        }

        // Check 2: Reference to non-existent primitive
        if (val.startsWith('{') && val.endsWith('}')) {
          const refPath = val.slice(1, -1)
          if (refPath.startsWith('primitive.color.') && !validPrimitivePaths.has(refPath)) {
            warnings.push({
              level: 'error',
              theme,
              category,
              variant,
              value: val,
              message: `References non-existent primitive: ${refPath}`,
            })
          }
        }
      }
    }
  }

  return warnings
}

/**
 * Print token validation warnings to console.
 * Reusable in both internal and user-facing CLI.
 */
function printTokenWarnings(warnings: TokenWarning[]): void {
  if (warnings.length === 0) return

  const errors = warnings.filter(w => w.level === 'error')
  const warns = warnings.filter(w => w.level === 'warn')

  if (warns.length > 0) {
    console.log('')
    console.log(`⚠️  Hardcoded hex in semantic colors (${warns.length} found):`)
    console.log('   These tokens reference raw hex instead of primitive color variables.')
    console.log('   Fix in figma-tokens.json by using {primitive.color.*} references.\n')
    for (const w of warns) {
      console.log(`   ${w.theme}.color.${w.category}.${w.variant}: ${w.value}`)
    }
  }

  if (errors.length > 0) {
    console.log('')
    console.log(`❌  Invalid references (${errors.length} found):\n`)
    for (const w of errors) {
      console.log(`   ${w.theme}.color.${w.category}.${w.variant}: ${w.message}`)
    }
  }
}

// ============================================================
// Phase 1: Core Infrastructure
// ============================================================

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function readTextFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function writeTextFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Convert px number to rem string. 0 → '0', 16 → '1rem', 13 → '0.8125rem' */
function pxToRem(px: number | string): string {
  const n = typeof px === 'string' ? parseFloat(px) : px
  if (n === 0) return '0'
  const rem = n / 16
  // Up to 4 decimal places, strip trailing zeros
  return `${parseFloat(rem.toFixed(4))}rem`
}

/** Inline px comment for rem values. e.g. pxComment(11) → "/* 11px *​/" */
function pxComment(px: number | string): string {
  const n = typeof px === 'string' ? parseFloat(px) : px
  if (n === 0) return ''
  return `/* ${n}px */`
}

/** Resolve a {reference.path} to its final value */
function resolveReference(ref: string, allTokens: FigmaTokens, depth = 0): string {
  if (depth > 10) throw new Error(`Circular reference detected: ${ref}`)
  if (!ref.startsWith('{') || !ref.endsWith('}')) return ref

  const tokenPath = ref.slice(1, -1).split('.')
  let current: unknown = allTokens
  for (const key of tokenPath) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return ref // unresolvable
    }
  }

  if (current && typeof current === 'object' && 'value' in (current as Record<string, unknown>)) {
    const val = (current as TokenValue).value
    if (typeof val === 'string' && val.startsWith('{')) {
      return resolveReference(val, allTokens, depth + 1)
    }
    return String(val)
  }

  return ref
}

/**
 * Build a semantic color CSS variable name.
 * Strips "-default" suffix: background.default → --color-background
 * Keeps other variants: primary.hover → --color-primary-hover
 */
function semanticColorVar(category: string, variant: string): string {
  return variant === 'default' ? `--color-${category}` : `--color-${category}-${variant}`
}

/**
 * Strip ".default" from a dot-separated token path for CSS variable naming.
 * e.g. "primary.default" → "primary", "primary.hover" → "primary-hover"
 */
function stripDefaultFromPath(dotPath: string): string {
  return dotPath.replace(/\.default$/, '').replace(/\./g, '-')
}

/**
 * Convert a {reference.path} to a CSS var() reference.
 * e.g. {primitive.color.primary.600} → var(--color-primary-600)
 *      {primitive.color.white}       → var(--color-white)
 * Returns null if the reference cannot be converted to a var().
 */
function referenceToVar(ref: string): string | null {
  if (!ref.startsWith('{') || !ref.endsWith('}')) return null
  const tokenPath = ref.slice(1, -1)
  if (tokenPath.startsWith('primitive.color.')) {
    const colorPath = tokenPath.replace('primitive.color.', '')
    const varName = colorPath.replace(/\./g, '-')
    return `var(--color-${varName})`
  }
  return null
}

/**
 * Resolve a composition token (color + opacity) to a color-mix() CSS expression.
 * e.g. { color: "{light.color.primary.default}", opacity: "{primitive.opacity.20}" }
 *    → "color-mix(in srgb, var(--color-primary) 20%, transparent)"
 */
function resolveCompositionToColorMix(value: { color: string; opacity: string }): string {
  // Resolve color: {light.color.primary.default} → var(--color-primary)
  const colorPath = value.color.slice(1, -1) // "light.color.primary.default"
  const colorMatch = colorPath.match(/^(?:light|dark)\.color\.(.+)$/)
  const colorVar = colorMatch
    ? `var(--color-${stripDefaultFromPath(colorMatch[1])})`
    : value.color

  // Resolve opacity: {primitive.opacity.20} → "20"
  const opacityMatch = value.opacity.match(/\{primitive\.opacity\.(\d+)\}/)
  const pct = opacityMatch ? opacityMatch[1] : '0'

  return `color-mix(in srgb, ${colorVar} ${pct}%, transparent)`
}

/**
 * Resolve a semantic color token to a CSS var() reference if possible,
 * otherwise fall back to resolveReference (hex).
 * Follows reference chains: if the referenced token itself references
 * a primitive color, we use that final primitive as var().
 */
function resolveToVar(value: string, tokens: FigmaTokens): string {
  if (!value.startsWith('{') || !value.endsWith('}')) return value

  // Direct primitive.color reference
  const varRef = referenceToVar(value)
  if (varRef) return varRef

  // Follow one level: e.g. {light.color.primary.default} → {primitive.color.primary.600}
  const tokenPath = value.slice(1, -1).split('.')
  let current: unknown = tokens
  for (const key of tokenPath) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return resolveReference(value, tokens)
    }
  }

  if (current && typeof current === 'object' && 'value' in (current as Record<string, unknown>)) {
    const innerVal = (current as TokenValue).value
    if (typeof innerVal === 'string' && innerVal.startsWith('{')) {
      const innerVar = referenceToVar(innerVal)
      if (innerVar) return innerVar
      // Recurse further
      return resolveToVar(innerVal, tokens)
    }
    return String(innerVal)
  }

  return resolveReference(value, tokens)
}

/** Resolve a reference and return the raw value (can be object for shadow) */
function resolveReferenceRaw(ref: string, allTokens: FigmaTokens, depth = 0): unknown {
  if (depth > 10) throw new Error(`Circular reference detected: ${ref}`)
  if (typeof ref !== 'string' || !ref.startsWith('{') || !ref.endsWith('}')) return ref

  const tokenPath = ref.slice(1, -1).split('.')
  let current: unknown = allTokens
  for (const key of tokenPath) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return ref
    }
  }

  if (current && typeof current === 'object' && 'value' in (current as Record<string, unknown>)) {
    const val = (current as TokenValue).value
    if (typeof val === 'string' && val.startsWith('{')) {
      return resolveReferenceRaw(val, allTokens, depth + 1)
    }
    return val
  }

  return ref
}

interface ShadowExtensions {
  colorReference?: string
  colorOpacity?: number
  darkColorOpacity?: number
  darkValue?: ShadowLayer | ShadowLayer[]
}

function parseOpacityFromRgba(color: string): number {
  const match = color.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/)
  return match ? parseFloat(match[1]) : 1
}

function formatShadowLayer(s: ShadowLayer, ext?: ShadowExtensions): string {
  const x = s.x === '0' ? '0' : `${s.x}px`
  const y = s.y === '0' ? '0' : `${s.y}px`
  const blur = s.blur === '0' ? '0' : `${s.blur}px`
  const spread = s.spread === '0' ? '0' : `${s.spread}px`

  if (ext?.colorReference) {
    const varName = `var(--color-${stripDefaultFromPath(ext.colorReference)})`
    const opacity = ext.colorOpacity ?? parseOpacityFromRgba(s.color)
    return `${x} ${y} ${blur} ${spread} color-mix(in srgb, ${varName} ${Math.round(opacity * 100)}%, transparent)`
  }

  return `${x} ${y} ${blur} ${spread} ${s.color}`
}

/**
 * Format a single dark-mode shadow layer.
 * For colorReference tokens: uses darkColorOpacity (designer-specified).
 * For regular shadows: uses darkValue from $extensions (designer-specified).
 * No auto-calculation — all dark values come from figma-tokens.json.
 */
function formatShadowLayerDark(s: ShadowLayer, ext?: ShadowExtensions): string {
  const x = s.x === '0' ? '0' : `${s.x}px`
  const y = s.y === '0' ? '0' : `${s.y}px`
  const blur = s.blur === '0' ? '0' : `${s.blur}px`
  const spread = s.spread === '0' ? '0' : `${s.spread}px`

  if (ext?.colorReference) {
    const varName = `var(--color-${stripDefaultFromPath(ext.colorReference)})`
    const opacity = ext.darkColorOpacity ?? ext.colorOpacity ?? parseOpacityFromRgba(s.color)
    return `${x} ${y} ${blur} ${spread} color-mix(in srgb, ${varName} ${Math.round(opacity * 100)}%, transparent)`
  }

  // No auto-calculation for regular shadows — use the layer as-is
  return `${x} ${y} ${blur} ${spread} ${s.color}`
}

function formatShadow(shadow: ShadowLayer | ShadowLayer[], ext?: ShadowExtensions): string {
  if (Array.isArray(shadow)) {
    return shadow.map(s => formatShadowLayer(s, ext)).join(', ')
  }
  return formatShadowLayer(shadow, ext)
}

/**
 * Format dark-mode shadow.
 * Priority: $extensions.darkValue (designer-explicit) > light value as fallback.
 */
function formatShadowDark(shadow: ShadowLayer | ShadowLayer[], ext?: ShadowExtensions): string {
  // If designer specified explicit dark values, use those
  if (ext?.darkValue) {
    const dv = ext.darkValue
    if (Array.isArray(dv)) {
      return dv.map(s => formatShadowLayerDark(s, ext)).join(', ')
    }
    return formatShadowLayerDark(dv, ext)
  }

  // Fallback: use light value as-is (colorReference tokens still use darkColorOpacity)
  if (Array.isArray(shadow)) {
    return shadow.map(s => formatShadowLayerDark(s, ext)).join(', ')
  }
  return formatShadowLayerDark(shadow, ext)
}

function formatValue(value: string, type: string): string {
  if (type === 'color') return value
  // rem: spacing, fontSize, iconSize
  if (type === 'fontSizes' || type === 'spacing') {
    return pxToRem(value)
  }
  // px: borderRadius, borderWidth, dimension, sizing
  if (type === 'borderRadius' || type === 'borderWidth' || type === 'dimension' || type === 'sizing') {
    return `${value}px`
  }
  // fontWeights, opacity, other (zIndex, scale), duration, cubicBezier — as-is
  return value
}

function spacingKeyToCssKey(key: string): string {
  return key.replace(/\./g, '-')
}

// ============================================================
// Dynamic Key Ordering
// ============================================================

type SortStrategy =
  | { type: 'known'; order: string[] }  // semantic order, unknown keys appended at end
  | { type: 'numeric' }                  // parseFloat sort
  | { type: 'json' }                     // preserve JSON key order

/**
 * Return keys from `data` in a deterministic order, filtering out `$`-prefixed keys.
 * When `known` strategy is used, any key present in `data` but missing from the
 * known list is appended at the end and a console warning is emitted.
 */
function orderedKeys(
  data: Record<string, unknown>,
  strategy: SortStrategy,
  sectionLabel?: string,
): string[] {
  const allKeys = Object.keys(data).filter(k => !k.startsWith('$'))
  switch (strategy.type) {
    case 'known': {
      const known = strategy.order.filter(k => allKeys.includes(k))
      const unknown = allKeys.filter(k => !strategy.order.includes(k))
      if (unknown.length > 0 && sectionLabel) {
        console.warn(`⚠️  [${sectionLabel}] New keys detected: ${unknown.join(', ')}`)
      }
      return [...known, ...unknown]
    }
    case 'numeric':
      return allKeys.sort((a, b) => parseFloat(a) - parseFloat(b))
    case 'json':
      return allKeys
  }
}

/**
 * Sort variant entries by a known order. Unknown variants are appended at the end.
 */
function sortByKnownOrder(
  entries: [string, unknown][],
  order: string[],
): [string, unknown][] {
  return [...entries].sort((a, b) => {
    const ai = order.indexOf(a[0])
    const bi = order.indexOf(b[0])
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
}

/**
 * Resolve lineHeight to var() or hardcoded px.
 * If fontSize references a primitive and its lineHeight matches, use var(--line-height-*).
 * Otherwise hardcode the px value (designer intentionally overrode).
 */
function resolveLineHeight(
  v: Record<string, string>,
  fontSizeData: Record<string, TokenValue>,
): { value: string; comment?: string } | null {
  if (!v.lineHeight) return null
  if (v.fontSize && v.fontSize.startsWith('{') && v.fontSize.endsWith('}')) {
    const sizeRef = v.fontSize.slice(1, -1).split('.').pop()!
    const primToken = fontSizeData[sizeRef]
    if (primToken) {
      const primLh = primToken.$extensions?.lineHeight as string | undefined
      if (primLh && String(primLh) === String(v.lineHeight)) {
        return { value: `var(--line-height-${sizeRef})`, comment: `${primLh}px` }
      }
      // Intentional override — comment shows primitive default
      if (primLh) {
        return { value: pxToRem(v.lineHeight), comment: `override: ${sizeRef} default = ${primLh}px` }
      }
    }
  }
  return { value: pxToRem(v.lineHeight) }
}

/** Format inline comment after semicolon */
function inlineComment(comment?: string): string {
  return comment ? ` /* ${comment} */` : ''
}

// ============================================================
// Known Orders (single definition, used by all generators)
// ============================================================

const KNOWN_ORDERS = {
  colorPalettes: ['white', 'black', 'gray', 'primary', 'secondary', 'blue', 'green', 'yellow', 'red', 'chart'],
  fontSize: ['2xs', 'xs', 'sm', 'md', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
  borderRadius: ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
  shadow: ['xs', 'sm', 'md', 'lg', 'xl', 'primary-glow'],
  iconSize: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'],
  zIndex: ['0', '10', '20', '30', '40', '50', 'sticky', 'dropdown', 'overlay', 'modal', 'popover', 'tooltip', 'toast'],
  duration: ['instant', 'fast', 'micro', 'normal', 'slow', 'slower', 'slowest'],
  easing: ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut'],
  breakpoint: ['sm', 'md', 'lg', 'xl', '2xl'],
  shadeOrder: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  semanticColorCategories: ['background', 'text', 'primary', 'secondary',
    'success', 'warning', 'error', 'info', 'border', 'disabled', 'focus', 'chart'],
  semanticColorVariants: ['default', 'paper', 'elevated', 'muted', 'hover', 'active', 'tint', 'text',
    'subtle', 'link', 'primary', 'info', 'success', 'error', 'warning', 'strong', 'ring', 'ring-error', 'bg',
    '1', '2', '3', '4', '5'],
  typographyCategories: ['heading', 'body', 'label'],
  typographyOrders: { heading: ['1', '2', '3', '4', '5', '6'], body: ['lg', 'default', 'md', 'sm', 'xs', '2xs'], label: ['lg', 'md', 'default', 'sm', 'xs'] } as Record<string, string[]>,
}

// ============================================================
// Unknown Section Detection
// ============================================================

const KNOWN_PRIMITIVE_SECTIONS = new Set([
  'color', 'fontFamily', 'fontSize', 'fontWeight', 'spacing',
  'borderRadius', 'borderWidth', 'shadow', 'iconSize', 'scale',
  'zIndex', 'opacity', 'duration', 'easing', 'breakpoint',
])

function warnUnknownPrimitiveSections(primitive: Record<string, unknown>): void {
  const unknown = Object.keys(primitive).filter(k => !k.startsWith('$') && !KNOWN_PRIMITIVE_SECTIONS.has(k))
  if (unknown.length > 0) {
    console.warn(`⚠️  [primitive] Unknown sections detected: ${unknown.join(', ')}`)
    console.warn(`   These sections will NOT be included in output files.`)
  }
}

const KNOWN_SEMANTIC_SECTIONS = new Set([
  'typography', 'spacing', 'animation', 'componentSize',
])

function warnUnknownSemanticSections(semantic: Record<string, unknown>): void {
  const unknown = Object.keys(semantic).filter(k => !k.startsWith('$') && !KNOWN_SEMANTIC_SECTIONS.has(k))
  if (unknown.length > 0) {
    console.warn(`⚠️  [semantic] Unknown sections detected: ${unknown.join(', ')}`)
    console.warn(`   These sections will NOT be included in output files.`)
  }
}

function warnUnknownThemeCategories(themeColor: Record<string, Record<string, TokenValue>>, themeName: string): void {
  const known = new Set(KNOWN_ORDERS.semanticColorCategories)
  const unknown = Object.keys(themeColor).filter(k => !k.startsWith('$') && !known.has(k))
  if (unknown.length > 0) {
    console.warn(`⚠️  [${themeName}.color] Unknown categories detected: ${unknown.join(', ')}`)
    console.warn(`   These categories will NOT be included in output files.`)
  }
}

// ============================================================
// Animation Token Reader
// ============================================================

/**
 * Parsed animation token — all types unified as named animations.
 * Each token generates: @keyframes {name} + .animate-{name} class.
 * Token name = keyframe name = class name (1:1 mapping).
 */
interface AnimationToken {
  name: string
  type: 'enter' | 'exit' | 'height-expand' | 'height-collapse' | 'spin'
  opacity: string         // raw value e.g. "0" (empty if not used)
  scale: string           // raw value e.g. "0.75" (empty if not used)
  translateX: string      // raw value e.g. "100%" or "8" in px (empty if not used)
  translateXNegative: boolean
  translateY: string      // raw value e.g. "8" in px (empty if not used)
  translateYNegative: boolean
  heightVar: string       // CSS var name for height animations (empty if not used)
  durationVar: string     // CSS var e.g. "var(--duration-micro)"
  easingVar: string       // CSS var e.g. "var(--easing-ease-out)"
}

/**
 * Read semantic.animation composites from figma-tokens.json.
 * All animations are generated as named: @keyframes {name} + .animate-{name}
 * No composable system — token name maps 1:1 to CSS class name.
 */
function readAnimationTokens(tokens: FigmaTokens): AnimationToken[] | null {
  const sem = tokens.semantic as Record<string, unknown> | undefined
  const animation = sem?.animation as Record<string, unknown> | undefined
  if (!animation) return null

  const p = tokens.primitive as Record<string, unknown>
  const result: AnimationToken[] = []

  for (const [name, entry] of Object.entries(animation)) {
    if (name.startsWith('$')) continue
    const token = entry as TokenValue
    if (token.type !== 'composition') continue
    const val = token.value as Record<string, string>
    const ext = (token as Record<string, unknown>).$extensions as Record<string, unknown> | undefined

    const durationKey = extractRefKey(val.duration)
    const easingKey = extractRefKey(val.easing)
    const durationVar = `var(--duration-${durationKey})`
    const easingVar = `var(--easing-${camelToKebab(easingKey)})`

    // Special types
    const animationType = ext?.animationType as string | undefined
    if (animationType === 'spin') {
      result.push({ name, type: 'spin', opacity: '', scale: '', translateX: '', translateXNegative: false, translateY: '', translateYNegative: false, heightVar: '', durationVar, easingVar })
      continue
    }

    // Height-based animations (Radix runtime)
    if (animationType === 'height-expand' || animationType === 'height-collapse') {
      result.push({ name, type: animationType, opacity: '', scale: '', translateX: '', translateXNegative: false, translateY: '', translateYNegative: false, heightVar: val.heightVar, durationVar, easingVar })
      continue
    }

    // Enter/exit direction (from $extensions or inferred from token name)
    const direction = ext?.direction as string | undefined
    const type = (direction === 'exit' ? 'exit' : 'enter') as 'enter' | 'exit'
    const opacityRaw = val.opacity ? resolveRef(val.opacity, p) : ''
    const scaleRaw = val.scale ? resolveRef(val.scale, p) : ''
    const translateXRaw = val.translateX ? (val.translateX.startsWith('{') ? resolveRef(val.translateX, p) : val.translateX) : ''
    const translateXNegative = ext?.translateXNegative === true
    const translateYRaw = val.translateY ? resolveRef(val.translateY, p) : ''
    const translateYNegative = ext?.translateYNegative === true

    result.push({ name, type, opacity: opacityRaw, scale: scaleRaw, translateX: translateXRaw, translateXNegative, translateY: translateYRaw, translateYNegative, heightVar: '', durationVar, easingVar })
  }

  return result.length > 0 ? result : null
}

/** Resolve {primitive.section.key} to raw value from tokens (supports keys like "0.5") */
function resolveRef(ref: string, primitive: Record<string, unknown>): string {
  const match = ref.match(/^\{primitive\.(\w+)\.([\w.]+)\}$/)
  if (!match) return ref
  const [, section, key] = match
  const sectionData = primitive[section] as Record<string, TokenValue> | undefined
  return sectionData?.[key]?.value != null ? String(sectionData[key].value) : ref
}

/** Extract last key from {primitive.section.key} → "key" */
function extractRefKey(ref: string): string {
  const match = ref.match(/^\{primitive\.\w+\.(\w+)\}$/)
  return match ? match[1] : ref
}

/** Convert scale raw value "0.75" → percentage integer "75" */
function scaleToPercent(raw: string): string {
  return String(Math.round(parseFloat(raw) * 100))
}

/** Format translate value: if already has unit (%, em, etc.) use as-is, otherwise append px */
function formatTranslateVal(raw: string, negative: boolean): string {
  const sign = negative ? '-' : ''
  if (/[%a-z]/i.test(raw)) return `${sign}${raw}`
  return `${sign}${raw}px`
}

/**
 * Generate CSS for a single animation token.
 * Produces @keyframes {name} + .animate-{name} (or @utility for v4).
 * Token name = keyframe name = class name (1:1 mapping).
 */
function generateAnimationCss(a: AnimationToken, format: 'css' | 'v4'): string {
  const lines: string[] = []

  // Spin animation (infinite rotation)
  if (a.type === 'spin') {
    lines.push(`@keyframes ${a.name} {`)
    lines.push(`  from { transform: rotate(0deg); }`)
    lines.push(`  to { transform: rotate(360deg); }`)
    lines.push(`}`)

    if (format === 'v4') {
      lines.push(`@utility animate-${a.name} {`)
    } else {
      lines.push(`.animate-${a.name} {`)
    }
    lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar} infinite;`)
    lines.push(`}`)
    return lines.join('\n')
  }

  // Height-based animations
  if (a.type === 'height-expand' || a.type === 'height-collapse') {
    const isExpand = a.type === 'height-expand'
    lines.push(`@keyframes ${a.name} {`)
    lines.push(`  from { height: ${isExpand ? '0' : `var(${a.heightVar})`}; }`)
    lines.push(`  to { height: ${isExpand ? `var(${a.heightVar})` : '0'}; }`)
    lines.push(`}`)
  } else {
    // Enter/exit animations
    const isEnter = a.type === 'enter'
    const fromProps: string[] = []
    const toProps: string[] = []

    if (a.opacity) {
      fromProps.push(`opacity: ${isEnter ? a.opacity : '1'}`)
      toProps.push(`opacity: ${isEnter ? '1' : a.opacity}`)
    }

    const fromT: string[] = [], toT: string[] = []
    if (a.scale) {
      fromT.push(isEnter ? `scale(${a.scale})` : 'scale(1)')
      toT.push(isEnter ? 'scale(1)' : `scale(${a.scale})`)
    }
    if (a.translateX) {
      const v = formatTranslateVal(a.translateX, a.translateXNegative)
      fromT.push(isEnter ? `translateX(${v})` : 'translateX(0)')
      toT.push(isEnter ? 'translateX(0)' : `translateX(${v})`)
    }
    if (a.translateY) {
      const v = formatTranslateVal(a.translateY, a.translateYNegative)
      fromT.push(isEnter ? `translateY(${v})` : 'translateY(0)')
      toT.push(isEnter ? 'translateY(0)' : `translateY(${v})`)
    }
    if (fromT.length) {
      fromProps.push(`transform: ${fromT.join(' ')}`)
      toProps.push(`transform: ${toT.join(' ')}`)
    }

    lines.push(`@keyframes ${a.name} {`)
    lines.push(`  from { ${fromProps.join('; ')}; }`)
    lines.push(`  to { ${toProps.join('; ')}; }`)
    lines.push(`}`)
  }

  // Utility class
  if (format === 'v4') {
    lines.push(`@utility animate-${a.name} {`)
  } else {
    lines.push(`.animate-${a.name} {`)
  }
  lines.push(`  animation: ${a.name} ${a.durationVar} ${a.easingVar};`)
  lines.push(`}`)

  return lines.join('\n')
}

/** Convert 6-digit hex color to space-separated RGB channels: "#F4F4F5" → "244 244 245" */
function hexToRgb(hex: string): string | null {
  const match = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!match) return null
  return `${parseInt(match[1], 16)} ${parseInt(match[2], 16)} ${parseInt(match[3], 16)}`
}

// ============================================================
// Phase 2A: Generate tokens/css/variables.css
// ============================================================

function generateVariablesCss(tokens: FigmaTokens): string {
  const lines: string[] = []
  const p = tokens.primitive as Record<string, unknown>

  lines.push(`/**`)
  lines.push(` * Design System - CSS Variables`)
  lines.push(` * ⚠️ Auto-generated from figma-tokens.json — DO NOT EDIT`)
  lines.push(` *`)
  lines.push(` * No Tailwind required. Just import:`)
  lines.push(` * @import '@7onic-ui/tokens/css/variables.css';`)
  lines.push(` *`)
  lines.push(` * Regenerate: npx sync-tokens`)
  lines.push(` */`)
  lines.push(``)
  lines.push(`:root {`)

  // --- Primitive Colors ---
  lines.push(`  /* ========================================`)
  lines.push(`     Primitive Colors`)
  lines.push(`     Raw color palette — the building blocks`)
  lines.push(`     for semantic color tokens`)
  lines.push(`     ======================================== */`)
  lines.push(``)

  const colorData = p.color as Record<string, unknown>
  const colorPalettes = orderedKeys(colorData, { type: 'known', order: KNOWN_ORDERS.colorPalettes }, 'primitive.color')

  for (const palette of colorPalettes) {
    const paletteData = colorData[palette]
    if (!paletteData) continue

    if (typeof paletteData === 'object' && 'value' in (paletteData as TokenValue)) {
      // Single color (white, black)
      if (palette === 'white' || palette === 'black') {
        if (palette === 'white') lines.push(`  /* Base */`)
        const hexVal = String((paletteData as TokenValue).value)
        lines.push(`  --color-${palette}: ${hexVal};`)
        const rgb = hexToRgb(hexVal)
        if (rgb) lines.push(`  --color-${palette}-rgb: ${rgb};`)
        if (palette === 'black') lines.push(``)
      }
    } else {
      // Palette with shades
      const shades = paletteData as Record<string, TokenValue | Record<string, unknown>>
      const paletteLabel = palette.charAt(0).toUpperCase() + palette.slice(1)
      lines.push(`  /* ${paletteLabel} */`)

      const shadeKeys = orderedKeys(shades as Record<string, unknown>, { type: 'numeric' }, `primitive.color.${palette}`)

      for (const shade of shadeKeys) {
        const token = shades[shade] as TokenValue
        if (token && token.value) {
          const hexVal = String(token.value)
          lines.push(`  --color-${palette}-${shade}: ${hexVal};`)
          const rgb = hexToRgb(hexVal)
          if (rgb) lines.push(`  --color-${palette}-${shade}-rgb: ${rgb};`)
        }
      }
      lines.push(``)
    }
  }
  // --- Font Family ---
  const fontFamilyData = p.fontFamily as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Font Family`)
  lines.push(`     ======================================== */`)
  for (const [name, token] of Object.entries(fontFamilyData)) {
    if (name.startsWith('$')) continue
    lines.push(`  --font-family-${name}: ${token.value};`)
  }
  lines.push(``)
  // --- Typography (fontSize + lineHeight) ---
  const fontSizeData = p.fontSize as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Typography`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'primitive.fontSize')) {
    const token = fontSizeData[name]
    if (!token) continue
    const lh = token.$extensions?.lineHeight as string | undefined
    lines.push(`  --font-size-${name}: ${formatValue(String(token.value), 'fontSizes')}; ${pxComment(String(token.value))}`)
    if (lh) lines.push(`  --line-height-${name}: ${pxToRem(lh)}; ${pxComment(lh)}`)
  }
  lines.push(``)
  // --- Font Weight ---
  const fontWeightData = p.fontWeight as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Font Weight`)
  lines.push(`     ======================================== */`)
  for (const [name, token] of Object.entries(fontWeightData)) {
    if (name.startsWith('$')) continue
    lines.push(`  --font-weight-${name}: ${token.value};`)
  }
  lines.push(``)
  // --- Spacing ---
  const spacingData = p.spacing as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Spacing`)
  lines.push(`     0~12px: 2px increments, 12px~: 4px increments`)
  lines.push(`     ======================================== */`)
  for (const key of orderedKeys(spacingData, { type: 'numeric' }, 'primitive.spacing')) {
    const token = spacingData[key]
    lines.push(`  --spacing-${spacingKeyToCssKey(key)}: ${formatValue(String(token.value), 'spacing')}; ${pxComment(String(token.value))}`)
  }
  lines.push(``)
  // --- Border Radius ---
  const radiusData = p.borderRadius as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Border Radius`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'primitive.borderRadius')) {
    const token = radiusData[name]
    if (!token) continue
    lines.push(`  --radius-${name}: ${formatValue(String(token.value), 'borderRadius')};`)
  }
  lines.push(``)
  // --- Border Width ---
  const borderWidthData = p.borderWidth as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Border Width`)
  lines.push(`     ======================================== */`)
  for (const key of orderedKeys(borderWidthData, { type: 'numeric' }, 'primitive.borderWidth')) {
    lines.push(`  --border-width-${key}: ${formatValue(String(borderWidthData[key].value), 'borderWidth')};`)
  }
  lines.push(``)
  // --- Shadows ---
  const shadowData = p.shadow as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Shadows (Light Mode)`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(shadowData, { type: 'known', order: KNOWN_ORDERS.shadow }, 'primitive.shadow')) {
    const token = shadowData[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    lines.push(`  --shadow-${name}: ${formatShadow(token.value as ShadowLayer | ShadowLayer[], ext)};`)
  }
  lines.push(``)
  // --- Icon Size ---
  const iconSizeData = p.iconSize as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Icon Size (5-step scale)`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(iconSizeData, { type: 'known', order: KNOWN_ORDERS.iconSize }, 'primitive.iconSize')) {
    const token = iconSizeData[name]
    if (!token) continue
    lines.push(`  --icon-size-${name}: ${pxToRem(String(token.value))}; ${pxComment(String(token.value))}`)
  }
  lines.push(``)
  // --- Scale ---
  const scaleData = p.scale as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Scale`)
  lines.push(`     ======================================== */`)
  for (const [name, token] of Object.entries(scaleData)) {
    if (name.startsWith('$')) continue
    lines.push(`  --scale-${name}: ${token.value};`)
  }
  lines.push(``)
  // --- Z-Index ---
  const zIndexData = p.zIndex as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Z-Index`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(zIndexData, { type: 'known', order: KNOWN_ORDERS.zIndex }, 'primitive.zIndex')) {
    const token = zIndexData[name]
    if (!token) continue
    lines.push(`  --z-index-${name}: ${token.value};`)
  }
  lines.push(``)
  // --- Opacity ---
  const opacityData = p.opacity as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Opacity`)
  lines.push(`     ======================================== */`)
  for (const key of orderedKeys(opacityData, { type: 'numeric' }, 'primitive.opacity')) {
    // Convert decimal (0.5) → percentage (50%) for Tailwind v4 color-mix() compatibility
    // CSS opacity property accepts both: opacity: 50% === opacity: 0.5
    const pct = Math.round(Number(opacityData[key].value) * 100)
    lines.push(`  --opacity-${key}: ${pct}%;`)
  }
  lines.push(``)
  // --- Duration ---
  const durationData = p.duration as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Duration`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(durationData, { type: 'known', order: KNOWN_ORDERS.duration }, 'primitive.duration')) {
    const token = durationData[name]
    if (!token) continue
    lines.push(`  --duration-${name}: ${token.value};`)
  }
  lines.push(``)
  // --- Easing ---
  const easingData = p.easing as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Easing`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(easingData, { type: 'known', order: KNOWN_ORDERS.easing }, 'primitive.easing')) {
    const token = easingData[name]
    if (!token) continue
    lines.push(`  --easing-${camelToKebab(name)}: ${token.value};`)
  }
  lines.push(``)
  // --- Breakpoints ---
  const breakpointData = p.breakpoint as Record<string, TokenValue>
  lines.push(`  /* ========================================`)
  lines.push(`     Breakpoints`)
  lines.push(`     ======================================== */`)
  for (const name of orderedKeys(breakpointData, { type: 'known', order: KNOWN_ORDERS.breakpoint }, 'primitive.breakpoint')) {
    const token = breakpointData[name]
    if (!token) continue
    lines.push(`  --breakpoint-${name}: ${formatValue(String(token.value), 'dimension')};`)
  }
  lines.push(``)

  // --- Component Size (semantic.componentSize) ---
  const sem = tokens.semantic as Record<string, unknown> | undefined
  const compSizeData = sem?.componentSize as Record<string, unknown> | undefined
  if (compSizeData) {
    lines.push(`  /* ========================================`)
    lines.push(`     Component Size`)
    lines.push(`     ======================================== */`)
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp] as Record<string, unknown>
      if (!compData) continue
      for (const part of Object.keys(compData)) {
        const partData = compData[part] as Record<string, TokenValue>
        if (!partData) continue
        for (const size of Object.keys(partData)) {
          const token = partData[size]
          if (!token) continue
          const val = token.value
          if (typeof val === 'object' && val !== null) {
            const obj = val as Record<string, string>
            if (obj.width) lines.push(`  --component-${comp}-${part}-${size}-width: ${obj.width}px;`)
            if (obj.height) lines.push(`  --component-${comp}-${part}-${size}-height: ${obj.height}px;`)
          } else {
            lines.push(`  --component-${comp}-${part}-${size}: ${val}px;`)
          }
        }
      }
    }
    lines.push(``)
  }

  // --- Semantic Typography ---
  const semTypo = tokens.semantic.typography as Record<string, unknown>
  lines.push(`  /* ========================================`)
  lines.push(`     Semantic Typography`)
  lines.push(`     ======================================== */`)

  const typoCategories = orderedKeys(semTypo, { type: 'known', order: [...KNOWN_ORDERS.typographyCategories, 'caption', 'code'] }, 'semantic.typography')
    .filter(k => KNOWN_ORDERS.typographyCategories.includes(k))
  const typoOrders: Record<string, string[]> = {
    ...KNOWN_ORDERS.typographyOrders,
  }

  for (const cat of typoCategories) {
    const catData = semTypo[cat] as Record<string, TokenValue>
    if (!catData) continue
    const order = typoOrders[cat]
    for (const name of order) {
      const token = catData[name]
      if (!token || !token.value) continue
      const v = token.value as Record<string, string>
      const prefix = `--typography-${cat}-${name}`
      // fontSize → var(--font-size-*) /* resolved px */
      if (v.fontSize) {
        const sizeRef = v.fontSize.slice(1, -1).split('.').pop()!
        const fsVal = fontSizeData[sizeRef]?.value
        lines.push(`  ${prefix}-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : undefined)}`)
      }
      // lineHeight → var(--line-height-*) /* resolved px */ or hardcoded with override comment
      const lhResolved = resolveLineHeight(v, fontSizeData)
      if (lhResolved) lines.push(`  ${prefix}-line-height: ${lhResolved.value};${inlineComment(lhResolved.comment)}`)
      // fontWeight → var(--font-weight-*) /* resolved number */
      if (v.fontWeight) {
        const weightRef = v.fontWeight.slice(1, -1).split('.').pop()!
        const fwVal = fontWeightData[weightRef]?.value
        lines.push(`  ${prefix}-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : undefined)}`)
      }
      // fontFamily → var(--font-family-*)
      if (v.fontFamily) {
        const familyRef = v.fontFamily.slice(1, -1).split('.').pop()!
        lines.push(`  ${prefix}-font-family: var(--font-family-${familyRef});`)
      }
    }
  }

  // caption (single token)
  const captionToken = semTypo.caption as TokenValue
  if (captionToken?.value) {
    const cv = captionToken.value as Record<string, string>
    if (cv.fontSize) {
      const sizeRef = cv.fontSize.slice(1, -1).split('.').pop()!
      const fsVal = fontSizeData[sizeRef]?.value
      lines.push(`  --typography-caption-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : undefined)}`)
    }
    const captionLh = resolveLineHeight(cv, fontSizeData)
    if (captionLh) lines.push(`  --typography-caption-line-height: ${captionLh.value};${inlineComment(captionLh.comment)}`)
    if (cv.fontWeight) {
      const weightRef = cv.fontWeight.slice(1, -1).split('.').pop()!
      const fwVal = fontWeightData[weightRef]?.value
      lines.push(`  --typography-caption-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : undefined)}`)
    }
    if (cv.fontFamily) {
      const familyRef = cv.fontFamily.slice(1, -1).split('.').pop()!
      lines.push(`  --typography-caption-font-family: var(--font-family-${familyRef});`)
    }
  }

  // code (block, inline)
  const codeData = semTypo.code as Record<string, TokenValue>
  if (codeData) {
    for (const name of ['block', 'inline']) {
      const token = codeData[name]
      if (!token?.value) continue
      const v = token.value as Record<string, string>
      const prefix = `--typography-code-${name}`
      if (v.fontSize) {
        const sizeRef = v.fontSize.slice(1, -1).split('.').pop()!
        const fsVal = fontSizeData[sizeRef]?.value
        lines.push(`  ${prefix}-font-size: var(--font-size-${sizeRef});${inlineComment(fsVal ? `${fsVal}px` : undefined)}`)
      }
      const codeLh = resolveLineHeight(v, fontSizeData)
      if (codeLh) lines.push(`  ${prefix}-line-height: ${codeLh.value};${inlineComment(codeLh.comment)}`)
      if (v.fontWeight) {
        const weightRef = v.fontWeight.slice(1, -1).split('.').pop()!
        const fwVal = fontWeightData[weightRef]?.value
        lines.push(`  ${prefix}-font-weight: var(--font-weight-${weightRef});${inlineComment(fwVal ? String(fwVal) : undefined)}`)
      }
      if (v.fontFamily) {
        const familyRef = v.fontFamily.slice(1, -1).split('.').pop()!
        lines.push(`  ${prefix}-font-family: var(--font-family-${familyRef});`)
      }
    }
  }
  lines.push(``)

  // Semantic Spacing — Layout removed (layout spacing is a design guideline, not a token)

  lines.push(`}`)
  lines.push(``)

  // --- Component Animations (from semantic.animation) ---
  // Each token generates: @keyframes {name} + .animate-{name} (1:1 mapping)
  const animTokens = readAnimationTokens(tokens)
  if (animTokens) {
    lines.push(`/* ========================================`)
    lines.push(`   Component Animations`)
    lines.push(`   Generated from semantic.animation in figma-tokens.json`)
    lines.push(`   Token name = keyframe name = class name (1:1)`)
    lines.push(`   ======================================== */`)
    lines.push(``)
    for (const a of animTokens) {
      lines.push(generateAnimationCss(a, 'css'))
      lines.push(``)
    }
  }

  return lines.join('\n')
}

// ============================================================
// Phase 2A-2: Generate tokens/css/themes/light.css
// ============================================================

function generateThemeLight(tokens: FigmaTokens): string {
  const lines: string[] = []
  lines.push(`/**`)
  lines.push(` * Light Theme — Semantic color overrides`)
  lines.push(` * ⚠️ Auto-generated — DO NOT EDIT`)
  lines.push(` *`)
  lines.push(` * Usage: @import '@7onic-ui/tokens/css/themes/light.css';`)
  lines.push(` */`)
  lines.push(``)
  lines.push(`:root {`)

  const lightColor = tokens.light.color
  const semanticColorOrder = orderedKeys(lightColor, { type: 'known', order: KNOWN_ORDERS.semanticColorCategories }, 'light.color')

  for (const category of semanticColorOrder) {
    const catData = lightColor[category]
    if (!catData) continue
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1)
    lines.push(`  /* ${catLabel} */`)
    const entries = Object.entries(catData).filter(([k]) => !k.startsWith('$'))
    const sortedEntries = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants) as [string, TokenValue][]
    for (const [variant, token] of sortedEntries) {
      const tv = token as TokenValue
      if (tv.type === 'composition' && typeof tv.value === 'object' && tv.value !== null) {
        const comp = tv.value as { color: string; opacity: string }
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`)
        // No RGB for composition tokens (they use color-mix)
      } else {
        const resolved = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveToVar(tv.value, tokens)
          : String(tv.value)
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolved};`)
        // Add RGB channel variable for opacity modifier support
        const resolvedHex = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveReference(tv.value, tokens)
          : String(tv.value)
        const rgb = hexToRgb(resolvedHex)
        if (rgb) lines.push(`  ${semanticColorVar(category, variant)}-rgb: ${rgb};`)
      }
    }
    lines.push(``)
  }

  lines.push(`}`)
  lines.push(``)
  return lines.join('\n')
}

// ============================================================
// Phase 2A-3: Generate tokens/css/themes/dark.css
// ============================================================

function generateThemeDark(tokens: FigmaTokens): string {
  const lines: string[] = []
  lines.push(`/**`)
  lines.push(` * Dark Theme — Semantic color overrides`)
  lines.push(` * ⚠️ Auto-generated — DO NOT EDIT`)
  lines.push(` *`)
  lines.push(` * Supports three dark mode strategies:`)
  lines.push(` * 1. OS auto-detection: follows prefers-color-scheme`)
  lines.push(` * 2. Manual dark:  <html data-theme="dark"> or <html class="dark">`)
  lines.push(` * 3. Manual light: <html data-theme="light"> (overrides OS dark)`)
  lines.push(` *`)
  lines.push(` * Usage: @import '@7onic-ui/tokens/css/themes/dark.css';`)
  lines.push(` */`)
  lines.push(``)

  // Collect dark theme CSS declarations (shared between selectors)
  const declLines: string[] = []

  const darkColor = tokens.dark.color
  const lightColor = tokens.light.color
  const semanticColorOrder = orderedKeys(lightColor, { type: 'known', order: KNOWN_ORDERS.semanticColorCategories }, 'dark.color')

  for (const category of semanticColorOrder) {
    const catData = darkColor[category]
    if (!catData) continue
    const catLabel = category.charAt(0).toUpperCase() + category.slice(1)
    declLines.push(`  /* ${catLabel} */`)
    const entries = Object.entries(catData).filter(([k]) => !k.startsWith('$'))
    const sortedEntries = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants) as [string, TokenValue][]
    for (const [variant, token] of sortedEntries) {
      const tv = token as TokenValue
      if (tv.type === 'composition' && typeof tv.value === 'object' && tv.value !== null) {
        const comp = tv.value as { color: string; opacity: string }
        declLines.push(`  ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`)
        // No RGB for composition tokens (they use color-mix)
      } else {
        const resolved = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveToVar(tv.value, tokens)
          : String(tv.value)
        declLines.push(`  ${semanticColorVar(category, variant)}: ${resolved};`)
        // Add RGB channel variable for opacity modifier support
        const resolvedHex = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveReference(tv.value, tokens)
          : String(tv.value)
        const rgb = hexToRgb(resolvedHex)
        if (rgb) declLines.push(`  ${semanticColorVar(category, variant)}-rgb: ${rgb};`)
      }
    }
    declLines.push(``)
  }

  declLines.push(`  /* Dark Mode Shadows - increased opacity for visibility */`)
  const darkShadowData = tokens.primitive as Record<string, unknown>
  const darkShadows = darkShadowData.shadow as Record<string, TokenValue>
  for (const name of orderedKeys(darkShadows, { type: 'known', order: KNOWN_ORDERS.shadow }, 'dark.shadow')) {
    const token = darkShadows[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    declLines.push(`  --shadow-${name}: ${formatShadowDark(token.value as ShadowLayer | ShadowLayer[], ext)};`)
  }

  const declarations = declLines.join('\n')
  // Add extra indent for media query nesting
  const mediaDeclarations = declLines.map(l => l ? `  ${l}` : l).join('\n')

  // Strategy 1: OS auto-detection (excludes manual light override)
  lines.push(`@media (prefers-color-scheme: dark) {`)
  lines.push(`  :root:not([data-theme="light"]) {`)
  lines.push(mediaDeclarations)
  lines.push(`  }`)
  lines.push(`}`)
  lines.push(``)
  // Strategy 2: Manual dark override (.dark class or data-theme attribute)
  lines.push(`:root[data-theme="dark"],`)
  lines.push(`:root.dark {`)
  lines.push(declarations)
  lines.push(`}`)
  lines.push(``)
  return lines.join('\n')
}

// ============================================================
// Phase 2A-4: Generate tokens/js/index.js + index.mjs
// ============================================================

function generateJsTokens(tokens: FigmaTokens): { cjs: string; esm: string } {
  const p = tokens.primitive as Record<string, unknown>

  // Build token data object
  const data: Record<string, unknown> = {}

  // Colors (primitives)
  const colors: Record<string, unknown> = {}
  const colorData = p.color as Record<string, unknown>
  for (const palette of orderedKeys(colorData, { type: 'known', order: KNOWN_ORDERS.colorPalettes }, 'js.color')) {
    const paletteData = colorData[palette]
    if (!paletteData) continue
    if (typeof paletteData === 'object' && 'value' in (paletteData as TokenValue)) {
      colors[palette] = (paletteData as TokenValue).value
    } else {
      const shades = paletteData as Record<string, TokenValue>
      const shadeObj: Record<string, string> = {}
      for (const shade of orderedKeys(shades as Record<string, unknown>, { type: 'numeric' }, `js.color.${palette}`)) {
        const token = shades[shade] as TokenValue
        if (token?.value) shadeObj[shade] = String(token.value)
      }
      colors[palette] = shadeObj
    }
  }
  data.colors = colors

  // Spacing
  const spacing: Record<string, string> = {}
  const spacingData = p.spacing as Record<string, TokenValue>
  for (const key of orderedKeys(spacingData, { type: 'numeric' }, 'js.spacing')) {
    spacing[key] = pxToRem(String(spacingData[key].value))
  }
  data.spacing = spacing

  // Font Size
  const fontSize: Record<string, { size: string; lineHeight: string }> = {}
  const fontSizeData = p.fontSize as Record<string, TokenValue>
  for (const name of orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'js.fontSize')) {
    const token = fontSizeData[name]
    if (!token) continue
    const lh = token.$extensions?.lineHeight as string | undefined
    fontSize[name] = {
      size: pxToRem(String(token.value)),
      lineHeight: pxToRem(String(lh || token.value)),
    }
  }
  data.fontSize = fontSize

  // Border Radius
  const borderRadius: Record<string, string> = {}
  const radiusData = p.borderRadius as Record<string, TokenValue>
  for (const name of orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'js.borderRadius')) {
    const token = radiusData[name]
    if (!token) continue
    borderRadius[name] = formatValue(String(token.value), 'borderRadius')
  }
  data.borderRadius = borderRadius

  // Shadow
  const shadow: Record<string, string> = {}
  const shadowData = p.shadow as Record<string, TokenValue>
  for (const name of orderedKeys(shadowData, { type: 'known', order: KNOWN_ORDERS.shadow }, 'js.shadow')) {
    const token = shadowData[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    shadow[name] = formatShadow(token.value as ShadowLayer | ShadowLayer[], ext)
  }
  data.shadow = shadow

  // Z-Index
  const zIndex: Record<string, string | number> = {}
  const zData = p.zIndex as Record<string, TokenValue>
  for (const name of orderedKeys(zData, { type: 'known', order: KNOWN_ORDERS.zIndex }, 'js.zIndex')) {
    const token = zData[name]
    if (!token) continue
    zIndex[name] = token.value as string | number
  }
  data.zIndex = zIndex

  // Duration
  const duration: Record<string, string> = {}
  const durationData = p.duration as Record<string, TokenValue>
  for (const name of orderedKeys(durationData, { type: 'known', order: KNOWN_ORDERS.duration }, 'js.duration')) {
    const token = durationData[name]
    if (!token) continue
    duration[name] = String(token.value)
  }
  data.duration = duration

  // Icon Size
  const iconSize: Record<string, string> = {}
  const iconSizeData = p.iconSize as Record<string, TokenValue>
  for (const name of orderedKeys(iconSizeData, { type: 'known', order: KNOWN_ORDERS.iconSize }, 'js.iconSize')) {
    const token = iconSizeData[name]
    if (!token) continue
    iconSize[name] = pxToRem(String(token.value))
  }
  data.iconSize = iconSize

  // Opacity
  const opacity: Record<string, string> = {}
  const opacityData = p.opacity as Record<string, TokenValue>
  if (opacityData) {
    for (const name of orderedKeys(opacityData, { type: 'numeric' }, 'js.opacity')) {
      const token = opacityData[name]
      if (!token) continue
      opacity[name] = String(token.value)
    }
    data.opacity = opacity
  }

  // Font Weight
  const fontWeight: Record<string, string> = {}
  const fontWeightData = p.fontWeight as Record<string, TokenValue>
  if (fontWeightData) {
    for (const name of Object.keys(fontWeightData)) {
      const token = fontWeightData[name]
      if (!token) continue
      fontWeight[name] = String(token.value)
    }
    data.fontWeight = fontWeight
  }

  // Border Width
  const borderWidth: Record<string, string> = {}
  const borderWidthData = p.borderWidth as Record<string, TokenValue>
  if (borderWidthData) {
    for (const name of orderedKeys(borderWidthData, { type: 'numeric' }, 'js.borderWidth')) {
      const token = borderWidthData[name]
      if (!token) continue
      borderWidth[name] = `${token.value}px`
    }
    data.borderWidth = borderWidth
  }

  // Scale
  const scale: Record<string, string> = {}
  const scaleData = p.scale as Record<string, TokenValue>
  if (scaleData) {
    for (const name of Object.keys(scaleData)) {
      const token = scaleData[name]
      if (!token) continue
      scale[name] = String(token.value)
    }
    data.scale = scale
  }

  // Easing
  const easing: Record<string, string> = {}
  const easingData = p.easing as Record<string, TokenValue>
  if (easingData) {
    for (const name of orderedKeys(easingData, { type: 'known', order: KNOWN_ORDERS.easing }, 'js.easing')) {
      const token = easingData[name]
      if (!token) continue
      easing[name] = String(token.value)
    }
    data.easing = easing
  }

  // Breakpoint
  const breakpoint: Record<string, string> = {}
  const breakpointData = p.breakpoint as Record<string, TokenValue>
  if (breakpointData) {
    for (const name of orderedKeys(breakpointData, { type: 'known', order: KNOWN_ORDERS.breakpoint }, 'js.breakpoint')) {
      const token = breakpointData[name]
      if (!token) continue
      breakpoint[name] = `${token.value}px`
    }
    data.breakpoint = breakpoint
  }

  // Font Family
  const fontFamily: Record<string, string> = {}
  const fontFamilyData = p.fontFamily as Record<string, TokenValue>
  if (fontFamilyData) {
    for (const name of Object.keys(fontFamilyData)) {
      const token = fontFamilyData[name]
      if (!token) continue
      fontFamily[name] = String(token.value)
    }
    data.fontFamily = fontFamily
  }

  // Component Size (semantic.componentSize)
  const compSizeData = (tokens.semantic as Record<string, unknown>)?.componentSize as Record<string, unknown> | undefined
  if (compSizeData) {
    const componentSize: Record<string, Record<string, Record<string, string | Record<string, string>>>> = {}
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp] as Record<string, unknown>
      if (!compData) continue
      componentSize[comp] = {}
      for (const part of Object.keys(compData)) {
        const partData = compData[part] as Record<string, TokenValue>
        if (!partData) continue
        componentSize[comp][part] = {}
        for (const size of Object.keys(partData)) {
          const token = partData[size]
          if (!token) continue
          const val = token.value
          if (typeof val === 'object' && val !== null) {
            const obj = val as Record<string, string>
            componentSize[comp][part][size] = {
              ...(obj.width ? { width: `${obj.width}px` } : {}),
              ...(obj.height ? { height: `${obj.height}px` } : {}),
            }
          } else {
            componentSize[comp][part][size] = `${val}px`
          }
        }
      }
    }
    data.componentSize = componentSize
  }

  // Animation (composite tokens → resolved values)
  const animSem = (tokens.semantic as Record<string, unknown>)?.animation as Record<string, TokenValue> | undefined
  if (animSem) {
    const animData: Record<string, Record<string, string>> = {}
    for (const [name, entry] of Object.entries(animSem)) {
      if (name.startsWith('$')) continue
      const token = entry as TokenValue
      if (token.type !== 'composition') continue
      const val = token.value as Record<string, string>
      const durationRaw = resolveRef(val.duration, p)
      const easingRaw = resolveRef(val.easing, p)
      const obj: Record<string, string> = {
        duration: durationRaw.endsWith('ms') ? durationRaw : `${durationRaw}ms`,
        easing: easingRaw,
      }
      if (val.opacity) obj.opacity = resolveRef(val.opacity, p)
      if (val.scale) obj.scale = resolveRef(val.scale, p)
      if (val.translateX) obj.translateX = val.translateX.startsWith('{') ? resolveRef(val.translateX, p) : val.translateX
      if (val.translateY) obj.translateY = resolveRef(val.translateY, p)
      if (val.heightVar) obj.heightVar = val.heightVar
      animData[name] = obj
    }
    data.animation = animData
  }

  // Typography (semantic composite tokens → resolved values)
  const sem = tokens.semantic as Record<string, unknown> | undefined
  const typoData = sem?.typography as Record<string, unknown> | undefined
  if (typoData) {
    const typography: Record<string, unknown> = {}
    for (const category of Object.keys(typoData)) {
      const catData = typoData[category] as Record<string, unknown>
      if (!catData) continue
      // Check if it's a direct typography token (e.g. caption) or a category with children
      if (catData.type === 'typography' && catData.value) {
        const val = (catData as TokenValue).value as Record<string, string>
        typography[category] = {
          fontFamily: resolveRef(val.fontFamily, p),
          fontSize: pxToRem(resolveRef(val.fontSize, p)),
          fontWeight: resolveRef(val.fontWeight, p),
          lineHeight: pxToRem(val.lineHeight),
        }
      } else {
        const catObj: Record<string, unknown> = {}
        for (const name of Object.keys(catData)) {
          const entry = catData[name] as Record<string, unknown>
          if (!entry || entry.type !== 'typography') continue
          const val = entry.value as Record<string, string>
          catObj[name] = {
            fontFamily: resolveRef(val.fontFamily, p),
            fontSize: pxToRem(resolveRef(val.fontSize, p)),
            fontWeight: resolveRef(val.fontWeight, p),
            lineHeight: pxToRem(val.lineHeight),
          }
        }
        typography[category] = catObj
      }
    }
    data.typography = typography
  }

  const json = JSON.stringify(data, null, 2)

  // CJS
  const cjsLines: string[] = []
  cjsLines.push(`/**`)
  cjsLines.push(` * 7onic Design Tokens — JavaScript export`)
  cjsLines.push(` * ⚠️ Auto-generated — DO NOT EDIT`)
  cjsLines.push(` */`)
  cjsLines.push(`'use strict';`)
  cjsLines.push(``)
  cjsLines.push(`const tokens = ${json};`)
  cjsLines.push(``)
  for (const key of Object.keys(data)) {
    cjsLines.push(`module.exports.${key} = tokens.${key};`)
  }
  cjsLines.push(`module.exports.default = tokens;`)
  cjsLines.push(``)

  // ESM
  const esmLines: string[] = []
  esmLines.push(`/**`)
  esmLines.push(` * 7onic Design Tokens — JavaScript export (ESM)`)
  esmLines.push(` * ⚠️ Auto-generated — DO NOT EDIT`)
  esmLines.push(` */`)
  esmLines.push(``)
  esmLines.push(`const tokens = ${json};`)
  esmLines.push(``)
  for (const key of Object.keys(data)) {
    esmLines.push(`export const ${key} = tokens.${key};`)
  }
  esmLines.push(`export default tokens;`)
  esmLines.push(``)

  return { cjs: cjsLines.join('\n'), esm: esmLines.join('\n') }
}

// ============================================================
// Phase 2A-5: Generate tokens/types/index.d.ts
// ============================================================

function generateTypeDefinitions(tokens: FigmaTokens): string {
  const p = tokens.primitive as Record<string, unknown>
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * 7onic Design Tokens — TypeScript type definitions`)
  lines.push(` * ⚠️ Auto-generated — DO NOT EDIT`)
  lines.push(` */`)
  lines.push(``)

  // Shade type
  lines.push(`type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';`)
  lines.push(`type ShadeRecord = Record<Shade, string>;`)
  lines.push(``)

  // Colors type
  const colorData = p.color as Record<string, unknown>
  const colorPalettes = orderedKeys(colorData, { type: 'known', order: KNOWN_ORDERS.colorPalettes }, 'types.color')
  lines.push(`export declare const colors: {`)
  for (const palette of colorPalettes) {
    const paletteData = colorData[palette]
    if (!paletteData) continue
    if (typeof paletteData === 'object' && 'value' in (paletteData as TokenValue)) {
      lines.push(`  ${palette}: string;`)
    } else {
      lines.push(`  ${palette}: ShadeRecord;`)
    }
  }
  lines.push(`};`)
  lines.push(``)

  // Spacing
  const spacingData = p.spacing as Record<string, TokenValue>
  const spacingKeys = orderedKeys(spacingData, { type: 'numeric' }, 'types.spacing')
  lines.push(`export declare const spacing: Record<${spacingKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
  lines.push(``)

  // Font Size
  const fontSizeData = p.fontSize as Record<string, TokenValue>
  const fsKeys = orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'types.fontSize')
  lines.push(`export declare const fontSize: Record<${fsKeys.map(k => `'${k}'`).join(' | ')}, { size: string; lineHeight: string }>;`)
  lines.push(``)

  // Border Radius
  const radiusData = p.borderRadius as Record<string, TokenValue>
  const rKeys = orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'types.borderRadius')
  lines.push(`export declare const borderRadius: Record<${rKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
  lines.push(``)

  // Shadow
  lines.push(`export declare const shadow: Record<${KNOWN_ORDERS.shadow.map(k => `'${k}'`).join(' | ')}, string>;`)
  lines.push(``)

  // Z-Index
  const zData = p.zIndex as Record<string, TokenValue>
  const zKeys = orderedKeys(zData, { type: 'known', order: KNOWN_ORDERS.zIndex }, 'types.zIndex')
  lines.push(`export declare const zIndex: Record<${zKeys.map(k => `'${k}'`).join(' | ')}, string | number>;`)
  lines.push(``)

  // Duration
  lines.push(`export declare const duration: Record<${KNOWN_ORDERS.duration.map(k => `'${k}'`).join(' | ')}, string>;`)
  lines.push(``)

  // Icon Size
  lines.push(`export declare const iconSize: Record<${KNOWN_ORDERS.iconSize.map(k => `'${k}'`).join(' | ')}, string>;`)
  lines.push(``)

  // Opacity
  const opacityData = p.opacity as Record<string, TokenValue>
  if (opacityData) {
    const opKeys = orderedKeys(opacityData, { type: 'numeric' }, 'types.opacity')
    lines.push(`export declare const opacity: Record<${opKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Font Weight
  const fontWeightData = p.fontWeight as Record<string, TokenValue>
  if (fontWeightData) {
    const fwKeys = Object.keys(fontWeightData)
    lines.push(`export declare const fontWeight: Record<${fwKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Border Width
  const borderWidthData = p.borderWidth as Record<string, TokenValue>
  if (borderWidthData) {
    const bwKeys = orderedKeys(borderWidthData, { type: 'numeric' }, 'types.borderWidth')
    lines.push(`export declare const borderWidth: Record<${bwKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Scale
  const scaleData = p.scale as Record<string, TokenValue>
  if (scaleData) {
    const scKeys = Object.keys(scaleData)
    lines.push(`export declare const scale: Record<${scKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Easing
  const easingDataT = p.easing as Record<string, TokenValue>
  if (easingDataT) {
    const eKeys = orderedKeys(easingDataT, { type: 'known', order: KNOWN_ORDERS.easing }, 'types.easing')
    lines.push(`export declare const easing: Record<${eKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Breakpoint
  const breakpointDataT = p.breakpoint as Record<string, TokenValue>
  if (breakpointDataT) {
    const bpKeys = orderedKeys(breakpointDataT, { type: 'known', order: KNOWN_ORDERS.breakpoint }, 'types.breakpoint')
    lines.push(`export declare const breakpoint: Record<${bpKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Font Family
  const fontFamilyData = p.fontFamily as Record<string, TokenValue>
  if (fontFamilyData) {
    const ffKeys = Object.keys(fontFamilyData)
    lines.push(`export declare const fontFamily: Record<${ffKeys.map(k => `'${k}'`).join(' | ')}, string>;`)
    lines.push(``)
  }

  // Component Size (semantic.componentSize)
  const compSizeDataT = (tokens.semantic as Record<string, unknown>)?.componentSize as Record<string, unknown> | undefined
  if (compSizeDataT) {
    lines.push(`export declare const componentSize: {`)
    for (const comp of Object.keys(compSizeDataT)) {
      const compData = compSizeDataT[comp] as Record<string, unknown>
      if (!compData) continue
      lines.push(`  ${comp}: {`)
      for (const part of Object.keys(compData)) {
        const partData = compData[part] as Record<string, TokenValue>
        if (!partData) continue
        lines.push(`    ${part}: {`)
        for (const size of Object.keys(partData)) {
          const token = partData[size]
          if (!token) continue
          const val = token.value
          if (typeof val === 'object' && val !== null) {
            lines.push(`      ${size}: { width: string; height: string };`)
          } else {
            lines.push(`      ${size}: string;`)
          }
        }
        lines.push(`    };`)
      }
      lines.push(`  };`)
    }
    lines.push(`};`)
    lines.push(``)
  }

  // Animation
  const animSemT = (tokens.semantic as Record<string, unknown>)?.animation as Record<string, TokenValue> | undefined
  if (animSemT) {
    lines.push(`export declare const animation: {`)
    for (const [name, entry] of Object.entries(animSemT)) {
      if (name.startsWith('$')) continue
      const token = entry as TokenValue
      if (token.type !== 'composition') continue
      const val = token.value as Record<string, string>
      const fields: string[] = ['duration: string', 'easing: string']
      if (val.opacity) fields.unshift('opacity: string')
      if (val.scale) fields.unshift('scale: string')
      if (val.translateX) fields.unshift('translateX: string')
      if (val.translateY) fields.unshift('translateY: string')
      if (val.heightVar) fields.unshift('heightVar: string')
      lines.push(`  '${name}': { ${fields.join('; ')} };`)
    }
    lines.push(`};`)
    lines.push(``)
  }

  // Typography (semantic composite tokens)
  const semT = tokens.semantic as Record<string, unknown> | undefined
  const typoDataT = semT?.typography as Record<string, unknown> | undefined
  if (typoDataT) {
    const typoType = `{ fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string }`
    lines.push(`export declare const typography: {`)
    for (const category of Object.keys(typoDataT)) {
      const catData = typoDataT[category] as Record<string, unknown>
      if (!catData) continue
      if (catData.type === 'typography') {
        // Direct token (e.g. caption)
        lines.push(`  ${category}: ${typoType};`)
      } else {
        // Category with children (e.g. heading, body, label, code)
        const childKeys = Object.keys(catData).filter(k => {
          const entry = catData[k] as Record<string, unknown>
          return entry?.type === 'typography'
        })
        lines.push(`  ${category}: {`)
        for (const name of childKeys) {
          lines.push(`    '${name}': ${typoType};`)
        }
        lines.push(`  };`)
      }
    }
    lines.push(`};`)
    lines.push(``)
  }

  // Named type aliases
  lines.push(`// Named type aliases for convenience`)
  lines.push(`export type Colors = typeof colors;`)
  lines.push(`export type Spacing = typeof spacing;`)
  lines.push(`export type FontSize = typeof fontSize;`)
  lines.push(`export type BorderRadius = typeof borderRadius;`)
  lines.push(`export type Shadow = typeof shadow;`)
  lines.push(`export type ZIndex = typeof zIndex;`)
  lines.push(`export type Duration = typeof duration;`)
  lines.push(`export type IconSize = typeof iconSize;`)
  lines.push(`export type Opacity = typeof opacity;`)
  lines.push(`export type FontWeight = typeof fontWeight;`)
  lines.push(`export type BorderWidth = typeof borderWidth;`)
  lines.push(`export type Scale = typeof scale;`)
  lines.push(`export type Easing = typeof easing;`)
  lines.push(`export type Breakpoint = typeof breakpoint;`)
  lines.push(`export type FontFamily = typeof fontFamily;`)
  lines.push(`export type ComponentSize = typeof componentSize;`)
  lines.push(`export type Animation = typeof animation;`)
  lines.push(`export type Typography = typeof typography;`)
  lines.push(``)

  // Default export
  lines.push(`declare const tokens: {`)
  lines.push(`  colors: typeof colors;`)
  lines.push(`  spacing: typeof spacing;`)
  lines.push(`  fontSize: typeof fontSize;`)
  lines.push(`  borderRadius: typeof borderRadius;`)
  lines.push(`  shadow: typeof shadow;`)
  lines.push(`  zIndex: typeof zIndex;`)
  lines.push(`  duration: typeof duration;`)
  lines.push(`  iconSize: typeof iconSize;`)
  lines.push(`  opacity: typeof opacity;`)
  lines.push(`  fontWeight: typeof fontWeight;`)
  lines.push(`  borderWidth: typeof borderWidth;`)
  lines.push(`  scale: typeof scale;`)
  lines.push(`  easing: typeof easing;`)
  lines.push(`  breakpoint: typeof breakpoint;`)
  lines.push(`  fontFamily: typeof fontFamily;`)
  lines.push(`  componentSize: typeof componentSize;`)
  lines.push(`  animation: typeof animation;`)
  lines.push(`  typography: typeof typography;`)
  lines.push(`};`)
  lines.push(`export default tokens;`)
  lines.push(``)

  return lines.join('\n')
}

// ============================================================
// Phase 2A-6: Generate tokens/json/tokens.json
// ============================================================

function generateNormalizedJson(tokens: FigmaTokens): string {
  const p = tokens.primitive as Record<string, unknown>
  const result: Record<string, Record<string, string>> = {}

  // Colors
  const colorFlat: Record<string, string> = {}
  const colorData = p.color as Record<string, unknown>
  for (const palette of orderedKeys(colorData, { type: 'known', order: KNOWN_ORDERS.colorPalettes }, 'json.color')) {
    const paletteData = colorData[palette]
    if (!paletteData) continue
    if (typeof paletteData === 'object' && 'value' in (paletteData as TokenValue)) {
      colorFlat[palette] = String((paletteData as TokenValue).value)
    } else {
      const shades = paletteData as Record<string, TokenValue>
      for (const shade of orderedKeys(shades as Record<string, unknown>, { type: 'numeric' }, `json.color.${palette}`)) {
        const token = shades[shade] as TokenValue
        if (token?.value) colorFlat[`${palette}-${shade}`] = String(token.value)
      }
    }
  }
  result.color = colorFlat

  // Spacing
  const spacingFlat: Record<string, string> = {}
  const spacingData = p.spacing as Record<string, TokenValue>
  for (const key of orderedKeys(spacingData, { type: 'numeric' }, 'json.spacing')) {
    spacingFlat[key] = pxToRem(String(spacingData[key].value))
  }
  result.spacing = spacingFlat

  // Font Size
  const fontSizeFlat: Record<string, string> = {}
  const fontSizeData = p.fontSize as Record<string, TokenValue>
  for (const name of orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'json.fontSize')) {
    const token = fontSizeData[name]
    if (!token) continue
    fontSizeFlat[name] = pxToRem(String(token.value))
  }
  result.fontSize = fontSizeFlat

  // Line Height
  const lineHeightFlat: Record<string, string> = {}
  for (const name of orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'json.lineHeight')) {
    const token = fontSizeData[name]
    if (!token) continue
    const lh = token.$extensions?.lineHeight as string | undefined
    if (lh) lineHeightFlat[name] = pxToRem(lh)
  }
  result.lineHeight = lineHeightFlat

  // Border Radius
  const radiusFlat: Record<string, string> = {}
  const radiusData = p.borderRadius as Record<string, TokenValue>
  for (const name of orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'json.borderRadius')) {
    const token = radiusData[name]
    if (!token) continue
    radiusFlat[name] = formatValue(String(token.value), 'borderRadius')
  }
  result.borderRadius = radiusFlat

  // Shadow
  const shadowFlat: Record<string, string> = {}
  const shadowData = p.shadow as Record<string, TokenValue>
  for (const name of orderedKeys(shadowData, { type: 'known', order: KNOWN_ORDERS.shadow }, 'json.shadow')) {
    const token = shadowData[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    shadowFlat[name] = formatShadow(token.value as ShadowLayer | ShadowLayer[], ext)
  }
  result.shadow = shadowFlat

  // Icon Size
  const iconSizeFlat: Record<string, string> = {}
  const iconSizeData = p.iconSize as Record<string, TokenValue>
  for (const name of orderedKeys(iconSizeData, { type: 'known', order: KNOWN_ORDERS.iconSize }, 'json.iconSize')) {
    const token = iconSizeData[name]
    if (!token) continue
    iconSizeFlat[name] = pxToRem(String(token.value))
  }
  result.iconSize = iconSizeFlat

  // Z-Index
  const zFlat: Record<string, string | number> = {}
  const zData = p.zIndex as Record<string, TokenValue>
  for (const name of orderedKeys(zData, { type: 'known', order: KNOWN_ORDERS.zIndex }, 'json.zIndex')) {
    const token = zData[name]
    if (!token) continue
    zFlat[name] = token.value as string | number
  }
  result.zIndex = zFlat as Record<string, string>

  // Duration
  const durationFlat: Record<string, string> = {}
  const durationData = p.duration as Record<string, TokenValue>
  for (const name of orderedKeys(durationData, { type: 'known', order: KNOWN_ORDERS.duration }, 'json.duration')) {
    const token = durationData[name]
    if (!token) continue
    durationFlat[name] = String(token.value)
  }
  result.duration = durationFlat

  // Opacity
  const opacityFlat: Record<string, string> = {}
  const opacityData = p.opacity as Record<string, TokenValue>
  if (opacityData) {
    for (const name of orderedKeys(opacityData, { type: 'numeric' }, 'json.opacity')) {
      const token = opacityData[name]
      if (!token) continue
      opacityFlat[name] = String(token.value)
    }
    result.opacity = opacityFlat
  }

  // Font Weight
  const fontWeightFlat: Record<string, string> = {}
  const fontWeightData = p.fontWeight as Record<string, TokenValue>
  if (fontWeightData) {
    for (const name of Object.keys(fontWeightData)) {
      const token = fontWeightData[name]
      if (!token) continue
      fontWeightFlat[name] = String(token.value)
    }
    result.fontWeight = fontWeightFlat
  }

  // Border Width
  const borderWidthFlat: Record<string, string> = {}
  const borderWidthData = p.borderWidth as Record<string, TokenValue>
  if (borderWidthData) {
    for (const name of orderedKeys(borderWidthData, { type: 'numeric' }, 'json.borderWidth')) {
      const token = borderWidthData[name]
      if (!token) continue
      borderWidthFlat[name] = `${token.value}px`
    }
    result.borderWidth = borderWidthFlat
  }

  // Scale
  const scaleFlat: Record<string, string> = {}
  const scaleData = p.scale as Record<string, TokenValue>
  if (scaleData) {
    for (const name of Object.keys(scaleData)) {
      const token = scaleData[name]
      if (!token) continue
      scaleFlat[name] = String(token.value)
    }
    result.scale = scaleFlat
  }

  // Easing
  const easingFlat: Record<string, string> = {}
  const easingData = p.easing as Record<string, TokenValue>
  if (easingData) {
    for (const name of orderedKeys(easingData, { type: 'known', order: KNOWN_ORDERS.easing }, 'json.easing')) {
      const token = easingData[name]
      if (!token) continue
      easingFlat[name] = String(token.value)
    }
    result.easing = easingFlat
  }

  // Breakpoint
  const breakpointFlat: Record<string, string> = {}
  const breakpointData = p.breakpoint as Record<string, TokenValue>
  if (breakpointData) {
    for (const name of orderedKeys(breakpointData, { type: 'known', order: KNOWN_ORDERS.breakpoint }, 'json.breakpoint')) {
      const token = breakpointData[name]
      if (!token) continue
      breakpointFlat[name] = `${token.value}px`
    }
    result.breakpoint = breakpointFlat
  }

  // Font Family
  const fontFamilyFlat: Record<string, string> = {}
  const fontFamilyData = p.fontFamily as Record<string, TokenValue>
  if (fontFamilyData) {
    for (const name of Object.keys(fontFamilyData)) {
      const token = fontFamilyData[name]
      if (!token) continue
      fontFamilyFlat[name] = String(token.value)
    }
    result.fontFamily = fontFamilyFlat
  }

  // Component Size (semantic.componentSize, flat: "switch-track-sm-width": "32px")
  const compSizeData = (tokens.semantic as Record<string, unknown>)?.componentSize as Record<string, unknown> | undefined
  if (compSizeData) {
    const compFlat: Record<string, string> = {}
    for (const comp of Object.keys(compSizeData)) {
      const compData = compSizeData[comp] as Record<string, unknown>
      if (!compData) continue
      for (const part of Object.keys(compData)) {
        const partData = compData[part] as Record<string, TokenValue>
        if (!partData) continue
        for (const size of Object.keys(partData)) {
          const token = partData[size]
          if (!token) continue
          const val = token.value
          if (typeof val === 'object' && val !== null) {
            const obj = val as Record<string, string>
            if (obj.width) compFlat[`${comp}-${part}-${size}-width`] = `${obj.width}px`
            if (obj.height) compFlat[`${comp}-${part}-${size}-height`] = `${obj.height}px`
          } else {
            compFlat[`${comp}-${part}-${size}`] = `${val}px`
          }
        }
      }
    }
    result.componentSize = compFlat
  }

  // Animation (flat: "checkbox-enter-opacity": "0")
  const animSemJ = (tokens.semantic as Record<string, unknown>)?.animation as Record<string, TokenValue> | undefined
  if (animSemJ) {
    const animFlat: Record<string, string> = {}
    for (const [name, entry] of Object.entries(animSemJ)) {
      if (name.startsWith('$')) continue
      const token = entry as TokenValue
      if (token.type !== 'composition') continue
      const val = token.value as Record<string, string>
      const durationRaw = resolveRef(val.duration, p)
      const easingRaw = resolveRef(val.easing, p)
      animFlat[`${name}-duration`] = durationRaw.endsWith('ms') ? durationRaw : `${durationRaw}ms`
      animFlat[`${name}-easing`] = easingRaw
      if (val.opacity) animFlat[`${name}-opacity`] = resolveRef(val.opacity, p)
      if (val.scale) animFlat[`${name}-scale`] = resolveRef(val.scale, p)
      if (val.translateX) animFlat[`${name}-translateX`] = val.translateX.startsWith('{') ? resolveRef(val.translateX, p) : val.translateX
      if (val.translateY) animFlat[`${name}-translateY`] = resolveRef(val.translateY, p)
      if (val.heightVar) animFlat[`${name}-heightVar`] = val.heightVar
    }
    result.animation = animFlat
  }

  return JSON.stringify(result, null, 2) + '\n'
}

// ============================================================
// Phase 2B: Generate tokens/tailwind/v3-preset.js
// ============================================================

function generateV3Preset(tokens: FigmaTokens): string {
  const p = tokens.primitive as Record<string, unknown>
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * Design System - Tailwind CSS v3 Preset`)
  lines.push(` * ⚠️ Auto-generated from figma-tokens.json — DO NOT EDIT`)
  lines.push(` *`)
  lines.push(` * Non-color values reference CSS variables from variables.css for auto-sync.`)
  lines.push(` * Primitive colors use HEX for Tailwind v3 opacity modifier support (bg-white/10, etc.).`)
  lines.push(` * Semantic colors use rgb() with RGB channel variables for opacity modifier support (bg-primary/50, etc.).`)
  lines.push(` *`)
  lines.push(` * Usage:`)
  lines.push(` * \`\`\`js`)
  lines.push(` * // tailwind.config.js`)
  lines.push(` * module.exports = {`)
  lines.push(` *   presets: [require('@7onic-ui/react/tailwind-preset')],`)
  lines.push(` * }`)
  lines.push(` * \`\`\``)
  lines.push(` */`)
  lines.push(``)
  lines.push(`/** @type {import('tailwindcss').Config} */`)
  lines.push(`module.exports = {`)
  lines.push(`  theme: {`)
  lines.push(`    extend: {`)

  // --- Colors ---
  const colorData = p.color as Record<string, unknown>

  lines.push(`      colors: {`)
  lines.push(`        // Standalone primitive colors (HEX for opacity modifier support: bg-white/10, etc.)`)
  const whiteToken = colorData.white as TokenValue | undefined
  const blackToken = colorData.black as TokenValue | undefined
  lines.push(`        white: '${whiteToken?.value || '#FFFFFF'}',`)
  lines.push(`        black: '${blackToken?.value || '#000000'}',`)
  lines.push(``)
  // Helper: wrap semantic color in rgb() with alpha-value for opacity modifier support
  const rgbAlpha = (varName: string) => `'rgb(var(${varName}-rgb) / <alpha-value>)'`

  lines.push(`        // Semantic colors (rgb() with alpha-value for opacity modifier support)`)
  lines.push(`        background: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-background')},`)
  lines.push(`          paper: ${rgbAlpha('--color-background-paper')},`)
  lines.push(`          elevated: ${rgbAlpha('--color-background-elevated')},`)
  lines.push(`          muted: ${rgbAlpha('--color-background-muted')},`)
  lines.push(`        },`)
  lines.push(`        foreground: ${rgbAlpha('--color-text')},`)
  lines.push(``)

  // Primary, secondary — semantic + primitive palette merge
  const brandColors = ['primary', 'secondary']
  for (const color of brandColors) {
    lines.push(`        ${color}: {`)
    lines.push(`          DEFAULT: ${rgbAlpha(`--color-${color}`)},`)
    lines.push(`          hover: ${rgbAlpha(`--color-${color}-hover`)},`)
    lines.push(`          active: ${rgbAlpha(`--color-${color}-active`)},`)
    lines.push(`          tint: ${rgbAlpha(`--color-${color}-tint`)},`)
    lines.push(`          foreground: ${rgbAlpha(`--color-${color}-text`)},`)
    // Merge primitive palette shades (HEX for opacity modifier support)
    const palette = colorData[color] as Record<string, TokenValue> | undefined
    if (palette) {
      for (const shade of orderedKeys(palette, { type: 'known', order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${color}`)) {
        const token = palette[shade]
        if (token?.value) {
          lines.push(`          '${shade}': '${token.value}',`)
        }
      }
    }
    lines.push(`        },`)
  }
  lines.push(``)
  lines.push(`        // Status colors`)

  const semanticColors = ['success', 'warning', 'error', 'info']
  for (const color of semanticColors) {
    lines.push(`        ${color}: {`)
    lines.push(`          DEFAULT: ${rgbAlpha(`--color-${color}`)},`)
    lines.push(`          hover: ${rgbAlpha(`--color-${color}-hover`)},`)
    lines.push(`          active: ${rgbAlpha(`--color-${color}-active`)},`)
    lines.push(`          tint: ${rgbAlpha(`--color-${color}-tint`)},`)
    lines.push(`          foreground: ${rgbAlpha(`--color-${color}-text`)},`)
    if (color === 'error') {
      lines.push(`          bg: ${rgbAlpha('--color-error-bg')},`)
    }
    lines.push(`        },`)
  }
  lines.push(``)

  // Primitive color palettes (HEX for opacity modifier support)
  lines.push(`        // Primitive color palettes (HEX for opacity modifier support)`)
  const palettesOnly = ['gray', 'blue', 'green', 'yellow', 'red', 'violet', 'rose']
  for (const palName of palettesOnly) {
    const palette = colorData[palName] as Record<string, TokenValue> | undefined
    if (!palette) continue
    lines.push(`        ${palName}: {`)
    for (const shade of orderedKeys(palette, { type: 'known', order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${palName}`)) {
      const token = palette[shade]
      if (token?.value) {
        lines.push(`          '${shade}': '${token.value}',`)
      }
    }
    lines.push(`        },`)
  }
  lines.push(``)
  lines.push(`        // UI colors`)
  lines.push(`        border: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-border')},`)
  lines.push(`          strong: ${rgbAlpha('--color-border-strong')},`)
  lines.push(`          subtle: ${rgbAlpha('--color-border-subtle')},`)
  lines.push(`        },`)
  lines.push(`        ring: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-focus-ring')},`)
  lines.push(`          error: ${rgbAlpha('--color-focus-ring-error')},`)
  lines.push(`        },`)
  lines.push(`        muted: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-background-muted')},`)
  lines.push(`          foreground: ${rgbAlpha('--color-text-muted')},`)
  lines.push(`        },`)
  lines.push(`        disabled: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-disabled')},`)
  lines.push(`          foreground: ${rgbAlpha('--color-disabled-text')},`)
  lines.push(`        },`)
  lines.push(``)
  lines.push(`        // Chart colors`)
  lines.push(`        chart: {`)
  lines.push(`          '1': ${rgbAlpha('--color-chart-1')},`)
  lines.push(`          '2': ${rgbAlpha('--color-chart-2')},`)
  lines.push(`          '3': ${rgbAlpha('--color-chart-3')},`)
  lines.push(`          '4': ${rgbAlpha('--color-chart-4')},`)
  lines.push(`          '5': ${rgbAlpha('--color-chart-5')},`)
  lines.push(`        },`)
  lines.push(``)
  lines.push(`        // Text`)
  lines.push(`        text: {`)
  lines.push(`          DEFAULT: ${rgbAlpha('--color-text')},`)
  lines.push(`          muted: ${rgbAlpha('--color-text-muted')},`)
  lines.push(`          subtle: ${rgbAlpha('--color-text-subtle')},`)
  lines.push(`          link: ${rgbAlpha('--color-text-link')},`)
  lines.push(`          primary: ${rgbAlpha('--color-text-primary')},`)
  lines.push(`          info: ${rgbAlpha('--color-text-info')},`)
  lines.push(`          success: ${rgbAlpha('--color-text-success')},`)
  lines.push(`          error: ${rgbAlpha('--color-text-error')},`)
  lines.push(`          warning: ${rgbAlpha('--color-text-warning')},`)
  lines.push(`        },`)
  lines.push(`      },`)
  lines.push(``)

  // --- fontSize ---
  const fontSizeData = p.fontSize as Record<string, TokenValue>
  lines.push(`      fontSize: {`)
  for (const name of orderedKeys(fontSizeData, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'primitive.fontSize')) {
    const token = fontSizeData[name]
    if (!token) continue
    lines.push(`        '${name}': ['var(--font-size-${name})', { lineHeight: 'var(--line-height-${name})' }],`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- fontFamily ---
  const fontFamilyData = p.fontFamily as Record<string, TokenValue> | undefined
  if (fontFamilyData) {
    lines.push(`      fontFamily: {`)
    for (const name of Object.keys(fontFamilyData).filter(k => !k.startsWith('$'))) {
      const token = fontFamilyData[name]
      if (!token?.value) continue
      lines.push(`        '${name}': ['var(--font-family-${name})'],`)
    }
    lines.push(`      },`)
    lines.push(``)
  }

  // --- spacing ---
  const spacingData = p.spacing as Record<string, TokenValue>
  lines.push(`      spacing: {`)
  for (const key of orderedKeys(spacingData, { type: 'numeric' }, 'primitive.spacing')) {
    const cssKey = key.replace('.', '-')
    lines.push(`        '${key}': 'var(--spacing-${cssKey})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- borderRadius ---
  const radiusData = p.borderRadius as Record<string, TokenValue>
  lines.push(`      borderRadius: {`)
  // Insert DEFAULT after 'base' (Tailwind-specific, not in figma-tokens.json)
  const radiusKeys = orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'primitive.borderRadius')
  for (const name of radiusKeys) {
    const token = radiusData[name]
    if (!token) continue
    lines.push(`        '${name}': 'var(--radius-${name})',`)
    if (name === 'base') {
      lines.push(`        'DEFAULT': 'var(--radius-base)',`)
    }
  }
  lines.push(`      },`)
  lines.push(``)

  // --- boxShadow ---
  lines.push(`      boxShadow: {`)
  for (const name of orderedKeys(p.shadow as Record<string, unknown>, { type: 'known', order: KNOWN_ORDERS.shadow }, 'primitive.shadow')) {
    lines.push(`        '${name}': 'var(--shadow-${name})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- zIndex ---
  const zIndexData = p.zIndex as Record<string, TokenValue>
  lines.push(`      zIndex: {`)
  for (const name of orderedKeys(zIndexData, { type: 'known', order: KNOWN_ORDERS.zIndex }, 'primitive.zIndex')) {
    const token = zIndexData[name]
    if (!token) continue
    lines.push(`        '${name}': 'var(--z-index-${name})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- transitionDuration ---
  const durationData = p.duration as Record<string, TokenValue>
  lines.push(`      transitionDuration: {`)
  for (const name of orderedKeys(durationData, { type: 'known', order: KNOWN_ORDERS.duration }, 'primitive.duration')) {
    const token = durationData[name]
    if (!token) continue
    lines.push(`        '${name}': 'var(--duration-${name})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- transitionTimingFunction ---
  const easingData = p.easing as Record<string, TokenValue>
  lines.push(`      transitionTimingFunction: {`)
  for (const name of orderedKeys(easingData, { type: 'known', order: KNOWN_ORDERS.easing }, 'primitive.easing')) {
    const token = easingData[name]
    if (!token) continue
    lines.push(`        '${camelToKebab(name)}': 'var(--easing-${camelToKebab(name)})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- opacity ---
  const v3OpacityData = p.opacity as Record<string, TokenValue>
  if (v3OpacityData) {
    lines.push(`      opacity: {`)
    for (const name of orderedKeys(v3OpacityData, { type: 'numeric' }, 'v3.opacity')) {
      const token = v3OpacityData[name]
      if (!token) continue
      lines.push(`        '${name}': 'var(--opacity-${name})',`)
    }
    lines.push(`      },`)
    lines.push(``)
  }

  // --- scale (from primitive.scale) ---
  const scaleData = p.scale as Record<string, TokenValue>
  lines.push(`      scale: {`)
  for (const [name, token] of Object.entries(scaleData)) {
    if (name.startsWith('$')) continue
    lines.push(`        '${name}': 'var(--scale-${name})',`)
  }
  lines.push(`      },`)
  lines.push(``)

  // --- keyframes + animation (from semantic.animation, 1:1 named) ---
  const v3Anim = readAnimationTokens(tokens)
  lines.push(`      keyframes: {`)
  if (v3Anim) {
    for (const a of v3Anim) {
      if (a.type === 'height-expand' || a.type === 'height-collapse') {
        const isExpand = a.type === 'height-expand'
        lines.push(`        '${a.name}': {`)
        lines.push(`          from: { height: '${isExpand ? '0' : `var(${a.heightVar})`}' },`)
        lines.push(`          to: { height: '${isExpand ? `var(${a.heightVar})` : '0'}' },`)
        lines.push(`        },`)
      } else {
        const isEnter = a.type === 'enter'
        const fromProps: string[] = []
        const toProps: string[] = []
        if (a.opacity) { fromProps.push(`'opacity': '${isEnter ? a.opacity : '1'}'`); toProps.push(`'opacity': '${isEnter ? '1' : a.opacity}'`) }
        const fromT: string[] = [], toT: string[] = []
        if (a.scale) { fromT.push(isEnter ? `scale(${a.scale})` : 'scale(1)'); toT.push(isEnter ? 'scale(1)' : `scale(${a.scale})`) }
        if (a.translateX) { const v = formatTranslateVal(a.translateX, a.translateXNegative); fromT.push(isEnter ? `translateX(${v})` : 'translateX(0)'); toT.push(isEnter ? 'translateX(0)' : `translateX(${v})`) }
        if (a.translateY) { const v = formatTranslateVal(a.translateY, a.translateYNegative); fromT.push(isEnter ? `translateY(${v})` : 'translateY(0)'); toT.push(isEnter ? 'translateY(0)' : `translateY(${v})`) }
        if (fromT.length) { fromProps.push(`'transform': '${fromT.join(' ')}'`); toProps.push(`'transform': '${toT.join(' ')}'`) }
        lines.push(`        '${a.name}': {`)
        lines.push(`          from: { ${fromProps.join(', ')} },`)
        lines.push(`          to: { ${toProps.join(', ')} },`)
        lines.push(`        },`)
      }
    }
  }
  lines.push(`      },`)
  lines.push(``)

  lines.push(`      animation: {`)
  if (v3Anim) {
    for (const a of v3Anim) {
      const infinite = a.type === 'spin' ? ' infinite' : ''
      lines.push(`        '${a.name}': '${a.name} ${a.durationVar} ${a.easingVar}${infinite}',`)
    }
  }
  lines.push(`      },`)

  lines.push(`    },`)
  lines.push(`  },`)

  // --- plugins ---
  lines.push(`  plugins: [`)
  lines.push(`    // Icon size utilities`)
  lines.push(`    function({ addUtilities }) {`)
  lines.push(`      addUtilities({`)
  for (const name of KNOWN_ORDERS.iconSize) {
    lines.push(`        '.icon-${name}': { width: 'var(--icon-size-${name})', height: 'var(--icon-size-${name})' },`)
  }
  lines.push(`      })`)
  lines.push(`    },`)
  lines.push(`    // Scale reset for grouped buttons (override active:scale-pressed)`)
  lines.push(`    function({ addUtilities }) {`)
  lines.push(`      addUtilities({`)
  lines.push(`        '.scale-none': { transform: 'none !important' },`)
  lines.push(`      })`)
  lines.push(`    },`)
  lines.push(`    // Focus ring utility (v3/v4 compatible)`)
  lines.push(`    function({ addUtilities }) {`)
  lines.push(`      addUtilities({`)
  lines.push(`        '.focus-ring': {`)
  lines.push(`          outline: '2px solid transparent',`)
  lines.push(`          'outline-offset': '2px',`)
  lines.push(`          'box-shadow': '0 0 0 2px var(--color-focus-ring)',`)
  lines.push(`        },`)
  lines.push(`      })`)
  lines.push(`    },`)
  // Animation utilities (from semantic.animation, 1:1 named)
  if (v3Anim) {
    lines.push(`    // Animation utilities (generated from semantic.animation)`)
    lines.push(`    function({ addUtilities }) {`)
    lines.push(`      addUtilities({`)
    for (const a of v3Anim) {
      const infinite = a.type === 'spin' ? ' infinite' : ''
      lines.push(`        '.animate-${a.name}': { 'animation': '${a.name} ${a.durationVar} ${a.easingVar}${infinite}' },`)
    }
    lines.push(`      })`)
    lines.push(`    },`)
  }
  // Layout padding utilities removed (layout spacing is a design guideline, not a token)

  // Component size CSS variables (--component-switch-*, --component-slider-*)
  // are already defined in variables.css — no addBase() needed.

  lines.push(`  ],`)
  lines.push(`}`)
  lines.push(``)

  return lines.join('\n')
}

// ============================================================
// Phase 2C: Generate tokens/tailwind/v4-theme.css
// ============================================================

function generateV4Theme(tokens: FigmaTokens): string {
  const p = tokens.primitive as Record<string, unknown>
  const lines: string[] = []

  lines.push(`/**`)
  lines.push(` * Design System - Tailwind CSS v4 Theme`)
  lines.push(` * ⚠️ Auto-generated from figma-tokens.json — DO NOT EDIT`)
  lines.push(` *`)
  lines.push(` * This file is a MAPPING layer between variables.css and Tailwind v4 utilities.`)
  lines.push(` * Actual values live in variables.css (single source of truth).`)
  lines.push(` *`)
  lines.push(` * - var() references: auto-sync when variables.css changes`)
  lines.push(` * - Hardcoded values: same-name variables (overridden by variables.css at runtime)`)
  lines.push(` * - Dark mode: handled entirely by variables.css .dark block (no duplication here)`)
  lines.push(` *`)
  lines.push(` * Usage:`)
  lines.push(` * \`\`\`css`)
  lines.push(` * @import "tailwindcss";`)
  lines.push(` * @import "@7onic-ui/react/tokens";   <- variables.css (values)`)
  lines.push(` * @import "@7onic-ui/react/theme";    <- this file (mapping)`)
  lines.push(` * \`\`\``)
  lines.push(` */`)
  lines.push(``)
  lines.push(`@theme {`)

  // --- Colors ---
  lines.push(`  /* =============================================`)
  lines.push(`     Colors — var() references (different names → auto-sync)`)
  lines.push(`     When variables.css changes, these follow automatically.`)
  lines.push(`     Dark mode: variables.css .dark changes the source → auto-cascade.`)
  lines.push(`     ============================================= */`)
  lines.push(``)

  // Helper to resolve a light-theme color to hardcoded hex
  const resolveLight = (cat: string, variant: string): string => {
    const catData = tokens.light.color[cat]
    if (!catData) return ''
    const token = catData[variant] as TokenValue | undefined
    if (!token) return ''
    return typeof token.value === 'string' && token.value.startsWith('{')
      ? resolveReference(token.value, tokens)
      : String(token.value)
  }

  // Background
  lines.push(`  /* Background */`)
  lines.push(`  --color-background: ${resolveLight('background', 'default')};          /* same name → overridden by variables.css */`)
  lines.push(`  --color-background-paper: ${resolveLight('background', 'paper')};          /* same name → overridden by variables.css */`)
  lines.push(`  --color-background-elevated: ${resolveLight('background', 'elevated')};       /* same name → overridden by variables.css */`)
  lines.push(`  --color-background-muted: ${resolveLight('background', 'muted')};         /* same name → overridden by variables.css */`)
  lines.push(``)

  // Foreground
  lines.push(`  /* Foreground */`)
  lines.push(`  --color-foreground: var(--color-text);`)
  lines.push(``)

  // Semantic color groups with hardcoded fallback + overridden by variables.css
  const v4ColorGroups = ['primary', 'secondary', 'success', 'warning', 'error', 'info']
  for (const group of v4ColorGroups) {
    const label = group.charAt(0).toUpperCase() + group.slice(1)
    lines.push(`  /* ${label} */`)
    lines.push(`  --color-${group}: ${resolveLight(group, 'default')};               /* same name → overridden by variables.css */`)
    lines.push(`  --color-${group}-hover: ${resolveLight(group, 'hover')};             /* same name → overridden by variables.css */`)
    lines.push(`  --color-${group}-active: ${resolveLight(group, 'active')};            /* same name → overridden by variables.css */`)
    lines.push(`  --color-${group}-tint: ${resolveLight(group, 'tint')};              /* same name → overridden by variables.css */`)
    lines.push(`  --color-${group}-foreground: var(--color-${group}-text);`)
    if (group === 'error') {
      lines.push(`  --color-error-bg: var(--color-error-bg);`)
    }
    lines.push(``)
  }

  // Border
  lines.push(`  /* Border */`)
  lines.push(`  --color-border: ${resolveLight('border', 'default')};                /* same name → overridden by variables.css */`)
  lines.push(`  --color-border-strong: ${resolveLight('border', 'strong')};             /* same name → overridden by variables.css */`)
  lines.push(`  --color-border-subtle: ${resolveLight('border', 'subtle')};             /* same name → overridden by variables.css */`)
  lines.push(``)

  // Muted
  lines.push(`  /* Muted */`)
  lines.push(`  --color-muted: var(--color-background-muted);`)
  lines.push(`  --color-muted-foreground: var(--color-text-muted);`)
  lines.push(``)

  // Ring
  lines.push(`  /* Ring (focus) */`)
  lines.push(`  --color-ring: var(--color-focus-ring);`)
  lines.push(`  --color-ring-error: var(--color-focus-ring-error);`)
  lines.push(``)

  // Disabled
  lines.push(`  /* Disabled */`)
  lines.push(`  --color-disabled: ${resolveLight('disabled', 'default')};             /* same name → overridden by variables.css */`)
  lines.push(`  --color-disabled-foreground: var(--color-disabled-text);`)
  lines.push(``)

  // Chart
  lines.push(`  /* Chart */`)
  lines.push(`  --color-chart-1: ${resolveLight('chart', '1')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-chart-2: ${resolveLight('chart', '2')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-chart-3: ${resolveLight('chart', '3')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-chart-4: ${resolveLight('chart', '4')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-chart-5: ${resolveLight('chart', '5')};               /* same name → overridden by variables.css */`)
  lines.push(``)

  // Text
  lines.push(`  /* Text */`)
  lines.push(`  --color-text: ${resolveLight('text', 'default')};                   /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-muted: ${resolveLight('text', 'muted')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-subtle: ${resolveLight('text', 'subtle')};              /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-link: ${resolveLight('text', 'link')};                /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-primary: ${resolveLight('text', 'primary')};             /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-info: ${resolveLight('text', 'info')};                /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-success: ${resolveLight('text', 'success')};             /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-error: ${resolveLight('text', 'error')};               /* same name → overridden by variables.css */`)
  lines.push(`  --color-text-warning: ${resolveLight('text', 'warning')};             /* same name → overridden by variables.css */`)
  lines.push(``)

  // --- Primitive Color Palettes ---
  const colorData = p.color as Record<string, unknown>

  lines.push(`  /* =============================================`)
  lines.push(`     Primitive Color Palettes`)
  lines.push(`     Same names as variables.css — overridden at runtime.`)
  lines.push(`     ============================================= */`)
  lines.push(``)

  // white, black
  lines.push(`  --color-white: ${(colorData.white as TokenValue).value};`)
  lines.push(`  --color-black: ${(colorData.black as TokenValue).value};`)
  lines.push(``)

  // Palette colors
  const v4Palettes = ['gray', 'primary', 'secondary', 'blue', 'green', 'yellow', 'red', 'violet', 'rose']
  for (const palName of v4Palettes) {
    const palette = colorData[palName] as Record<string, TokenValue> | undefined
    if (!palette) continue
    lines.push(`  /* ${palName} */`)
    for (const shade of orderedKeys(palette, { type: 'known', order: KNOWN_ORDERS.shadeOrder }, `primitive.color.${palName}`)) {
      const token = palette[shade]
      if (token?.value) {
        lines.push(`  --color-${palName}-${shade}: ${token.value};`)
      }
    }
    lines.push(``)
  }

  // --- Typography ---
  lines.push(`  /* =============================================`)
  lines.push(`     Typography — var() references (different namespace → auto-sync)`)
  lines.push(`     @theme uses --text-*, variables.css uses --font-size-*`)
  lines.push(`     ============================================= */`)

  for (const name of orderedKeys(p.fontSize as Record<string, unknown>, { type: 'known', order: KNOWN_ORDERS.fontSize }, 'primitive.fontSize')) {
    lines.push(`  --text-${name}: var(--font-size-${name});`)
    lines.push(`  --text-${name}--line-height: var(--line-height-${name});`)
  }
  lines.push(``)

  // --- Font Family ---
  const fontFamilyData = p.fontFamily as Record<string, TokenValue> | undefined
  if (fontFamilyData) {
    lines.push(`  /* =============================================`)
    lines.push(`     Font Family — var() references to variables.css`)
    lines.push(`     ============================================= */`)
    for (const name of Object.keys(fontFamilyData).filter(k => !k.startsWith('$'))) {
      lines.push(`  --font-${name}: var(--font-family-${name});`)
    }
    lines.push(``)
  }

  // --- Border Radius ---
  lines.push(`  /* =============================================`)
  lines.push(`     Border Radius`)
  lines.push(`     Same names as variables.css — values here just register utilities.`)
  lines.push(`     Runtime values come from variables.css (unlayered > theme layer).`)
  lines.push(`     ============================================= */`)

  const radiusData = p.borderRadius as Record<string, TokenValue>
  // In v4 @theme, 'base' is replaced by 'DEFAULT' (Tailwind convention)
  for (const name of orderedKeys(radiusData, { type: 'known', order: KNOWN_ORDERS.borderRadius }, 'primitive.borderRadius')) {
    const token = radiusData[name]
    if (!token) continue
    if (name === 'base') {
      // Replace 'base' with 'DEFAULT' for Tailwind v4
      lines.push(`  --radius-DEFAULT: ${radiusData['base'].value}px;`)
    } else {
      lines.push(`  --radius-${name}: ${formatValue(String(token.value), 'borderRadius')};`)
    }
  }
  lines.push(``)

  // --- Shadows ---
  lines.push(`  /* =============================================`)
  lines.push(`     Shadows`)
  lines.push(`     Same names as variables.css — overridden at runtime.`)
  lines.push(`     Dark mode shadows also handled by variables.css .dark block.`)
  lines.push(`     ============================================= */`)

  const shadowData = p.shadow as Record<string, TokenValue>
  for (const name of orderedKeys(shadowData, { type: 'known', order: KNOWN_ORDERS.shadow }, 'primitive.shadow')) {
    const token = shadowData[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    lines.push(`  --shadow-${name}: ${formatShadow(token.value as ShadowLayer | ShadowLayer[], ext)};`)
  }
  lines.push(``)

  // --- Component Sizes (semantic.componentSize) ---
  const v4CompSizeData = (tokens.semantic as Record<string, unknown>)?.componentSize as Record<string, unknown> | undefined
  if (v4CompSizeData) {
    lines.push(`  /* =============================================`)
    lines.push(`     Component Sizes`)
    lines.push(`     Switch, Slider thumb/track dimensions.`)
    lines.push(`     ============================================= */`)
    for (const comp of Object.keys(v4CompSizeData)) {
      const compData = v4CompSizeData[comp] as Record<string, unknown>
      for (const part of Object.keys(compData)) {
        const partData = compData[part] as Record<string, TokenValue>
        for (const size of Object.keys(partData)) {
          const token = partData[size]
          const val = token.value
          if (typeof val === 'object' && val !== null) {
            const obj = val as Record<string, string>
            if (obj.width) lines.push(`  --component-${comp}-${part}-${size}-width: ${obj.width}px;`)
            if (obj.height) lines.push(`  --component-${comp}-${part}-${size}-height: ${obj.height}px;`)
          } else {
            lines.push(`  --component-${comp}-${part}-${size}: ${val}px;`)
          }
        }
      }
    }
    lines.push(``)
  }

  // --- Opacity ---
  const v4OpacityData = p.opacity as Record<string, TokenValue>
  if (v4OpacityData) {
    lines.push(`  /* =============================================`)
    lines.push(`     Opacity`)
    lines.push(`     Same names as variables.css — overridden at runtime.`)
    lines.push(`     ============================================= */`)
    for (const name of orderedKeys(v4OpacityData, { type: 'numeric' }, 'v4.opacity')) {
      const token = v4OpacityData[name]
      if (!token) continue
      // Convert decimal (0.5) → percentage (50%) for Tailwind v4 color-mix() compatibility
      const pct = Math.round(Number(token.value) * 100)
      lines.push(`  --opacity-${name}: ${pct}%;`)
    }
    lines.push(``)
  }

  // --- Easing ---
  const v4EasingData = p.easing as Record<string, TokenValue> | undefined
  if (v4EasingData) {
    lines.push(`  /* =============================================`)
    lines.push(`     Easing — var() references to variables.css`)
    lines.push(`     ============================================= */`)
    for (const name of orderedKeys(v4EasingData, { type: 'known', order: KNOWN_ORDERS.easing }, 'v4.easing')) {
      const token = v4EasingData[name]
      if (!token) continue
      const cssVarSuffix = camelToKebab(name)
      // Map token name to Tailwind v4 --ease-* variable name
      // linear → linear, ease → DEFAULT, easeIn → in, easeOut → out, easeInOut → in-out
      let v4Suffix: string
      if (name === 'ease') {
        v4Suffix = 'DEFAULT'
      } else if (name === 'linear') {
        v4Suffix = 'linear'
      } else {
        v4Suffix = camelToKebab(name.replace(/^ease/, ''))
      }
      lines.push(`  --ease-${v4Suffix}: var(--easing-${cssVarSuffix});`)
    }
    lines.push(``)
  }

  // --- Animation ---
  lines.push(`  /* =============================================`)
  lines.push(`     Animation`)
  lines.push(`     ============================================= */`)
  lines.push(`  --animate-spin: spin 1s linear infinite;`)

  lines.push(`}`)
  lines.push(``)

  // --- NOTE about dark mode ---
  lines.push(`/*`)
  lines.push(` * NOTE: No .dark block needed here.`)
  lines.push(` *`)
  lines.push(` * Dark mode is handled entirely by variables.css .dark { } block.`)
  lines.push(` * - var() referenced variables: source changes in .dark → auto-cascade`)
  lines.push(` * - Same-name variables: variables.css (unlayered) overrides @theme (theme layer)`)
  lines.push(` *`)
  lines.push(` * CSS cascade: unlayered > @layer theme`)
  lines.push(` * So variables.css always wins over @theme for same-name variables.`)
  lines.push(` */`)
  lines.push(``)

  // --- Custom Utilities ---
  lines.push(`/* =============================================`)
  lines.push(`   Custom Utilities`)
  lines.push(`   ============================================= */`)
  lines.push(``)

  // Duration utilities
  lines.push(`/* Transition duration — var() references to variables.css */`)
  for (const name of orderedKeys(p.duration as Record<string, unknown>, { type: 'known', order: KNOWN_ORDERS.duration }, 'primitive.duration')) {
    lines.push(`@utility duration-${name} {`)
    lines.push(`  transition-duration: var(--duration-${name});`)
    lines.push(`}`)
  }
  lines.push(``)

  // Scale utilities (from primitive.scale)
  lines.push(`/* Scale — var() references to variables.css */`)
  const v4ScaleData = p.scale as Record<string, TokenValue>
  for (const [name, token] of Object.entries(v4ScaleData)) {
    if (name.startsWith('$')) continue
    lines.push(`@utility scale-${name} {`)
    lines.push(`  scale: var(--scale-${name});`)
    lines.push(`}`)
  }
  lines.push(``)

  // Icon size utilities
  lines.push(`/* Icon size utilities (5-step system) — var() references */`)
  for (const name of orderedKeys(p.iconSize as Record<string, unknown>, { type: 'known', order: KNOWN_ORDERS.iconSize }, 'primitive.iconSize')) {
    lines.push(`@utility icon-${name} {`)
    lines.push(`  width: var(--icon-size-${name});`)
    lines.push(`  height: var(--icon-size-${name});`)
    lines.push(`}`)
  }
  lines.push(``)

  // Focus ring
  lines.push(`/* Focus ring utility (v3/v4 compatible) */`)
  lines.push(`@utility focus-ring {`)
  lines.push(`  outline: 2px solid transparent;`)
  lines.push(`  outline-offset: 2px;`)
  lines.push(`  box-shadow: 0 0 0 2px var(--color-focus-ring);`)
  lines.push(`}`)
  lines.push(``)

  // Z-index utilities (named semantic values only, not numeric)
  lines.push(`/* Z-index utilities (named semantic values) — var() references */`)
  const zNamedOnly = ['sticky', 'dropdown', 'overlay', 'modal', 'popover', 'tooltip', 'toast']
  const zUtilities = orderedKeys(p.zIndex as Record<string, unknown>, { type: 'known', order: KNOWN_ORDERS.zIndex })
    .filter(k => zNamedOnly.includes(k) || isNaN(Number(k)))
  for (const name of zUtilities) {
    lines.push(`@utility z-${name} {`)
    lines.push(`  z-index: var(--z-index-${name});`)
    lines.push(`}`)
  }
  lines.push(``)

  // Scale none
  lines.push(`/* Scale reset for grouped buttons (override active:scale-pressed) */`)
  lines.push(`@utility scale-none {`)
  lines.push(`  scale: 1 !important;`)
  lines.push(`  transform: none !important;`)
  lines.push(`}`)
  lines.push(``)

  // Animations (from semantic.animation, 1:1 named)
  const v4Anim = readAnimationTokens(tokens)
  if (v4Anim) {
    lines.push(`/* =============================================`)
    lines.push(`   Animations`)
    lines.push(`   Generated from semantic.animation in figma-tokens.json`)
    lines.push(`   Token name = keyframe name = class name (1:1)`)
    lines.push(`   ============================================= */`)
    lines.push(``)
    for (const a of v4Anim) {
      lines.push(generateAnimationCss(a, 'v4'))
      lines.push(``)
    }
  }

  return lines.join('\n')
}

// ============================================================
// CSS Bundle Files (@import wrappers)
// ============================================================

function generateCssBundle(): string {
  const lines: string[] = []
  lines.push(`/* Auto-generated by sync-tokens — DO NOT EDIT */`)
  lines.push(`/* All-in-one CSS bundle: variables + light/dark themes */`)
  lines.push(``)
  lines.push(`@import './variables.css';`)
  lines.push(`@import './themes/light.css';`)
  lines.push(`@import './themes/dark.css';`)
  lines.push(``)
  return lines.join('\n')
}

function generateV4Bundle(): string {
  const lines: string[] = []
  lines.push(`/* Auto-generated by sync-tokens — DO NOT EDIT */`)
  lines.push(`/* All-in-one Tailwind v4 bundle: variables + themes + v4 mapping */`)
  lines.push(``)
  lines.push(`@import '../css/variables.css';`)
  lines.push(`@import '../css/themes/light.css';`)
  lines.push(`@import '../css/themes/dark.css';`)
  lines.push(`@import './v4-theme.css';`)
  lines.push(``)
  return lines.join('\n')
}

// ============================================================
// Phase 3: globals.css marker injection
// ============================================================

function generateSemanticLightBlock(tokens: FigmaTokens): string {
  const lines: string[] = []
  const lightColor = tokens.light.color

  lines.push(``)
  lines.push(`    /* ========================================`)
  lines.push(`       Light Theme Colors`)
  lines.push(`       synced with figma-tokens.json light`)
  lines.push(`       ======================================== */`)
  lines.push(``)

  for (const category of orderedKeys(lightColor, { type: 'known', order: KNOWN_ORDERS.semanticColorCategories }, 'light.color')) {
    const catData = lightColor[category]
    if (!catData) continue

    const catLabel = category.charAt(0).toUpperCase() + category.slice(1)
    lines.push(`    /* ${catLabel} */`)

    const entries = Object.entries(catData).filter(([k]) => !k.startsWith('$'))
    const sorted = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants) as [string, TokenValue][]

    for (const [variant, token] of sorted) {
      const tv = token as TokenValue
      if (tv.type === 'composition' && typeof tv.value === 'object' && tv.value !== null) {
        const comp = tv.value as { color: string; opacity: string }
        lines.push(`    ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`)
      } else {
        const resolved = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveToVar(tv.value, tokens) : String(tv.value)
        lines.push(`    ${semanticColorVar(category, variant)}: ${resolved};`)
        // Add RGB channel variable for opacity modifier support
        const resolvedHex = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveReference(tv.value, tokens) : String(tv.value)
        const rgb = hexToRgb(resolvedHex)
        if (rgb) lines.push(`    ${semanticColorVar(category, variant)}-rgb: ${rgb};`)
      }
    }
    lines.push(``)
  }

  return lines.join('\n')
}

function generateSemanticDarkBlock(tokens: FigmaTokens): string {
  const lines: string[] = []
  const darkColor = tokens.dark.color

  lines.push(``)
  lines.push(`    /* ========================================`)
  lines.push(`       Dark Theme Colors`)
  lines.push(`       synced with figma-tokens.json dark`)
  lines.push(`       ======================================== */`)
  lines.push(``)

  for (const category of orderedKeys(darkColor, { type: 'known', order: KNOWN_ORDERS.semanticColorCategories }, 'dark.color')) {
    const catData = darkColor[category]
    if (!catData) continue

    const catLabel = category.charAt(0).toUpperCase() + category.slice(1)
    lines.push(`    /* ${catLabel} */`)

    const entries = Object.entries(catData).filter(([k]) => !k.startsWith('$'))
    const sorted = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants) as [string, TokenValue][]

    for (const [variant, token] of sorted) {
      const tv = token as TokenValue
      if (tv.type === 'composition' && typeof tv.value === 'object' && tv.value !== null) {
        const comp = tv.value as { color: string; opacity: string }
        lines.push(`    ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`)
      } else {
        const resolved = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveToVar(tv.value, tokens) : String(tv.value)
        lines.push(`    ${semanticColorVar(category, variant)}: ${resolved};`)
        // Add RGB channel variable for opacity modifier support
        const resolvedHex = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveReference(tv.value, tokens) : String(tv.value)
        const rgb = hexToRgb(resolvedHex)
        if (rgb) lines.push(`    ${semanticColorVar(category, variant)}-rgb: ${rgb};`)
      }
    }
    lines.push(``)
  }

  // Dark Mode Shadows
  lines.push(`    /* ----------------------------------------`)
  lines.push(`       Dark Mode Shadows - increased opacity for visibility`)
  lines.push(`       ---------------------------------------- */`)
  const darkShadowPrimitive = tokens.primitive as Record<string, unknown>
  const darkShadowTokens = darkShadowPrimitive.shadow as Record<string, TokenValue>
  for (const name of orderedKeys(darkShadowTokens, { type: 'known', order: KNOWN_ORDERS.shadow }, 'globals.dark.shadow')) {
    const token = darkShadowTokens[name]
    if (!token) continue
    const ext = token.$extensions as ShadowExtensions | undefined
    lines.push(`    --shadow-${name}: ${formatShadowDark(token.value as ShadowLayer | ShadowLayer[], ext)};`)
  }
  lines.push(``)

  return lines.join('\n')
}

function injectIntoGlobals(tokens: FigmaTokens): string {
  let content = readTextFile(GLOBALS_CSS_PATH)
  if (!content) {
    throw new Error(`globals.css not found at ${GLOBALS_CSS_PATH}`)
  }

  const semanticLightContent = generateSemanticLightBlock(tokens)
  const semanticDarkContent = generateSemanticDarkBlock(tokens)

  // Check if semantic markers already exist
  const hasMarkers = content.includes(SEMANTIC_LIGHT_START)

  if (hasMarkers) {
    // Replace between markers (semantic light/dark only — primitives come from variables.css import)
    content = replaceMarkerBlock(content, SEMANTIC_LIGHT_START, SEMANTIC_LIGHT_END, semanticLightContent)
    content = replaceMarkerBlock(content, SEMANTIC_DARK_START, SEMANTIC_DARK_END, semanticDarkContent)
  } else {
    throw new Error('Semantic markers not found in globals.css. Ensure SEMANTIC-LIGHT and SEMANTIC-DARK markers exist.')
  }

  return content
}

function replaceMarkerBlock(content: string, startMarker: string, endMarker: string, newContent: string): string {
  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers not found: ${startMarker}`)
  }
  return content.slice(0, startIdx + startMarker.length) + newContent + '    ' + content.slice(endIdx)
}

/**
 * Generate .light {} block for docs-site.css.
 * Uses the same semantic light mappings as globals.css, wrapped in .light selector.
 */
function generateForceLightBlock(tokens: FigmaTokens): string {
  const lines: string[] = []
  const lightColor = tokens.light.color

  lines.push(``)
  lines.push(`/* Force light mode — ダークモード内でライトモードプレビュー用 */`)
  lines.push(`.light {`)

  for (const category of orderedKeys(lightColor, { type: 'known', order: KNOWN_ORDERS.semanticColorCategories }, 'light.color')) {
    const catData = lightColor[category]
    if (!catData) continue

    const catLabel = category.charAt(0).toUpperCase() + category.slice(1)
    lines.push(`  /* ${catLabel} */`)

    const entries = Object.entries(catData).filter(([k]) => !k.startsWith('$'))
    const sorted = sortByKnownOrder(entries, KNOWN_ORDERS.semanticColorVariants) as [string, TokenValue][]

    for (const [variant, token] of sorted) {
      const tv = token as TokenValue
      if (tv.type === 'composition' && typeof tv.value === 'object' && tv.value !== null) {
        const comp = tv.value as { color: string; opacity: string }
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolveCompositionToColorMix(comp)};`)
      } else {
        const resolved = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveToVar(tv.value, tokens) : String(tv.value)
        lines.push(`  ${semanticColorVar(category, variant)}: ${resolved};`)
        // Add RGB channel variable for opacity modifier support
        const resolvedHex = typeof tv.value === 'string' && tv.value.startsWith('{')
          ? resolveReference(tv.value, tokens) : String(tv.value)
        const rgb = hexToRgb(resolvedHex)
        if (rgb) lines.push(`  ${semanticColorVar(category, variant)}-rgb: ${rgb};`)
      }
    }
  }

  lines.push(`}`)
  lines.push(``)

  return lines.join('\n')
}

function injectIntoDocsSiteCss(tokens: FigmaTokens): string {
  let content = readTextFile(DOCS_SITE_CSS_PATH)
  if (!content) {
    throw new Error(`docs-site.css not found at ${DOCS_SITE_CSS_PATH}`)
  }

  const forceLightContent = generateForceLightBlock(tokens)

  const hasMarkers = content.includes(FORCE_LIGHT_START)

  if (hasMarkers) {
    content = replaceMarkerBlock(content, FORCE_LIGHT_START, FORCE_LIGHT_END, forceLightContent)
  } else {
    throw new Error('FORCE-LIGHT markers not found in docs-site.css.')
  }

  return content
}

// ============================================================
// Phase 4: Breaking Change Detection
// ============================================================

function parseExistingVars(cssContent: string): Map<string, string> {
  const vars = new Map<string, string>()
  // Only parse :root block (not .dark) for breaking change detection
  const rootMatch = cssContent.match(/:root\s*\{([\s\S]*?)\n\}/)
  if (!rootMatch) return vars

  const rootBlock = rootMatch[1]
  const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g
  let match: RegExpExecArray | null
  while ((match = varRegex.exec(rootBlock)) !== null) {
    vars.set(`--${match[1]}`, match[2].trim())
  }
  return vars
}

interface ValueChange {
  name: string
  oldValue: string
  newValue: string
}

interface BreakingChanges {
  removed: Map<string, string>
  added: Map<string, string>
  renamed: Array<{ oldName: string; newName: string; value: string }>
  changed: ValueChange[]
}

function detectBreakingChanges(oldVars: Map<string, string>, newVars: Map<string, string>): BreakingChanges {
  const removed = new Map<string, string>()
  const added = new Map<string, string>()
  const renamed: Array<{ oldName: string; newName: string; value: string }> = []
  const changed: ValueChange[] = []

  for (const [name, value] of oldVars) {
    if (!newVars.has(name)) {
      removed.set(name, value)
    } else if (newVars.get(name) !== value) {
      changed.push({ name, oldValue: value, newValue: newVars.get(name)! })
    }
  }

  for (const [name, value] of newVars) {
    if (!oldVars.has(name)) {
      added.set(name, value)
    }
  }

  // Detect possible renames (removed + added with same value)
  for (const [oldName, oldValue] of removed) {
    for (const [newName, newValue] of added) {
      if (oldValue === newValue) {
        renamed.push({ oldName, newName, value: oldValue })
      }
    }
  }

  return { removed, added, renamed, changed }
}

function formatBreakingChanges(changes: BreakingChanges): string {
  const lines: string[] = []
  lines.push(`\n⚠️  Breaking Changes Detected:\n`)

  if (changes.removed.size > 0) {
    lines.push(`  REMOVED (${changes.removed.size}):`)
    for (const [name, value] of changes.removed) {
      lines.push(`    - ${name}: ${value}`)
    }
    lines.push(``)
  }

  if (changes.renamed.length > 0) {
    lines.push(`  POSSIBLE RENAME (${changes.renamed.length}):`)
    for (const r of changes.renamed) {
      lines.push(`    ${r.oldName} → ${r.newName} (same value: ${r.value})`)
    }
    lines.push(``)
  }

  if (changes.added.size > 0) {
    lines.push(`  ADDED (${changes.added.size}):`)
    for (const [name, value] of changes.added) {
      lines.push(`    + ${name}: ${value}`)
    }
    lines.push(``)
  }

  lines.push(`  Affected files: variables.css, v3-preset.js, v4-theme.css, globals.css\n`)
  return lines.join('\n')
}

/**
 * Format a human-readable diff summary of all token changes.
 * Shows added, removed, renamed, and value-changed variables.
 */
function formatDiff(changes: BreakingChanges): string {
  const total = changes.removed.size + changes.added.size + changes.renamed.length + changes.changed.length
  if (total === 0) return ''

  const lines: string[] = []
  lines.push(`\n📊 Token Diff Summary (${total} changes):\n`)

  if (changes.renamed.length > 0) {
    lines.push(`  RENAMED (${changes.renamed.length}):`)
    for (const r of changes.renamed) {
      lines.push(`    ~ ${r.oldName} → ${r.newName}`)
    }
    lines.push(``)
  }

  if (changes.changed.length > 0) {
    lines.push(`  VALUE CHANGED (${changes.changed.length}):`)
    for (const c of changes.changed) {
      lines.push(`    ~ ${c.name}: ${c.oldValue} → ${c.newValue}`)
    }
    lines.push(``)
  }

  if (changes.added.size > 0) {
    lines.push(`  ADDED (${changes.added.size}):`)
    for (const [name, value] of changes.added) {
      lines.push(`    + ${name}: ${value}`)
    }
    lines.push(``)
  }

  if (changes.removed.size > 0) {
    lines.push(`  REMOVED (${changes.removed.size}):`)
    for (const [name, value] of changes.removed) {
      lines.push(`    - ${name}: ${value}`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

/**
 * Generate deprecated CSS variable aliases for renamed tokens.
 * Each alias maps old-name → new-name with a deprecation comment.
 *
 * Returns empty string if no renames detected.
 */
function generateDeprecatedAliases(changes: BreakingChanges): string {
  if (changes.renamed.length === 0) return ''

  const lines: string[] = []
  lines.push(`/**`)
  lines.push(` * Deprecated CSS variable aliases`)
  lines.push(` * Auto-generated by sync-tokens — do not edit manually`)
  lines.push(` *`)
  lines.push(` * These aliases provide backwards compatibility for renamed tokens.`)
  lines.push(` * They will be removed in a future major version.`)
  lines.push(` */`)
  lines.push(`:root {`)

  for (const r of changes.renamed) {
    lines.push(`  /* @deprecated — use ${r.newName} instead */`)
    lines.push(`  ${r.oldName}: var(${r.newName});`)
  }

  lines.push(`}`)
  lines.push(``)

  return lines.join('\n')
}

async function promptUser(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(`${message} Continue? (y/n) `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

// ============================================================
// Phase 5: Main Orchestrator
// ============================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const dryRun = args.includes('--dry-run')

  // Parse --brand argument (supports --brand acme or --brand=acme)
  const brandArgIdx = args.findIndex(a => a === '--brand' || a.startsWith('--brand='))
  let brand = '7onic' // default
  if (brandArgIdx !== -1) {
    const arg = args[brandArgIdx]
    if (arg.startsWith('--brand=')) {
      const val = arg.split('=')[1]
      if (val) brand = val
    } else if (brandArgIdx + 1 < args.length && !args[brandArgIdx + 1].startsWith('--')) {
      brand = args[brandArgIdx + 1]
    }
  }

  console.log('🔄 sync-tokens: Reading figma-tokens.json...')

  const tokens = readJsonFile<FigmaTokens>(TOKENS_PATH)

  // Brand color overlay
  const brandPath = path.join(BRANDS_DIR, `${brand}.json`)
  if (fs.existsSync(brandPath)) {
    const brandColors = readJsonFile<{ color: Record<string, unknown> }>(brandPath)
    ;(tokens.primitive as Record<string, unknown>).color = brandColors.color
    console.log(`🎨 Brand: ${brand} (${brandPath})`)
  } else {
    console.log(`⚠️  Brand file not found: ${brandPath}, using figma-tokens.json colors`)
  }

  // Token Validation
  console.log('🔍 Validating tokens...')
  const tokenWarnings = validateTokens(tokens)

  // Unknown section detection
  warnUnknownPrimitiveSections(tokens.primitive as Record<string, unknown>)
  warnUnknownSemanticSections(tokens.semantic as Record<string, unknown>)
  warnUnknownThemeCategories(tokens.light.color, 'light')
  warnUnknownThemeCategories(tokens.dark.color, 'dark')

  // Breaking Change & Diff Detection
  let deprecatedCss = ''
  const existingVariablesCss = readTextFile(VARIABLES_CSS_PATH)
  if (existingVariablesCss) {
    const oldVars = parseExistingVars(existingVariablesCss)
    const newCss = generateVariablesCss(tokens)
    const newVars = parseExistingVars(newCss)

    const changes = detectBreakingChanges(oldVars, newVars)
    const hasBreaking = changes.removed.size > 0 || changes.renamed.length > 0
    const hasAnyChange = hasBreaking || changes.added.size > 0 || changes.changed.length > 0

    // Show diff summary
    if (hasAnyChange) {
      console.log(formatDiff(changes))
    }

    // Breaking change prompt
    if (hasBreaking) {
      console.log(formatBreakingChanges(changes))
      if (!force) {
        const proceed = await promptUser('')
        if (!proceed) {
          console.log('❌ Aborted.')
          process.exit(1)
        }
      }
    }

    // Generate deprecated aliases for renames
    deprecatedCss = generateDeprecatedAliases(changes)
    if (deprecatedCss) {
      console.log(`📝 Generating deprecated aliases (${changes.renamed.length} renames)...`)
    }
  }

  // Generate all files
  console.log('📝 Generating tokens/css/variables.css...')
  const variablesCss = generateVariablesCss(tokens)

  console.log('📝 Generating tokens/css/themes/light.css...')
  const themeLight = generateThemeLight(tokens)

  console.log('📝 Generating tokens/css/themes/dark.css...')
  const themeDark = generateThemeDark(tokens)

  console.log('📝 Generating tokens/tailwind/v3-preset.js...')
  const v3Preset = generateV3Preset(tokens)

  console.log('📝 Generating tokens/tailwind/v4-theme.css...')
  const v4Theme = generateV4Theme(tokens)

  console.log('📝 Generating tokens/js/index.js + index.mjs...')
  const jsTokens = generateJsTokens(tokens)

  console.log('📝 Generating tokens/types/index.d.ts...')
  const typeDefs = generateTypeDefinitions(tokens)

  console.log('📝 Generating tokens/json/tokens.json...')
  const normalizedJson = generateNormalizedJson(tokens)

  console.log('📝 Generating tokens/css/all.css...')
  const cssBundle = generateCssBundle()

  console.log('📝 Generating tokens/tailwind/v4.css...')
  const v4Bundle = generateV4Bundle()

  console.log('📝 Injecting into src/styles/globals.css...')
  const globalsCss = injectIntoGlobals(tokens)

  console.log('📝 Injecting into src/styles/docs-site.css...')
  const docsSiteCss = injectIntoDocsSiteCss(tokens)

  if (dryRun) {
    console.log('\n--- DRY RUN: No files written ---')
    printTokenWarnings(tokenWarnings)
    console.log('\n✅ Dry run complete.')
    return
  }

  // Write files
  writeTextFile(VARIABLES_CSS_PATH, variablesCss)
  writeTextFile(THEME_LIGHT_PATH, themeLight)
  writeTextFile(THEME_DARK_PATH, themeDark)
  writeTextFile(V3_PRESET_PATH, v3Preset)
  writeTextFile(V4_THEME_PATH, v4Theme)
  writeTextFile(JS_CJS_PATH, jsTokens.cjs)
  writeTextFile(JS_ESM_PATH, jsTokens.esm)
  writeTextFile(TYPES_PATH, typeDefs)
  writeTextFile(JSON_PATH, normalizedJson)
  writeTextFile(CSS_ALL_PATH, cssBundle)
  writeTextFile(V4_ALL_PATH, v4Bundle)
  writeTextFile(GLOBALS_CSS_PATH, globalsCss)
  writeTextFile(DOCS_SITE_CSS_PATH, docsSiteCss)

  // Write deprecated aliases if any renames detected
  const DEPRECATED_CSS_PATH = path.join(ROOT, 'tokens/css/deprecated.css')
  if (deprecatedCss) {
    writeTextFile(DEPRECATED_CSS_PATH, deprecatedCss)
  }

  printTokenWarnings(tokenWarnings)

  console.log('')
  console.log('✅ sync-tokens complete:')
  console.log('   📄 tokens/css/variables.css')
  console.log('   📄 tokens/css/themes/light.css')
  console.log('   📄 tokens/css/themes/dark.css')
  console.log('   📄 tokens/tailwind/v3-preset.js')
  console.log('   📄 tokens/tailwind/v4-theme.css')
  console.log('   📄 tokens/js/index.js')
  console.log('   📄 tokens/js/index.mjs')
  console.log('   📄 tokens/types/index.d.ts')
  console.log('   📄 tokens/json/tokens.json')
  console.log('   📄 tokens/css/all.css (bundle)')
  console.log('   📄 tokens/tailwind/v4.css (bundle)')
  console.log('   📄 src/styles/globals.css')
  console.log('   📄 src/styles/docs-site.css')
  if (deprecatedCss) {
    console.log('   📄 tokens/css/deprecated.css (backwards compat)')
  }
}

// Export generators & utilities for CLI reuse (esbuild bundles these)
export {
  main,
  validateTokens,
  printTokenWarnings,
  generateVariablesCss,
  generateThemeLight,
  generateThemeDark,
  generateV3Preset,
  generateV4Theme,
  generateJsTokens,
  generateTypeDefinitions,
  generateNormalizedJson,
  generateCssBundle,
  generateV4Bundle,
  generateForceLightBlock,
  injectIntoDocsSiteCss,
  parseExistingVars,
  detectBreakingChanges,
  formatBreakingChanges,
  formatDiff,
  generateDeprecatedAliases,
  promptUser,
  readJsonFile,
  readTextFile,
  writeTextFile,
}
export type { FigmaTokens, TokenWarning, BreakingChanges }
