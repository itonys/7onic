import type { Metadata } from 'next'
import { siteConfig } from '@/site.config'

// Locale-aware SEO metadata for all pages
// Titles stay English (component/token names are universal)
// Descriptions are locale-specific for better search visibility

type Locale = 'en' | 'ja' | 'ko'
type LocaleDescriptions = Record<Locale, string>
type LocaleSEOMap = Record<Locale, Metadata>

function page(title: string, descriptions: LocaleDescriptions): LocaleSEOMap {
  const result = {} as LocaleSEOMap
  for (const locale of ['en', 'ja', 'ko'] as Locale[]) {
    result[locale] = {
      title,
      description: descriptions[locale],
      openGraph: {
        title: `${title} | ${siteConfig.name} Design System`,
        description: descriptions[locale],
      },
    }
  }
  return result
}

// Accessor functions for layout.tsx
export function getComponentSEO(locale: string, key: string): Metadata {
  const entry = componentSEO[key as keyof typeof componentSEO]
  return entry?.[(locale as Locale)] ?? entry?.en
}

export function getTokenSEO(locale: string, key: string): Metadata {
  const entry = tokenSEO[key as keyof typeof tokenSEO]
  return entry?.[(locale as Locale)] ?? entry?.en
}

export function getGuidelineSEO(locale: string, key: string): Metadata {
  const entry = guidelineSEO[key as keyof typeof guidelineSEO]
  return entry?.[(locale as Locale)] ?? entry?.en
}

// Description accessors for OG images (always English)
export function getComponentDescription(key: string): string {
  return componentSEO[key as keyof typeof componentSEO]?.en?.description as string ?? ''
}

export function getTokenDescription(key: string): string {
  return tokenSEO[key as keyof typeof tokenSEO]?.en?.description as string ?? ''
}

export function getGuidelineDescription(key: string): string {
  return guidelineSEO[key as keyof typeof guidelineSEO]?.en?.description as string ?? ''
}

// ═══ Component pages ═══

