# Changelog

All notable changes to this project will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and uses synchronized versioning across `@7onic-ui/react` and `@7onic-ui/tokens`.

---

## [0.3.0] — 2026-04-22

### @7onic-ui/react & @7onic-ui/tokens

#### Breaking Changes

This release drops two legacy APIs and consolidates on Named exports. Migration guide below.

**(1) Compound JSX removed** — `<Card.Header />` dot-notation is no longer emitted by the library. Use `<CardHeader />` instead.

**(2) TypeScript namespace type access removed** — `Card.HeaderProps` merged type access is gone. Use `CardHeaderProps` directly.

#### Why — Namespace removed, consolidated on Named export

Rationale for dropping the Namespace/Object.assign pattern and moving to a single Named-export API:

1. **Consistent user experience** — Inside Next.js App Router Server Components, Namespace access (`<Card.Header />`) could not resolve sub-component references due to a React Client Manifest limitation around `Object.assign`-attached properties. Named imports (`<CardHeader />`) produce the **same result in every environment**: RSC, Client Components, Pages Router, Vite, CRA, CJS.

2. **Tree-shaking reliability** — `Object.assign(CardRoot, { Header, Content, … })` defeats bundler static analysis, which means **unused sub-components can survive into the final bundle**. Named exports map 1:1 to standard dead-code elimination, so only the sub-components you actually import ship.

3. **Lower future version-management cost** — Previously each compound component file had to keep three places in sync: (a) the runtime `*Root` const, (b) the `Object.assign` property attachments, and (c) the `namespace X {}` TypeScript merge. Every sub-component addition meant three edits. Post Option D, adding a sub-component is a single Named export — long-term maintenance cost is minimized.

4. **Preserve AI-optimized baseline** — AI training data mixes Named (shadcn-style) and Compound (Chakra/Mantine-style) patterns. When both were supported, AI tools would randomly emit the Compound form, which crashed at runtime in RSC. Collapsing to Named makes **AI-generated code deterministically RSC-safe**. `llms.txt` also loses the Pattern A/B split, the Object.assign mechanics, and the Client Manifest warning — **unnecessary code and meta-information removed** to tighten the AI token budget and present one unambiguous guide.

If you still prefer the dot-notation syntax, add a **5-line Compound Recipe wrapper** in your own project. ADR [NAMED-PRIMARY-MIGRATION](docs/decisions/NAMED-PRIMARY-MIGRATION.md) §Appendix A ships the full recipe for all 25 compound namespaces.

#### Migration Guide

**(1) Compound JSX → Named imports**

```tsx
// Before (v0.2.x)
import { Card } from '@7onic-ui/react'
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
</Card>

// After (v0.3.0)
import { Card, CardHeader, CardTitle } from '@7onic-ui/react'
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

**(1-b) Keep dot-notation — Compound Recipe (opt-in)**

```tsx
// user-project/lib/card.tsx
'use client'
import {
  Card as CardBase,
  CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter, CardImage, CardAction,
} from '@7onic-ui/react'

export const Card = Object.assign(CardBase, {
  Header: CardHeader, Title: CardTitle,
  Description: CardDescription, Content: CardContent,
  Footer: CardFooter, Image: CardImage, Action: CardAction,
})
// 'use client' required at the top — Client Components only.
```

Then `import { Card } from '@/lib/card'` reuses your existing dot-notation call sites. The same pattern applies to all 25 compound namespaces (see ADR Appendix A).

**(2) TypeScript namespace type access**

```ts
// Before
type T = Card.HeaderProps

