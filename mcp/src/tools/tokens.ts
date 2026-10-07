// Token tools (Phase 3): search_tokens / get_token / suggest_tokens.
// Handlers are pure functions returning JSON-serializable objects; the MCP
// wrapping stays in server.ts. The custom-value confirmation prompt is
// locale-aware (en/ja/ko — Phase 0 decision #2, trilingual project).
import { z } from 'zod'
import { differenceEuclidean, parse } from 'culori'
import { loadDesignData } from '../data/loader.js'
import { tokenIndex, searchWords, normalizeQuery, type TokenEntry } from '../search/fuzzy.js'

export const TOKEN_CATEGORIES = [
  'colors', 'typography', 'spacing', 'shadows', 'opacity', 'radius',
  'border-width', 'icon-sizes', 'breakpoints', 'z-index', 'duration',
  'easing', 'scale', 'animation',
] as const

export const LOCALES = ['en', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

const CUSTOM_VALUE_PROMPT: Record<Locale, string> = {
  en: 'This value is NOT in the token system. Ask the user: "This is outside the design tokens. Apply the custom value bypassing tokens, or use a close token ({suggestions})?" Never bypass tokens on your own.',
  ja: 'この値はトークンに存在しません。ユーザーに確認してください:「この値はデザイントークン外です。トークンを迂回してカスタム値を適用しますか? それとも近いトークン({suggestions})を使いますか?」AI自身の判断でトークン外の値を使わないこと。',
  ko: '이 값은 토큰 시스템에 없습니다. 유저에게 확인하세요: "이 값은 디자인 토큰 밖입니다. 토큰을 우회해 커스텀 값을 적용할까요, 아니면 가까운 토큰({suggestions})을 쓸까요?" AI 임의로 토큰을 우회하지 마세요.',
}

function publicEntry(e: TokenEntry) {
  const { keywords: _k, ...rest } = e
  return rest
}

// --- search_tokens -----------------------------------------------------------

export const searchTokensSchema = {
  query: z.string().describe('Search text (English/Japanese/Korean): token name, class, or purpose e.g. "main text color", "余白", "그림자"'),
  category: z.enum(TOKEN_CATEGORIES).optional().describe('Limit to one token category'),
}

export function searchTokens(args: { query: string; category?: string }) {
  const data = loadDesignData()
  const { fuse } = tokenIndex(data)
  const results = searchWords(fuse, args.query, 30)
    .filter((e) => !args.category || e.category === args.category)
    .slice(0, 10)
  return {
    query: args.query,
    count: results.length,
    results: results.map(publicEntry),
    hint:
      results.length === 0
        ? 'No match. Try broader terms (color/spacing/typography) or pass a category.'
        : 'Use the listed classes as-is. Token values are user-configurable — the NAMES are the API; never hardcode values.',
  }
}

// --- get_token ---------------------------------------------------------------

export const getTokenSchema = {
  name: z.string().describe('Token name, CSS variable, or utility class (e.g. "primary", "--color-text", "text-sm")'),
}

export function getToken(args: { name: string }) {
  const data = loadDesignData()
  const { entries, fuse } = tokenIndex(data)
  const q = args.name.trim().replace(/^--/, '').toLowerCase()
  const matches = entries.filter(
    (e) =>
      e.name.toLowerCase() === q ||
      e.cssVar.replace(/^--/, '').toLowerCase() === q ||
      e.classes.some((c) => c.toLowerCase() === q),
  )
  if (matches.length === 0) {
    const near = searchWords(fuse, args.name, 3).map((e) => e.name)
    return { found: false, name: args.name, didYouMean: near }
  }
  return {
    found: true,
    matches: matches.map(publicEntry),
    note: 'Semantic color tokens switch light/dark automatically via CSS variables — never use the dark: prefix. Typography tokens pair font-size with line-height — never override with leading-*.',
  }
}

// --- suggest_tokens ----------------------------------------------------------

export const suggestTokensSchema = {
  value: z.string().describe('A raw value the code wants to use: "#FF5733", "rgb(...)", "13px", "0.5rem", "250ms", "0.8"'),
  property: z.string().optional().describe('CSS property context (e.g. "font-size", "padding", "border-radius", "z-index") to narrow the category'),
  locale: z.enum(LOCALES).optional().describe('Language for the user-facing confirmation prompt (default: en)'),
}

const PROPERTY_CATEGORIES: Array<[RegExp, string[]]> = [
  [/font|text/i, ['typography']],
  [/padding|margin|gap|inset|space/i, ['spacing']],
  [/radius|corner/i, ['radius']],
  [/icon/i, ['icon-sizes']],
  [/width|height|size/i, ['spacing', 'icon-sizes']],
  [/z-?index|layer/i, ['z-index']],
  [/shadow|elevation/i, ['shadows']],
  [/duration|transition|animation/i, ['duration']],
  [/opacity|alpha/i, ['opacity']],
  [/border/i, ['border-width', 'radius']],
]

function entryPx(e: TokenEntry): number | null {
  const m = e.value.match(/^([\d.]+)(rem|px|ms)/)
  if (!m) return null
  const n = parseFloat(m[1])
  return m[2] === 'rem' ? n * 16 : n
}

export function suggestTokens(args: { value: string; property?: string; locale?: Locale }) {
  const data = loadDesignData()
  const { entries } = tokenIndex(data)
  const value = args.value.trim()
  const locale: Locale = args.locale ?? 'en'
  const prompt = (names: string) =>
    CUSTOM_VALUE_PROMPT[locale].replace('{suggestions}', names)

  // Color input?
  const looksColor = /^#|^rgb|^hsl|^oklch|^hwb/i.test(value)
  const parsed = looksColor ? parse(value) : undefined
  if (parsed) {
    const delta = differenceEuclidean('oklab')
    const ranked = entries
      .filter((e) => e.category === 'colors')
      .map((e) => {
        const c = parse(e.value)
        return c ? { entry: e, delta: delta(parsed, c) } : null
      })
      .filter((x): x is { entry: TokenEntry; delta: number } => x !== null)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 3)
    const exact = ranked.length > 0 && ranked[0].delta < 0.01
    const names = ranked.map((r) => r.entry.name).join(', ')
    return {
      input: value,
      interpreted: 'color',
      exact,
      matches: ranked.map((r) => ({ ...publicEntry(r.entry), deltaEOK: Number(r.delta.toFixed(4)) })),
      guidance: exact
        ? `Exact token match — use ${ranked[0].entry.classes[0] ?? ranked[0].entry.name} instead of the raw value.`
        : 'This exact color is NOT in the token system. Do not apply it on your own — confirm with the user first.',
      ...(exact ? {} : { userPrompt: prompt(names) }),
    }
  }

  // Dimension / duration / unitless.
  const dim = value.match(/^(-?[\d.]+)(px|rem|ms|s)?$/)
  if (!dim) {
    return {
      input: value,
      interpreted: 'unknown',
      guidance: 'Pass a color (#hex/rgb/hsl), a dimension (px/rem), a duration (ms), or a unitless 0–1 opacity.',
    }
  }
  const n = parseFloat(dim[1])
  const unit = dim[2] ?? ''
  let categories: string[]
  let target: number
  if (unit === 'ms' || unit === 's') {
    categories = ['duration']
    target = unit === 's' ? n * 1000 : n
  } else if (unit === '') {
    categories = n <= 1 ? ['opacity', 'scale'] : ['z-index', 'opacity']
    target = n
  } else {
    target = unit === 'rem' ? n * 16 : n
    categories = ['typography', 'spacing', 'radius', 'icon-sizes', 'border-width']
  }
  if (args.property) {
    const hinted = PROPERTY_CATEGORIES.find(([re]) => re.test(args.property as string))
    if (hinted) categories = hinted[1]
  }

  const ranked = entries
    .filter((e) => categories.includes(e.category) && e.classes.length > 0)
    .map((e) => {
      const raw = parseFloat(e.value)
      const px = unit === '' ? (Number.isNaN(raw) ? null : raw) : entryPx(e)
      return px === null ? null : { entry: e, diff: Math.abs(px - target) }
    })
    .filter((x): x is { entry: TokenEntry; diff: number } => x !== null)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 3)

  const exact = ranked.length > 0 && ranked[0].diff === 0
  const names = ranked.map((r) => r.entry.classes[0] ?? r.entry.name).join(', ')
  return {
    input: value,
    interpreted: unit === 'ms' || unit === 's' ? 'duration' : unit === '' ? 'number' : 'dimension',
    exact,
    matches: ranked.map((r) => ({ ...publicEntry(r.entry), difference: r.diff })),
    guidance: exact
      ? `Exact token match — use ${ranked[0].entry.classes[0] ?? ranked[0].entry.name} instead of the arbitrary value.`
      : 'No exact token. Arbitrary values are forbidden except layout h-[]/w-[] — confirm with the user before bypassing tokens.',
    ...(exact ? {} : { userPrompt: prompt(names) }),
  }
}
