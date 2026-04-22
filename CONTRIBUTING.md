# Contributing to 7onic

Thank you for your interest in contributing! PRs are welcome for bug fixes, improvements, and new features.

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run checks: `npm run typecheck && npm run build:lib`
5. Submit a PR — [CodeRabbit](https://coderabbit.ai) will automatically review it

## Code Style

### Design Tokens — No Hardcoding

All visual values must come from design tokens. Never use raw values.

| Property | Use | Don't use |
|----------|-----|-----------|
| Colors | `bg-primary`, `text-foreground` | `bg-gray-500`, `text-[#333]` |
| Spacing | `p-4`, `gap-2`, `m-6` | `p-[17px]`, `m-[13px]` |
| Font size | `text-sm`, `text-base` | `text-[13px]`, `text-[15px]` |
| Font weight | `font-normal`, `font-semibold`, `font-bold` | `font-medium`, `font-[500]` |
| Border radius | `rounded-md`, `rounded-lg` | `rounded-[7px]` |
| Icon size | `icon-sm`, `icon-md`, `icon-lg` | `w-4 h-4`, `w-[16px]` |
| Z-index | `z-modal`, `z-dropdown` | `z-[999]`, `z-50` |
| Duration | `duration-fast`, `duration-normal` | `duration-150`, `duration-[175ms]` |

### Component Patterns

Components follow these conventions:

- **Radix UI Primitives** as base (where applicable)
- **CVA** (class-variance-authority) for variant management
- **`forwardRef`** on all components
- **`'use client'`** directive at top
- **Controlled + Uncontrolled** support
- **Named exports** for all components and sub-components (v0.3.0+):
  ```tsx
  // Each sub-component is its own named export
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@7onic-ui/react'
  ```
  Compound JSX (`<Card.Header>`) is not emitted by the library. Users who prefer dot-notation can add a 5-line Compound Recipe wrapper in their own project. See `docs/decisions/NAMED-PRIMARY-MIGRATION.md`.

### Font Weight

Only three weights are available in our token system:

- `font-normal` (400)
- `font-semibold` (600)
- `font-bold` (700)

`font-medium` (500) is **not** a valid token.

### Icon Sizes

Use the 6-step icon size scale:

| Class | Size | Use case |
|-------|------|----------|
| `icon-2xs` | 12px | Badge icons |
| `icon-xs` | 14px | xs/sm buttons |
| `icon-sm` | 16px | Default buttons, form elements |
| `icon-md` | 20px | IconButton, navigation |
| `icon-lg` | 24px | Large icons, cards |
| `icon-xl` | 32px | Hero sections |

## Token Exceptions

Some hardcoded values are intentionally allowed (SVG attributes, Recharts numeric props, etc.). These are documented in the codebase. If you need a new exception, explain the reason in your PR.

## What to Expect

1. **CodeRabbit** will review your PR automatically
2. A maintainer will review and provide feedback
3. Once approved, your PR will be merged

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
