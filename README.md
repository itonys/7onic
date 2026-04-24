<h1 align="center"><a href="https://7onic.design">7onic Design System</a></h1>

<p align="center">
  <strong>Just take a look. Don't say I didn't warn you.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@7onic-ui/react"><img src="https://img.shields.io/npm/v/@7onic-ui/react?color=37D8E6&label=react" alt="npm react" /></a>
  <a href="https://www.npmjs.com/package/@7onic-ui/tokens"><img src="https://img.shields.io/npm/v/@7onic-ui/tokens?color=37D8E6&label=tokens" alt="npm tokens" /></a>
  <a href="https://www.npmjs.com/package/7onic"><img src="https://img.shields.io/npm/v/7onic?color=37D8E6&label=cli" alt="npm cli" /></a>
  <a href="https://github.com/itonys/7onic/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://7onic.design"><img src="https://img.shields.io/badge/docs-7onic.design-black" alt="Documentation" /></a>
</p>

<p align="center">
  Open-source React design system where design and code never drift.<br>
  Single source of truth from Figma tokens, designer-verified components on Radix UI.
</p>

---

## Why 7onic?

| | What | Why it matters |
|:---:|---|---|
| **🎯** | **Zero design-code drift** | Design and code from a single vision. No handoff, no drift — every component is pixel-verified against Figma. |
| **📦** | **One JSON, every format** | `figma-tokens.json` auto-generates CSS, Tailwind v3, Tailwind v4, JS/TS, and JSON — all in sync. |
| **🧩** | **shadcn freedom + MUI convenience** | shadcn's customization with none of its missing features. MUI's built-in power with none of its styling constraints. Both, by design. |
| **⚡** | **npm or CLI — your choice** | `npm install` for packages, `npx 7onic add` for local copy. Same components, two workflows. |
| **🔀** | **Only Tailwind v3+v4 dual support** | The ecosystem's only design system supporting both Tailwind versions. Same tokens, same DX. |
| **🪄** | **Framework-aware setup** | Next.js 15 works out of the box. `npx 7onic init` auto-cleans Vite template boilerplate (or delete a few blocks manually). No Provider wrapper, no `globals.css` replacement, no body class setup. |
| **🎮** | **Built-in playground** | Interactive props editor + live code generation in docs. No Storybook setup needed. |
| **🌗** | **Dark mode, zero config** | Light/dark themes built into tokens. System preference detection out of the box. |
| **🔓** | **Framework-agnostic tokens** | Tokens ship as pure CSS variables. Use with Vue, Angular, Svelte, or vanilla CSS — no React required. |
| **🤖** | **AI-ready** | Ships with `llms.txt` — AI builds with design tokens, not hardcoded values. Zero config for Claude, Cursor, Copilot. |
| **🌏** | **CJK-first typography** | Type scale tuned for Japanese kanji, Korean hangul, and Latin — not an afterthought. |
| **🔐** | **Supply chain verified** | Cryptographically signed releases (npm provenance), automated vulnerability scanning in CI, reproducible builds. You can verify every package came from this exact GitHub commit — not a hijacked account. |
| **🔥** | **Relentlessly updated** | Actively maintained with continuous research, refinement, and new features. Not abandoned — ever. |

---

## Get Started

**Option A — npm package**

```bash
npm install @7onic-ui/react @7onic-ui/tokens
```

**Option B — CLI (local file copy)**

```bash
npx 7onic init
npx 7onic add button card input
```

<details>
<summary><strong>Tailwind v4</strong></summary>

```css
@import "tailwindcss";
@import '@7onic-ui/tokens/tailwind/v4.css';
@source "../node_modules/@7onic-ui/react/dist";
```
</details>

<details>
<summary><strong>Tailwind v3</strong></summary>

```css
@import '@7onic-ui/tokens/css/all.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
// tailwind.config.js
module.exports = {
  presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],
  content: ['./node_modules/@7onic-ui/react/dist/**/*.{js,mjs}'],
}
```
</details>

<details>
<summary><strong>CSS only (no Tailwind, no React)</strong></summary>

```css
@import '@7onic-ui/tokens/css/all.css';

.button {
  background: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```
