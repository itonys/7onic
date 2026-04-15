#!/usr/bin/env bash
# ──────────────────────────────────────────────────────
# 7onic CLI Smoke Test
# Verifies CLI init/add/build in 3 consumer environments
# Usage: npm run smoke
# ──────────────────────────────────────────────────────

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="$ROOT/cli/dist/index.js"
TMP="$(mktemp -d)"

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

PASS=0
FAIL=0
RESULTS=()

SHOULD_CLEANUP=true
cleanup() { $SHOULD_CLEANUP && rm -rf "$TMP"; }
trap cleanup EXIT

# ── Helpers ──

run_step() {
  local desc="$1" log="$2"
  shift 2
  printf "  %-44s" "$desc..."
  if "$@" >> "$log" 2>&1; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    return 1
  fi
}

# ── Pre-check ──

echo -e "${BOLD}7onic CLI Smoke Test${NC}"
echo -e "${DIM}tmp: $TMP${NC}\n"

if [ ! -f "$CLI" ]; then
  echo -e "${RED}✗ CLI not built. Run: cd cli && npm run build${NC}"
  exit 1
fi

# ══════════════════════════════════════════════════════
# [A] Next.js 15 + App Router + TW v4
# ══════════════════════════════════════════════════════

test_nextjs_tw4() {
  local dir="$TMP/nextjs-tw4"
  local log="$TMP/nextjs-tw4.log"

  echo -e "${BOLD}[A] Next.js 15 + App Router + TW v4${NC}"

  cd "$TMP"
  run_step "Create Next.js project" "$log" \
    npx --yes create-next-app@latest "$dir" \
      --typescript --tailwind --eslint --app --src-dir \
      --import-alias "@/*" --use-npm --turbopack || return 1
  cd "$dir" || return 1

  run_step "CLI init" "$log" node "$CLI" init --yes || return 1
  run_step "CLI add (button card input)" "$log" node "$CLI" add button card input --yes || return 1
  run_step "CLI add (toast tooltip)" "$log" node "$CLI" add toast tooltip --yes || return 1
  run_step "CLI add (chart)" "$log" node "$CLI" add chart --yes || return 1
  run_step "CLI add --all --overwrite" "$log" node "$CLI" add --all --overwrite --yes || return 1
  run_step "Build" "$log" npm run build || return 1
}

# ══════════════════════════════════════════════════════
# [B] Vite + React + TS + TW v4
# ══════════════════════════════════════════════════════

test_vite_tw4() {
  local dir="$TMP/vite-tw4"
  local log="$TMP/vite-tw4.log"

  echo -e "\n${BOLD}[B] Vite + React + TS + TW v4${NC}"

  cd "$TMP"
  run_step "Create Vite project" "$log" \
    npm create vite@6 vite-tw4 -- --template react-ts || return 1
  cd "$dir" || return 1

  run_step "Install dependencies" "$log" npm install || return 1
  run_step "Install Tailwind v4" "$log" npm install tailwindcss @tailwindcss/vite || return 1
  run_step "Install @types/node" "$log" npm install -D @types/node || return 1

  # vite.config.ts — Tailwind plugin + path alias
  cat > vite.config.ts << 'CONF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
CONF

  # tsconfig.app.json — path alias (JSONC: strip comments + trailing commas)
  run_step "Configure path alias + vite" "$log" node -e "
    const fs = require('fs');
    const raw = fs.readFileSync('tsconfig.app.json', 'utf-8');
    const clean = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,(\s*[}\]])/g, '\$1');
    const tc = JSON.parse(clean);
    tc.compilerOptions.paths = { '@/*': ['./src/*'] };
    fs.writeFileSync('tsconfig.app.json', JSON.stringify(tc, null, 2));
  " || return 1

  run_step "CLI init" "$log" node "$CLI" init --yes || return 1
  run_step "CLI add (button card input)" "$log" node "$CLI" add button card input --yes || return 1
  run_step "CLI add (toast tooltip)" "$log" node "$CLI" add toast tooltip --yes || return 1
  run_step "CLI add (chart)" "$log" node "$CLI" add chart --yes || return 1
  run_step "CLI add --all --overwrite" "$log" node "$CLI" add --all --overwrite --yes || return 1
  run_step "Build (tsc -b + vite build)" "$log" npm run build || return 1
}

