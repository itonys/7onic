// ESLint 9 flat config, migrated from .eslintrc.json + .eslintignore.
// eslint-config-next@16 ships native flat configs: core-web-vitals brings the next,
// react-hooks, jsx-a11y and import plugins; typescript brings typescript-eslint
// recommended. It only needs eslint >= 9, so it also runs on Next 15.
import js from '@eslint/js'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import react from 'eslint-plugin-react'
import prettier from 'eslint-config-prettier'

export default [
  {
    // Same set as the old .eslintignore. Patterns there without a leading slash
    // matched at any depth (gitignore rules), hence `**/`. `mcp/` and `ai-kit/`
    // must stay anchored to the root: unanchored they also match
    // app/[locale]/components/mcp/ and drop that docs page from lint.
    ignores: [
      '**/dist/',
      '**/.next/',
      '**/next-env.d.ts',
      'tokens/css/',
      'tokens/js/',
      'tokens/tailwind/',
      'tokens/types/',
      'tokens/json/',
      'cli/src/registry/index.ts',
      'scripts/user-test/templates/',
      'mcp/',
      'ai-kit/',
      // ESLint 8 ran with --ext .ts,.tsx; keep JavaScript files out as before
      '**/*.{js,mjs,cjs}',
    ],
  },
  js.configs.recommended,
  ...coreWebVitals,
  ...nextTypescript,
  react.configs.flat.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      // `interface XProps extends YProps {}` is an intentional public API pattern
      // (extensible prop types). typescript-eslint v8 replaced no-empty-interface
      // with this rule, which flags it by default.
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      // React Compiler rules new in eslint-plugin-react-hooks v7 (the old chain was
      // v4). Advisory until the flagged effects and ref merges are refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    // Build/verify scripts and the CLI report to the terminal; console is their output
    files: ['scripts/**/*.{ts,tsx}', 'cli/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Tailwind config loads plugins with require()
    files: ['tailwind.config.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