export const componentSEO = {
  index: page('Components', {
    en: 'Production-ready, accessible React components built on Radix UI. Customizable with Tailwind CSS and design tokens.',
    ja: 'Radix UIベースのプロダクション対応Reactコンポーネント。Tailwind CSSとデザイントークンでカスタマイズ可能。',
    ko: 'Radix UI 기반의 프로덕션 대응 React 컴포넌트. Tailwind CSS와 디자인 토큰으로 커스터마이즈 가능.',
  }),
  accordion: page('Accordion', {
    en: 'Collapsible content sections with 3 variants, single/multiple mode, and customizable icon position. Built on Radix UI.',
    ja: '3つのバリアント、single/multipleモード、アイコン位置カスタマイズ対応の折りたたみコンポーネント。Radix UIベース。',
    ko: '3가지 배리언트, single/multiple 모드, 아이콘 위치 커스터마이즈를 지원하는 접이식 컴포넌트. Radix UI 기반.',
  }),
  alert: page('Alert', {
    en: 'Contextual feedback component with 3 variants, 4 color states, closable option, and automatic icon mapping.',
    ja: '3つのバリアント、4つのカラー状態、閉じるオプション、自動アイコンマッピング対応のフィードバックコンポーネント。',
    ko: '3가지 배리언트, 4가지 컬러 상태, 닫기 옵션, 자동 아이콘 매핑을 지원하는 피드백 컴포넌트.',
  }),
  'area-chart': page('Area Chart', {
    en: 'Area chart component with 4 interpolation types, gradient/solid variants, stacked mode, and hover fade. Built on Recharts.',
    ja: '4つの補間タイプ、グラデーション/ソリッド、スタック、ホバーフェード対応のエリアチャート。Rechartsベース。',
    ko: '4가지 보간 타입, 그라데이션/솔리드, 스택, 호버 페이드를 지원하는 에어리어 차트. Recharts 기반.',
  }),
  avatar: page('Avatar', {
    en: 'User avatar with 6 sizes, shape options, status indicator, AvatarGroup, and automatic CJK initial extraction.',
    ja: '6つのサイズ、形状オプション、ステータス表示、AvatarGroup、CJK頭文字自動抽出対応のアバター。',
    ko: '6가지 사이즈, 형태 옵션, 상태 표시, AvatarGroup, CJK 이니셜 자동 추출을 지원하는 아바타.',
  }),
  badge: page('Badge', {
    en: 'Inline status indicator with 3 variants, 6 colors, 3 sizes, dot mode, icon support, and removable option.',
    ja: '3つのバリアント、6つのカラー、3つのサイズ、ドット、アイコン、削除可能オプション対応のバッジ。',
    ko: '3가지 배리언트, 6가지 컬러, 3가지 사이즈, 도트, 아이콘, 삭제 가능 옵션을 지원하는 배지.',
  }),
  'bar-chart': page('Bar Chart', {
    en: 'Bar chart component with horizontal/vertical layout, stacked mode, rounded corners, and hover fade. Built on Recharts.',
    ja: '水平/垂直レイアウト、スタック、角丸、ホバーフェード対応のバーチャート。Rechartsベース。',
    ko: '수평/수직 레이아웃, 스택, 라운드 코너, 호버 페이드를 지원하는 바 차트. Recharts 기반.',
  }),
  breadcrumb: page('Breadcrumb', {
    en: 'Navigation breadcrumb with 3 sizes, custom separators, and auto-collapse for long paths. WAI-ARIA compliant.',
    ja: '3つのサイズ、カスタムセパレーター、長いパスの自動省略対応のパンくずリスト。WAI-ARIA準拠。',
    ko: '3가지 사이즈, 커스텀 구분자, 긴 경로 자동 생략을 지원하는 브레드크럼. WAI-ARIA 준수.',
  }),
  button: page('Button', {
    en: 'Versatile button with 4 variants, 4 colors, 5 sizes, press effect, loading state, and icon support. Built on Radix UI.',
    ja: '4つのバリアント、4つのカラー、5つのサイズ、プレスエフェクト、ローディング、アイコン対応のボタン。Radix UIベース。',
    ko: '4가지 배리언트, 4가지 컬러, 5가지 사이즈, 프레스 이펙트, 로딩, 아이콘을 지원하는 버튼. Radix UI 기반.',
  }),
  'button-group': page('ButtonGroup', {
    en: 'Group buttons with shared variant, size, and disabled state. Automatic context propagation to child buttons.',
    ja: 'バリアント、サイズ、disabled状態を共有するボタングループ。子ボタンへの自動コンテキスト伝播。',
    ko: '배리언트, 사이즈, disabled 상태를 공유하는 버튼 그룹. 자식 버튼에 컨텍스트 자동 전파.',
  }),
  card: page('Card', {
    en: 'Content container with 3 variants, 3 sizes, interactive mode, image overlay, and optical padding balance.',
    ja: '3つのバリアント、3つのサイズ、インタラクティブモード、画像オーバーレイ対応のカードコンポーネント。',
    ko: '3가지 배리언트, 3가지 사이즈, 인터랙티브 모드, 이미지 오버레이를 지원하는 카드 컴포넌트.',
  }),
  checkbox: page('Checkbox', {
    en: 'Form checkbox with 2 colors, customizable size and radius. Supports indeterminate state. Built on Radix UI.',
    ja: '2つのカラー、サイズ・角丸カスタマイズ、indeterminate状態対応のチェックボックス。Radix UIベース。',
    ko: '2가지 컬러, 사이즈, 라디우스 커스터마이즈, indeterminate 상태를 지원하는 체크박스. Radix UI 기반.',
  }),
  divider: page('Divider', {
    en: 'Visual separator with 3 line styles, 3 colors, horizontal/vertical orientation, and optional label placement.',
    ja: '3つの線スタイル、3つのカラー、水平/垂直方向、ラベル配置対応のディバイダー。',
    ko: '3가지 선 스타일, 3가지 컬러, 수평/수직 방향, 라벨 배치를 지원하는 디바이더.',
  }),
  drawer: page('Drawer', {
    en: 'Slide-in panel from any edge with 5 sizes, directional animations, and full modal support. Built on Radix Dialog.',
    ja: '5つのサイズ、4方向アニメーション、フルモーダル対応のスライドインパネル。Radix Dialogベース。',
    ko: '5가지 사이즈, 4방향 애니메이션, 풀 모달을 지원하는 슬라이드인 패널. Radix Dialog 기반.',
  }),
  dropdown: page('Dropdown', {
    en: 'Dropdown menu with 3 sizes, keyboard navigation, submenus, checkable items, and separator groups. Built on Radix UI.',
    ja: '3つのサイズ、キーボード操作、サブメニュー、チェック可能アイテム対応のドロップダウン。Radix UIベース。',
    ko: '3가지 사이즈, 키보드 내비게이션, 서브메뉴, 체크 가능 아이템을 지원하는 드롭다운. Radix UI 기반.',
  }),
  'icon-button': page('IconButton', {
    en: 'Icon-only button with 5 variants including subtle, 4 colors, 5 sizes, and accessible aria-label support.',
    ja: 'subtle含む5つのバリアント、4つのカラー、5つのサイズ、aria-label対応のアイコンボタン。',
    ko: 'subtle 포함 5가지 배리언트, 4가지 컬러, 5가지 사이즈, aria-label을 지원하는 아이콘 버튼.',
  }),
  input: page('Input', {
    en: 'Text input with 5 sizes, 9 radius options, Field wrapper for label/error, and keyboard-only focus ring detection.',
    ja: '5つのサイズ、9つの角丸、Fieldラッパー（ラベル/エラー）、キーボードフォーカスリング対応のテキスト入力。',
    ko: '5가지 사이즈, 9가지 라디우스, Field 래퍼(라벨/에러), 키보드 포커스 링을 지원하는 텍스트 입력.',
  }),
  installation: page('Installation', {
    en: 'Get started with 7onic — install components and tokens via npm, yarn, or pnpm. Setup guides for Tailwind v3 and v4.',
    ja: '7onicの導入ガイド — npm、yarn、pnpmでコンポーネントとトークンをインストール。Tailwind v3/v4セットアップ。',
    ko: '7onic 시작 가이드 — npm, yarn, pnpm으로 컴포넌트와 토큰 설치. Tailwind v3/v4 셋업 안내.',
  }),
  'line-chart': page('Line Chart', {
    en: 'Line chart component with 4 interpolation types, dot markers, series highlighting, and hover fade. Built on Recharts.',
    ja: '4つの補間タイプ、ドットマーカー、シリーズハイライト、ホバーフェード対応のラインチャート。Rechartsベース。',
    ko: '4가지 보간 타입, 도트 마커, 시리즈 하이라이트, 호버 페이드를 지원하는 라인 차트. Recharts 기반.',
  }),
  'metric-card': page('Metric Card', {
    en: 'Dashboard metric display with 3 variants, 3 sizes, trend indicator, and description. Context-based size propagation.',
    ja: '3つのバリアント、3つのサイズ、トレンド表示、コンテキストベースのサイズ伝播対応のメトリクスカード。',
    ko: '3가지 배리언트, 3가지 사이즈, 트렌드 표시, 컨텍스트 기반 사이즈 전파를 지원하는 메트릭 카드.',
  }),
  modal: page('Modal', {
    en: 'Dialog overlay with 6 sizes, 2 scroll behaviors, AlertModal variant, and close button. Built on Radix Dialog.',
    ja: '6つのサイズ、2つのスクロール方式、AlertModalバリアント、閉じるボタン対応のモーダル。Radix Dialogベース。',
    ko: '6가지 사이즈, 2가지 스크롤 방식, AlertModal 배리언트, 닫기 버튼을 지원하는 모달. Radix Dialog 기반.',
  }),
  'navigation-menu': page('Navigation Menu', {
    en: 'Horizontal/vertical navigation with collapsible sidebar, size options, and hover indicator. Built on Radix UI.',
    ja: '折りたたみサイドバー、サイズオプション、ホバーインジケーター対応のナビゲーションメニュー。Radix UIベース。',
    ko: '접이식 사이드바, 사이즈 옵션, 호버 인디케이터를 지원하는 내비게이션 메뉴. Radix UI 기반.',
  }),
  pagination: page('Pagination', {
    en: 'Page navigation with 5 sizes, 3 variants, 2 colors, boundary control, loop option, and usePagination hook.',
    ja: '5つのサイズ、3つのバリアント、2つのカラー、boundary制御、loop、usePaginationフック対応のページネーション。',
    ko: '5가지 사이즈, 3가지 배리언트, 2가지 컬러, boundary 제어, loop, usePagination 훅을 지원하는 페이지네이션.',
  }),
  'pie-chart': page('Pie Chart', {
    en: 'Pie and donut chart with inside/outside labels, active shape highlight, and customizable padding angle. Built on Recharts.',
    ja: '内側/外側ラベル、アクティブシェイプ、パディング角度カスタマイズ対応のパイ/ドーナツチャート。Rechartsベース。',
    ko: '내부/외부 라벨, 액티브 셰이프, 패딩 앵글 커스터마이즈를 지원하는 파이/도넛 차트. Recharts 기반.',
  }),
  popover: page('Popover', {
    en: 'Floating content panel with 2 variants including glassmorphism, arrow support, and 4-direction placement. Built on Radix UI.',
    ja: 'グラスモーフィズム含む2つのバリアント、矢印、4方向配置対応のフローティングパネル。Radix UIベース。',
    ko: '글래스모피즘 포함 2가지 배리언트, 화살표, 4방향 배치를 지원하는 플로팅 패널. Radix UI 기반.',
  }),
  progress: page('Progress', {
    en: 'Linear and circular progress indicator with 3 sizes, striped variant, custom labels, and animation. Built on Radix UI.',
    ja: 'リニア/サーキュラー、3つのサイズ、ストライプ、カスタムラベル、アニメーション対応のプログレス。Radix UIベース。',
    ko: '리니어/서큘러, 3가지 사이즈, 스트라이프, 커스텀 라벨, 애니메이션을 지원하는 프로그레스. Radix UI 기반.',
  }),
  radio: page('Radio', {
    en: 'Radio group with 2 colors, size options, and context-based color propagation to child radios. Built on Radix UI.',
    ja: '2つのカラー、サイズオプション、コンテキストベースのカラー伝播対応のラジオグループ。Radix UIベース。',
    ko: '2가지 컬러, 사이즈 옵션, 컨텍스트 기반 컬러 전파를 지원하는 라디오 그룹. Radix UI 기반.',
  }),
  segmented: page('Segmented', {
    en: 'Segmented control with 4 sizes and customizable radius. Tab-like selection for mutually exclusive options.',
    ja: '4つのサイズ、角丸カスタマイズ対応のセグメンテッドコントロール。排他的選択用のタブ型UI。',
    ko: '4가지 사이즈, 라디우스 커스터마이즈를 지원하는 세그먼티드 컨트롤. 상호 배타적 옵션 선택용 탭 UI.',
  }),
  select: page('Select', {
    en: 'Dropdown select with 5 sizes, 9 radius options, grouped items, and flush mode. Built on Radix UI.',
    ja: '5つのサイズ、9つの角丸、グループアイテム、flushモード対応のセレクト。Radix UIベース。',
    ko: '5가지 사이즈, 9가지 라디우스, 그룹 아이템, flush 모드를 지원하는 셀렉트. Radix UI 기반.',
  }),
  skeleton: page('Skeleton', {
    en: 'Loading placeholder with text/circular/rectangular variants, pulse/wave animations, and conditional rendering.',
    ja: 'テキスト/サークル/レクタングル、pulse/waveアニメーション、条件付きレンダリング対応のスケルトン。',
    ko: '텍스트/서클/사각형, pulse/wave 애니메이션, 조건부 렌더링을 지원하는 스켈레톤.',
  }),
  slider: page('Slider', {
    en: 'Range slider with 2 colors, size options, and smooth thumb interaction. Built on Radix UI.',
    ja: '2つのカラー、サイズオプション、スムーズなサム操作対応のスライダー。Radix UIベース。',
    ko: '2가지 컬러, 사이즈 옵션, 부드러운 썸 조작을 지원하는 슬라이더. Radix UI 기반.',
  }),
  spinner: page('Spinner', {
    en: 'Loading spinner with 4 variants — ring, dots, bars, and orbit with 5 sub-styles including 3D effects.',
    ja: 'ring、dots、bars、orbit（3Dエフェクト含む5種）の4バリアント対応のローディングスピナー。',
    ko: 'ring, dots, bars, orbit(3D 이펙트 포함 5종) 4가지 배리언트를 지원하는 로딩 스피너.',
  }),
  switch: page('Switch', {
    en: 'Toggle switch with 5 colors, label positioning, custom icons, and accessible keyboard support. Built on Radix UI.',
    ja: '5つのカラー、ラベル配置、カスタムアイコン、キーボードアクセシビリティ対応のスイッチ。Radix UIベース。',
    ko: '5가지 컬러, 라벨 배치, 커스텀 아이콘, 키보드 접근성을 지원하는 스위치. Radix UI 기반.',
  }),
  table: page('Table', {
    en: 'Data table with 3 sizes, 3 variants, sortable columns, row selection with checkbox, and sticky header.',
    ja: '3つのサイズ、3つのバリアント、ソート、チェックボックス行選択、スティッキーヘッダー対応のテーブル。',
    ko: '3가지 사이즈, 3가지 배리언트, 정렬, 체크박스 행 선택, 스티키 헤더를 지원하는 테이블.',
  }),
  tabs: page('Tabs', {
    en: 'Tab navigation with 3 variants — line, enclosed, pill — 4 sizes, 2 colors, and fitted mode. Built on Radix UI.',
    ja: 'line、enclosed、pillの3バリアント、4サイズ、2カラー、fittedモード対応のタブ。Radix UIベース。',
    ko: 'line, enclosed, pill 3가지 배리언트, 4사이즈, 2컬러, fitted 모드를 지원하는 탭. Radix UI 기반.',
  }),
  textarea: page('Textarea', {
    en: 'Multi-line text input with size and radius options, Field wrapper for label/error, and auto-resize support.',
    ja: 'サイズ・角丸オプション、Fieldラッパー（ラベル/エラー）、自動リサイズ対応のテキストエリア。',
    ko: '사이즈, 라디우스 옵션, Field 래퍼(라벨/에러), 자동 리사이즈를 지원하는 텍스트에어리어.',
  }),
  theming: page('Theming', {
    en: 'Customize 7onic with design tokens — light/dark mode, CSS variables, and Tailwind configuration guide.',
    ja: 'デザイントークンで7onicをカスタマイズ — ライト/ダークモード、CSS変数、Tailwind設定ガイド。',
    ko: '디자인 토큰으로 7onic 커스터마이즈 — 라이트/다크 모드, CSS 변수, Tailwind 설정 가이드.',
  }),
  toast: page('Toast', {
    en: 'Notification toast with 6 types, 6 positions, rich colors, promise support, stacking, and imperative API.',
    ja: '6つのタイプ、6つの位置、リッチカラー、Promise対応、スタッキング、命令的API対応のトースト。',
    ko: '6가지 타입, 6가지 위치, 리치 컬러, Promise 지원, 스태킹, 명령적 API를 지원하는 토스트.',
  }),
  toggle: page('Toggle', {
    en: 'Pressable toggle button with 5 sizes, variant options, press effect, and controlled/uncontrolled modes. Built on Radix UI.',
    ja: '5つのサイズ、バリアント、プレスエフェクト、controlled/uncontrolledモード対応のトグル。Radix UIベース。',
    ko: '5가지 사이즈, 배리언트, 프레스 이펙트, controlled/uncontrolled 모드를 지원하는 토글. Radix UI 기반.',
  }),
  'toggle-group': page('Toggle Group', {
    en: 'Group of toggle buttons with single/multiple selection, shared variant and size context. Built on Radix UI.',
    ja: 'single/multiple選択、バリアント・サイズコンテキスト共有のトグルグループ。Radix UIベース。',
    ko: 'single/multiple 선택, 배리언트, 사이즈 컨텍스트를 공유하는 토글 그룹. Radix UI 기반.',
  }),
  tooltip: page('Tooltip', {
    en: 'Hover tooltip with 2 variants including glassmorphism, arrow support, and WCAG 1.4.13 compliance. Built on Radix UI.',
    ja: 'グラスモーフィズム含む2バリアント、矢印、WCAG 1.4.13準拠のツールチップ。Radix UIベース。',
    ko: '글래스모피즘 포함 2가지 배리언트, 화살표, WCAG 1.4.13 준수 툴팁. Radix UI 기반.',
  }),
} as const

