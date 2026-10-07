// validate_code + get_guidelines tools (Phase 4). validate_code mechanizes
// the llms SECTION 1 Self-Check list; get_guidelines serves rule topics from
// rules.json plus the designer–engineer-bridge workflow narrative (Phase L).
import { z } from 'zod'
import { loadRules } from '../data/artifacts.js'
import { validateCode } from '../validate/engine.js'
import { LOCALES, type Locale } from './tokens.js'

// --- validate_code -----------------------------------------------------------

export const validateCodeSchema = {
  code: z.string().describe('TSX/JSX source to validate (a component, a snippet, or a whole file)'),
  locale: z.enum(LOCALES).optional().describe('Language for violation messages and fixes (default: en)'),
}

export function validateCodeTool(args: { code: string; locale?: Locale }) {
  const result = validateCode(args.code, { locale: args.locale })
  return {
    ...result,
    note: result.valid
      ? 'Design and code stay in sync — tokens are the bridge between the Figma source and this code.'
      : 'Fix the errors, then validate again. A line can be suppressed with a "ds-ignore" comment only when the user explicitly approved the custom value.',
  }
}

// --- get_guidelines ----------------------------------------------------------

const TOPICS = [
  'core-principle', 'whitelist', 'forbidden', 'custom-values',
  'third-party', 'self-check', 'workflow',
] as const

export const getGuidelinesSchema = {
  topic: z.enum(TOPICS).describe(
    'core-principle (what 7onic is for) / whitelist (allowed class groups) / ' +
    'forbidden (anti-patterns) / custom-values (off-token protocol) / ' +
    'third-party (wrapping external components) / self-check (pre-return checklist) / ' +
    'workflow (how design and code stay in sync)',
  ),
}

export function getGuidelines(args: { topic: (typeof TOPICS)[number] }) {
  const { rules } = loadRules()
  switch (args.topic) {
    case 'core-principle':
      return {
        topic: args.topic,
        content: rules.corePrinciple,
        decisionTree: rules.decisionTree,
      }
    case 'whitelist':
      return {
        topic: args.topic,
        items: rules.whitelist.map((w) => ({ num: w.num, title: w.title, detail: w.body })),
      }
    case 'forbidden':
      return {
        topic: args.topic,
        patterns: rules.forbiddenPatterns,
        note: 'validate_code detects all of these mechanically — run it before returning code.',
      }
    case 'custom-values':
      return { topic: args.topic, content: rules.customValueProtocol }
    case 'third-party':
      return {
        topic: args.topic,
        content: rules.thirdPartyProtocol,
        readonlyFiles: rules.tokenFilesReadonly,
      }
    case 'self-check':
      return {
        topic: args.topic,
        checklist: rules.selfCheck,
        note: 'validate_code runs this checklist mechanically.',
      }
    case 'workflow':
      return {
        topic: args.topic,
        content: [
          '7onic is a designer–engineer bridge: Figma design tokens are the single source of',
          'truth, and the same token names flow from Figma through CSS variables into Tailwind',
          'classes and components. Code written with token classes can never drift from the',
          'design — when the design changes, tokens update and the code follows automatically.',
          'Workflow: 1) find the component (list_components / get_component), 2) find tokens',
          '(search_tokens / suggest_tokens — never hardcode a raw value), 3) compose layout',
          '(get_layout_pattern), 4) validate_code before returning. If the user asks for a value',
          'outside the tokens, follow the custom-values protocol: ask first, never bypass silently.',
        ].join(' '),
      }
  }
}
