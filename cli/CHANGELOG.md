# Changelog — 7onic CLI

All notable changes to the `7onic` CLI package will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/).

## [0.1.9] — 2026-04-22

### 7onic

#### Changed

- `registry` — regenerated from the `@7onic-ui/react` v0.3.0 source refactor. All 40 component source files copied by `7onic add` now use Named exports only: zero `Object.assign` blocks, zero `namespace X {}` TypeScript merges, zero runtime `*Root` naming. Sub-components (`CardHeader`, `ModalContent`, `TabsList`, etc.) remain as individual Named exports, so `7onic add card` produces a shadcn-style transparent source file.
- Synced with `@7onic-ui/react` 0.3.0 Named-Primary migration.

---

## [0.1.8] — 2026-04-16

### 7onic

#### Fixed
- `registry` — add `outline-transparent` to Input/Textarea/Select (Tailwind v4 focus flash fix)
- `registry` — add `text-foreground` to Portal content containers: Dropdown, Select, Modal, Drawer, Popover (dark mode text color fix)

---

## [0.1.7] — 2026-04-16

### 7onic

#### Changed
- `registry` — updated `Pagination` component: `withControls`/`withEdges` props now auto-render Previous/Next and First/Last buttons when no `children` are provided (compound mode unchanged)

---

## [0.1.6] — 2026-04-15

### 7onic

#### Fixed
- `init` — auto-configure `@/` path alias for Vite projects: patches `tsconfig.app.json` (JSONC-safe) and `vite.config.ts` (adds `import path` + `resolve.alias`), installs `@types/node` as devDep

---

## [0.1.5] — 2026-04-15

### 7onic

#### Added
- `init` — auto-inject `@import "tailwindcss"` into CSS file for Tailwind v4 (skipped if already present)
- `add` — auto-inject `@source` directive for Tailwind v4 CSS (relative path from CSS entry to components dir)
- `smoke-test.sh` — release smoke test script: 3 environments (Next.js 15 + TW v4 / Vite + TW v4 / Vite + TW v3), 7 scenarios each (init → add → build)
- `npm run smoke` script + `prepublishOnly` auto-run

#### Fixed
- `init` — detect `@/` path alias in `tsconfig.app.json` (Vite split-tsconfig support)
- `init` — improved Vite-specific warning with both `tsconfig.app.json` and `vite.config.ts` guidance
- `install-deps` — add `--ignore-engines` flag for yarn compatibility

---

## [0.1.4] — 2026-04-11

### 7onic

#### Added
- `typing-indicator`, `quick-reply`, `chat-input`, `chat-message` — 4 AI components available via `7onic add`
- `chat-message` auto-installs `avatar` + `typing-indicator` as registry dependencies

#### Fixed
- `--version` now auto-reads from package.json (no more hardcoded version string)

---

## [0.1.3] — 2026-04-10

### 7onic

#### Added
- `--tailwind v3|v4` flag for `init` command — explicit Tailwind version selection in non-interactive mode
- Warning on invalid `--tailwind` value instead of silent fallback
- Full `--help` documentation for all `init` and `add` options

---

## [0.1.2] — 2026-04-10

### 7onic

#### Fixed
- `init` now installs `lucide-react` as base dependency
- `--version` flag now shows correct version (was hardcoded to 0.1.0)

#### Added
- Convenience aliases: `radio` → `radio-group`, `nav` → `navigation-menu`, `dropdown-menu` → `dropdown`

---

## [0.1.1] — 2026-04-10

### 7onic

#### Fixed
- `init` now installs `lucide-react` as base dependency

---

## [0.1.0] — 2026-04-09

### 7onic

#### Added
- **`npx 7onic init`** — project initialization (Tailwind v3/v4 detection, base deps, CSS token imports, cn() utility, 7onic.json)
- **`npx 7onic add <component...>`** — copy component source files with dependency resolution
- Topological dependency resolution (e.g., `add input` → input + field)
- button-group reverse dependency (e.g., `add button-group` → also adds button)
- Chart aliases (`pie-chart` → `chart`)
- `--all` flag with recharts opt-out prompt
- `--yes` / `--overwrite` flags for non-interactive usage
- Toast / Tooltip post-install setup hints
- Package manager auto-detection (npm/pnpm/yarn/bun)
- Typo suggestions for unknown component names
- `llms.txt` included in package (AI tool integration)
- JSON Schema for `7onic.json` at `https://7onic.design/schema/7onic.json`
