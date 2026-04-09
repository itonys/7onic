/**
 * Rewrite import paths in component source files.
 *
 * Only @/lib/utils needs rewriting — internal relative imports
 * (./field, ./button-group, ./button) stay unchanged since all
 * components live in the same flat directory.
 */
export function rewriteImports(content: string, utilsAlias: string): string {
  return content.replace(
    /from ['"]@\/lib\/utils['"]/g,
    `from '${utilsAlias}'`
  )
}
