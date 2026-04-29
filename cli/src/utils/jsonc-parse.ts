/**
 * Safe JSONC parsing.
 *
 * Per CLI-INIT-SCENARIOS ADR §5 — replaces the previous regex-based
 * comment-strip that broke on URL strings (`"https://..."` truncated at
 * `//`). Uses `jsonc-parser` for robust handling of comments, trailing
 * commas, and string-internal sequences.
 */
import * as jsonc from 'jsonc-parser'

/** Standard JSONC tolerance: accept comments + trailing commas, reject empty input. */
const PARSE_OPTIONS: jsonc.ParseOptions = {
  allowTrailingComma: true,
  disallowComments: false,
  allowEmptyContent: false,
}

/**
 * Parse JSONC content. Throws on syntax errors with code + offset.
 * Comments and trailing commas are accepted (standard JSONC features).
 */
export function parseJsonc<T = unknown>(source: string): T {
  const errors: jsonc.ParseError[] = []
  const data = jsonc.parse(source, errors, PARSE_OPTIONS) as T

  if (errors.length > 0) {
    const first = errors[0]
    const code = jsonc.printParseErrorCode(first.error)
    throw new Error(`JSONC parse error: ${code} at offset ${first.offset}`)
  }

  return data
}
