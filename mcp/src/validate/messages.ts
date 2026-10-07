// Locale messages for validate_code (Phase 4). Phase 0 decision #2: violation
// messages and fix suggestions are returned in en/ja/ko via the locale arg
// (default en). Templates interpolate {found} and {suggestion}.
import type { Locale } from '../tools/tokens.js'

export type Severity = 'error' | 'warning'

export type RuleId =
  | 'raw-color'
  | 'not-in-whitelist'
  | 'arbitrary-value'
  | 'dark-prefix'
  | 'leading-override'
  | 'inline-style'
  | 'html-element'
  | 'radix-import'
  | 'apply-raw'
  | 'visual-override'
  | 'icon-size'
  | 'divide-no-color'
  | 'opacity-element'
  | 'wrapper-component'

export const RULE_SEVERITY: Record<RuleId, Severity> = {
  'raw-color': 'error',
  'not-in-whitelist': 'error',
  'arbitrary-value': 'error',
  'dark-prefix': 'error',
  'leading-override': 'error',
  'inline-style': 'error',
  'html-element': 'error',
  'radix-import': 'error',
  'apply-raw': 'error',
  'visual-override': 'warning',
  'icon-size': 'warning',
  'divide-no-color': 'warning',
  'opacity-element': 'warning',
  'wrapper-component': 'warning',
}

type MessagePair = { message: string; fix: string }

