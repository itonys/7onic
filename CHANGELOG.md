# Changelog

All notable changes to this project will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and uses synchronized versioning across `@7onic-ui/react` and `@7onic-ui/tokens`.

---

## [0.3.1] — 2026-04-23

> **Critical patch** — Fixes Next.js 15 + Vite framework template compatibility. All three issues were 100% reproducible on v0.3.0. Users on v0.3.0 should upgrade.

### @7onic-ui/react & @7onic-ui/tokens

#### Fixed

- **Next.js 15 + Tailwind v4 light/dark mode broken** — compiled CSS showed `.bg-background { background-color: var(--background) }` referencing Next.js template variable (OS dark mode forced `#0a0a0a`) instead of our token. `data-theme="light"` toggle was silently overridden. Fixed by `html:root` alias in `variables.css` — cascade specificity wins regardless of source order.
- **Vite + Tailwind v4/v3 body layout broken** — Vite template's `body { display: flex; place-items: center; min-width: 320px }` force-centered all content. Fixed by `html body` baseline in new `reset.css` — overrides with higher specificity.
- **Vite + Tailwind v3 UI not rendering** — CLI `CSS_V3_IMPORTS` was missing `@tailwind base/components/utilities` directives, so v3 generated zero utility classes. Fixed by adding directives to CLI v3 imports (see 7onic CLI 0.1.10).

#### Added

- `tokens/css/reset.css` — new bundled file. Framework template baseline. Applies `html body { background-color; color; display:block; place-items:initial; min-width:auto; margin:0 }`. Bundled into `all.css` and `tailwind/v4.css` — users importing either bundle automatically get the reset. Selector specificity `(0,0,2)` > `body` `(0,0,1)` wins over Vite/Next.js template defaults. **Override paths**: (1) Tailwind class on `<body>` — `.flex` `(0,1,0)` wins, (2) same-selector CSS after our import — source order wins, (3) skip bundle + import individual files for complete opt-out.
- `tokens/css/variables.css` — `html:root { --background: var(--color-background); --foreground: var(--color-foreground) }` alias block appended at end. Specificity `(0,1,1)` wins over Next.js default `:root { --background: #fff }` `(0,1,0)` without source order dependency. Makes Next.js's `@theme inline { --color-background: var(--background) }` convention automatically flow through our semantic tokens.
- `tokens/package.json` exports — `./css/reset.css` subpath export added.
- Distribution file count: **11 → 12** (reset.css added).

#### Changed

- `npx sync-tokens` (and internal `npm run sync-tokens`) now shows **per-file status** after generation: `(NEW)` for files created for the first time, `(updated)` for files whose content changed, `(unchanged)` for identical regenerations. Top-line summary also shows counts — `✅ sync-tokens complete: 1 new, 3 updated, 10 unchanged`. Makes v0.3.0 → v0.3.1 upgrade transparent (users see `reset.css (NEW)` + bundle files `(updated)`) and alerts users who modified generated files directly (against the "Never modify generated files" rule) before their changes get overwritten. Info-level log only — no prompt added (follows npm / cargo / pip convention for additive changes). Breaking Changes (W3 — removed or renamed CSS variables) still prompt `y/n` as before.
- `@7onic-ui/react` — no code changes; version bumped to maintain sync with `@7onic-ui/tokens`.

#### Architecture Decision

- New ADR `docs/decisions/NEXTJS-FRAMEWORK-COMPAT-STRATEGY.md` — documents the problem mechanism (`@theme inline` override cascade), 6 considered alternatives, chosen solution, 4-scenario CSS cascade proof, and industry comparison (shadcn/HeroUI/Radix/Mantine/Chakra/DaisyUI).

#### Why this is uniquely 7onic

- Industry first combination of 4 properties simultaneously: zero-config install (import → done), no React Provider wrapper, preserves user's `globals.css` (no file replacement), and standard Tailwind naming (`bg-background`, `text-foreground`). No existing library satisfies all four — shadcn wipes `globals.css`, HeroUI/Radix require Provider + namespaced vars, Mantine/Chakra use CSS-in-JS.

---

## [0.3.0] — 2026-04-22

### @7onic-ui/react & @7onic-ui/tokens

#### Breaking Changes

- Compound JSX removed — use Named imports. `<Card.Header />` → `<CardHeader />`
- TypeScript namespace types removed — `Card.HeaderProps` → `CardHeaderProps`
- Applies to all 25 compound namespaces (Card, Modal, Drawer, Tabs, Accordion, etc.)
- Rollback if needed: `npm dist-tag add @7onic-ui/react@0.2.9 latest`

#### Migration

- `import { Card, CardHeader, CardTitle } from '@7onic-ui/react'`
- `<Card><CardHeader><CardTitle>...</CardTitle></CardHeader></Card>`
- Prefer dot-notation? Add a 5-line Compound Recipe wrapper in your project (`'use client'` required). All 25 wrappers documented in the migration ADR

#### Why

- **Same behavior everywhere** — Named imports work identically in RSC, Client Components, Pages Router, Vite, CRA, CJS. Compound JSX previously broke inside Next.js App Router Server Components
- **Reliable tree-shaking** — Named exports map 1:1 to dead-code elimination; only the sub-components you import ship to the bundle
- **Simpler maintenance** — adding a sub-component is now one export, not three synchronized locations
- **AI-ready** — AI tools no longer randomly emit compound syntax that crashes in RSC

#### Source

- 24 compound component files rewritten as shadcn-style Named-export-only. No more `Object.assign`, `namespace X {}`, or runtime `*Root` aliases
- Radix Dialog accessibility fix: added `DialogTitle` to 5 Modal sidebar examples that were missing it

#### Fixed — Playground code output matches rendered JSX 1:1

- Playground previously shipped unused imports. Dropdown `simple` menu imported 14 sub-components while using only 5. Users who copy-pasted got `noUnusedLocals` warnings
- Import list now derived from the rendered JSX body at generation time. Generated code contains exactly the identifiers used — no more, no less
- All 42 Playground pages refactored to this pattern. Over-imports are now structurally impossible
- Chart pages had a mirror bug in the other direction — hardcoded `{ Chart }` only, but rendered 6–8 sub-components. Imports now auto-grow with the JSX
- Static example fixes: `pagination` `usePagination` hook missing `useState`; `typing-indicator` had unused `useState`; `quick-reply` icon / FAQ examples missing the 7onic import

#### Verified

- End-to-end browser audit opens every docs page in Playwright, exercises the Playground tabs (JSX / Full / CLI) and the Code tab, captures every code block, and checks every `import` line against the surrounding code
- **60 pages · 351+ import lines checked · 0 unused · 0 under-import**
- Sample outputs compile cleanly with tsc `strict` + `noUnusedLocals`

#### Docs cleanup

- Root `llms.txt` + `public/llms*.txt`: replaced the old "Compound Import Patterns" section with a concise "Component Import" + opt-in "Compound Recipe" section. ~47 lines shorter per file
- Locale JSON files: removed 21 obsolete install keys, rewrote 200 dot-notation strings to Named, plus 24 locale-specific phrase updates
- Installation docs: collapsed into a single "Import & Usage" card

#### Architecture Decision Records

- New ADR: Named-Primary Migration — covers the rationale, keep/remove decisions, and all 25 Compound Recipe snippets
- Previous ADR "Namespace Compound Export" marked Superseded (kept as v0.2.x historical record)

### @7onic/cli

#### Changed

- Registry regenerated from the v0.3.0 Named-export source (40 components, 0 namespace blocks, 8 internal deps)
- Added `repository` / `bugs` / `homepage` fields to cli/package.json for npm provenance

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