// ═══ Design token pages ═══

export const tokenSEO = {
  index: page('Design Tokens', {
    en: 'Figma-synced design tokens — colors, typography, spacing, and more. Single source of truth for CSS, Tailwind, and JS.',
    ja: 'Figma同期のデザイントークン — カラー、タイポグラフィ、スペーシングなど。CSS、Tailwind、JSの唯一の情報源。',
    ko: 'Figma 동기화 디자인 토큰 — 컬러, 타이포그래피, 스페이싱 등. CSS, Tailwind, JS의 단일 소스.',
  }),
  animation: page('Animation Tokens', {
    en: '54 animation tokens with named 1:1 keyframe matching — toast, spinner, skeleton, and progress animations.',
    ja: '名前付き1:1キーフレーム対応の54アニメーショントークン — toast、spinner、skeleton、progressアニメーション。',
    ko: '이름 기반 1:1 키프레임 매칭 54개 애니메이션 토큰 — toast, spinner, skeleton, progress 애니메이션.',
  }),
  'border-width': page('Border Width Tokens', {
    en: '5 border width tokens from hairline to thick. Consistent border sizing across all components.',
    ja: 'hairlineからthickまでの5つのボーダー幅トークン。全コンポーネント統一のボーダーサイズ。',
    ko: 'hairline부터 thick까지 5가지 보더 너비 토큰. 전 컴포넌트 통일 보더 사이즈.',
  }),
  breakpoints: page('Breakpoint Tokens', {
    en: '5 responsive breakpoints for mobile-first design. Aligned with Tailwind CSS breakpoint system.',
    ja: 'モバイルファースト設計の5つのレスポンシブブレークポイント。Tailwind CSSのブレークポイントシステムと統一。',
    ko: '모바일 퍼스트 설계 5가지 반응형 브레이크포인트. Tailwind CSS 브레이크포인트 시스템과 통일.',
  }),
  colors: page('Color Tokens', {
    en: '72 primitive colors + semantic tokens for light and dark mode. RGB channel support for opacity modifiers.',
    ja: '72のプリミティブカラー + ライト/ダークモード対応のセマンティックトークン。RGBチャネルでopacity修飾子対応。',
    ko: '72개 프리미티브 컬러 + 라이트/다크 모드 시맨틱 토큰. RGB 채널로 opacity modifier 지원.',
  }),
  duration: page('Duration Tokens', {
    en: '8 transition duration tokens from instant to slow. Consistent timing across animations and interactions.',
    ja: 'instantからslowまでの8つのトランジションデュレーション。アニメーションとインタラクションの統一タイミング。',
    ko: 'instant부터 slow까지 8가지 트랜지션 듀레이션. 애니메이션과 인터랙션의 통일 타이밍.',
  }),
  easing: page('Easing Tokens', {
    en: '5 easing curve tokens for smooth transitions. Standard, ease-in, ease-out, ease-in-out, and spring.',
    ja: 'スムーズなトランジション用の5つのイージングカーブ。standard、ease-in、ease-out、ease-in-out、spring。',
    ko: '부드러운 트랜지션을 위한 5가지 이징 커브. standard, ease-in, ease-out, ease-in-out, spring.',
  }),
  'icon-sizes': page('Icon Size Tokens', {
    en: '6 icon size tokens from 12px to 32px. Mapped to component sizes for consistent icon scaling.',
    ja: '12pxから32pxまでの6つのアイコンサイズ。コンポーネントサイズに対応した統一スケーリング。',
    ko: '12px부터 32px까지 6가지 아이콘 사이즈. 컴포넌트 사이즈에 매핑된 통일 스케일링.',
  }),
  installation: page('Token Installation', {
    en: 'Install and configure design tokens — setup guides for Tailwind v3, Tailwind v4, and plain CSS variables.',
    ja: 'デザイントークンのインストールと設定 — Tailwind v3、v4、プレーンCSS変数のセットアップガイド。',
    ko: '디자인 토큰 설치 및 설정 — Tailwind v3, v4, 순수 CSS 변수 셋업 가이드.',
  }),
  opacity: page('Opacity Tokens', {
    en: '21 opacity tokens with CSS percentage and JS decimal output. For layering, overlays, and disabled states.',
    ja: 'CSSパーセンテージとJS小数出力の21不透明度トークン。レイヤリング、オーバーレイ、disabled状態用。',
    ko: 'CSS 퍼센트와 JS 소수점 출력 21개 불투명도 토큰. 레이어링, 오버레이, disabled 상태용.',
  }),
  radius: page('Border Radius Tokens', {
    en: '9 border radius tokens from none to full. Consistent rounding across buttons, cards, inputs, and more.',
    ja: 'noneからfullまでの9つのボーダーラディウス。ボタン、カード、入力の統一された角丸。',
    ko: 'none부터 full까지 9가지 보더 라디우스. 버튼, 카드, 인풋의 통일된 라운딩.',
  }),
  scale: page('Scale Tokens', {
    en: '4 transform scale tokens for hover effects and press interactions. Subtle scaling for UI feedback.',
    ja: 'ホバーエフェクトとプレスインタラクション用の4つのスケールトークン。UIフィードバック用の微細スケーリング。',
    ko: '호버 이펙트와 프레스 인터랙션용 4가지 스케일 토큰. UI 피드백을 위한 미세 스케일링.',
  }),
  shadows: page('Shadow Tokens', {
    en: '6 shadow elevation tokens from subtle to dramatic. Consistent depth perception across components.',
    ja: 'subtleからdramaticまでの6つのシャドウエレベーション。コンポーネント全体の統一された奥行き表現。',
    ko: 'subtle부터 dramatic까지 6가지 섀도 엘리베이션. 전 컴포넌트 통일 깊이감.',
  }),
  spacing: page('Spacing Tokens', {
    en: '18 spacing tokens on a consistent scale. Used for padding, margin, and gap across all components.',
    ja: '統一スケールの18スペーシングトークン。全コンポーネントのpadding、margin、gapに使用。',
    ko: '통일 스케일 18개 스페이싱 토큰. 전 컴포넌트의 padding, margin, gap에 사용.',
  }),
  typography: page('Typography Tokens', {
    en: '11 font sizes with CJK-optimized scale, 3 weights, and 2 font families. Semantic typography presets included.',
    ja: 'CJK最適化の11フォントサイズ、3ウェイト、2フォントファミリー。セマンティックタイポグラフィプリセット付き。',
    ko: 'CJK 최적화 11개 폰트 사이즈, 3가지 웨이트, 2가지 폰트 패밀리. 시맨틱 타이포그래피 프리셋 포함.',
  }),
  'z-index': page('Z-Index Tokens', {
    en: '13 z-index tokens for layering — from base content to modals, toasts, and tooltips.',
    ja: 'ベースコンテンツからモーダル、トースト、ツールチップまでの13 z-indexトークン。',
    ko: '베이스 콘텐츠부터 모달, 토스트, 툴팁까지 13개 z-index 토큰.',
  }),
} as const

