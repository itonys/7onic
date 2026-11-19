# 7onic

CLI for the [7onic Design System](https://7onic.design) — an open-source React design system where design and code never drift.

It copies component source files into your project, so you own the code and can edit it freely.

**Documentation**: [7onic Design System — CLI](https://7onic.design/components/cli)

## Quick start

```bash
npx 7onic init
npx 7onic add button card input
```

## Commands

### `init`

Sets up 7onic in your project: creates `7onic.json`, installs base dependencies, and adds the token imports and the `cn()` utility. It detects Next.js or Vite, TypeScript, and your Tailwind version.

```bash
npx 7onic init
npx 7onic init --tailwind v3 --yes    # Explicit v3, skip prompts
npx 7onic init --claude               # Also install the AI Kit (.claude/ skills + design agent)
```

Requires a TypeScript project (`tsconfig.json`).

### `add`

Copies component `.tsx` files and installs the dependencies they need.

```bash
npx 7onic add <component...>    # Add specific components
npx 7onic add --all             # Add every component
npx 7onic add button --yes      # Skip confirmation prompt
npx 7onic add card --overwrite  # Overwrite existing files
```

Dependencies between components are resolved for you — for example, `add input` also copies `field.tsx`. The chart names `bar-chart`, `line-chart`, `area-chart`, and `pie-chart` all resolve to `chart`.

The exact steps change between versions. The [CLI page](https://7onic.design/components/cli) and the [installation page](https://7onic.design/components/installation) always describe the current behavior.

## Related packages

- [`@7onic-ui/react`](https://www.npmjs.com/package/@7onic-ui/react) — the same components as an npm package
- [`@7onic-ui/tokens`](https://www.npmjs.com/package/@7onic-ui/tokens) — design tokens

## Links

- Docs: [7onic Design System](https://7onic.design)
- Source: [github.com/itonys/7onic](https://github.com/itonys/7onic)
- Blog: [blog.7onic.design](https://blog.7onic.design)

## License

MIT
