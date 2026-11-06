#!/usr/bin/env bash
# vercel-ignore-build.sh — Vercel "Ignored Build Step" (wired up in vercel.json).
#
# Exit 0 = skip the build, any other exit = build (Vercel treats 1 or greater as "build").
# Skip only when every file changed since the last successful deployment of this branch is one
# the docs site never reads (SKIP_PATHS below, plus cli/ except cli/CHANGELOG.md and
# cli/package.json). Anything else builds — app/, src/, messages/, public/, tokens/, CHANGELOG.md,
# package files and config.
# Whenever the decision cannot be made safely (no previous deployment, commit missing from
# Vercel's shallow clone, git error), build.
#
# KEEP IN SYNC: the site reads files outside app/ and src/ only through
#   - app/[locale]/changelog/page.tsx  → CHANGELOG.md, cli/CHANGELOG.md (fs)
#   - src/site.config.ts               → cli/package.json, package.json
#   - tokens/**                        → globals.css, tailwind.config.ts, design-tokens pages
# If the site starts reading anything under a SKIP_PATHS folder (for example mcp/data) or adds a
# prebuild step that runs scripts/, remove that path from SKIP_PATHS — otherwise a push touching
# only that path leaves the live site stale. Type errors in scripts/ are still caught by CI
# (.github/workflows/ci.yml runs next build).

set -u

BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [ -z "$BASE" ]; then
  echo "vercel-ignore-build: no previous deployment for this branch — building"
  exit 1
fi

if ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "vercel-ignore-build: previous deployment ${BASE} not in the clone — building"
  exit 1
fi

if ! CHANGED="$(git diff --name-only "$BASE" HEAD)"; then
  echo "vercel-ignore-build: git diff failed — building"
  exit 1
fi

if [ -z "$CHANGED" ]; then
  echo "vercel-ignore-build: no file changes (redeploy) — building"
  exit 1
fi

# Paths the docs site never reads (see KEEP IN SYNC above)
SKIP_PATHS='^(docs/|\.claude/|CLAUDE\.md$|mcp/|ai-kit/|test-v4/|scripts/|\.github/|\.cursor/|\.claude-plugin/|\.coderabbit\.yaml$|README\.md$|CONTRIBUTING\.md$|.*\.(test|spec)\.[jt]sx?$)'
# cli/ is the CLI package; the site reads only its CHANGELOG.md and package.json (version badge)
CLI_SITE_FILES='^cli/(CHANGELOG\.md|package\.json)$'

SITE_RELEVANT="$(printf '%s\n' "$CHANGED" | grep -v -E "$SKIP_PATHS" | grep -v -E '^cli/' || true)"
SITE_RELEVANT="${SITE_RELEVANT}$(printf '%s\n' "$CHANGED" | grep -E "$CLI_SITE_FILES" || true)"

if [ -n "$SITE_RELEVANT" ]; then
  echo "vercel-ignore-build: site-relevant changes — building"
  printf '%s\n' "$SITE_RELEVANT" | head -20
  exit 1
fi

echo "vercel-ignore-build: only paths the site never reads changed — skipping"
printf '%s\n' "$CHANGED" | head -20
exit 0
