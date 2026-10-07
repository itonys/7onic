// Search layer (Phase 3): token entries + fuse.js indexes + multilingual
// query aliases. Indexes cache per source-object identity — loader/artifacts
// return the SAME object until a file changes, so WeakMap auto-invalidates.
// LESSON #1 (plan): fuse REQUIRES includeScore:true or merged ranking
// silently degrades to insertion order.
import Fuse from 'fuse.js'
import type { DesignData } from '../data/loader.js'
import type { ComponentRecord } from '../data/artifacts.js'

// ---------------------------------------------------------------------------
// Token entries
// ---------------------------------------------------------------------------

export interface TokenEntry {
  /** Token name within its category (e.g. "primary", "4", "sm"). */
  name: string
  /** Doc-site category id (colors, typography, spacing, ...). */
  category: string
  cssVar: string
  /** Display value; semantic colors carry the light-theme value. */
  value: string
  /** Dark-theme value when it differs (semantic colors). */
  valueDark?: string
  /** Whitelist classes applying this token (representative, capped). */
  classes: string[]
  keywords: string[]
  /** True for theme-switching semantic colors (themes/*.css backed). */
  semantic?: boolean
}

const REM_PX = 16

function withPx(value: string): string {
  const m = value.match(/^([\d.]+)rem$/)
  return m ? `${value} (${parseFloat(m[1]) * REM_PX}px)` : value
}

function inWhitelist(candidates: string[], whitelist: Set<string>, cap = 6): string[] {
  return candidates.filter((c) => whitelist.has(c)).slice(0, cap)
}

const ANIMATION_PARAM = /-(duration|easing|opacity|scale|translateX|translateY|heightVar)$/

