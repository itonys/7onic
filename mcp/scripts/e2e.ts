// Phase 6 E2E: drives the built server (dist/index.js) over real stdio
// JSON-RPC and walks five realistic page scenarios (form, dashboard,
// settings, table, notifications). For each scenario it checks:
//   1. tool flow — component discovery / token search / layout recipe respond
//   2. clean variant — validate_code returns 0 errors (no false positives)
//   3. violation variant — every seeded rule is detected (detection rate)
// Exit 0 only when the detection rate is 100% and clean variants are clean.
// Run: npm run e2e (requires npm run build first — dist is committed).
import { spawn, type ChildProcess } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.js')

// --- minimal stdio JSON-RPC client -------------------------------------------

interface RpcClient {
  rpc: (method: string, params?: unknown) => Promise<any>
  kill: () => void
}

function connect(): RpcClient {
  const proc: ChildProcess = spawn('node', [DIST], { stdio: ['pipe', 'pipe', 'inherit'] })
  let buf = ''
  const pending = new Map<number, (msg: any) => void>()
  proc.stdout!.on('data', (d: Buffer) => {
    buf += d.toString()
    let nl
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl)
      buf = buf.slice(nl + 1)
      if (!line.trim()) continue
      const msg = JSON.parse(line)
      if (msg.id !== undefined && pending.has(msg.id)) {
        pending.get(msg.id)!(msg)
        pending.delete(msg.id)
      }
    }
  })
  let nextId = 1
  const rpc = (method: string, params?: unknown) =>
    new Promise<any>((resolve, reject) => {
      const id = nextId++
      pending.set(id, resolve)
      proc.stdin!.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
      setTimeout(() => reject(new Error(`timeout: ${method}`)), 10_000)
    })
  return { rpc, kill: () => proc.kill() }
}

function toolJson(msg: any): any {
  if (msg.error) throw new Error(`tool error: ${JSON.stringify(msg.error)}`)
  return JSON.parse(msg.result.content[0].text)
}

// --- scenarios ----------------------------------------------------------------

interface Scenario {
  name: string
  /** list_components query (multilingual) → at least one of these expected. */
  discoverQuery: string
  expectComponents: string[]
  /** search_tokens query → at least one result expected. */
  tokenQuery: string
  layoutType: 'symmetric' | 'reading' | 'section' | 'element' | 'inline'
  clean: string
  violation: string
  /** Rules seeded into the violation variant — all must be detected. */
  seeded: string[]
}

