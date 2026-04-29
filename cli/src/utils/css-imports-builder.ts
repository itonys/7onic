/**
 * CSS imports builder.
 *
 * Per CLI-INIT-SCENARIOS ADR §7 — single source of truth for the CSS
 * lines we inject. v4 uses the `tailwind/v4.css` all-in-one bundle
 * (variables + themes + v4-theme), so no separate `variables.css`
 * import is needed.
 */

const TOKENS = '@7onic-ui/tokens'

const TOKEN_IMPORTS = {
  3: [`@import '${TOKENS}/css/all.css';`],
  4: [`@import '${TOKENS}/tailwind/v4.css';`],
} as const

const TAILWIND_LINES = {
  3: ['@tailwind base;', '@tailwind components;', '@tailwind utilities;'],
  4: [`@import "tailwindcss";`],
} as const

interface BuildOptions {
  version: 3 | 4
  /** Whether to include the Tailwind directive(s)/import. */
  includeTailwind: boolean
}

function joinSections(sections: ReadonlyArray<readonly string[]>): string {
  return sections.map(s => s.join('\n')).join('\n\n') + '\n'
}

/**
 * Build the CSS lines to write (or inject) for a given Tailwind version.
 * v4 layout: `@import "tailwindcss"` first, then tokens (Tailwind v4 spec).
 * v3 layout: tokens first, then `@tailwind` directives.
 */
export function buildCssImports({ version, includeTailwind }: BuildOptions): string {
  const tokens = TOKEN_IMPORTS[version]
  if (!includeTailwind) return joinSections([tokens])
  const tailwind = TAILWIND_LINES[version]
  return joinSections(version === 4 ? [tailwind, tokens] : [tokens, tailwind])
}

/** Required token import lines for a version. Used to detect partial existing state. */
export function requiredTokenImports(version: 3 | 4): readonly string[] {
  return TOKEN_IMPORTS[version]
}
