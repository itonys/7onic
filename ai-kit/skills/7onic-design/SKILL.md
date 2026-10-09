---
name: 7onic-design
description: Build UI with the 7onic Design System the right way — guided workflow that drives the 7onic MCP tools (component discovery, token resolution, layout recipes, validate_code loop) from a plain-language request like "SaaS dashboard" or "pricing page". Queries work in English, Japanese, and Korean.
---

# 7onic Design — guided, validated UI building

Turn a request ("build a settings page", "SaaSダッシュボード", "가격 페이지")
into token-accurate 7onic code. This skill is an **orchestrator**: the
knowledge lives in the 7onic MCP server tools — your job is to call them
in the right order and refuse to hand over unvalidated code.

If the `7onic-design` MCP tools are not available, stop and have the user
install the plugin (`claude plugin install 7onic-design@7onic`) or wire
the server manually — do not improvise from memory.

## Step 0 — Scope the request

Break the request into screens/sections and list them back in the user's
language. For a multi-screen request, confirm the breakdown before
writing code (e.g. dashboard → layout shell / metric row / chart panel /
table). For a single component or section, skip the confirmation and go.

## Step 1 — Components first

For every UI element, discover before you write:

- `list_components` with a natural-language query (en/ja/ko all fine) —
  prefer a 7onic component over any hand-rolled HTML.
- `get_component` for props/variants/sizes of each component you will
  use — never guess a prop name or enum value.
- `get_component_examples` and copy the import lines **exactly** —
  named exports only, charts from `@7onic-ui/react/chart`.

## Step 2 — Tokens for everything visual

- `search_tokens` / `get_token` for colors, spacing, typography, shadows.
  Token NAMES are the API; values are user-configurable — never hardcode.
- About to write any raw value (hex color, px size, ms duration)?
  Call `suggest_tokens` first. If it returns an exact token, use the
  token class. If not, it returns a user-confirmation prompt — **relay
  that prompt and wait**; never bypass tokens silently.
- Semantic colors theme-switch automatically: no `dark:` prefixes.
  Typography tokens pair font-size with line-height: no `leading-*`.

## Step 3 — Layout

`get_layout_pattern` for the structural skeleton — symmetric grids,
reading column, section rhythm, element rows, inline groups. Grid system
is 4/8/12 columns (mobile/tablet/desktop); icon+text rows always use
`items-center`.

## Step 4 — Write, then validate (non-negotiable)

Write the code, then run `validate_code` on every file you produced:

1. errors > 0 → fix using the per-violation `fix` guidance and re-run.
   Repeat until `valid: true`.
2. Warnings: resolve them or tell the user which ones you kept and why.
3. A `ds-ignore` comment is allowed only for a value the user explicitly
   approved through the Step 2 confirmation prompt.

Only validated code reaches the user. Include in your final summary:
components used, tokens of note, and the final validate_code verdict.

## Quality bar

Responsive mobile-first (`md:`/`lg:` variants), dark-mode safe by
construction (semantic tokens only), accessible labels on icon-only
controls, user-facing copy in the user's language.