export const RULE_MESSAGES: Record<RuleId, Record<Locale, MessagePair>> = {
  'raw-color': {
    en: {
      message: 'Primitive color class "{found}" — the 7onic rule is semantic-first.',
      fix: 'Use a semantic token instead: {suggestion}. Semantic colors also switch light/dark automatically.',
    },
    ja: {
      message: 'プリミティブカラークラス「{found}」— 7onic はセマンティックファーストです。',
      fix: 'セマンティックトークンを使ってください: {suggestion}。セマンティックカラーはライト/ダークも自動で切り替わります。',
    },
    ko: {
      message: '프리미티브 컬러 클래스 "{found}" — 7onic 규칙은 시맨틱 우선입니다.',
      fix: '시맨틱 토큰을 사용하세요: {suggestion}. 시맨틱 컬러는 라이트/다크도 자동 전환됩니다.',
    },
  },
  'not-in-whitelist': {
    en: {
      message: 'Class "{found}" is not in the 7onic token whitelist.',
      fix: 'Call search_tokens or suggest_tokens to find the token-backed class. {suggestion}',
    },
    ja: {
      message: 'クラス「{found}」は 7onic トークンのホワイトリストにありません。',
      fix: 'search_tokens / suggest_tokens でトークン由来のクラスを探してください。{suggestion}',
    },
    ko: {
      message: '클래스 "{found}" 는 7onic 토큰 whitelist 에 없습니다.',
      fix: 'search_tokens / suggest_tokens 로 토큰 기반 클래스를 찾으세요. {suggestion}',
    },
  },
  'arbitrary-value': {
    en: {
      message: 'Arbitrary value "{found}" — only layout h-[]/w-[] dimensions may use brackets.',
      fix: 'Call suggest_tokens with the raw value to find the nearest token. {suggestion}',
    },
    ja: {
      message: '任意値「{found}」— ブラケットが許されるのはレイアウトの h-[]/w-[] のみです。',
      fix: 'suggest_tokens にその値を渡して最も近いトークンを探してください。{suggestion}',
    },
    ko: {
      message: '임의 값 "{found}" — 브래킷은 레이아웃 h-[]/w-[] 치수에만 허용됩니다.',
      fix: 'suggest_tokens 에 원시 값을 넘겨 최근접 토큰을 찾으세요. {suggestion}',
    },
  },
  'dark-prefix': {
    en: {
      message: '"{found}" uses the dark: prefix — 7onic semantic tokens switch themes automatically.',
      fix: 'Remove dark: and use the semantic token alone (e.g. bg-background, text-foreground).',
    },
    ja: {
      message: '「{found}」は dark: プレフィックスを使用 — 7onic のセマンティックトークンはテーマを自動で切り替えます。',
      fix: 'dark: を外し、セマンティックトークン単体を使ってください (例: bg-background, text-foreground)。',
    },
    ko: {
      message: '"{found}" 는 dark: 프리픽스 사용 — 7onic 시맨틱 토큰은 테마를 자동 전환합니다.',
      fix: 'dark: 를 제거하고 시맨틱 토큰 단독으로 사용하세요 (예: bg-background, text-foreground).',
    },
  },
  'leading-override': {
    en: {
      message: '"{found}" overrides the token line-height — typography tokens pair font-size with line-height.',
      fix: 'Remove the leading-* class; the text-* token already provides the paired line-height.',
    },
    ja: {
      message: '「{found}」はトークンの line-height を上書き — タイポグラフィトークンは font-size と line-height のペアです。',
      fix: 'leading-* を削除してください。text-* トークンがペアの line-height を提供します。',
    },
    ko: {
      message: '"{found}" 는 토큰 line-height 를 덮어씁니다 — 타이포그래피 토큰은 font-size 와 line-height 쌍입니다.',
      fix: 'leading-* 클래스를 제거하세요. text-* 토큰이 쌍 line-height 를 이미 제공합니다.',
    },
  },
  'inline-style': {
    en: {
      message: 'Inline style with hardcoded values — styles must come from tokens.',
      fix: 'Replace style={{...}} with token classes; use suggest_tokens for each raw value.',
    },
    ja: {
      message: 'ハードコード値のインラインスタイル — スタイルはトークン由来である必要があります。',
      fix: 'style={{...}} をトークンクラスに置き換え、各生値は suggest_tokens で確認してください。',
    },
    ko: {
      message: '하드코딩 값 인라인 스타일 — 스타일은 토큰에서 와야 합니다.',
      fix: 'style={{...}} 를 토큰 클래스로 교체하고, 각 원시 값은 suggest_tokens 로 확인하세요.',
    },
  },
  'html-element': {
    en: {
      message: 'Native <{found}> instead of the 7onic component.',
      fix: 'Use {suggestion} from @7onic-ui/react — it carries tokens, a11y, and theme switching.',
    },
    ja: {
      message: '7onic コンポーネントの代わりにネイティブ <{found}> を使用。',
      fix: '@7onic-ui/react の {suggestion} を使ってください — トークン・a11y・テーマ切替が組み込まれています。',
    },
    ko: {
      message: '7onic 컴포넌트 대신 네이티브 <{found}> 사용.',
      fix: '@7onic-ui/react 의 {suggestion} 을 사용하세요 — 토큰·a11y·테마 전환이 내장되어 있습니다.',
    },
  },
  'radix-import': {
    en: {
      message: 'Direct Radix import "{found}" — 7onic components already wrap Radix.',
      fix: 'Import the equivalent component from @7onic-ui/react instead.',
    },
    ja: {
      message: 'Radix を直接インポート「{found}」— 7onic コンポーネントが既に Radix をラップしています。',
      fix: '代わりに @7onic-ui/react から該当コンポーネントをインポートしてください。',
    },
    ko: {
      message: 'Radix 직접 import "{found}" — 7onic 컴포넌트가 이미 Radix 를 래핑합니다.',
      fix: '대신 @7onic-ui/react 에서 해당 컴포넌트를 import 하세요.',
    },
  },
  'apply-raw': {
    en: {
      message: '@apply with a raw value: "{found}".',
      fix: 'Use token classes in @apply, or better, apply token classes directly in JSX.',
    },
    ja: {
      message: '生値を含む @apply:「{found}」。',
      fix: '@apply にはトークンクラスを使うか、JSX に直接トークンクラスを適用してください。',
    },
    ko: {
      message: '원시 값 포함 @apply: "{found}".',
      fix: '@apply 에는 토큰 클래스를 쓰거나, JSX 에 토큰 클래스를 직접 적용하세요.',
    },
  },
  'visual-override': {
    en: {
      message: 'className on <{found}> overrides component visuals: "{suggestion}".',
      fix: 'Prefer the documented props (color, variant, size) — call get_component to see them.',
    },
    ja: {
      message: '<{found}> の className がコンポーネントの見た目を上書き:「{suggestion}」。',
      fix: 'ドキュメント化された props (color, variant, size) を優先してください — get_component で確認できます。',
    },
    ko: {
      message: '<{found}> 의 className 이 컴포넌트 비주얼을 덮어씁니다: "{suggestion}".',
      fix: '문서화된 props (color, variant, size) 를 우선하세요 — get_component 로 확인할 수 있습니다.',
    },
  },
  'icon-size': {
    en: {
      message: 'Icon sized with "{found}" — 7onic has a 6-step icon scale.',
      fix: 'Use {suggestion} instead of w-N h-N.',
    },
    ja: {
      message: 'アイコンサイズに「{found}」を使用 — 7onic には 6 段階のアイコンスケールがあります。',
      fix: 'w-N h-N の代わりに {suggestion} を使ってください。',
    },
    ko: {
      message: '아이콘 크기에 "{found}" 사용 — 7onic 에는 6단 아이콘 스케일이 있습니다.',
      fix: 'w-N h-N 대신 {suggestion} 을 사용하세요.',
    },
  },
  'divide-no-color': {
    en: {
      message: '"{found}" without a token divide color.',
      fix: 'Add divide-border (or another semantic color): e.g. divide-y divide-border.',
    },
    ja: {
      message: 'トークンの divide カラーなしの「{found}」。',
      fix: 'divide-border (または他のセマンティックカラー) を追加してください: 例 divide-y divide-border。',
    },
    ko: {
      message: '토큰 divide 컬러 없는 "{found}".',
      fix: 'divide-border (또는 다른 시맨틱 컬러) 를 추가하세요: 예 divide-y divide-border.',
    },
  },
  'opacity-element': {
    en: {
      message: '"{found}" fades the whole element (children included).',
      fix: 'Use the color opacity modifier instead: {suggestion} (only the color becomes transparent).',
    },
    ja: {
      message: '「{found}」は子要素を含む要素全体を透過させます。',
      fix: 'カラーの不透明度修飾子を使ってください: {suggestion} (色のみ透過されます)。',
    },
    ko: {
      message: '"{found}" 는 자식 포함 요소 전체를 투명하게 만듭니다.',
      fix: '컬러 불투명도 수정자를 사용하세요: {suggestion} (색상만 투명해집니다).',
    },
  },
  'wrapper-component': {
    en: {
      message: 'Unnecessary wrapper around <{found}>.',
      fix: 'Use {found} directly — pass-through wrappers hide the documented API.',
    },
    ja: {
      message: '<{found}> の不要なラッパー。',
      fix: '{found} を直接使ってください — パススルーラッパーはドキュメント化された API を隠します。',
    },
    ko: {
      message: '<{found}> 의 불필요한 래퍼.',
      fix: '{found} 를 직접 사용하세요 — 패스스루 래퍼는 문서화된 API 를 가립니다.',
    },
  },
}

export function formatMessage(
  rule: RuleId,
  locale: Locale,
  found: string,
  suggestion = '',
): { message: string; fix: string } {
  const t = RULE_MESSAGES[rule][locale]
  const sub = (s: string) => s.replace(/\{found\}/g, found).replace(/\{suggestion\}/g, suggestion)
  return { message: sub(t.message), fix: sub(t.fix) }
}
