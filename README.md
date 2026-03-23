# 7onic Design System

> 🚧 **Coming soon — releasing April 2026**

Bridging the gap between design and code — down to zero.

A design system combining beauty, consistency, and developer experience. Designed by a designer, built for developers.

---

## Features

- **Figma Token Sync** — Single source of truth. Change a token, everything updates automatically
- **Namespace + Named Exports** — Both `<Card.Header>` and `<CardHeader>` work. Use whichever you prefer
- **100% TypeScript** — Full type safety with IntelliSense support
- **Dark Mode Built-in** — Light/dark themes with system preference detection
- **Radix UI Primitives** — Accessible, keyboard-navigable components out of the box
- **Tailwind v3/v4 Dual Support** — Both versions supported via presets
- **AI-Optimized Development** — CLAUDE.md + consistent patterns enable AI to generate components accurately
- **Chart Components** — 5 chart types (Bar, Line, Area, Pie, MetricCard) with design token integration
- **Tokens-only Distribution** — Use CSS variables without Tailwind or React
- **Zero Runtime CSS** — No CSS-in-JS runtime overhead. Pure Tailwind classes

---

## Quick Start

### Components + Tokens

```bash
npm install @7onic-ui/react @7onic-ui/tokens
```

```tsx
// Standalone components
import { Button } from '@7onic-ui/react'

<Button variant="primary">Get Started</Button>

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

<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
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

## Components

| Category | Components | Status |
|----------|-----------|--------|
| **Forms** | Button, IconButton, ButtonGroup, Input, Textarea, Select, Dropdown, Checkbox, Radio, Switch, Toggle, ToggleGroup, Segmented, Slider | Ready |
| **Data Display** | Avatar, Badge, Card, Table | Ready |
| **Charts** | BarChart, LineChart, AreaChart, PieChart, MetricCard | Ready |
| **Layout** | Tabs, Accordion, Divider | Ready |
| **Overlay** | Modal, Drawer, Tooltip, Popover | Ready |
| **Feedback** | Alert, Toast, Progress, Spinner, Skeleton | Ready |
| **Navigation** | Breadcrumb, NavigationMenu, Pagination | Ready |
| **AI Components** | ChatMessage, ChatInput, TypingIndicator, QuickReply | Planned |

All components follow these patterns:
- CVA (class-variance-authority) for variant management
- Controlled & uncontrolled modes
- `forwardRef` for ref forwarding
- `'use client'` directive
- Namespace compound export (`Card.Header`) + backward-compatible named exports (`CardHeader`)

---

## Design Tokens

| Token | Values | Description |
|-------|--------|-------------|
| **Colors** | Semantic color system | Brand, status, text, background, border |
| **Typography** | 11 sizes (11px–72px) | CJK-optimized with `md`(14px) for UI, `base`(16px) for body |
| **Spacing** | 0–96px | 2px increments (0–12px), 4px increments (12px+) |
| **Radius** | 9 values (0–9999px) | `none` through `full` |
| **Shadows** | 6 primitives | `xs` through `xl`, plus `primary-glow` |
| **Duration** | 8 values (0–1000ms) | `instant`, `fast`, `micro`, `normal`, `slow`, `slower`, `slowest`, `spin` |
| **Easing** | 5 functions | `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` |
| **Z-Index** | 13 layers | `0` through `toast`(3000) |
| **Icon Sizes** | 6 sizes (12–32px) | `2xs`, `xs`, `sm`, `md`, `lg`, `xl` |
| **Opacity** | 21 values (0–1) | `0`, `5`, `10`, `15`...`95`, `100` |
| **Breakpoints** | 5 widths | `sm`(640) through `2xl`(1536) |
| **Border Width** | 5 values | `0`, `1`, `2`, `4`, `8` |
| **Scale** | 4 values | `50`(0.5), `75`(0.75), `95`(0.95), `pressed`(0.98) |
| **Animation** | 47 named (1:1) | `checkbox-enter`, `radio-enter`, `fade-in/out`, `modal-*`, `drawer-*` (8), `nav-viewport-*`, `accordion-*`, `collapsible-*`, `tooltip-*` (8), `popover-*` (8), `toast-*` (8), `spin` |

---

## Token Pipeline

```
figma-tokens.json               ← Single Source of Truth
    │
    │  npx sync-tokens
    │
    ├── css/variables.css        ← CSS Variables (all primitives)
    ├── css/themes/light.css     ← Light theme semantics
    ├── css/themes/dark.css      ← Dark theme semantics
    ├── css/all.css              ← CSS bundle (variables + light + dark)
    ├── tailwind/v3-preset.js    ← Tailwind v3 preset
    ├── tailwind/v4-theme.css    ← Tailwind v4 theme
    ├── tailwind/v4.css          ← Tailwind v4 bundle (theme + variables)
    ├── js/index.js + .mjs       ← JavaScript/ESM export
    ├── types/index.d.ts         ← TypeScript definitions
    └── json/tokens.json         ← JSON distribution

All above files are distributed to users via npm.
```

---

## Token Distribution

| Format | File | Use Case |
|--------|------|----------|
| **CSS Variables** | `css/variables.css` | Any project, no Tailwind needed |
| **CSS Bundle** | `css/all.css` | All-in-one CSS (variables + light + dark) |
| **Tailwind v3 Preset** | `tailwind/v3-preset.js` | Tailwind v3 projects |
| **Tailwind v4 Theme** | `tailwind/v4-theme.css` | Tailwind v4 projects |
| **Tailwind v4 Bundle** | `tailwind/v4.css` | All-in-one Tailwind v4 (theme + variables) |
| **JSON** | `json/tokens.json` | Flat JSON for custom tooling |
| **Figma Tokens** | `figma-tokens.json` | Figma Token Studio sync |
| **JavaScript** | `js/index.js` / `index.mjs` | CSS-in-JS, styled-components |
| **TypeScript** | `types/index.d.ts` | Type definitions |

---

## Documentation

The documentation site includes:

- **Design Tokens** — Colors, typography, spacing, shadows, radius, z-index, duration, easing, opacity, breakpoints, border-width, icon-sizes, scale, animation
- **Components** — Interactive playground, props table, code examples
- **Guidelines** — Accessibility, icons, Tailwind v3/v4 versions

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

- [x] Design token system (14 categories)
- [x] Token sync script (`npx sync-tokens`)
- [x] Tailwind v3/v4 dual preset generation
- [x] RGB channel variables for v3 semantic opacity modifier support (`bg-primary/50`)
- [x] Light/dark theme
- [x] Documentation site with interactive playgrounds
- [x] Core components — Forms (14), Data Display (4), Layout (3), Overlay (4), Feedback (5), Navigation (3), Charts (5)
- [x] npm package distribution setup
- [x] Namespace compound exports — `<Card.Header>` style with backward-compatible named exports
- [ ] Theme Customizer (live color preview)
- [ ] `npx 7onic add` CLI
- [ ] Figma UI Kit
- [ ] Dashboard / landing templates

---

## License

MIT

---

<p align="center">
  <strong>Bridging the gap between design and code — down to zero.</strong>
</p>
