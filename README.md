<h1 align="center"><a href="https://7onic.design">7onic Design System</a></h1>

<p align="center">
  <strong>Just take a look. Don't say I didn't warn you.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@7onic-ui/react"><img src="https://img.shields.io/npm/v/@7onic-ui/react?color=37D8E6&label=react" alt="npm react" /></a>
  <a href="https://www.npmjs.com/package/@7onic-ui/tokens"><img src="https://img.shields.io/npm/v/@7onic-ui/tokens?color=37D8E6&label=tokens" alt="npm tokens" /></a>
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
| **🎯** | **Zero design-code drift** | One person designs in Figma and codes in React. No handoff, no miscommunication, no drift. |
| **📦** | **One JSON, every format** | `figma-tokens.json` auto-generates CSS, Tailwind v3, Tailwind v4, JS/TS, and JSON — all in sync. |
| **🧩** | **shadcn freedom + MUI convenience** | Built-in `loading`, `leftIcon`, `pressEffect`, `Field` — no DIY. Override anything with `className`. |
| **🔀** | **Only Tailwind v3+v4 dual support** | The ecosystem's only design system supporting both Tailwind versions. Same tokens, same DX. |
| **🎮** | **Built-in playground** | Interactive props editor + live code generation in docs. No Storybook setup needed. |
| **🌗** | **Dark mode, zero config** | Light/dark themes built into tokens. System preference detection out of the box. |
| **🔓** | **Framework-agnostic tokens** | Tokens ship as pure CSS variables. Use with Vue, Angular, Svelte, or vanilla CSS — no React required. |
| **🤖** | **AI-optimized** | Predictable token names and component patterns. Claude, Copilot, Cursor just work. |
| **🌏** | **CJK-first typography** | Type scale tuned for Japanese kanji, Korean hangul, and Latin — not an afterthought. |
| **🔥** | **Relentlessly updated** | Actively maintained with continuous research, refinement, and new features. Not abandoned — ever. |

---

## Get Started

```bash
npm install @7onic-ui/react @7onic-ui/tokens
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
@tailwind base;
@tailwind components;
@tailwind utilities;
@import '@7onic-ui/tokens/css/all.css';
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

Apply base theme colors to `<body>` — enables dark mode and consistent backgrounds:

```html
<body class="bg-background text-foreground">
```

Use components:

```tsx
import { Button, Card } from '@7onic-ui/react'

<Button variant="solid" color="primary">Get Started</Button>

<Card>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Content>...</Card.Content>
</Card>
```

---

## Components

| Category | Components | Count |
|----------|-----------|:-----:|
| **Forms** | Button, IconButton, ButtonGroup, Input, Textarea, Select, Dropdown, Checkbox, Radio, Switch, Toggle, ToggleGroup, Segmented, Slider | 14 |
| **Data Display** | Avatar, Badge, Card, Table | 4 |
| **Charts** | BarChart, LineChart, AreaChart, PieChart, MetricCard | 5 |
| **Layout** | Tabs, Accordion, Divider | 3 |
| **Overlay** | Modal, Drawer, Tooltip, Popover | 4 |
| **Feedback** | Alert, Toast, Progress, Spinner, Skeleton | 5 |
| **Navigation** | Breadcrumb, NavigationMenu, Pagination | 3 |

**38 components** — all with CVA variants, controlled + uncontrolled modes, `forwardRef`, namespace exports (`Card.Header`) + named exports (`CardHeader`).

---

## Design Tokens — 14 Categories

| Token | Values | Description |
|-------|--------|-------------|
| **Colors** | Semantic system | Brand, status, text, background, border |
| **Typography** | 11 sizes (11–72px) | CJK-optimized: `md`(14px) for UI, `base`(16px) for body |
| **Spacing** | 18 values (0–96px) | 2px steps (0–12px), 4px steps (12px+) |
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
    ├── css/variables.css            ← CSS variables (all primitives)
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

### `@7onic-ui/tokens`

| File | Description |
|------|-------------|
| `css/all.css` | All-in-one bundle (variables + light + dark) |
| `css/variables.css` | Primitive tokens only |
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

</details>

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 14 + React 18 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v3 / v4 + CSS Variables |
| **Primitives** | Radix UI |
| **Charts** | Recharts |
| **Tokens** | Figma Token Studio → `sync-tokens` |
| **Variants** | class-variance-authority (CVA) |
| **Build** | tsup (library), Next.js (docs) |

---

## Roadmap

- [x] Design token system (14 categories, 54 animations)
- [x] Token sync script with breaking change detection
- [x] Tailwind v3/v4 dual preset + RGB channel opacity support
- [x] Light/dark theme with OS auto-detection
- [x] 38 components with namespace compound exports
- [x] Documentation site with interactive playgrounds
- [x] Chart components included (Bar, Line, Area, Pie, MetricCard)
- [x] Automated doc verification (8 checks, AST-powered, blocks publish on error)
- [x] Automated component verification (7 checks — hardcoded colors, tokens, dark mode, dead code)
- [x] Multilingual documentation — English, Japanese, Korean (powered by next-intl)
- [x] npm package distribution — `@7onic-ui/react` + `@7onic-ui/tokens` v0.1.0
- [ ] Theme Customizer (live color preview)
- [ ] `npx 7onic add` CLI (shadcn-style)
- [ ] Figma UI Kit
- [ ] Dashboard / landing templates
- [ ] AI integration guide — `llms.txt` hosting + tool-specific rule files (Claude / Cursor / Copilot)

---

## Contact

hello@7onic.io

## License

MIT

---

<p align="center">
  <strong>One JSON, every format — from Figma to production.</strong><br>
  Independently built.
</p>
