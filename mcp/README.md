# @7onic-ui/mcp

MCP (Model Context Protocol) stdio server for the 7onic Design System.
Gives AI coding agents live access to design tokens, the component catalog,
layout recipes, and mechanical design-rule validation — with queries and
violation messages in English, Japanese, and Korean.

## Install

**Claude Code (recommended)** — one command, ~3 MB, no `npm install`:

```bash
claude plugin marketplace add itonys/7onic && claude plugin install 7onic-design@7onic
```

**Other MCP clients** — the bundle is committed, nothing to build (Node 20+):

```json
{
  "mcpServers": {
    "7onic-design": {
      "command": "node",
      "args": ["/path/to/7onic/mcp/dist/index.js"]
    }
  }
}
```

Docs: https://7onic.design/components/mcp

## What it provides

- **Tools (9)** — `search_tokens` / `get_token` / `suggest_tokens` (nearest
  token for raw hex/px/ms values, with a user-confirmation protocol),
  `list_components` / `get_component` / `get_component_examples` (41 internal
  records; the public catalog counts 42 — charts split into 4, utilities
  excluded), `get_layout_pattern`, `validate_code` (14 rules, en/ja/ko
  messages, `ds-ignore` suppression), `get_guidelines`
- **Resources (3)** — `design://7onic/{rules/core,tokens/cheatsheet,components/catalog}`
- **Prompt (1)** — `create_prototype` (guided discovery → tokens → layout → validate loop)

## Layout

| Path | Role |
|---|---|
| `src/server.ts` | All MCP SDK touchpoints (isolated for SDK migrations) |
| `src/data/` | Runtime token loader + committed-artifact loader (mtime caches) |
| `src/search/` | fuse.js indexes + Japanese/Korean query aliases |
| `src/validate/` | `validate_code` engine (@babel/parser AST) + trilingual messages |
| `scripts/` | `build-data` (llms-full → data/), `verify-drift`, `verify-validate`, `e2e` |
| `data/` | Committed build-data artifacts — **never edit by hand**, regenerate |
| `dist/` | Committed self-contained bundles (tsup, no runtime deps needed) |

## Verification gates

```bash
npm run build-data        # regenerate data/ from ../public/llms-full.txt
npm run verify-drift      # 4-way: llms ↔ src exports ↔ CVA/unions ↔ CLI registry (+ sourceHash freshness)
npm run verify-validate   # 14 forbidden-pattern fixtures + all llms examples sweep (0 errors required)
npm run e2e               # 5 stdio scenarios (form/dashboard/settings/table/notifications), 100% detection required
```

`verify-drift` + `verify-validate` also run from the repo root as
`npm run verify:mcp`, which is part of the root `prepublishOnly` chain.
They execute the committed `dist/` bundles, so they work without
`mcp/node_modules`.

## Supply chain

Dependencies are minimal and pinned by lockfile: `@modelcontextprotocol/sdk`,
`zod`, `fuse.js`, `culori`, `@babel/parser`. Policy: `.npmrc ignore-scripts`,
`npm ci` only, new versions observe a 3-day publish cooldown, `npm audit`
must stay at 0, and `dist/` is committed so consumers never install anything.
