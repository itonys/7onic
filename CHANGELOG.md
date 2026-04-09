# Changelog

All notable changes to this project will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and uses synchronized versioning across `@7onic-ui/react` and `@7onic-ui/tokens`.

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