# ══════════════════════════════════════════════════════
# [C] Vite + React + TS + TW v3
# ══════════════════════════════════════════════════════

test_vite_tw3() {
  local dir="$TMP/vite-tw3"
  local log="$TMP/vite-tw3.log"

  echo -e "\n${BOLD}[C] Vite + React + TS + TW v3${NC}"

  cd "$TMP"
  run_step "Create Vite project" "$log" \
    npm create vite@6 vite-tw3 -- --template react-ts || return 1
  cd "$dir" || return 1

  run_step "Install dependencies" "$log" npm install || return 1
  run_step "Install Tailwind v3" "$log" npm install tailwindcss@3 postcss autoprefixer || return 1
  run_step "Install @types/node" "$log" npm install -D @types/node || return 1

  # vite.config.ts — path alias only (no tailwind plugin for v3)
  cat > vite.config.ts << 'CONF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
CONF

  # postcss.config.cjs — CJS required (Vite template has type: "module")
  cat > postcss.config.cjs << 'CONF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
CONF

  # tailwind.config.cjs — content paths + 7onic preset
  # @7onic-ui/tokens is installed by CLI init below
  cat > tailwind.config.cjs << 'CONF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('@7onic-ui/tokens/tailwind/v3-preset')],
  theme: { extend: {} },
  plugins: [],
}
CONF

  # tsconfig.app.json — path alias (JSONC: strip comments + trailing commas)
  run_step "Configure path alias + tailwind" "$log" node -e "
    const fs = require('fs');
    const raw = fs.readFileSync('tsconfig.app.json', 'utf-8');
    const clean = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,(\s*[}\]])/g, '\$1');
    const tc = JSON.parse(clean);
    tc.compilerOptions.paths = { '@/*': ['./src/*'] };
    fs.writeFileSync('tsconfig.app.json', JSON.stringify(tc, null, 2));
  " || return 1

  run_step "CLI init (TW v3)" "$log" node "$CLI" init --tailwind v3 --yes || return 1
  run_step "CLI add (button card input)" "$log" node "$CLI" add button card input --yes || return 1
  run_step "CLI add (toast tooltip)" "$log" node "$CLI" add toast tooltip --yes || return 1
  run_step "CLI add (chart)" "$log" node "$CLI" add chart --yes || return 1
  run_step "CLI add --all --overwrite" "$log" node "$CLI" add --all --overwrite --yes || return 1
  run_step "Build (tsc -b + vite build)" "$log" npm run build || return 1
}

# ── Run all environments ──

for env in nextjs_tw4 vite_tw4 vite_tw3; do
  if "test_$env"; then
    RESULTS+=("${GREEN}PASS${NC}")
    ((PASS++))
  else
    RESULTS+=("${RED}FAIL${NC}")
    ((FAIL++))
  fi
done

# ── Summary ──

echo -e "\n${BOLD}════════════════════════════════════════${NC}"
printf "[A] Next.js 15 + TW v4 ........... "
echo -e "${RESULTS[0]}"
printf "[B] Vite + TW v4 ................. "
echo -e "${RESULTS[1]}"
printf "[C] Vite + TW v3 ................. "
echo -e "${RESULTS[2]}"
echo -e "${BOLD}════════════════════════════════════════${NC}"

if [ "$FAIL" -gt 0 ]; then
  echo -e "\n${RED}✗ $FAIL environment(s) failed${NC}"
  echo -e "${DIM}Logs preserved at: $TMP${NC}"
  SHOULD_CLEANUP=false
  exit 1
fi

echo -e "\n${GREEN}✓ All $PASS environments passed${NC}"
exit 0
