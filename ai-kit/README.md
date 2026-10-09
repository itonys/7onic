# 7onic AI Kit

Claude Code plugin root for the 7onic Design System. One install wires up:

- the `7onic-design` **MCP server** — token search, component catalog,
  layout recipes, `validate_code` rule checking (en/ja/ko queries)
- **skills** — `/7onic-setup` (project detection, CSS wiring, health
  check) and `/7onic-design` (guided build workflow driving the MCP tools)
- the **7onic-design-agent** — delegated page/component builds that
  return only validate_code-clean TSX

```bash
claude plugin marketplace add itonys/7onic
claude plugin install 7onic-design@7onic
```

## Layout

- `.claude-plugin/plugin.json` — plugin manifest (MCP server + agent)
- `skills/7onic-setup`, `skills/7onic-design` — auto-discovered skills
- `agents/design-agent.md` — design implementation agent
- `mcp/dist`, `mcp/data`, `tokens` — symlinks into the repo; the plugin cache
  materializes them on install (~3 MB, no `npm install` involved)

Do NOT add a `package.json` here — `claude plugin install` would run
`npm ci` against it and pull dependencies into every consumer's cache.
The MCP server ships as a self-contained bundle (`mcp/dist`), built and
committed from `mcp/` — see `mcp/README.md`.

Docs: https://7onic.design/components/mcp
