# [7onic Design System](https://7onic.design)

> **🚀 First npm release coming April 2026**

One JSON, every format. AI-optimized design system with Figma-synced token pipeline — accessible React components on Radix UI, and the ecosystem's only Tailwind v3+v4 dual support.

---

## Features

- **Figma-Synced Token Pipeline** — Single source of truth. One JSON powers CSS, Tailwind, JS, and TypeScript
- **Only Tailwind v3+v4 Dual Support** — The ecosystem's only design system supporting both versions
- **AI-Optimized Components** — Structured for AI coding tools (Claude, Copilot) with predictable patterns
- **Namespace + Named Exports** — Both `<Card.Header>` and `<CardHeader>` work. Use whichever you prefer
- **100% TypeScript** — Full type safety with IntelliSense support
- **Dark Mode Built-in** — Light/dark themes with system preference detection
- **Radix UI Primitives** — Accessible, keyboard-navigable components out of the box
- **Charts Included** — Bar, Line, Area, Pie, MetricCard with design token integration
- **Tokens-only Distribution** — Use CSS variables without Tailwind or React
- **Zero Runtime CSS** — No CSS-in-JS runtime overhead. Pure Tailwind classes
- **Multilingual** — English, Japanese, Korean with automatic locale detection

---

## Quick Start

### Components + Tokens

```bash
npm install @7onic-ui/react @7onic-ui/tokens
```

```tsx
// Standalone components
import { Button } from '@7onic-ui/react'

<Button>Get Started</Button>
<Button variant="solid" color="primary">Primary</Button>

// Compound components — namespace (recommended)
import { Card } from '@7onic-ui/react'

<Card>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Content>...</Card.Content>
</Card>

// Compound components — named exports (also supported)
import { Card, CardHeader, CardTitle, CardContent } from '@7onic-ui/react'
```

#### Tailwind v4

```css
@import "tailwindcss";

@import '@7onic-ui/tokens/tailwind/v4.css';

@source "../node_modules/@7onic-ui/react/dist";
```

#### Tailwind v3

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
  content: [
    './node_modules/@7onic-ui/react/dist/**/*.{js,mjs}',
  ],
}
```

#### Body Style

```html
<body class="bg-background text-foreground">
```

<br>

### Tokens Only

```bash
npm install @7onic-ui/tokens
```

#### Tailwind v4

```css
@import "tailwindcss";

@import '@7onic-ui/tokens/tailwind/v4.css';
```

#### Tailwind v3

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
}
```

#### CSS Only

