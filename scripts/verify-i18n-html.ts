/* eslint-disable no-console */
// verify-i18n-html.ts — Live site HTML language contamination checker
// Fetches all locale pages from the deployed site and detects foreign language characters.
// Usage: npm run verify:i18n:html [--base <url>]
// Default base URL: https://7onic.design

import * as path from 'node:path'

// ============================================================
// Config
// ============================================================

const args = process.argv.slice(2)
const baseIndex = args.indexOf('--base')
const BASE_URL = baseIndex !== -1 ? args[baseIndex + 1] : 'https://7onic.design'
const CONCURRENCY = 10
const FETCH_TIMEOUT_MS = 15000

// Pages to check (base paths, without locale prefix)
const COMPONENT_PAGES = [
  'accordion', 'alert', 'area-chart', 'avatar', 'badge', 'bar-chart',
  'breadcrumb', 'button', 'button-group', 'card', 'checkbox', 'divider',
  'drawer', 'dropdown', 'icon-button', 'input', 'installation', 'line-chart',
  'metric-card', 'modal', 'navigation-menu', 'pagination', 'pie-chart',
  'popover', 'progress', 'radio', 'segmented', 'select', 'skeleton',
  'slider', 'spinner', 'switch', 'table', 'tabs', 'textarea', 'theming',
  'toast', 'toggle', 'toggle-group', 'tooltip',
]

const TOKEN_PAGES = [
  'animation', 'border-width', 'breakpoints', 'colors', 'duration',
  'easing', 'icon-sizes', 'installation', 'opacity', 'radius',
  'scale', 'shadows', 'spacing', 'typography', 'z-index',
]

const GUIDELINE_PAGES = ['accessibility', 'icons', 'tailwind-versions']

// Pages excluded from HTML check — intentional multilingual demo content
// avatar: CJK initial extraction demo (김민수, 田中太郎, 李明)
// typography: CJK font rendering demo (あいうえお, 漢字, 가나다라 etc.)
const SKIP_PATHS = new Set([
  '/components/avatar',
  '/design-tokens/typography',
])

// All base paths
const BASE_PATHS = [
  '',
  '/changelog',
  '/components',
  ...COMPONENT_PAGES.map((p) => `/components/${p}`),
  '/design-tokens',
  ...TOKEN_PAGES.map((p) => `/design-tokens/${p}`),
  ...GUIDELINE_PAGES.map((p) => `/guidelines/${p}`),
].filter((p) => !SKIP_PATHS.has(p))

const LOCALES = ['en', 'ja', 'ko'] as const
type Locale = typeof LOCALES[number]

// Build full URL list per locale
function buildUrl(locale: Locale, path: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return `${BASE_URL}${prefix}${path}`
}

// ============================================================
// Unicode detectors
// ============================================================

const HIRAGANA    = /[\u3040-\u309F]/
const KATAKANA    = /[\u30A0-\u30FF\uFF65-\uFF9F]/
const KANJI       = /[\u4E00-\u9FFF\u3400-\u4DBF]/
const HANGUL      = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/

// Strings that legitimately appear on all pages (language switcher labels, etc.)
// These are excluded from contamination checks
const ALLOWED_CROSS_LANGUAGE = [
  '日本語',   // language switcher label
  '한국어',   // language switcher label
  'English',  // language switcher label
]

function removeAllowedStrings(text: string): string {
  let result = text
  for (const allowed of ALLOWED_CROSS_LANGUAGE) {
    result = result.split(allowed).join('')
  }
  return result
}