// ═══ Guideline pages ═══

export const guidelineSEO = {
  accessibility: page('Accessibility', {
    en: 'WCAG-compliant accessibility guide — keyboard navigation, screen reader support, and ARIA patterns for all components.',
    ja: 'WCAG準拠のアクセシビリティガイド — キーボード操作、スクリーンリーダー対応、全コンポーネントのARIAパターン。',
    ko: 'WCAG 준수 접근성 가이드 — 키보드 내비게이션, 스크린 리더 지원, 전 컴포넌트 ARIA 패턴.',
  }),
  icons: page('Icons', {
    en: 'Icon usage guidelines — 6 size tokens, Lucide React integration, and best practices for icon placement.',
    ja: 'アイコン使用ガイドライン — 6サイズトークン、Lucide React統合、アイコン配置のベストプラクティス。',
    ko: '아이콘 사용 가이드라인 — 6가지 사이즈 토큰, Lucide React 통합, 아이콘 배치 모범 사례.',
  }),
  'tailwind-versions': page('Tailwind v3 vs v4', {
    en: 'Side-by-side comparison of Tailwind v3 and v4 setup. The ecosystem\'s only design system supporting both versions.',
    ja: 'Tailwind v3とv4セットアップの比較ガイド。エコシステム唯一のv3/v4デュアルサポートデザインシステム。',
    ko: 'Tailwind v3과 v4 셋업 비교 가이드. 에코시스템 유일의 v3/v4 듀얼 지원 디자인 시스템.',
  }),
} as const