</details>

Use components:

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@7onic-ui/react'
import { Chart, type ChartConfig } from '@7onic-ui/react/chart'  // charts: separate entry

<Button variant="solid" color="primary">Get Started</Button>

<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

---

## Components

| Category | Components | Count |
|----------|-----------|:-----:|
| **Forms** | Button, IconButton, ButtonGroup, Input, Textarea, Select, Dropdown, Checkbox, RadioGroup, Switch, Toggle, ToggleGroup, Segmented, Slider | 14 |
| **Data Display** | Avatar, Badge, Card, Table | 4 |
| **Charts** | BarChart, LineChart, AreaChart, PieChart, MetricCard | 5 |
| **Layout** | Tabs, Accordion, Divider | 3 |
| **Overlay** | Modal, Drawer, Tooltip, Popover | 4 |
| **Feedback** | Alert, Toast, Progress, Spinner, Skeleton | 5 |
| **Navigation** | Breadcrumb, NavigationMenu, Pagination | 3 |
| **AI** | TypingIndicator, QuickReply, ChatInput, ChatMessage | 4 |

**42 components** — all with CVA variants, controlled + uncontrolled modes, `forwardRef`, and **Named exports** (`CardHeader`, `ModalContent`, `TabsList`, ...). If you prefer dot-notation (`<Card.Header>`), drop in a [Compound Recipe wrapper](docs/decisions/NAMED-PRIMARY-MIGRATION.md) — opt-in, Client Components only.

---

## Design Tokens — 14 Categories

| Token | Values | Description |
|-------|--------|-------------|
| **Colors** | Semantic system | Brand, status, text, background, border |
| **Typography** | 11 sizes (11–72px) | CJK-optimized: `md`(14px) for UI, `base`(16px) for body |
| **Spacing** | 19 values (0–96px) | 2px steps (0–14px), 4px steps (16px+) |
| **Radius** | 9 values | `none` through `full` |
| **Shadows** | 6 primitives | `xs` through `xl` + `primary-glow` |
| **Duration** | 8 values | `instant` through `spin` |
| **Easing** | 5 functions | `linear` through `ease-in-out` |
| **Z-Index** | 13 layers | `0` through `toast`(3000) |
| **Icon Sizes** | 6 sizes (12–32px) | `2xs` through `xl` |
| **Opacity** | 21 values | 5% increments |
| **Animation** | 54 keyframes | Component enter/exit, spin, skeleton, progress |
| **Breakpoints** | 5 widths | `sm`(640) through `2xl`(1536) |
| **Border Width** | 5 values | `0`, `1`, `2`, `4`, `8` |
| **Scale** | 4 values | `50`, `75`, `95`, `pressed`(0.98) |

---

## Token Pipeline

```
figma-tokens.json                    ← SSOT (the only file you edit)
    │
    │  npx sync-tokens
    │
    ├── css/variables.css            ← CSS variables + framework baseline (html body reset)
    ├── css/themes/light.css         ← Light theme semantics
    ├── css/themes/dark.css          ← Dark theme semantics
    ├── css/all.css                  ← All-in-one bundle
    ├── tailwind/v3-preset.js        ← Tailwind v3 preset
    ├── tailwind/v4-theme.css        ← Tailwind v4 theme
    ├── tailwind/v4.css              ← Tailwind v4 bundle
    ├── js/index.js + .mjs           ← JavaScript / ESM
    ├── types/index.d.ts             ← TypeScript definitions
    └── json/tokens.json             ← Flat JSON
```

Breaking changes are auto-detected with diff visualization. Backward-compatible aliases generated automatically.

<details>
<summary><strong>Package structure</strong></summary>

### `@7onic-ui/react`

| File | Format | Description |
|------|--------|-------------|
| `dist/index.js` | CJS | CommonJS for Node.js / require() |
| `dist/index.mjs` | ESM | ES Modules for bundlers / import |
| `dist/index.d.ts` | Types | TypeScript definitions |
| `dist/chart.js` | CJS | Chart components (separate entry — `@7onic-ui/react/chart`) |
| `dist/chart.mjs` | ESM | Chart components ESM |
| `dist/chart.d.ts` | Types | Chart TypeScript definitions |
| `llms.txt` | Text | AI integration rules (llms.txt standard) |

