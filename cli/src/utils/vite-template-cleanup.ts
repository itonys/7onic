import fs from 'node:fs'
import path from 'node:path'

export type ViteBlockMatch = {
  file: string
  name: string
  startLine: number
  endLine: number
  preview: string
}

export type ViteTemplateScanResult = {
  file: string
  fullPath: string
  originalContent: string
  cleanedContent: string
  matches: ViteBlockMatch[]
}

const VITE_INDEX_CSS_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: ':root (font/color/bg defaults)',
    pattern: /:root\s*\{[^}]*font-family:\s*system-ui,\s*Avenir,\s*Helvetica,\s*Arial,\s*sans-serif;[^}]*color-scheme:\s*light dark;[^}]*background-color:\s*#242424;[^}]*\}\s*/m,
  },
  {
    name: 'a (link colors)',
    pattern: /a\s*\{\s*font-weight:\s*500;\s*color:\s*#646cff;\s*text-decoration:\s*inherit;\s*\}\s*/m,
  },
  {
    name: 'a:hover',
    pattern: /a:hover\s*\{\s*color:\s*#535bf2;\s*\}\s*/m,
  },
  {
    name: 'body (flex centering)',
    pattern: /body\s*\{\s*margin:\s*0;\s*display:\s*flex;\s*place-items:\s*center;\s*min-width:\s*320px;\s*min-height:\s*100vh;\s*\}\s*/m,
  },
  {
    name: 'h1 (huge size)',
    pattern: /h1\s*\{\s*font-size:\s*3\.2em;\s*line-height:\s*1\.1;\s*\}\s*/m,
  },
  {
    name: 'button (default styles)',
    pattern: /button\s*\{\s*border-radius:\s*8px;\s*border:\s*1px solid transparent;\s*padding:\s*0\.6em 1\.2em;[^}]*background-color:\s*#1a1a1a;[^}]*\}\s*/m,
  },
  {
    name: 'button:hover',
    pattern: /button:hover\s*\{\s*border-color:\s*#646cff;\s*\}\s*/m,
  },
  {
    name: 'button:focus',
    pattern: /button:focus,\s*button:focus-visible\s*\{\s*outline:\s*4px auto -webkit-focus-ring-color;\s*\}\s*/m,
  },
  {
    name: '@media light mode overrides',
    pattern: /@media\s*\(prefers-color-scheme:\s*light\)\s*\{\s*:root\s*\{\s*color:\s*#213547;\s*background-color:\s*#ffffff;\s*\}[^@]*?button\s*\{\s*background-color:\s*#f9f9f9;\s*\}\s*\}\s*/m,
  },
]

// Next.js 15 `create-next-app` default globals.css patterns
// These override our design tokens and must be removed for consistent rendering.
const NEXTJS_GLOBALS_CSS_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: ':root (--background/--foreground defaults)',
    pattern: /:root\s*\{\s*--background:\s*#ffffff;\s*--foreground:\s*#171717;\s*\}\s*/m,
  },
  {
    name: '@theme inline (Geist font + color mapping)',
    pattern: /@theme\s+inline\s*\{\s*--color-background:\s*var\(--background\);\s*--color-foreground:\s*var\(--foreground\);\s*--font-sans:\s*var\(--font-geist-sans\);\s*--font-mono:\s*var\(--font-geist-mono\);\s*\}\s*/m,
  },
  {
    name: '@media dark mode (prefers-color-scheme)',
    pattern: /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{\s*--background:\s*#0a0a0a;\s*--foreground:\s*#ededed;\s*\}\s*\}\s*/m,
  },
  {
    name: 'body (Arial font-family override)',
    pattern: /body\s*\{\s*background:\s*var\(--background\);\s*color:\s*var\(--foreground\);\s*font-family:\s*Arial,\s*Helvetica,\s*sans-serif;\s*\}\s*/m,
  },
]

const VITE_APP_CSS_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: '#root (max-width + text-align:center)',
    pattern: /#root\s*\{\s*max-width:\s*1280px;\s*margin:\s*0 auto;\s*padding:\s*2rem;\s*text-align:\s*center;\s*\}\s*/m,
  },
  {
    name: '.logo (spin animation set)',
    pattern: /\.logo\s*\{[^}]*height:\s*6em;[^}]*padding:\s*1\.5em;[^}]*will-change:\s*filter;[^}]*\}\s*/m,
  },
  {
    name: '.logo:hover',
    pattern: /\.logo:hover\s*\{\s*filter:\s*drop-shadow\(0 0 2em #646cffaa\);\s*\}\s*/m,
  },
  {
    name: '.logo.react:hover',
    pattern: /\.logo\.react:hover\s*\{\s*filter:\s*drop-shadow\(0 0 2em #61dafbaa\);\s*\}\s*/m,
  },
  {
    name: '@keyframes logo-spin',
    pattern: /@keyframes\s+logo-spin\s*\{\s*from\s*\{\s*transform:\s*rotate\(0deg\);\s*\}\s*to\s*\{\s*transform:\s*rotate\(360deg\);\s*\}\s*\}\s*/m,
  },
  {
    name: '@media logo-spin animation',
    pattern: /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*a:nth-of-type\(2\)\s*\.logo\s*\{\s*animation:\s*logo-spin[^}]*\}\s*\}\s*/m,
  },
  {
    name: '.card',
    pattern: /\.card\s*\{\s*padding:\s*2em;\s*\}\s*/m,
  },
  {
    name: '.read-the-docs',
    pattern: /\.read-the-docs\s*\{\s*color:\s*#888;\s*\}\s*/m,
  },
]

function scanFile(fullPath: string, relPath: string, patterns: typeof VITE_INDEX_CSS_PATTERNS): ViteTemplateScanResult | null {
  if (!fs.existsSync(fullPath)) return null
  const originalContent = fs.readFileSync(fullPath, 'utf-8')
  let cleanedContent = originalContent
  const matches: ViteBlockMatch[] = []

  for (const { name, pattern } of patterns) {
    const match = cleanedContent.match(pattern)
    if (match && match.index !== undefined) {
      const linesBefore = cleanedContent.slice(0, match.index).split('\n').length
      const linesInMatch = match[0].split('\n').length
      matches.push({
        file: relPath,
        name,
        startLine: linesBefore,
        endLine: linesBefore + linesInMatch - 1,
        preview: match[0].split('\n')[0].trim().slice(0, 60),
      })
      cleanedContent = cleanedContent.slice(0, match.index) + cleanedContent.slice(match.index + match[0].length)
    }
  }

  if (matches.length === 0) return null

  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').replace(/^\s+\n/gm, '\n').trimStart()

  return {
    file: relPath,
    fullPath,
    originalContent,
    cleanedContent,
    matches,
  }
}

export function scanViteTemplate(projectRoot: string): ViteTemplateScanResult[] {
  const results: ViteTemplateScanResult[] = []

  const indexCssPath = path.join(projectRoot, 'src/index.css')
  const indexResult = scanFile(indexCssPath, 'src/index.css', VITE_INDEX_CSS_PATTERNS)
  if (indexResult) results.push(indexResult)

  const appCssPath = path.join(projectRoot, 'src/App.css')
  const appResult = scanFile(appCssPath, 'src/App.css', VITE_APP_CSS_PATTERNS)
  if (appResult) results.push(appResult)

  return results
}

export function scanNextjsTemplate(projectRoot: string, cssPath: string): ViteTemplateScanResult | null {
  const fullPath = path.join(projectRoot, cssPath)
  return scanFile(fullPath, cssPath, NEXTJS_GLOBALS_CSS_PATTERNS)
}

export function applyCleanup(result: ViteTemplateScanResult): void {
  const backupPath = result.fullPath + '.bak'
  fs.writeFileSync(backupPath, result.originalContent, 'utf-8')
  fs.writeFileSync(result.fullPath, result.cleanedContent, 'utf-8')
}
