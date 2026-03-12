/**
 * Build dist/styles.css for @7onic-ui/react
 * Bundles token CSS variables + semantic themes + base resets for non-Tailwind users.
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const variablesCss = fs.readFileSync(path.join(root, 'tokens/css/variables.css'), 'utf-8')
const lightCss = fs.readFileSync(path.join(root, 'tokens/css/themes/light.css'), 'utf-8')
const darkCss = fs.readFileSync(path.join(root, 'tokens/css/themes/dark.css'), 'utf-8')

const baseResets = `
/* Base resets — required for components */
*, *::before, *::after {
  border-color: var(--color-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`

const output = `/**
 * @7onic-ui/react — Component Styles
 * Import this file if you are NOT using Tailwind CSS.
 *
 * Includes: primitive tokens + light/dark semantic colors + base resets.
 * Light theme is default. Add class="dark" to <html> for dark mode.
 *
 * Tailwind users: import @7onic-ui/tokens/css/variables.css
 * and use the Tailwind preset instead.
 *
 * ⚠️ Auto-generated — DO NOT EDIT
 */

${variablesCss}
${lightCss}
${darkCss}
${baseResets}
`

const distDir = path.join(root, 'dist')
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
fs.writeFileSync(path.join(distDir, 'styles.css'), output)
console.log('✅ dist/styles.css generated')