const SCENARIOS: Scenario[] = [
  {
    name: 'form (login)',
    discoverQuery: '로그인 입력 버튼',
    expectComponents: ['Input', 'Button'],
    tokenQuery: 'spacing gap',
    layoutType: 'element',
    clean: `import { Field, FieldLabel, Input, Button, Checkbox } from '@7onic-ui/react'
export function LoginForm() {
  return (
    <form className="flex flex-col gap-4 p-6">
      <Field>
        <FieldLabel required>Email</FieldLabel>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <div className="flex items-center gap-2">
        <Checkbox id="remember" />
        <span className="text-sm text-muted">Remember me</span>
      </div>
      <Button variant="solid" color="primary">Sign in</Button>
    </form>
  )
}`,
    violation: `export function LoginForm() {
  return (
    <form className="flex flex-col gap-4 p-6">
      <label className="text-sm leading-tight text-gray-700">Email</label>
      <input className="border rounded-lg px-3 h-10" type="email" />
      <button className="bg-blue-500 rounded-lg px-4 py-2">Sign in</button>
    </form>
  )
}`,
    seeded: ['leading-override', 'raw-color', 'html-element'],
  },
  {
    name: 'dashboard (metrics)',
    discoverQuery: 'メトリクス チャート',
    expectComponents: ['MetricCard', 'Chart'],
    tokenQuery: 'shadow elevation',
    layoutType: 'symmetric',
    clean: `import { MetricCard, Card, CardHeader, CardTitle, CardContent } from '@7onic-ui/react'
export function Dashboard() {
  return (
    <section className="py-12 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard label="Revenue" value="$12,400" />
        <MetricCard label="Users" value="1,204" />
        <Card>
          <CardHeader><CardTitle>Traffic</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted">Weekly summary</CardContent>
        </Card>
      </div>
    </section>
  )
}`,
    violation: `export function Dashboard() {
  return (
    <section className="py-[52px] dark:bg-gray-900">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-6">
          <svg className="w-4 h-4" />
          <span className="text-sm">Revenue</span>
        </div>
      </div>
    </section>
  )
}`,
    seeded: ['arbitrary-value', 'dark-prefix', 'icon-size'],
  },
  {
    name: 'settings',
    discoverQuery: 'switch toggle 設定',
    expectComponents: ['Switch', 'Toggle'],
    tokenQuery: '색상 primary',
    layoutType: 'section',
    clean: `import { Switch, Divider, Button } from '@7onic-ui/react'
export function Settings() {
  return (
    <section className="py-12 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-md font-semibold">Notifications</span>
        <Switch defaultChecked />
      </div>
      <Divider />
      <Button variant="outline" size="sm">Save changes</Button>
    </section>
  )
}`,
    violation: `import { Button } from '@7onic-ui/react'
export function Settings() {
  return (
    <section style={{ padding: '24px' }}>
      <div className="bg-primary opacity-10 p-4">Banner</div>
      <Button className="bg-secondary rounded-full">Save</Button>
    </section>
  )
}`,
    seeded: ['inline-style', 'opacity-element', 'visual-override'],
  },
  {
    name: 'table (data list)',
    discoverQuery: '테이블 페이지네이션',
    expectComponents: ['Table', 'Pagination'],
    tokenQuery: 'border divide',
    layoutType: 'reading',
    clean: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '@7onic-ui/react'
export function UserTable() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Yuki</TableCell>
            <TableCell><Badge color="success">Active</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}`,
    violation: `export function UserTable() {
  return (
    <table className="w-full border-gray-200">
      <tbody className="divide-y">
        <tr><td className="p-3 text-sm">Yuki</td></tr>
      </tbody>
    </table>
  )
}`,
    seeded: ['html-element', 'raw-color', 'divide-no-color'],
  },
  {
    name: 'notifications',
    discoverQuery: 'アラート トースト 通知',
    expectComponents: ['Alert', 'Toast'],
    tokenQuery: 'duration animation',
    layoutType: 'inline',
    clean: `import { Alert, Badge } from '@7onic-ui/react'
export function Notifications() {
  return (
    <div className="space-y-4">
      <Alert color="info" title="Update available">A new version is ready.</Alert>
      <p className="text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <Badge color="error">3</Badge> unread alerts
        </span>
      </p>
    </div>
  )
}`,
    violation: `import * as RadixToast from '@radix-ui/react-toast'
import { Alert } from '@7onic-ui/react'
function MyAlert(props: any) { return <Alert {...props} /> }
export function Notifications() {
  return <div className="rounded-[7px] p-4">No alerts</div>
}`,
    seeded: ['radix-import', 'wrapper-component', 'arbitrary-value'],
  },
]

// --- run ----------------------------------------------------------------------

async function main() {
  const client = connect()
  let failed = false
  const check = (label: string, ok: boolean, detail = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : ` — ${detail}`}`)
    if (!ok) failed = true
  }

  const init = await client.rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'e2e', version: '0.0.1' },
  })
  check('initialize + instructions', (init.result?.instructions ?? '').length > 500)
  // (fire-and-forget notification, no id)
  ;(client as any).notifyDone = true
  await new Promise<void>((r) => {
    r()
  })

  const call = async (name: string, args: unknown) =>
    toolJson(await client.rpc('tools/call', { name, arguments: args }))

  let seededTotal = 0
  let seededDetected = 0

  for (const s of SCENARIOS) {
    console.log(`\n=== scenario: ${s.name} ===`)

    const found = await call('list_components', { query: s.discoverQuery })
    const names = found.components.map((c: any) => c.name)
    const hit = s.expectComponents.filter((e) => names.includes(e))
    check(`discover "${s.discoverQuery}" → ${hit.join(',') || 'none'}`, hit.length > 0,
      `expected one of [${s.expectComponents}], got [${names.slice(0, 6)}]`)

    const tokens = await call('search_tokens', { query: s.tokenQuery })
    check(`tokens "${s.tokenQuery}" → ${tokens.count} results`, tokens.count > 0)

    const layout = await call('get_layout_pattern', { type: s.layoutType })
    check(`layout ${s.layoutType} → ${layout.recipes.length} recipes, no whitelist warning`,
      layout.recipes.length > 0 && !layout.warning, layout.warning ?? '')

    const clean = await call('validate_code', { code: s.clean })
    check(`clean variant → errors=${clean.errors} warnings=${clean.warnings}`,
      clean.errors === 0 && clean.warnings === 0,
      JSON.stringify(clean.violations?.slice(0, 4)))

    const bad = await call('validate_code', { code: s.violation, locale: 'ja' })
    const detectedRules = new Set(bad.violations.map((v: any) => v.rule))
    const missed = s.seeded.filter((r) => !detectedRules.has(r))
    seededTotal += s.seeded.length
    seededDetected += s.seeded.length - missed.length
    check(`violation variant → seeded ${s.seeded.length}, detected ${s.seeded.length - missed.length}`,
      missed.length === 0, `missed: ${missed.join(', ')} | got: [${[...detectedRules].join(', ')}]`)
    const jaOk = bad.violations.every((v: any) => /[぀-ヿ一-鿿]/u.test(v.message))
    check('violation messages localized (ja)', jaOk)
  }

  const rate = seededTotal === 0 ? 0 : Math.round((seededDetected / seededTotal) * 100)
  console.log(`\nDetection rate: ${seededDetected}/${seededTotal} (${rate}%)`)
  check('detection rate 100%', seededDetected === seededTotal)

  console.log(failed ? '\nRESULT: FAIL' : '\nRESULT: OK')
  client.kill()
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error('E2E fatal:', e)
  process.exit(1)
})
