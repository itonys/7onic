# @7onic-ui/tokens

Design tokens for the [7onic Design System](https://7onic.design) — an open-source React design system where design and code never drift.

One `figma-tokens.json` generates CSS variables, Tailwind v3 and v4 presets, JavaScript, TypeScript types, and flat JSON, all in sync. The tokens ship as plain CSS variables, so they work with React, Vue, Angular, Svelte, or vanilla CSS.

**Documentation**: [7onic Design System — Design Tokens](https://7onic.design/design-tokens)

## Install

```bash
npm install @7onic-ui/tokens
```

## Usage

**Tailwind v4**

```css
@import "tailwindcss";
@import '@7onic-ui/tokens/tailwind/v4.css';
```

**Tailwind v3**

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
}
```

**CSS only (no Tailwind)**

```css
@import '@7onic-ui/tokens/css/all.css';

.button {
  background: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

Light and dark themes are built in and follow the system preference by default.

## What's inside

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
| `figma-tokens.json` | Source of truth — the only file you edit |
| `llms.txt` | AI integration rules for tokens |

## Token categories

Colors, typography, spacing, radius, shadows, duration, easing, z-index, icon sizes, opacity, animation, breakpoints, border width, and scale — 14 categories. Each one is documented with live previews at [7onic.design/design-tokens](https://7onic.design/design-tokens).

## Related packages

- [`@7onic-ui/react`](https://www.npmjs.com/package/@7onic-ui/react) — React components built on these tokens
- [`7onic`](https://www.npmjs.com/package/7onic) — CLI that copies component source into your project

## Links

- Docs: [7onic Design System](https://7onic.design)
- Source: [github.com/itonys/7onic](https://github.com/itonys/7onic)
- Blog: [blog.7onic.design](https://blog.7onic.design)

## License

MIT
