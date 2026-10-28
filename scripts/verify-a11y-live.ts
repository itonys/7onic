#!/usr/bin/env tsx
/**
 * verify-a11y-live.ts
 *
 * Opens every English sitemap page in a real browser and checks the
 * accessibility wiring that static checks cannot see:
 *   1. No duplicate ids
 *   2. Every label[for] points at an existing element
 *   3. Clicking a label toggles only its own checkbox / switch / radio,
 *      and that control's id is unique
 *   4. axe-core rules for names and list structure (contrast / landmark /
 *      heading-order are tracked separately and excluded here)
 *   5. Unknown URLs answer 404 (not 500)
 *
 * Requires a running server (production build recommended).
 *
 * Usage:
 *   npx tsx scripts/verify-a11y-live.ts
 *   npx tsx scripts/verify-a11y-live.ts --only /components/checkbox,/components/field
 */

import { chromium, type Page } from 'playwright'
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'

const BASE = (process.env.DOCS_ORIGIN ?? 'http://localhost:3000').replace(/\/$/, '')
const args = process.argv.slice(2)
const onlyIdx = args.indexOf('--only')
const ONLY = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(',')) : null

const AXE_RULES = [
  'button-name',
  'aria-progressbar-name',
  'aria-input-field-name',
  'label',
  'list',
  'listitem',
  'duplicate-id-aria',
]

const NOT_FOUND_PATHS = ['/foo.png', '/abc.txt', '/components/nonexistent', '/ja/nonexistent']

const require = createRequire(import.meta.url)
const AXE_PATH = require.resolve('axe-core/axe.min.js')

interface Finding {
  page: string
  check: string
  detail: string
}

async function listPages(): Promise<string[]> {
  const res = await fetch(`${BASE}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml → HTTP ${res.status}`)
  const xml = await res.text()
  const paths = new Set<string>()
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(m[1]).pathname.replace(/\/$/, '') || '/'
    // English is the unprefixed default locale
    if (/^\/(ja|ko)(\/|$)/.test(path)) continue
    if (ONLY && !ONLY.has(path)) continue
    paths.add(path)
  }
  return [...paths].sort()
}

async function checkDom(page: Page) {
  return page.evaluate(async () => {
    const out: { check: string; detail: string }[] = []
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

    // 1. Duplicate ids
    const counts = new Map<string, number>()
    for (const el of document.querySelectorAll('[id]')) {
      counts.set(el.id, (counts.get(el.id) ?? 0) + 1)
    }
    for (const [id, n] of counts) {
      if (n > 1) out.push({ check: 'duplicate-id', detail: `id="${id}" ×${n}` })
    }

    // 2. label[for] targets
    const labels = [...document.querySelectorAll<HTMLLabelElement>('label[for]')]
    for (const l of labels) {
      if (!document.getElementById(l.htmlFor)) {
        out.push({ check: 'label-for-missing', detail: `for="${l.htmlFor}" "${l.textContent?.trim().slice(0, 40)}"` })
      }
    }

    // 3. Label click toggles only its own control
    const selector = '[role="checkbox"],[role="switch"],[role="radio"],input[type="checkbox"],input[type="radio"]'
    const state = (el: Element) =>
      el.getAttribute('aria-checked') ?? el.getAttribute('data-state') ?? String((el as HTMLInputElement).checked)
    for (const l of labels) {
      const t = document.getElementById(l.htmlFor)
      if (!t || !t.matches(selector)) continue
      if (t.hasAttribute('disabled') || t.getAttribute('aria-disabled') === 'true' || t.hasAttribute('data-disabled')) continue
      const role = t.getAttribute('role') ?? (t as HTMLInputElement).type
      if (role === 'radio' && state(t) === 'true') continue

      const all = [...document.querySelectorAll(selector)]
      const before = all.map(state)
      l.click()
      await wait(120)
      const changed = all.filter((_, k) => before[k] !== state(all[k]))
      const unique = document.querySelectorAll(`[id="${CSS.escape(l.htmlFor)}"]`).length === 1
      const ok =
        unique &&
        changed.includes(t) &&
        changed.every((c) => c === t || c.getAttribute('role') === 'radio' || (c as HTMLInputElement).type === 'radio')
      if (!ok) {
        out.push({
          check: 'label-click',
          detail: `for="${l.htmlFor}" "${l.textContent?.trim().slice(0, 40)}" — changed ${changed.length}, target ${changed.includes(t) ? 'toggled' : 'unchanged'}, id ${unique ? 'unique' : 'duplicated'}`,
        })
      }
      // Undo so later labels start from the original state
      if (changed.length && role !== 'radio') {
        l.click()
        await wait(120)
      }
    }
    return out
  })
}

async function checkAxe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH })
  return page.evaluate(async (rules) => {
    // @ts-expect-error axe is injected at runtime
    const r = await window.axe.run(document, { runOnly: { type: 'rule', values: rules } })
    return (r.violations as { id: string; nodes: { target: string[] }[] }[]).flatMap((v) =>
      v.nodes.map((n) => ({ check: `axe:${v.id}`, detail: n.target.join(' ') })),
    )
  }, AXE_RULES)
}

async function main() {
  const pages = await listPages()
  if (pages.length === 0) throw new Error('no pages found in sitemap.xml')
  const findings: Finding[] = []

  for (const path of ONLY ? [] : NOT_FOUND_PATHS) {
    const res = await fetch(`${BASE}${path}`)
    if (res.status !== 404) findings.push({ page: path, check: 'not-found-status', detail: `HTTP ${res.status} (expected 404)` })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ locale: 'en-US' })
  // tsx (esbuild keepNames) wraps functions in __name(); define it in the page for page.evaluate bodies
  await context.addInitScript('window.__name = (f) => f')
  let loaded = 0

  for (const path of pages) {
    const page = await context.newPage()
    try {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 60_000 })
      if (!res || res.status() !== 200) {
        findings.push({ page: path, check: 'load', detail: `HTTP ${res?.status() ?? 'no response'}` })
        continue
      }
      // Let hydration settle before clicking labels
      await page.waitForTimeout(500)
      loaded++
      for (const f of [...(await checkDom(page)), ...(await checkAxe(page))]) findings.push({ page: path, ...f })
    } catch (e) {
      findings.push({ page: path, check: 'load', detail: (e as Error).message.split('\n')[0] })
    } finally {
      await page.close()
    }
  }
  await browser.close()

  console.log(`\n${pages.length} pages · ${loaded} loaded · ${NOT_FOUND_PATHS.length} 404 paths · ${findings.length} findings`)
  if (findings.length > 0) {
    for (const f of findings) console.log(`  ✗ ${f.page} [${f.check}] ${f.detail}`)
    writeFileSync('/tmp/a11y-live-findings.json', JSON.stringify(findings, null, 2))
    console.log('\nFull findings → /tmp/a11y-live-findings.json')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
