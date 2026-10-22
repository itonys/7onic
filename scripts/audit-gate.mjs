#!/usr/bin/env node
// audit-gate.mjs — CI supply-chain gate (no dependencies).
//
// Fails on any high/critical npm advisory unless it is listed in
// scripts/audit-allowlist.json with a reason and an unexpired date.
// Moderate/low advisories are reported but do not fail the gate.
//
// Usage: node scripts/audit-gate.mjs [--today YYYY-MM-DD]

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ALLOWLIST_PATH = join(ROOT, 'scripts', 'audit-allowlist.json')
const GATED = ['high', 'critical']
const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }

const todayArg = process.argv.indexOf('--today')
const today = todayArg > -1 ? process.argv[todayArg + 1] : new Date().toISOString().slice(0, 10)

function fail(msg) {
  console.error(`✗ audit-gate: ${msg}`)
  process.exit(1)
}

// npm audit exits 1 whenever it finds anything, so judge by the JSON, not the exit code.
// NO_COLOR keeps the output parseable when the caller forces colors.
const res = spawnSync('npm', ['audit', '--json'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
})

let report
try {
  report = JSON.parse(res.stdout)
} catch {
  fail(`could not parse \`npm audit --json\` output (exit ${res.status}).\n${res.stderr || res.stdout}`)
}
if (report.error) fail(`npm audit error: ${report.error.summary || JSON.stringify(report.error)}`)

// Collapse package-level entries into advisories (one GHSA can affect many packages).
// A package's `via` holds advisory objects or names of vulnerable packages it depends on,
// so walk the names to count every package an advisory reaches.
const vulns = report.vulnerabilities || {}
const advisories = new Map()
for (const pkg of Object.keys(vulns)) {
  const stack = [pkg]
  const seen = new Set()
  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur) || !vulns[cur]) continue
    seen.add(cur)
    for (const via of vulns[cur].via) {
      if (typeof via === 'string') stack.push(via)
      else {
        const id = via.url.split('/').pop()
        if (!advisories.has(id)) {
          advisories.set(id, { id, severity: via.severity, source: via.name, title: via.title, url: via.url, packages: new Set() })
        }
        advisories.get(id).packages.add(pkg)
      }
    }
  }
}

let allowlist
try {
  allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).entries
} catch (e) {
  fail(`could not read ${ALLOWLIST_PATH}: ${e.message}`)
}
const allowed = new Map(allowlist.map((e) => [e.id, e]))

const problems = []
const tolerated = []
const informational = []

for (const adv of advisories.values()) {
  const line = `${adv.severity.padEnd(8)} ${adv.id}  ${adv.source} — ${adv.title} (${adv.packages.size} pkg)`
  if (!GATED.includes(adv.severity)) {
    informational.push(line)
    continue
  }
  const entry = allowed.get(adv.id)
  if (!entry) {
    problems.push(`${line}\n           not in allowlist — ${adv.url}`)
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.expires || '') || !entry.reason) {
    problems.push(`${line}\n           allowlist entry needs "reason" and "expires" (YYYY-MM-DD)`)
  } else if (entry.expires < today) {
    problems.push(`${line}\n           allowlist entry expired on ${entry.expires} — re-check and renew or fix`)
  } else if (RANK[adv.severity] > RANK[entry.severity]) {
    problems.push(`${line}\n           severity raised from ${entry.severity} — re-check the allowlist entry`)
  } else {
    tolerated.push(`${line}\n           allowed until ${entry.expires}`)
  }
}

const stale = allowlist.filter((e) => !advisories.has(e.id))

const m = report.metadata?.vulnerabilities || {}
console.log(`npm audit: critical ${m.critical ?? 0} · high ${m.high ?? 0} · moderate ${m.moderate ?? 0} · low ${m.low ?? 0} (packages)`)
console.log(`advisories: ${advisories.size} (gated ${problems.length + tolerated.length}, allowed ${tolerated.length}) — today ${today}`)
if (tolerated.length) console.log(`\nAllowed:\n  ${tolerated.join('\n  ')}`)
if (informational.length) console.log(`\nBelow the gate (moderate/low, not failing):\n  ${informational.join('\n  ')}`)
if (stale.length) console.log(`\n⚠ Allowlist entries no longer reported (remove them): ${stale.map((e) => e.id).join(', ')}`)

if (problems.length) {
  console.error(`\n✗ ${problems.length} high/critical advisory problem(s):\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log('\n✓ audit-gate passed')
