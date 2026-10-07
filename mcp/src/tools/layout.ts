// get_layout_pattern (Phase 3): curated responsive layout recipes.
// No llms-full source exists for layout archetypes — recipes are curated
// here, restricted to structural utilities + token classes. Token-scale
// classes are validated against the Phase 1 whitelist at runtime so token
// renames surface as a warning instead of silently drifting.
import { z } from 'zod'
import { loadDesignData } from '../data/loader.js'

const LAYOUT_TYPES = ['symmetric', 'reading', 'section', 'element', 'inline'] as const

interface Recipe {
  label: string
  classes: string
  usage: string
}

const PATTERNS: Record<(typeof LAYOUT_TYPES)[number], { description: string; recipes: Recipe[] }> = {
  symmetric: {
    description: 'Equal-weight columns that stack on mobile (mobile-first, token gaps).',
    recipes: [
      { label: '2-column', classes: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6', usage: 'Two cards / form halves' },
      { label: '3-column', classes: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6', usage: 'Card grid, feature list' },
      { label: '12-column canvas', classes: 'grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4', usage: 'Dashboard canvas — place children with col-span-* (4 mobile / 8 tablet / 12 desktop)' },
    ],
  },
  reading: {
    description: 'Single centered prose column with a comfortable measure.',
    recipes: [
      { label: 'prose column', classes: 'mx-auto w-full max-w-3xl px-4 md:px-6', usage: 'Article, docs page body' },
      { label: 'prose flow', classes: 'space-y-4', usage: 'Paragraph rhythm inside the column' },
    ],
  },
  section: {
    description: 'Page-level section wrapper with vertical rhythm.',
    recipes: [
      { label: 'section padding', classes: 'py-12 md:py-16', usage: 'Top-level page section' },
      { label: 'section content', classes: 'space-y-6', usage: 'Blocks inside a section' },
      { label: 'section heading', classes: 'space-y-2', usage: 'Title + description pair' },
    ],
  },
  element: {
    description: 'Component-level composition (always items-center for icon/text rows).',
    recipes: [
      { label: 'vertical stack', classes: 'flex flex-col gap-2', usage: 'Label + control + helper' },
      { label: 'horizontal row', classes: 'flex items-center gap-2', usage: 'Icon + text, button rows — NEVER items-start with manual mt-* nudges' },
      { label: 'form field', classes: 'flex flex-col gap-1.5', usage: 'Use the Field component when label/error handling is needed' },
      { label: 'space-between row', classes: 'flex items-center justify-between gap-4', usage: 'Card header with action' },
    ],
  },
  inline: {
    description: 'Inline-level grouping inside text or table cells.',
    recipes: [
      { label: 'badge + text', classes: 'inline-flex items-center gap-1', usage: 'Status badge next to a label' },
      { label: 'icon + label', classes: 'inline-flex items-center gap-2', usage: 'Inline icon with text (icon-sm/icon-xs sizing)' },
    ],
  },
}

// Token-scale classes missing from the live whitelist. Structural utilities
// (flex, grid-cols-N) and -auto suffixed classes are exempt (whitelist rule #3).
function validateRecipes(whitelist: Set<string>): string[] {
  const tokenScale = /^(-?(p|px|py|pt|pr|pb|pl|m|mx|my|gap|gap-x|gap-y|space-x|space-y)-|text-|rounded|shadow-|duration-|icon-)/
  const invalid: string[] = []
  for (const { recipes } of Object.values(PATTERNS)) {
    for (const r of recipes) {
      for (const cls of r.classes.split(/\s+/)) {
        const bare = cls.replace(/^(sm|md|lg|xl|2xl):/, '')
        if (bare.endsWith('-auto')) continue
        if (tokenScale.test(bare) && !whitelist.has(bare)) invalid.push(cls)
      }
    }
  }
  return invalid
}

export const getLayoutPatternSchema = {
  type: z.enum(LAYOUT_TYPES).describe('Layout archetype: symmetric (equal columns) / reading (prose column) / section (page rhythm) / element (component composition) / inline (in-text grouping)'),
  context: z.string().optional().describe('What is being laid out, e.g. "dashboard cards", "login form"'),
}

export function getLayoutPattern(args: { type: (typeof LAYOUT_TYPES)[number]; context?: string }) {
  const data = loadDesignData()
  const invalid = validateRecipes(new Set(data.whitelist.classes))
  const pattern = PATTERNS[args.type]
  return {
    type: args.type,
    ...(args.context ? { context: args.context } : {}),
    description: pattern.description,
    recipes: pattern.recipes,
    grid: 'Column system: 4 (mobile) / 8 (tablet, md:) / 12 (desktop, lg:). Breakpoints are token-defined: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536.',
    rules: 'Structural utilities only + token spacing (gap-*, p-*, space-y-*). No arbitrary values except h-[]/w-[] layout dimensions. Icon/text rows always use items-center.',
    ...(invalid.length > 0
      ? { warning: `Recipe classes missing from the current token whitelist: ${invalid.join(', ')} — tokens may have been renamed.` }
      : {}),
  }
}