export function buildTokenEntries(data: DesignData): TokenEntry[] {
  const wl = new Set(data.whitelist.classes)
  const entries: TokenEntry[] = []
  const { tokens, themes, colorScale } = data

  // Colors: preset scale names (primitives = hex, semantics = var refs).
  for (const [name, raw] of Object.entries(colorScale)) {
    const varMatch = raw.match(/var\(--color-([\w-]+)-rgb\)/)
    const semanticKey = varMatch ? `color-${varMatch[1]}` : null
    const light = semanticKey ? themes.light[semanticKey]?.resolved ?? raw : raw
    const dark = semanticKey ? themes.dark[semanticKey]?.resolved : undefined
    entries.push({
      name,
      category: 'colors',
      cssVar: semanticKey ? `--${semanticKey}` : `--color-${name}`,
      value: light,
      ...(semanticKey ? { semantic: true } : {}),
      ...(dark && dark !== light ? { valueDark: dark } : {}),
      classes: inWhitelist(
        ['bg', 'text', 'border', 'ring', 'divide', 'fill'].map((u) => `${u}-${name}`),
        wl,
      ),
      keywords: ['color', ...name.split('-')],
    })
  }

  // Typography (fontSize carries its paired line-height — token-first rule
  // #9: leading-* overrides are forbidden, so no standalone leading entries).
  for (const [name, value] of Object.entries(tokens.fontSize ?? {})) {
    const lineHeight = tokens.lineHeight?.[name]
    entries.push({
      name,
      category: 'typography',
      cssVar: `--font-size-${name}`,
      value: `${withPx(value)}${lineHeight ? ` / line-height ${withPx(lineHeight)} (paired — never override with leading-*)` : ''}`,
      classes: inWhitelist([`text-${name}`], wl),
      keywords: ['font', 'size', 'text', 'typography'],
    })
  }
  for (const [name, value] of Object.entries(tokens.fontWeight ?? {})) {
    entries.push({
      name, category: 'typography', cssVar: `--font-weight-${name}`, value,
      classes: inWhitelist([`font-${name}`], wl),
      keywords: ['font', 'weight', 'bold', 'typography'],
    })
  }
  for (const [name, value] of Object.entries(tokens.fontFamily ?? {})) {
    entries.push({
      name, category: 'typography', cssVar: `--font-family-${name}`, value,
      classes: inWhitelist([`font-${name}`], wl),
      keywords: ['font', 'family', 'typeface', 'typography'],
    })
  }

  // Simple scales: [category, tokens key, cssVar prefix, classes, keywords].
  const simple: Array<[string, string, string, (k: string) => string[], string[]]> = [
    ['spacing', 'spacing', '--spacing-', (k) => [`p-${k}`, `m-${k}`, `gap-${k}`, `px-${k}`, `py-${k}`], ['spacing', 'padding', 'margin', 'gap', 'space']],
    ['radius', 'borderRadius', '--radius-', (k) => (k === 'base' ? ['rounded'] : [`rounded-${k}`]), ['radius', 'rounded', 'corner']],
    ['shadows', 'shadow', '--shadow-', (k) => [`shadow-${k}`], ['shadow', 'elevation', 'depth']],
    ['icon-sizes', 'iconSize', '--icon-size-', (k) => [`icon-${k}`], ['icon', 'size']],
    ['z-index', 'zIndex', '--z-index-', (k) => [`z-${k}`], ['z-index', 'layer', 'stacking']],
    ['duration', 'duration', '--duration-', (k) => [`duration-${k}`], ['duration', 'transition', 'speed', 'motion']],
    ['opacity', 'opacity', '--opacity-', (k) => [`opacity-${k}`], ['opacity', 'transparency', 'alpha']],
    ['border-width', 'borderWidth', '--border-width-', (k) => (k === '1' ? ['border'] : [`border-${k}`]), ['border', 'width', 'stroke']],
    ['scale', 'scale', '--scale-', (k) => [`scale-${k}`], ['scale', 'transform', 'press']],
  ]
  for (const [category, key, varPrefix, classFn, keywords] of simple) {
    for (const [name, value] of Object.entries(tokens[key] ?? {})) {
      entries.push({
        name,
        category,
        cssVar: `${varPrefix}${name.replace(/\./g, '-')}`,
        value: withPx(value),
        classes: inWhitelist(classFn(name), wl),
        keywords,
      })
    }
  }

  // Easing (tokens.json keys are camelCase; classes follow preset keys).
  for (const [name, value] of Object.entries(tokens.easing ?? {})) {
    const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    entries.push({
      name, category: 'easing', cssVar: `--easing-${kebabName}`, value,
      classes: inWhitelist([`ease-${kebabName}`, `ease-${name}`], wl),
      keywords: ['easing', 'timing', 'transition', 'motion'],
    })
  }

  // Breakpoints (variant prefixes, not classes).
  for (const [name, value] of Object.entries(tokens.breakpoint ?? {})) {
    entries.push({
      name, category: 'breakpoints', cssVar: `--breakpoint-${name}`, value,
      classes: [`${name}:`],
      keywords: ['breakpoint', 'responsive', 'media', 'screen'],
    })
  }

  // Animation: group param tokens (…-duration/…-easing) per animation name.
  const animations = new Map<string, { duration?: string; easing?: string }>()
  for (const [name, value] of Object.entries(tokens.animation ?? {})) {
    const pm = name.match(ANIMATION_PARAM)
    if (!pm) continue
    const group = name.slice(0, -pm[0].length)
    const entry = animations.get(group) ?? {}
    if (pm[1] === 'duration') entry.duration = value
    if (pm[1] === 'easing') entry.easing = value
    animations.set(group, entry)
  }
  for (const [name, params] of animations) {
    entries.push({
      name,
      category: 'animation',
      cssVar: `--animation-${name}`,
      value: [params.duration, params.easing].filter(Boolean).join(' ') || 'keyframes',
      classes: inWhitelist([`animate-${name}`], wl),
      keywords: ['animation', 'motion', 'keyframes', ...name.split('-')],
    })
  }

  return entries
}

// ---------------------------------------------------------------------------
// Korean/Japanese query aliases → English search terms (trilingual docs)
// ---------------------------------------------------------------------------

