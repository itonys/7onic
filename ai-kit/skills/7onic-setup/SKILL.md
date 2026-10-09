---
name: 7onic-setup
description: Detect, configure, and verify a project for the 7onic Design System — framework/Tailwind detection, token CSS wiring, and an idempotent health check. Run after installing @7onic-ui packages, after `npx 7onic init`, or whenever styles look wrong.
---

# 7onic Setup — detect, configure, verify

Bring the current project to a working 7onic state. This skill is
**idempotent**: when everything is already correct it changes nothing and
reports a passing checklist. Never guess — every verdict below must come
from reading the actual file.

## Step 1 — Detect the project

Read `package.json` and record:

- **Install route**:
  - `@7onic-ui/react` in dependencies → **npm route**
  - a `7onic.json` file at the root and/or components under the project's
    `components/ui/` → **CLI route** (`npx 7onic add` source copies)
  - neither → go to Step 4 (fresh install)
- **Tailwind major**: `tailwindcss` version — `^4` → v4, `^3` → v3.
  No Tailwind at all → tokens still work as plain CSS variables
  (`@7onic-ui/tokens/css/all.css`), but component classes need Tailwind:
  say so and stop after wiring the CSS.
- **Framework**: `next` → Next.js (global CSS usually `app/globals.css`),
  `vite` → Vite (usually `src/index.css`).
- `@7onic-ui/tokens` must be present on both routes — it ships the CSS
  variables everything depends on.

## Step 2 — Verify (and fix) the CSS wiring

Open the project's global CSS file and check against the matrix. Add only
what is missing; never duplicate an import that already exists.

**Tailwind v4**:

```css
@import "tailwindcss";
@import '@7onic-ui/tokens/tailwind/v4.css';

@source "../node_modules/@7onic-ui/react/dist";
```

- The `@source` path is relative to the CSS file — recompute it for the
  actual file location (npm route only; CLI-copied sources are scanned as
  normal project files).

**Tailwind v3** — CSS plus config:

```css
@import '@7onic-ui/tokens/css/all.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

`tailwind.config.js` must have the preset and, on the npm route, the dist
glob in `content`:

```js
presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],
content: ['./node_modules/@7onic-ui/react/dist/**/*.{js,mjs}', /* app globs */],
```

Notes that prevent common misdiagnoses:

- Body background/text/font come from the token CSS automatically
  (`html body` baseline inside `variables.css`) — do NOT add manual
  `body { ... }` rules or wrapper providers.
- Dark mode is automatic via CSS variables — never add `dark:` prefixed
  classes to compensate.
- `lucide-react` is NOT a 7onic dependency; 7onic components use inline
  SVG. Install it only if the user's own code imports it.

## Step 3 — Health check (always run, report as a checklist)

1. `@7onic-ui/tokens` resolvable and its CSS imported (Step 2 matrix).
2. Tailwind version matches the wiring style actually found.
3. npm route: `@source`/`content` covers `@7onic-ui/react/dist`.
4. A trivial render compiles: import `{ Button }` from
   `@7onic-ui/react` (npm) or the local `components/ui` path (CLI) and
   type-check or build.
5. If the 7onic MCP server is connected, finish with one
   `validate_code` call on an existing screen file to confirm the
   project's code follows the token rules.

Report each line as pass/fixed/action-needed with the file you read as
evidence. If all five pass untouched, say so explicitly — that is the
expected steady state.

## Step 4 — Nothing installed yet

Recommend exactly one of:

- `npx 7onic init` — detects framework/TS/Tailwind, installs base deps,
  wires the CSS automatically (then re-run this skill to verify), or
- manual npm route: `npm install @7onic-ui/react @7onic-ui/tokens` and
  apply Step 2.

Full reference: `node_modules/@7onic-ui/react/llms.txt` (npm route) or
https://7onic.design/components/installation
