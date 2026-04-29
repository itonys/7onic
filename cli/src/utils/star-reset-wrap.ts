/**
 * `*` reset → `@layer base { ... }` wrapping.
 *
 * Per CLI-INIT-SCENARIOS ADR §9 — Next.js 14/15 default globals.css ships
 * a top-level `* { box-sizing; padding: 0; margin: 0 }` rule that wins
 * the cascade against Tailwind v4's layered base utilities, breaking
 * component padding/margin. Wrapping the rule in `@layer base { }`
 * subordinates it to native cascade layers and lets utilities win.
 *
 * Detection: top-level standalone `*` rules only. Already-layered `*`
 * rules (`@layer base { * { ... } }`, `@layer utilities { * { ... } }`)
 * and complex selectors (`*::before`, `.foo *`, `:where(*)`) are skipped.
 *
 * Idempotent — re-running on already-wrapped CSS is a no-op.
 */
import postcss, { type Rule } from 'postcss'

export interface StarWrapResult {
  /** Number of top-level `*` rules wrapped. 0 = no-op. */
  wrappedCount: number
  /** Modified CSS (== input when `wrappedCount === 0`). */
  output: string
}

/** Detect whether a rule's selector is a single, standalone `*`. */
function isStandaloneStar(rule: Rule): boolean {
  // Selector strings are normalized (whitespace) by postcss; we want exactly `*`.
  // Multi-selector cases (`*, body`) are treated as not-standalone.
  return rule.selectors.length === 1 && rule.selectors[0].trim() === '*'
}

/** Whether a node lives directly under the root (not nested in @media/@layer/etc.). */
function isTopLevel(rule: Rule): boolean {
  return rule.parent?.type === 'root'
}

/**
 * Wrap top-level `*` rules in `@layer base { ... }`. Each `*` rule gets
 * its own wrapping layer so original line ordering is preserved.
 */
export function wrapStarReset(input: string): StarWrapResult {
  const root = postcss.parse(input)
  const targets: Rule[] = []

  root.walkRules(rule => {
    if (isStandaloneStar(rule) && isTopLevel(rule)) {
      targets.push(rule)
    }
  })

  for (const rule of targets) {
    const layer = postcss.atRule({ name: 'layer', params: 'base' })
    rule.replaceWith(layer)
    layer.append(rule)
  }

  return {
    wrappedCount: targets.length,
    output: targets.length === 0 ? input : root.toString(),
  }
}
