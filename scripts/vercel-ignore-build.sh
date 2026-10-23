#!/usr/bin/env bash
# vercel-ignore-build.sh — Vercel "Ignored Build Step" (wired up in vercel.json).
#
# Exit 0 = skip the build, any other exit = build (Vercel treats 1 or greater as "build").
# Skip only when every file changed since the last successful deployment of this branch is
# internal documentation the docs site never reads: docs/, .claude/, CLAUDE.md.
# Anything else — including CHANGELOG.md, which the changelog page reads — builds.
# Whenever the decision cannot be made safely (no previous deployment, commit missing from
# Vercel's shallow clone, git error), build.

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

SITE_RELEVANT="$(printf '%s\n' "$CHANGED" | grep -v -E '^(docs/|\.claude/|CLAUDE\.md$)' || true)"

if [ -n "$SITE_RELEVANT" ]; then
  echo "vercel-ignore-build: site-relevant changes — building"
  printf '%s\n' "$SITE_RELEVANT" | head -20
  exit 1
fi

echo "vercel-ignore-build: only docs/, .claude/ or CLAUDE.md changed — skipping"
printf '%s\n' "$CHANGED" | head -20
exit 0