```css
@import '@7onic-ui/tokens/css/all.css';

.button {
  background: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

#### JavaScript / TypeScript

```ts
import { colors, spacing, typography } from '@7onic-ui/tokens'
```

---

## Package Structure

### `@7onic-ui/react` — Component Library

| File | Format | Description |
|------|--------|-------------|
| `dist/index.js` | CJS | CommonJS for Node.js / require() |
| `dist/index.mjs` | ESM | ES Modules for bundlers / import |
| `dist/index.d.ts` | Types | TypeScript definitions |

```ts
import { Button, Card, Modal } from '@7onic-ui/react'
```

### `@7onic-ui/tokens` — Design Tokens

**CSS Variables** — Use with any framework or vanilla CSS

| File | Description |
|------|-------------|
| `css/all.css` | All-in-one bundle (variables + light + dark) ⭐ |
| `css/variables.css` | Primitive tokens only |
| `css/themes/light.css` | Light theme semantics |
| `css/themes/dark.css` | Dark theme semantics |

**Tailwind Presets** — Drop-in presets for v3 and v4

| File | Description |
|------|-------------|
| `tailwind/v4.css` | All-in-one Tailwind v4 (theme + variables) ⭐ |
| `tailwind/v3-preset.js` | Tailwind v3 preset for `tailwind.config.js` |
| `tailwind/v4-theme.css` | Tailwind v4 `@theme` definitions |

**JavaScript / TypeScript / JSON**

| File | Description |
|------|-------------|
| `js/index.js` | CJS export |
| `js/index.mjs` | ESM export |
| `types/index.d.ts` | TypeScript definitions |
| `json/tokens.json` | Flat JSON for custom tooling |

**CLI**

| File | Description |
|------|-------------|
| `cli/sync.js` | `npx sync-tokens` — regenerate all files from source |
| `figma-tokens.json` | **SSOT** — the only file you edit |

> All 9 distribution files + 2 convenience bundles are auto-generated from `figma-tokens.json` via `npx sync-tokens`.

---

## Components

| Category | Components | Count |
|----------|-----------|:-----:|
| **Forms** | Button, IconButton, ButtonGroup, Input, Textarea, Select, Dropdown, Checkbox, Radio, Switch, Toggle, ToggleGroup, Segmented, Slider | 14 |
| **Data Display** | Avatar, Badge, Card, Table | 4 |
| **Chart** | BarChart, LineChart, AreaChart, PieChart, MetricCard | 5 |
| **Layout** | Tabs, Accordion, Divider | 3 |
| **Overlay** | Modal, Drawer, Tooltip, Popover | 4 |
| **Feedback** | Alert, Toast, Progress, Spinner, Skeleton | 5 |
| **Navigation** | Breadcrumb, NavigationMenu, Pagination | 3 |

**38 components** ready. All follow these patterns:

- CVA (class-variance-authority) for variant management
- Controlled & uncontrolled modes
- `forwardRef` for ref forwarding
- `'use client'` directive
- Namespace compound export (`Card.Header`) + backward-compatible named exports (`CardHeader`)

---

## Design Tokens

| Token | Values | Description |
|-------|--------|-------------|
| **Colors** | Semantic system | Brand, status, text, background, border |
| **Typography** | 11 sizes (11–72px) | CJK-optimized: `md`(14px) for UI, `base`(16px) for body |
| **Spacing** | 18 values (0–96px) | 2px steps (0–12px), 4px steps (12px+) |
| **Radius** | 9 values (0–9999px) | `none` through `full` |
| **Shadows** | 6 primitives | `xs` through `xl` + `primary-glow` |
| **Duration** | 8 values (0–1000ms) | `instant` through `spin` |
| **Easing** | 5 functions | `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` |
| **Z-Index** | 13 layers | `0` through `toast`(3000) |
| **Icon Sizes** | 6 sizes (12–32px) | `2xs` through `xl` |
| **Opacity** | 21 values (0–1) | 5% increments |
| **Animation** | 54 named (1:1) | Component enter/exit, spin, skeleton, progress |
| **Breakpoints** | 5 widths | `sm`(640) through `2xl`(1536) |
| **Border Width** | 5 values | `0`, `1`, `2`, `4`, `8` |
| **Scale** | 4 values | `50`, `75`, `95`, `pressed`(0.98) |

---

## Token Pipeline

```
figma-tokens.json                    ← SSOT (only file you edit)
    │
    │  npx sync-tokens
    │
    ├── css/variables.css            ← CSS variables (all primitives)
    ├── css/themes/light.css         ← Light theme semantics
    ├── css/themes/dark.css          ← Dark theme semantics
    ├── css/all.css                  ← Bundle (variables + light + dark)
    ├── tailwind/v3-preset.js        ← Tailwind v3 preset
    ├── tailwind/v4-theme.css        ← Tailwind v4 theme
    ├── tailwind/v4.css              ← Bundle (theme + variables)
    ├── js/index.js + .mjs           ← JavaScript / ESM
    ├── types/index.d.ts             ← TypeScript definitions
    └── json/tokens.json             ← Flat JSON
```

CLI supports `--dry-run`, `--force`, `--input`, `--output` flags. Breaking changes are auto-detected with diff visualization and backward-compatible aliases.

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
- [x] Multilingual documentation — English, Japanese, Korean (powered by next-intl, in progress)
- [ ] npm package distribution (April 2026)
- [ ] Theme Customizer (live color preview)
- [ ] `npx 7onic add` CLI (shadcn-style)
- [ ] Figma UI Kit
- [ ] Dashboard / landing templates
- [ ] AI integration guide — `llms.txt` hosting + tool-specific rule files (Claude / Cursor / Copilot)
- [ ] `/7onic-demo` Claude Code skill — build a full service with zero hardcoding, guided setup

---

## License

MIT

---

<p align="center">
  <strong>One JSON, every format — from Figma to production.</strong>
</p>