// After
type T = CardHeaderProps
```

### Source & Refactor

- `src/components/ui/*.tsx` (24 compound files): `Object.assign`, `namespace X {}` blocks, and runtime `*Root` naming **all removed**. Each file is now shadcn-style Named-export-only.
- Docs (32 pages) + test-v4 (20 files): **5,600+** Compound JSX and type references rewritten to Named (via `scripts/phase4-rewrite.js`, kept as a durable artifact).
- Radix UI Dialog accessibility fix: added `DialogTitle` in Modal sidebar layout at 5 locations where it was missing.

### Fixed — generateCode per-branch minimal imports

- `scripts/fix-generatecode-imports.ts` added. Earlier Phase 4 rewrite replaced `<Card.Header />` with `<CardHeader />` but aggregated sub-component names as a file-wide union, so every `generateCode()` branch shipped the same maximal import list (e.g. Dropdown `menuType === 'simple'` imported 14 names while rendering only 5).
- Fix scans each branch's template literal (plus `${varname}` interpolations, e.g. pie-chart `patternConfig`), keeps exactly the identifiers that actually appear, and rewrites the import line.
- Result: **17 pages · 52 import lines · 119 unused names removed**. Verified with tsc `strict` + `noUnusedLocals` (pre-fix dropdown sample produced 9 TS6133 errors, post-fix produces 0).

### Fixed — Playground generateCode root refactor (structural 1:1 guarantee)

- Root cause of the earlier fix-generatecode-imports script's gap: the `lines.push('import ...')` pattern (30+ pages) hardcoded imports independently of the JSX body, so per-state correctness was a manual maintenance burden. New helper `src/lib/code-generator.ts` (`importUsed` / `extractUsedNames`) derives imports **from** the emitted JSX body — makes over-imports structurally impossible.
- All 42 component Playground pages refactored to the helper pattern. Every `generateCode()` now builds the JSX body first, then calls `importUsed(jsxBody, CANDIDATES, pkg)` so the resulting import line ships exactly the identifiers the JSX uses — no more, no less.
- Chart pages (`area-chart`, `bar-chart`, `line-chart`, `pie-chart`) had a separate critical bug in the same class: the hardcoded import was `{ Chart, type ChartConfig }` only, but the emitted JSX used 6–8 Chart sub-components (`ChartArea`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartXAxis`, `ChartYAxis`, etc.). Post-refactor these import lines auto-grow with the JSX.
- Additional static-CodeBlock under-import bugs fixed: `pagination` `use-pagination-hook.tsx` example was missing `useState` import; `typing-indicator` `ai-streaming.tsx` example had unused `useState`; `quick-reply` L556/L949 ComponentPreview/CodeBlock snippets were missing the 7onic-ui-react import for the QuickReply compound.

### Fixed — Verified by live browser audit

- `scripts/verify-playground-live.ts` + `scripts/verify-pages-live.ts` added. Opens each docs page via Playwright, exercises Playground tabs (JSX / Full / CLI) and ContentTabs Design / Code tabs, captures every `<pre><code>` block, and verifies that each `import { ... }` line's names appear as JSX tags or identifiers in the surrounding code. Also flags under-imports (JSX tags referencing compound names that aren't in any import).
- Final audit: **60 pages · 351+ import lines checked · 0 unused · 0 under-import**. Components (42), design-tokens (15), guidelines (3). tsc strict + noUnusedLocals compilation of sample JSX-tab outputs passes.

### Docs — Unnecessary information removed (AI optimization)

- `public/llms.txt` + `public/llms-full.txt` + `public/llms-cli.txt` + root `llms.txt`: dropped the "Compound Component Import Patterns" section (Pattern A/B + Client Manifest warning) and replaced it with a concise "Component Import" section plus a dedicated "Compound Recipe (opt-in self-wrapper)" section. **~47 lines shorter per file.**
- `messages/{ja,en,ko}.json`: deleted 21 orphan install keys (`usageDesc`, `namespaceNote`, `rscNote`, `standaloneNote`, `compat`, `namedExportNote`, `recommended`), rewrote **200 dot-notation strings to Named**, plus 24 locale-specific phrase rewrites.
- `app/[locale]/components/installation/page.tsx`: removed 6 stale blocks (Namespace card, `rscNote`, `standaloneNote`, `usageDesc`, `namedExportNote`) → collapsed to a single "Import & Usage" card.
- `CLAUDE.md` §Component Implementation Patterns: "Namespace Export (compound)" rule replaced by "Named Export single (v0.3.0+)".

### Architecture Decision Records

- New: `docs/decisions/NAMED-PRIMARY-MIGRATION.md` — covers Option D rationale, keep/remove verdicts, Appendix A with 25 compound Recipe snippets, and the rollback plan.
- Superseded: `docs/decisions/NAMESPACE-COMPOUND-EXPORT.md` — retained as a historical v0.2.x record.

### @7onic/cli

- `cli/src/registry/index.ts` regenerated (40 components, 0 namespace blocks, 8 internal deps).
- `cli/package.json`: 0.1.8 → 0.1.9 (registry sync).

### Rollback

If a critical issue surfaces after v0.3.0 publishes, revert the `latest` tag to v0.2.9 via `npm dist-tag add @7onic-ui/react@0.2.9 latest`. The registry commit, tag, and GitHub Release are preserved as historical records.

---

## [0.2.9] — 2026-04-22

### @7onic-ui/react

#### Fixed — Next.js App Router RSC compatibility

Previously, installing 7onic in a Next.js 15+/16 App Router project and importing from a Server Component failed with `TypeError: d.createContext is not a function`, because `dist/index.mjs` lacked a top-level `'use client'` directive and the barrel used `export *` (which React/Next.js cannot track across a client boundary). Named imports (`import { Card, CardHeader } from '@7onic-ui/react'`) now work inside Server Components out of the box, matching the behaviour of shadcn/ui, Radix Primitives, Chakra v3, and Mantine v7.

- `src/components/ui/index.ts`: add top-level `'use client'` directive; replace every `export * from './X'` with explicit `export { Named, … } from './X'` + `export type { … } from './X'` for types. Each of the 39 component files already carries `'use client'`, so per-component behaviour is unchanged — only the barrel was missing the directive.

Namespace/compound access (`<Card.Header />`) still cannot be used inside Server Components due to a React Client Manifest limitation around `Object.assign`-attached properties. Use Named imports in RSC; Namespace continues to work in Client Components. This is documented in `llms.txt` and the Installation page.

### Docs

- `public/llms.txt` + `public/llms-full.txt` + `public/llms-cli.txt` + `llms.txt` (root): expand Compound section into Pattern A (Namespace, Client Components) / Pattern B (Named, everywhere) with Next.js Server Components warning and rule of thumb.
- `scripts/generate-llms-cli.ts`: generator template updated so regenerated `llms-cli.txt` matches the new RSC guidance.
- `app/[locale]/components/installation`: replace the outdated *"add `'use client'` when consuming"* callout with a neutral note explaining that Namespace access falls back to Named Export inside Server Components.
- `messages/{ja,en,ko}.json`: remove the obsolete `nextjsNote` key, add the new `rscNote` copy.

### @7onic-ui/tokens

- Version synced to 0.2.9 (no functional changes).

---

## [0.2.8] — 2026-04-21

### @7onic-ui/react

#### Fixed — `llms.txt` Props defaults audit

Full source verification revealed 18 incorrect Props defaults, 9 missing Props/sub-tables, and 1 type mismatch in the bundled `llms.txt` AI guide. Component source code and deployed `dist/` were already correct — only the AI documentation was wrong, which misled AI tools generating user code.

**Fixed defaults (18)**:
- Accordion: `type` (`required` → `'single'`), `collapsible` (`false` → `true`)
- Breadcrumb: `separator` (`'/'` → `<ChevronRightIcon />`)
- ButtonGroup: `attached` (`false` → `true`)
- Dropdown.Content: `radius` (`'lg'` → `'md'`)
- MetricCard: `radius` (`'xl'` → `'default'`) with explicit 9-value options
- Modal.Content: `size` (`'md'` → `'sm'`), `scrollBehavior` (`'inside'` → `'outside'`)
- NavigationMenu: `radius` (`'default'` → `'lg'`)
- Popover.Content: `showArrow` (`false` → `true`)
- Slider: `showTooltip` (`'auto'` → `'never'`)
- Tabs.List: `radius` default (`'default'` → `'md'`), options expanded 6 → 9 values
- Toaster: `richColors` (`false` → `true`), `visibleToasts` (`3` → `5`)
- Tooltip.Content: `showArrow` (`false` → `true`), `sideOffset` (`4` → `6`)
- Pagination: `total` (`required` → `1`)

**Added Props (9)**:
- NavigationMenu: `delayDuration=200`, `skipDelayDuration=300`
- NavigationMenu.Item: `defaultOpen=false` (new sub-table)
- NavigationMenu.Indicator: `color='default'` (new sub-table)
- Pagination: `withControls=true`, `withEdges=false` + quick-mode example
- Textarea: `rows=4`
- Chart.Pie: `paddingAngle=0`, `cornerRadius=0`, `startAngle=90`, `endAngle=-270`, `innerRadius`
- Toaster: `offset=24`, `gap=8`
- Modal.Content: `closeIcon`
- TableCell: `align='left'` (new sub-table)

**Type correction (1)**:
- Avatar.Fallback: `colorized` type `boolean` → `string` (source: `colorized?: string`)

**Added section**: AlertModal full section with sub-components + usage example.

Files updated: `llms.txt` (shipped in npm package), `public/llms.txt`, `public/llms-full.txt`, `public/llms-cli.txt` (served on docs site).

### @7onic-ui/tokens

Version sync bump to keep parity with `@7onic-ui/react` per VERSIONING policy. No content changes.

---

## [0.2.7] — 2026-04-16

### @7onic-ui/react

#### Fixed
- `input.tsx`, `textarea.tsx`, `select.tsx` — add `outline-transparent` to prevent focus outline flash on Tailwind v4 (`transition-colors` now includes `outline-color`)
- `dropdown.tsx`, `select.tsx`, `modal.tsx`, `drawer.tsx`, `popover.tsx` — add `text-foreground` to Portal content containers for correct dark mode text color

---

## [0.2.6] — 2026-04-16

### @7onic-ui/react

#### Fixed
- `pagination.tsx` — `withControls` / `withEdges` props now work: when no `children` provided, auto-renders `Previous`/`Next` (withControls) and `First`/`Last` (withEdges) buttons. Compound mode (with children) is unchanged.

---

## [0.2.5] — 2026-04-15

### 7onic (CLI)

#### Fixed
- `init` — auto-configure `@/` path alias for Vite projects: patches `tsconfig.app.json` (JSONC-safe) and `vite.config.ts` (adds `import path` + `resolve.alias`), installs `@types/node` as devDep automatically

---

## [0.2.4] — 2026-04-15

### @7onic-ui/react

#### Fixed
- `card.tsx` — removed unused `sizePaddingMap` (caused `noUnusedLocals` error in Vite strict tsconfig)
- `pagination.tsx` — `withControls`/`withEdges` extracted via rest pattern (caused `noUnusedLocals` error in Vite strict tsconfig)
- `toast.tsx` — `isPaused` changed to `[, setIsPaused]` destructuring (caused `noUnusedLocals` error in Vite strict tsconfig)

### 7onic (CLI)

#### Fixed
- `init` — detect `@/` path alias in `tsconfig.app.json` (Vite split tsconfig support)
- `init` — auto-inject `@import "tailwindcss"` for Tailwind v4 (skip if already present)
- `init` — improved Vite-specific warning message with both `tsconfig.app.json` and `vite.config.ts` guidance
- `add` — auto-inject `@source` directive for Tailwind v4 CSS (relative path from CSS entry to components dir)
- `install-deps` — add `--ignore-engines` flag for yarn install compatibility

#### Added
- `tsconfig.strict-check.json` — consumer-environment tsc verification (`noUnusedLocals: true`)
- `smoke-test.sh` — release smoke test script; 3 environments (Next.js 15 + TW v4 / Vite + TW v4 / Vite + TW v3), 7 scenarios each (init → add → build); runs via `npm run smoke`, auto-runs in `prepublishOnly`

### Documentation

#### Added
- CLI page: Next.js / Vite framework selector in 7onic.json config example
- CLI page: Vite note card under init section (tsconfig.app.json detection + `@import "tailwindcss"` auto-inject)
- CLI page: Tailwind v4 + Vite note card under add section (`@source` auto-inject)
- CLI page: Added 4 AI components to Available Components list (`chat-input`, `chat-message`, `quick-reply`, `typing-indicator`)
- Token Installation Font tab: Japanese and Korean Fontsource `filename` now shows both Next.js and Vite paths
- `llms.txt`: Vite Fontsource font setup pattern + `@source` auto-inject note

---

## [0.2.3] — 2026-04-11

### @7onic-ui/react

#### Added
- `TypingIndicator` component — animated typing indicator with dots/cursor variants, 3 sizes, label support
- `QuickReply` component — quick reply chip list with icon support, 3 sizes, compound pattern (`QuickReply` + `QuickReply.Item`)
- `ChatInput` component — compound AI chat input with auto-resizing textarea, send/stop toggle, loading state, character count, 2 variants, 3 sizes, 6 radius options (`ChatInput` + `ChatInput.Field` + `ChatInput.Submit`)
- `ChatMessage` component — compound AI chat message display with assistant/user roles, bubble/flat variants, typing animation, 4 delivery status options, hover actions, 3 sizes, 4 radius options (`ChatMessage` + `ChatMessage.Avatar` + `ChatMessage.Content` + `ChatMessage.Footer`)

#### Fixed
- Documentation CSS examples: `@import` now correctly precedes `@tailwind` directives (CSS spec compliance)

#### Removed
- Unused `src/index.ts` barrel file (build entry is `src/components/ui/index.ts`)

### @7onic-ui/tokens

#### Added
- `spacing-3.5` (14px / `--spacing-3-5`) — completes the 2px sub-grid for the 0–14px range

---

## [0.2.2] — 2026-04-10

### @7onic-ui/react

#### Fixed
- `peerDependencies` — `@7onic-ui/tokens` range `^0.1.0` rejected tokens@0.2.x. Fixed to `>=0.1.0 <1.0.0`

### @7onic-ui/tokens
- Version synced to 0.2.2 (no functional changes)

---

## [0.2.1] — 2026-04-09

### @7onic-ui/react

#### Fixed
- `llms.txt` was shipping tokens-only guide instead of full component guide

### @7onic-ui/tokens
- Version synced to 0.2.1 (no functional changes)

---

## [0.2.0] — 2026-04-08

### @7onic-ui/react

#### Changed
- **[Breaking]** Chart components moved to separate entry point `@7onic-ui/react/chart`
  - Before: `import { Chart } from '@7onic-ui/react'`
  - After: `import { Chart } from '@7onic-ui/react/chart'`
  - Reason: `recharts` is optional — importing any component without recharts installed no longer crashes

#### Added
- Pre-publish validation script (`verify:publish`) — tests actual npm pack + install + import

### @7onic-ui/tokens
- Version synced to 0.2.0 (no functional changes)

### Migration Guide

```tsx
// Before (v0.1.x)
import { Button, Chart, type ChartConfig } from '@7onic-ui/react'

// After (v0.2.0) — Chart uses a separate entry point
import { Button } from '@7onic-ui/react'
import { Chart, type ChartConfig } from '@7onic-ui/react/chart'
```

Non-chart imports are unchanged:
```tsx
import { Button, Card, Input } from '@7onic-ui/react'  // works as before
```

---

## [0.1.1] — 2026-04-07

### @7onic-ui/react

#### Added
- **AI Integration**: `llms.txt` included in npm package (llms.txt standard)

### @7onic-ui/tokens

#### Added
- **AI Integration**: `llms.txt` included in npm package (llms.txt standard)

### Documentation

#### Added
- AI Integration pages (`/design-tokens/ai`, `/components/ai`)
- Setup guides for Claude Code, Cursor, GitHub Copilot, ChatGPT
- `llms.txt` entry in Installation page Package Contents

#### Changed
- README: added AI Integration section, updated AI-ready feature description

---

## [0.1.0] — 2026-04-04

Initial release of 7onic Design System.

### @7onic-ui/react

#### Components (38)
- **Form**: Button, IconButton, ButtonGroup, Toggle, ToggleGroup, Segmented, Checkbox, RadioGroup, Switch, Slider, Input, Textarea, Select, Dropdown
- **Data Display**: Avatar, Badge, Card, Table
- **Chart**: BarChart, LineChart, AreaChart, PieChart, MetricCard
- **Layout**: Divider
- **Overlay**: Modal, AlertModal, Drawer, Tooltip, Popover
- **Feedback**: Alert, Toast, Progress, Spinner, Skeleton
- **Navigation**: Breadcrumb, NavigationMenu, Pagination, Tabs, Accordion

#### Features
- Namespace Export pattern for 22 compound components (`Card.Header`, `Modal.Content`, etc.)
- Backward-compatible named exports maintained
- Radix UI Primitives + CVA + forwardRef + Controlled/Uncontrolled
- Default dark color (`bg-foreground`) across all components
- 5-step size scale: xs(28) / sm(32) / md(36) / default(40) / lg(48)

### @7onic-ui/tokens

#### Token Categories (18)
- Colors (72 primitive + semantic with text/tint)
- Typography (11 sizes), FontWeight (3), FontFamily (2)
- Spacing (18), BorderRadius (9), BorderWidth (5)
- Shadows (6), IconSizes (6), ZIndex (13), Opacity (21)
- Duration (8), Easing (5), Scale (4), Breakpoints (5)
- ComponentSize (12), Animation (54), SemanticTypography (20)

#### Features
- Automated token pipeline: `figma-tokens.json` → `sync-tokens` → 9 distribution files
- Tailwind v3/v4 dual support with full opacity modifier (`/50`) via RGB channels
- CSS variables, Tailwind v3 preset, Tailwind v4 theme, JS/ESM/TypeScript/JSON outputs
- CLI tool: `npx sync-tokens` (--input / --output / --dry-run / --force)
- Breaking change detection + deprecated alias generation