const QUERY_ALIASES: Array<[RegExp, string]> = [
  [/테이블|テーブル|표\b/u, 'table'],
  [/버튼|ボタン/u, 'button'],
  [/모달|モーダル|다이얼로그|ダイアログ/u, 'modal dialog'],
  [/페이지네이션|페이지 ?나누기|ページネーション|ページング/u, 'pagination'],
  [/입력|인풋|入力|インプット/u, 'input'],
  [/선택|셀렉트|セレクト|選択/u, 'select'],
  [/체크박스|チェックボックス/u, 'checkbox'],
  [/라디오|ラジオ/u, 'radio'],
  [/스위치|スイッチ/u, 'switch'],
  [/슬라이더|スライダー/u, 'slider'],
  [/탭|タブ/u, 'tabs'],
  [/아코디언|アコーディオン/u, 'accordion'],
  [/구분선|区切り|디바이더|ディバイダー/u, 'divider'],
  [/드로어|서랍|ドロワー/u, 'drawer'],
  [/툴팁|ツールチップ/u, 'tooltip'],
  [/팝오버|ポップオーバー/u, 'popover'],
  [/알림|알럿|アラート|警告/u, 'alert'],
  [/토스트|トースト|通知/u, 'toast'],
  [/진행|프로그레스|プログレス|進捗/u, 'progress'],
  [/스피너|로딩|スピナー|ローディング/u, 'spinner loading'],
  [/스켈레톤|スケルトン/u, 'skeleton'],
  [/브레드크럼|パンくず/u, 'breadcrumb'],
  [/내비게이션|네비게이션|ナビゲーション|ナビ/u, 'navigation menu'],
  [/아바타|アバター/u, 'avatar'],
  [/배지|뱃지|バッジ/u, 'badge'],
  [/카드|カード/u, 'card'],
  [/차트|그래프|チャート|グラフ/u, 'chart'],
  [/메트릭|지표|指標|メトリック/u, 'metric'],
  [/드롭다운|ドロップダウン/u, 'dropdown menu'],
  [/텍스트에어리어|텍스트 ?영역|テキストエリア/u, 'textarea'],
  [/토글|トグル/u, 'toggle'],
  [/세그먼트|セグメント/u, 'segmented'],
  [/필드|폼|フィールド|フォーム/u, 'field form'],
  [/채팅|チャット|대화/u, 'chat message input'],
  [/타이핑|入力中|タイピング/u, 'typing indicator'],
  [/퀵리플라이|クイックリプライ|빠른 ?답/u, 'quick reply'],
  [/아이콘|アイコン/u, 'icon'],
  [/색상?|컬러|色|カラー/u, 'color'],
  [/간격|여백|스페이스|余白|スペース|間隔/u, 'spacing'],
  [/그림자|影|シャドウ/u, 'shadow'],
  [/둥근|모서리|角丸/u, 'radius rounded'],
  [/글꼴|폰트|フォント|글자/u, 'font text'],
  [/애니메이션|アニメーション|모션|モーション/u, 'animation motion'],
  [/투명도?|透明/u, 'opacity'],
]

/** Append English equivalents for Korean/Japanese terms in the query. */
export function normalizeQuery(query: string): string {
  let extra = ''
  for (const [re, english] of QUERY_ALIASES) {
    if (re.test(query)) extra += ` ${english}`
  }
  return extra ? `${query}${extra}` : query
}

/** Multi-word fuzzy search: fuse scores a whole phrase poorly against short
 *  names, so search per word and merge by best-score sum (lower = better). */
export function searchWords<T>(fuse: Fuse<T>, query: string, limit = 10): T[] {
  const words = normalizeQuery(query)
    .split(/\s+/)
    .filter((w) => w.length >= 2)
  if (words.length === 0) return []
  const scores = new Map<T, number>()
  for (const word of words) {
    for (const r of fuse.search(word)) {
      // (score − 1) per hit: more matching words → more negative → first.
      scores.set(r.item, (scores.get(r.item) ?? 0) + (r.score ?? 1) - 1)
    }
  }
  return [...scores.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([item]) => item)
}

// ---------------------------------------------------------------------------
// Fuse indexes (cached per source object identity)
// ---------------------------------------------------------------------------

const tokenIndexCache = new WeakMap<DesignData, { entries: TokenEntry[]; fuse: Fuse<TokenEntry> }>()

export function tokenIndex(data: DesignData): { entries: TokenEntry[]; fuse: Fuse<TokenEntry> } {
  const hit = tokenIndexCache.get(data)
  if (hit) return hit
  const entries = buildTokenEntries(data)
  const fuse = new Fuse(entries, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'category', weight: 1 },
      { name: 'classes', weight: 1.5 },
      { name: 'keywords', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true, // lesson #1 — searchWords ranking needs real scores
  })
  const built = { entries, fuse }
  tokenIndexCache.set(data, built)
  return built
}

const componentIndexCache = new WeakMap<object, Fuse<ComponentRecord>>()

export function componentIndex(source: object, components: ComponentRecord[]): Fuse<ComponentRecord> {
  const hit = componentIndexCache.get(source)
  if (hit) return hit
  const fuse = new Fuse(components, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'annotation', weight: 1.5 },
      { name: 'category', weight: 1 },
      { name: 'description', weight: 1 },
      { name: 'subComponents', weight: 1 },
      { name: 'notes', weight: 0.5 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true, // lesson #1
  })
  componentIndexCache.set(source, fuse)
  return fuse
}
