/**
 * Graceful exit helpers.
 *
 * Per CLI-INIT-SCENARIOS ADR §원칙 1 — error messages route
 * to our docs (when present) or to relevant official pages, never silent.
 */
import * as p from '@clack/prompts'

const LINK_PREFIX = 'See: '
const SECTION_SEPARATOR = '\n\n'
const DEFAULT_CANCEL_MESSAGE = 'Init cancelled.'

export interface GracefulExitOptions {
  /** Primary error message (single line, declarative). */
  message: string
  /** Optional inline hint — manual setup steps, code snippets, etc. */
  hint?: string
  /** Optional reference link (our docs or official). */
  link?: string
}

function formatMessage({ message, hint, link }: GracefulExitOptions): string {
  const parts = [message]
  if (hint) parts.push(hint)
  if (link) parts.push(`${LINK_PREFIX}${link}`)
  return parts.join(SECTION_SEPARATOR)
}

/**
 * Abort due to an unrecoverable error. Prints message, hint, link, exits 1.
 * Returns `never` so TypeScript narrows correctly.
 */
export function gracefulExit(options: GracefulExitOptions): never {
  p.cancel(formatMessage(options))
  process.exit(1)
}

/**
 * User-initiated cancellation (e.g. declining a prompt). Exits 0.
 */
export function userCancel(message: string = DEFAULT_CANCEL_MESSAGE): never {
  p.cancel(message)
  process.exit(0)
}