function checkContamination(text: string, locale: Locale): string[] {
  const cleaned = removeAllowedStrings(text)
  const issues: string[] = []

  if (locale === 'en') {
    const jaMatches = cleaned.match(new RegExp(`[\\u3040-\\u309F\\u30A0-\\u30FF\\uFF65-\\uFF9F\\u4E00-\\u9FFF\\u3400-\\u4DBF]`, 'g'))
    const koMatches = cleaned.match(new RegExp(`[\\uAC00-\\uD7AF\\u1100-\\u11FF\\u3130-\\u318F]`, 'g'))
    if (jaMatches) issues.push(`Japanese chars: ${[...new Set(jaMatches)].slice(0, 10).join('')}`)
    if (koMatches) issues.push(`Korean chars: ${[...new Set(koMatches)].slice(0, 10).join('')}`)
  } else if (locale === 'ja') {
    const koMatches = cleaned.match(new RegExp(`[\\uAC00-\\uD7AF\\u1100-\\u11FF\\u3130-\\u318F]`, 'g'))
    if (koMatches) issues.push(`Korean chars: ${[...new Set(koMatches)].slice(0, 10).join('')}`)
  } else if (locale === 'ko') {
    // Only flag hiragana/katakana — kanji shared with hanja
    const jaMatches = cleaned.match(new RegExp(`[\\u3040-\\u309F\\u30A0-\\u30FF\\uFF65-\\uFF9F]`, 'g'))
    if (jaMatches) issues.push(`Japanese hiragana/katakana: ${[...new Set(jaMatches)].slice(0, 10).join('')}`)
  }

  return issues
}

// ============================================================
// HTML text extraction
// ============================================================

function extractText(html: string): string {
  // Remove script, style, code, pre blocks entirely
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

// ============================================================
// Fetch with timeout
// ============================================================

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': '7onic-i18n-verifier/1.0' },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ============================================================
// Concurrency limiter
// ============================================================

async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = []
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const current = index++
      results[current] = await tasks[current]()
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  await Promise.all(workers)
  return results
}

// ============================================================
// Main
// ============================================================

interface PageResult {
  url: string
  locale: Locale
  status: 'ok' | 'error' | 'fail'
  issues: string[]
}

async function run() {
  console.log(`🌐 Verifying i18n HTML — ${BASE_URL}`)
  console.log(`   ${BASE_PATHS.length} pages × ${LOCALES.length} locales = ${BASE_PATHS.length * LOCALES.length} requests\n`)

  const tasks: (() => Promise<PageResult>)[] = []

  for (const locale of LOCALES) {
    for (const basePath of BASE_PATHS) {
      const url = buildUrl(locale, basePath)
      tasks.push(async (): Promise<PageResult> => {
        const html = await fetchPage(url)
        if (!html) {
          return { url, locale, status: 'error', issues: ['fetch failed or timeout'] }
        }
        const text = extractText(html)
        const issues = checkContamination(text, locale)
        return {
          url,
          locale,
          status: issues.length > 0 ? 'fail' : 'ok',
          issues,
        }
      })
    }
  }

  const results = await runConcurrent(tasks, CONCURRENCY)

  // ── Summary ──
  const errors  = results.filter((r) => r.status === 'error')
  const fails   = results.filter((r) => r.status === 'fail')
  const oks     = results.filter((r) => r.status === 'ok')

  console.log(`Results: ✓ ${oks.length} passed  ✗ ${fails.length} contaminated  ⚠ ${errors.length} fetch errors\n`)

  if (errors.length > 0) {
    console.warn('⚠ Fetch errors (network or 404):')
    for (const r of errors) {
      console.warn(`  ${r.url}`)
    }
    console.log()
  }

  if (fails.length > 0) {
    console.error('❌ Language contamination detected:')
    for (const r of fails) {
      console.error(`  [${r.locale.toUpperCase()}] ${r.url}`)
      for (const issue of r.issues) {
        console.error(`    → ${issue}`)
      }
    }
    console.log()
    console.error(`❌ i18n HTML verification failed — ${fails.length} page(s) contaminated`)
    process.exit(1)
  } else {
    console.log('✅ i18n HTML verification passed — all pages are clean')
    process.exit(0)
  }
}

run()