### `@7onic-ui/tokens`

| File | Description |
|------|-------------|
| `css/all.css` | All-in-one bundle (variables + light + dark) |
| `css/variables.css` | Primitive tokens + framework baseline (`html body` reset) |
| `css/themes/light.css` | Light theme semantics |
| `css/themes/dark.css` | Dark theme semantics |
| `tailwind/v4.css` | All-in-one Tailwind v4 |
| `tailwind/v3-preset.js` | Tailwind v3 preset |
| `tailwind/v4-theme.css` | Tailwind v4 theme definitions |
| `js/index.js` | CJS export |
| `js/index.mjs` | ESM export |
| `types/index.d.ts` | TypeScript definitions |
| `json/tokens.json` | Flat JSON for custom tooling |
| `cli/sync.js` | `npx sync-tokens` CLI |
| `figma-tokens.json` | SSOT — the only file you edit |
| `llms.txt` | AI integration rules for tokens |

### `7onic` (CLI)

| File | Description |
|------|-------------|
| `dist/index.js` | Self-contained CLI bundle |
| `llms.txt` | AI integration — CLI command reference |

</details>

---

## AI Integration

7onic ships with `llms.txt` — an open standard that lets AI tools build with design tokens instead of hardcoded values.

```
# In CLAUDE.md, .cursor/rules, or copilot-instructions.md
Rules: node_modules/@7onic-ui/react/llms.txt
```

Once loaded, AI automatically uses `bg-primary` instead of `bg-blue-500`, spacing tokens instead of arbitrary pixels, and skips unnecessary `dark:` prefixes.

Works with Claude Code, Cursor, GitHub Copilot, ChatGPT, and any AI tool that reads text files.

**Setup guides**: [Tokens](https://7onic.design/design-tokens/ai) · [Components](https://7onic.design/components/ai)

---

## Tech Stack

| Category | Technology |
|---|---|
| **Styling** | Tailwind CSS v3 / v4 + CSS Variables |
| **Primitives** | Radix UI |
| **Charts** | Recharts |
| **Variants** | class-variance-authority (CVA) |

---

## Roadmap

- [x] Design token system (14 categories, 54 animations)
- [x] Token sync script with breaking change detection
- [x] Tailwind v3/v4 dual preset + RGB channel opacity support
- [x] Light/dark theme with OS auto-detection
- [x] 42 components with Named exports (Compound Recipe available for opt-in dot-notation)
- [x] Documentation site with interactive playgrounds
- [x] Chart components included (Bar, Line, Area, Pie, MetricCard)
- [x] Automated doc verification (8 checks, AST-powered, blocks publish on error)
- [x] Automated component verification (7 checks — hardcoded colors, tokens, dark mode, dead code)
- [x] Multilingual documentation — English, Japanese, Korean (powered by next-intl)
- [x] npm package distribution — `@7onic-ui/react` + `@7onic-ui/tokens` v0.3.3
- [x] AI integration — `llms.txt` standard, setup guides for Claude Code / Cursor / Copilot / ChatGPT
- [x] `npx 7onic add` CLI (shadcn-style) — source copy with dependency resolution
- [x] `npx 7onic init` Vite support — `tsconfig.app.json` detection, `@import "tailwindcss"` + `@source` auto-inject, `@/` path alias auto-configure
- [x] Technical blog — [blog.7onic.design](https://blog.7onic.design) ("Design to Code" series)
- [x] Enterprise-grade supply chain security — cryptographically signed releases (npm provenance), automated vulnerability scanning on every build, reproducible installs. Protection against npm package hijacking attacks (like the 2026 axios incident)
- [ ] Theme Customizer — live palette preview + CSS variable export
- [ ] Figma UI Kit
- [ ] Dashboard / landing templates

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

> 7onic is a solo project — your star or kind word genuinely helps. ⭐

---

## License

MIT

---

<p align="center">
  <strong>One JSON, every format — from Figma to production.</strong><br>
  Independently built.<br>
  <sub>Last updated: 2026-04-24 (v0.3.3)</sub>
</p>
