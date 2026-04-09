# Changelog — 7onic CLI

All notable changes to the `7onic` CLI package will be documented in this file.

This project follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

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

#### Added
- Convenience aliases: `radio` → `radio-group`, `nav` → `navigation-menu`, `dropdown-menu` → `dropdown`

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
