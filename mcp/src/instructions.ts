// Server instructions + create_prototype prompt text (Phase 5).
// Instructions are built from rules.json at startup so the rule summary can
// never drift from the llms SECTION 1 source; a static fallback keeps the
// server bootable if the data artifacts are unreachable.
import { loadRules, loadComponents } from './data/artifacts.js'

const FALLBACK = [
  '7onic Design System MCP server — the designer–engineer bridge: Figma tokens are the single',
  'source of truth, so code written with token classes never drifts from the design.',
  'Use list_components/get_component before writing JSX, search_tokens/suggest_tokens before',
  'any raw value, and ALWAYS run validate_code on generated TSX before returning it.',
].join(' ')

export function buildInstructions(): string {
  try {
    const { rules } = loadRules()
    const { count } = loadComponents()
    const whitelist = rules.whitelist.map((w) => `${w.num}) ${w.title}`).join(' · ')
    return [
      '# 7onic Design System server',
      '',
      '7onic is a designer–engineer bridge: Figma design tokens are the single source of truth,',
      'flowing as the SAME names from Figma through CSS variables into Tailwind classes and',
      `${count} React components. Code written with token classes never drifts from the design.`,
      '',
      '## Workflow (always in this order)',
      `1. Components first — list_components / get_component / get_component_examples (${count} components; queries accept English, Japanese, Korean).`,
      '2. Tokens for everything visual — search_tokens / get_token. Token NAMES are the API; values are user-configurable. Never hardcode a value.',
      '3. About to write a raw value (hex, px, ms)? Call suggest_tokens — if no exact token exists it returns the user-confirmation prompt you MUST relay before bypassing tokens.',
      '4. Layout — get_layout_pattern (4/8/12 column grid, token gaps, items-center for icon/text rows).',
      '5. ALWAYS validate_code on the generated TSX before returning it; fix every error and re-validate. Guidance by topic: get_guidelines.',
      '',
      `## Allowed classes (whitelist): ${whitelist}.`,
      'Everything else is forbidden — notably raw palette colors (semantic-first), dark: prefixes',
      '(semantic tokens theme-switch automatically), arbitrary values except layout h-[]/w-[],',
      'leading-* (typography tokens pair font-size with line-height), inline styles, and native',
      '<button>/<input>/<table> where a 7onic component exists.',
    ].join('\n')
  } catch {
    return FALLBACK
  }
}

export function createPrototypePrompt(brief: string, locale?: string): string {
  const lang = locale === 'ja' ? 'Japanese' : locale === 'ko' ? 'Korean' : 'English'
  return [
    `Build a 7onic Design System prototype for: ${brief}`,
    '',
    `Write user-facing copy in ${lang}. Follow this exact workflow:`,
    '',
    '1. Break the brief into screens/sections, then for each UI element call list_components',
    '   (fuzzy, multilingual) to find the 7onic component — never hand-roll HTML that a',
    '   component covers.',
    '2. For every component you will use, call get_component (props/variants/sizes) and',
    '   get_component_examples, and copy the import lines exactly as shown.',
    '3. Compose the page with get_layout_pattern recipes (section → symmetric/reading →',
    '   element). Icon/text rows always use items-center.',
    '4. Style ONLY with token classes (search_tokens). If the brief implies a raw value',
    '   (brand hex, specific px), call suggest_tokens and follow its guidance — ask the user',
    '   before bypassing tokens, never bypass silently.',
    '5. Run validate_code on the finished TSX. Fix every error, re-run until valid, and only',
    '   then return the code. Mention any warnings you intentionally kept.',
    '',
    'Prototype quality bar: responsive (mobile-first, md:/lg: variants), dark-mode safe',
    '(semantic tokens only — no dark: prefix), accessible labels on icon-only controls.',
  ].join('\n')
}
