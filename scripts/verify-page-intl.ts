/* eslint-disable no-console */
// verify-page-intl.ts — client translation bundle checker
// Every page that renders `pages.<name>` text must hand that bundle to the client
// through <PageIntlProvider locale={locale} page="<name>"> in its own folder
// (layout.tsx, or page.tsx for the landing page). The root provider only carries the
// shared namespaces, so a page without the wrapper shows raw message keys after
// client navigation. See docs/roadmap/active/I18N-CLIENT-MESSAGES-PLAN.md.
// Usage: npm run verify:page-intl

import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(__dirname, '..')
const APP = path.join(ROOT, 'app', '[locale]')
const LOCALES = ['en', 'ja', 'ko']

const PAGE_NAMESPACE = /['"`]pages\.([A-Za-z0-9_-]+)/g
const LOCAL_IMPORT = /from\s+['"](\.\/_pages\/[^'"]+)['"]/g
const PROVIDER = /<PageIntlProvider\s+locale=\{locale\}\s+page="([^"]+)"/g

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function read(file: string): string {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

// The page file plus the _pages/ modules it imports (the landing page renders its
// body from app/[locale]/_pages/).
function pageSources(pageFile: string): string {
  const source = read(pageFile)
  const imported = [...source.matchAll(LOCAL_IMPORT)].map((m) => {
    const base = path.resolve(path.dirname(pageFile), m[1])
    return read(`${base}.tsx`) || read(`${base}.ts`)
  })
  return [source, ...imported].join('\n')
}

const messageKeys = Object.fromEntries(
  LOCALES.map((locale) => {
    const messages = JSON.parse(read(path.join(ROOT, 'messages', `${locale}.json`)))
    return [locale, new Set(Object.keys(messages.pages ?? {}))]
  }),
)

const errors: string[] = []
let checked = 0

const rootLayout = read(path.join(APP, 'layout.tsx'))
if (!/<NextIntlClientProvider\s+messages=\{/.test(rootLayout)) {
  errors.push('app/[locale]/layout.tsx: NextIntlClientProvider must pass messages={...} (shared namespaces only)')
}

for (const pageFile of walk(APP).filter((f) => path.basename(f) === 'page.tsx')) {
  const dir = path.dirname(pageFile)
  const rel = path.relative(ROOT, dir)
  const used = [...new Set([...pageSources(pageFile).matchAll(PAGE_NAMESPACE)].map((m) => m[1]))]
  const provided = [
    ...new Set([...`${read(path.join(dir, 'layout.tsx'))}\n${read(pageFile)}`.matchAll(PROVIDER)].map((m) => m[1])),
  ]

  if (used.length === 0) {
    if (provided.length > 0) errors.push(`${rel}: PageIntlProvider page="${provided.join(',')}" but the page renders no pages.* text`)
    continue
  }
  checked++
  if (used.length > 1) errors.push(`${rel}: page renders several bundles (${used.join(', ')}); a page provider carries exactly one`)
  for (const name of used) {
    if (!provided.includes(name)) errors.push(`${rel}: renders pages.${name} but its layout.tsx has no <PageIntlProvider locale={locale} page="${name}">`)
  }
  for (const name of provided) {
    for (const locale of LOCALES) {
      if (!messageKeys[locale].has(name)) errors.push(`${rel}: page="${name}" is missing from messages/${locale}.json pages`)
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} problem(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`✅ page translation bundles verified — ${checked} pages, each wrapped in its PageIntlProvider`)
