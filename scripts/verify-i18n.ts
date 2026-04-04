/* eslint-disable no-console */
// verify-i18n.ts — i18n message file language contamination checker
// Detects foreign language characters mixed into the wrong locale JSON.
// Usage: npm run verify:i18n

import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(__dirname, '..')
const MESSAGES_DIR = path.join(ROOT, 'messages')

// ============================================================
// Unicode character range detectors
// ============================================================

// Japanese: hiragana + katakana (full-width and half-width)
// CJK kanji is shared across CJK languages — not checked for ko.json
const HIRAGANA = /[\u3040-\u309F]/
const KATAKANA = /[\u30A0-\u30FF\uFF65-\uFF9F]/
const KANJI    = /[\u4E00-\u9FFF\u3400-\u4DBF]/

// Korean: Hangul syllables + Jamo
const HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/

function hasJapanese(str: string): boolean {
  return HIRAGANA.test(str) || KATAKANA.test(str) || KANJI.test(str)
}

function hasKatakanaOrHiragana(str: string): boolean {
  return HIRAGANA.test(str) || KATAKANA.test(str)
}

function hasKorean(str: string): boolean {
  return HANGUL.test(str)
}

// ============================================================
// JSON key path traversal
// ============================================================

interface Issue {
  file: string
  keyPath: string
  value: string
  reason: string
}

function traverse(
  obj: unknown,
  keyPath: string,
  check: (val: string) => string | null,
  issues: Issue[],
  file: string,
) {
  if (typeof obj === 'string') {
    const reason = check(obj)
    if (reason) {
      issues.push({ file, keyPath, value: obj, reason })
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => traverse(item, `${keyPath}[${i}]`, check, issues, file))
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      traverse(val, keyPath ? `${keyPath}.${key}` : key, check, issues, file)
    }
  }
}

// ============================================================
// Checks per locale
// ============================================================

const CHECKS: Array<{
  file: string
  label: string
  check: (val: string) => string | null
}> = [
  {
    file: 'en.json',
    label: 'English',
    check: (val) => {
      if (hasJapanese(val)) return 'Japanese characters detected'
      if (hasKorean(val)) return 'Korean characters detected'
      return null
    },
  },
  {
    file: 'ja.json',
    label: 'Japanese',
    check: (val) => {
      if (hasKorean(val)) return 'Korean characters detected'
      return null
    },
  },
  {
    file: 'ko.json',
    label: 'Korean',
    check: (val) => {
      // Only flag hiragana/katakana — kanji (hanja) is shared with Korean
      if (hasKatakanaOrHiragana(val)) return 'Japanese hiragana/katakana detected'
      return null
    },
  },
]

// ============================================================
// Main
// ============================================================

function run() {
  let totalIssues = 0

  for (const { file, label, check } of CHECKS) {
    const filePath = path.join(MESSAGES_DIR, file)

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ ${file} not found — skipping`)
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      console.error(`  ✗ ${file}: invalid JSON`)
      totalIssues++
      continue
    }

    const issues: Issue[] = []
    traverse(json, '', check, issues, file)

    if (issues.length === 0) {
      console.log(`  ✓ ${file} (${label}) — no foreign characters found`)
    } else {
      console.error(`\n  ✗ ${file} (${label}) — ${issues.length} issue(s) found:`)
      for (const issue of issues) {
        console.error(`    [${issue.keyPath}] ${issue.reason}`)
        // Show truncated value for context
        const preview = issue.value.length > 80 ? issue.value.slice(0, 80) + '…' : issue.value
        console.error(`    → "${preview}"`)
      }
      totalIssues += issues.length
    }
  }

  console.log()
  if (totalIssues === 0) {
    console.log('✅ i18n verification passed — all message files are clean')
    process.exit(0)
  } else {
    console.error(`❌ i18n verification failed — ${totalIssues} issue(s) found`)
    process.exit(1)
  }
}

console.log('🌐 Verifying i18n message files...\n')
run()
