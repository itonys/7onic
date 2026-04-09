/**
 * generate-llms-cli.ts
 *
 * Transforms public/llms-full.txt (npm package guide) into public/llms-cli.txt (CLI local copy guide).
 *
 * Key transformations:
 * 1. Header: "AI Guide (Full)" → "AI Guide (CLI)"
 * 2. Setup section: npm install → npx 7onic init/add
 * 3. Import paths: '@7onic-ui/react' → '@/components/ui/xxx'
 * 4. Chart imports: '@7onic-ui/react/chart' → '@/components/ui/chart'
 * 5. Tree-shaking section → removed (local files, no tree-shaking needed)
 * 6. Links section → updated with CLI npm link
 */

import fs from 'fs'
import path from 'path'

// ─── Component export name → file name mapping ────────────────────────────

const EXPORT_TO_FILE: Record<string, string> = {
  // button.tsx
  Button: 'button',
  // icon-button.tsx
  IconButton: 'icon-button',
  // button-group.tsx
  ButtonGroup: 'button-group',
  // card.tsx
  Card: 'card', CardRoot: 'card', CardHeader: 'card', CardTitle: 'card',
  CardDescription: 'card', CardContent: 'card', CardFooter: 'card',
  // input.tsx
  Input: 'input',
  // textarea.tsx
  Textarea: 'textarea',
  // select.tsx
  Select: 'select', SelectTrigger: 'select', SelectContent: 'select',
  SelectItem: 'select', SelectGroup: 'select', SelectLabel: 'select', SelectValue: 'select',
  // dropdown.tsx
  DropdownMenu: 'dropdown', DropdownMenuTrigger: 'dropdown', DropdownMenuContent: 'dropdown',
  DropdownMenuItem: 'dropdown', DropdownMenuSeparator: 'dropdown', DropdownMenuLabel: 'dropdown',
  DropdownMenuGroup: 'dropdown', DropdownMenuSub: 'dropdown',
  DropdownMenuSubTrigger: 'dropdown', DropdownMenuSubContent: 'dropdown',
  DropdownMenuCheckboxItem: 'dropdown', DropdownMenuRadioGroup: 'dropdown',
  DropdownMenuRadioItem: 'dropdown',
  // checkbox.tsx
  Checkbox: 'checkbox',
  // radio-group.tsx
  RadioGroup: 'radio-group', RadioGroupItem: 'radio-group',
  // switch.tsx
  Switch: 'switch',
  // toggle.tsx
  Toggle: 'toggle',
  // toggle-group.tsx
  ToggleGroup: 'toggle-group', ToggleGroupItem: 'toggle-group',
  // segmented.tsx
  Segmented: 'segmented', SegmentedItem: 'segmented',
  // slider.tsx
  Slider: 'slider',
  // field.tsx
  Field: 'field', FieldLabel: 'field', FieldMessage: 'field',
  // avatar.tsx
  Avatar: 'avatar', AvatarImage: 'avatar', AvatarFallback: 'avatar', AvatarGroup: 'avatar',
  // badge.tsx
  Badge: 'badge',
  // table.tsx
  Table: 'table', TableHeader: 'table', TableBody: 'table', TableFooter: 'table',
  TableRow: 'table', TableHead: 'table', TableCell: 'table', TableCaption: 'table',
  // tabs.tsx
  Tabs: 'tabs', TabsList: 'tabs', TabsTrigger: 'tabs', TabsContent: 'tabs',
  // accordion.tsx
  Accordion: 'accordion', AccordionItem: 'accordion',
  AccordionTrigger: 'accordion', AccordionContent: 'accordion',
  // divider.tsx
  Divider: 'divider',
  // modal.tsx
  Modal: 'modal', ModalTrigger: 'modal', ModalContent: 'modal',
  ModalHeader: 'modal', ModalTitle: 'modal', ModalDescription: 'modal',
  ModalFooter: 'modal', ModalClose: 'modal',
  // drawer.tsx
  Drawer: 'drawer', DrawerTrigger: 'drawer', DrawerContent: 'drawer',
  DrawerHeader: 'drawer', DrawerTitle: 'drawer', DrawerDescription: 'drawer',
  DrawerFooter: 'drawer', DrawerClose: 'drawer',
  // tooltip.tsx
  Tooltip: 'tooltip', TooltipTrigger: 'tooltip', TooltipContent: 'tooltip',
  TooltipProvider: 'tooltip',
  // popover.tsx
  Popover: 'popover', PopoverTrigger: 'popover', PopoverContent: 'popover',
  PopoverClose: 'popover',
  // alert.tsx
  Alert: 'alert', AlertTitle: 'alert', AlertDescription: 'alert',
  // toast.tsx
  Toaster: 'toast', toast: 'toast', Toast: 'toast',
  // progress.tsx
  Progress: 'progress',
  // spinner.tsx
  Spinner: 'spinner',
  // skeleton.tsx
  Skeleton: 'skeleton',
  // breadcrumb.tsx
  Breadcrumb: 'breadcrumb', BreadcrumbList: 'breadcrumb', BreadcrumbItem: 'breadcrumb',
  BreadcrumbLink: 'breadcrumb', BreadcrumbSeparator: 'breadcrumb', BreadcrumbPage: 'breadcrumb',
  // pagination.tsx
  Pagination: 'pagination', PaginationContent: 'pagination', PaginationItem: 'pagination',
  PaginationPrevious: 'pagination', PaginationNext: 'pagination', PaginationLink: 'pagination',
  PaginationEllipsis: 'pagination',
  // navigation-menu.tsx
  NavigationMenu: 'navigation-menu',
  // chart.tsx
  Chart: 'chart', ChartTooltipContent: 'chart', ChartLegendContent: 'chart',
  // metric-card.tsx
  MetricCard: 'metric-card', MetricCardTitle: 'metric-card', MetricCardValue: 'metric-card',
  MetricCardTrend: 'metric-card',
}

// ─── Import line transformer ──────────────────────────────────────────────

/**
 * Transform an import line from npm path to local CLI path.
 *
 * Input:  import { Button, Card, Input, toast } from '@7onic-ui/react'
 * Output: import { Button } from '@/components/ui/button'
 *         import { Card } from '@/components/ui/card'
 *         import { Input } from '@/components/ui/input'
 *         import { toast } from '@/components/ui/toast'
 */
function transformImportLine(line: string): string {
  // Match: import { ... } from '@7onic-ui/react' or '@7onic-ui/react/chart'
  const match = line.match(/^(\s*)(import\s+\{([^}]+)\}\s+from\s+)'@7onic-ui\/react(?:\/chart)?'(.*)$/)
  if (!match) return line

  const [, indent, , namesPart, trailing] = match
  const names = namesPart.split(',').map(n => n.trim()).filter(Boolean)

  // Handle type imports (e.g., "type ChartConfig")
  const parsedNames = names.map(n => {
    const typeMatch = n.match(/^type\s+(.+)$/)
    if (typeMatch) return { name: typeMatch[1], isType: true }
    return { name: n, isType: false }
  })

  // Group by target file
  const groups = new Map<string, { name: string; isType: boolean }[]>()
  for (const item of parsedNames) {
    const file = EXPORT_TO_FILE[item.name]
    if (!file) {
      // Unknown export — keep original path as fallback
      console.warn(`  Warning: Unknown export "${item.name}", keeping @7onic-ui/react path`)
      return line.replace(/'@7onic-ui\/react(?:\/chart)?'/, `'@/components/ui/${item.name.toLowerCase()}'`)
    }
    const group = groups.get(file) || []
    group.push(item)
    groups.set(file, group)
  }

  // Generate one import per file
  const lines: string[] = []
  for (const [file, items] of groups) {
    const importNames = items.map(i => i.isType ? `type ${i.name}` : i.name).join(', ')
    // Preserve trailing comment if it exists (only on the last line)
    lines.push(`${indent}import { ${importNames} } from '@/components/ui/${file}'`)
  }

  // Add trailing comment to the last line if present
  const trailingComment = trailing.trim()
  if (trailingComment && lines.length > 0) {
    lines[lines.length - 1] += `  ${trailingComment}`
  }

  return lines.join('\n')
}

// ─── Section replacements ─────────────────────────────────────────────────

const CLI_SETUP_SECTION = `## How to Start

### Step 1: Ask the user (setup checklist)

Before writing any code, present this checklist and wait for answers:

1. **Framework** — Next.js / Vite (React SPA) / Remix / other?
2. **Dark mode** — Yes or no?
3. **Font** — Use default, or custom font? If custom, which font?
4. **Locale** — Which language(s)? (for CJK font loading)
5. **What are you building?** — Describe the project

**If the user answers in natural language** (e.g., "Make me a dashboard with dark mode, English only"), extract the answers from their message. **If any item is missing, ask a follow-up question for the missing items only.** Do not proceed until all 5 items are answered.

### Step 2: Initialize project with CLI

Run the 7onic CLI to set up the project:

\`\`\`bash
npx 7onic init
\`\`\`

This automatically:
- Detects Tailwind v3/v4
- Installs base dependencies (@7onic-ui/tokens, lucide-react, class-variance-authority, clsx, tailwind-merge)
- Sets up globals.css with all required token imports
- Creates \`cn()\` utility at \`lib/utils.ts\`
- Generates \`7onic.json\` config

**After init, apply user's answers:**

- Dark mode = yes → implement dark mode toggle (see below)
- Custom font → load font (next/font for Next.js, CDN for Vite) + set \`--font-family-sans\`
- Locale includes Japanese → load Noto Sans JP font
- Locale includes Korean → load Noto Sans KR font

**Set body classes** (if not already set):
\`\`\`html
<body class="bg-background text-foreground">
\`\`\`

**Verify setup is complete before writing any UI code:**
- [ ] \`npx 7onic init\` completed successfully
- [ ] Body has \`bg-background text-foreground\`
- [ ] Dark mode toggle (if selected)
- [ ] Font loaded (if custom)
- [ ] CJK fonts loaded (if applicable)

⛔ **Do NOT proceed to Step 3 until all checks pass.**

### Icon Import Pattern (lucide-react)

\`\`\`tsx
// ✅ Official pattern — no suffix
import { Search, Settings, ChevronDown, X } from 'lucide-react'

// ❌ Legacy alias — avoid
import { SearchIcon, SettingsIcon } from 'lucide-react'

// ⚠️ Name collision with 7onic component — use alias
import { Badge } from '@/components/ui/badge'
import { Badge as BadgeIcon } from 'lucide-react'
\`\`\`

### Step 3: Add components as needed

\`\`\`bash
# Add individual components
npx 7onic add button card input

# Add all components at once
npx 7onic add --all

# Dependencies are resolved automatically (e.g., input → input + field)
\`\`\`

### Step 4: Add Toaster to root layout (if using Toast)

\`\`\`bash
npx 7onic add toast
\`\`\`

Place \`<Toaster />\` once in your root layout file. Without this, \`toast()\` calls will not render.

\`\`\`tsx
import { Toaster } from '@/components/ui/toast'

// In your root layout (e.g., app/layout.tsx)
<body className="bg-background text-foreground">
  {children}
  <Toaster position="bottom-right" />
</body>
\`\`\`

### Step 5: Start building

Design freely based on user's project description. Always use 7onic components + tokens.

### Component Dependencies (auto-resolved by CLI)

| Component | Additional Package | When to install |
|---|---|---|
| Chart (Bar, Line, Area, Pie) | \`recharts\` | CLI prompts during \`add chart\` — import from \`@/components/ui/chart\` |`

const CLI_IMPORT_SECTION = `# ═══ SECTION 2: COMPONENT IMPORT PATTERNS ═══

## Import

\`\`\`tsx
// Each component from its own file
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
\`\`\`

## Namespace Pattern (Compound Components)

21 compound components use namespace imports. Access sub-components via dot notation:

\`\`\`tsx
import { Card } from '@/components/ui/card'

// ✅ Namespace usage (preferred)
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>

// ✅ Named exports also work (backwards compatible)
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
\`\`\``

const CLI_PERFORMANCE_SECTION = `## Performance

**Components are local files — no tree-shaking needed.** Only the components you add are in your project.

\`\`\`bash
# Only adds button and its dependencies
npx 7onic add button
\`\`\`

**Don't wrap components unnecessarily:**
\`\`\`tsx
// ❌ Unnecessary
function MyButton(props) { return <Button {...props} /> }

// ✅ Use directly
<Button variant="solid" color="primary">Submit</Button>
\`\`\`

**Next.js App Router:** 7onic components have \`'use client'\` internally — they render in Server Components.
But if YOUR code uses React hooks (\`useState\`, \`useEffect\`) or event handlers (\`onClick\`, \`onChange\`), add \`'use client'\` at the top of your file. When in doubt, add \`'use client'\` — it's always safe.`

const CLI_LINKS_SECTION = `## Links

- Documentation: https://7onic.design
- npm (CLI): https://npmjs.com/package/7onic
- npm (tokens): https://npmjs.com/package/@7onic-ui/tokens
- GitHub: https://github.com/itonys/7onic
- Tokens-only AI guide: https://7onic.design/llms.txt`

// ─── Main ─────────────────────────────────────────────────────────────────

function main() {
  const fullPath = path.join(process.cwd(), 'public/llms-full.txt')
  const outPath = path.join(process.cwd(), 'public/llms-cli.txt')

  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n')
  const output: string[] = []

  let skip = false
  let sectionState: 'normal' | 'skip-setup' | 'skip-import-section' | 'skip-performance' | 'skip-links' = 'normal'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ─── Header transformation ──────────────────────────────────────
    if (i === 0) {
      output.push('# 7onic Design System — AI Guide (CLI)')
      continue
    }

    // ─── Replace npm description line ───────────────────────────────
    if (line === '- npm: `@7onic-ui/react` (components) + `@7onic-ui/tokens` (design tokens)') {
      output.push('- CLI: `npx 7onic init` + `npx 7onic add <component>` (local file copy)')
      output.push('- npm: `@7onic-ui/tokens` (design tokens, installed by CLI)')
      continue
    }

    // ─── Replace "For tokens-only guide" line ───────────────────────
    if (line === '- For tokens-only guide, see: https://7onic.design/llms.txt') {
      output.push('- For tokens-only guide, see: https://7onic.design/llms.txt')
      output.push('- For npm package guide, see: https://7onic.design/llms-full.txt')
      continue
    }

    // ─── Replace SECTION 1: Setup ───────────────────────────────────
    if (line === '## How to Start') {
      sectionState = 'skip-setup'
      output.push(CLI_SETUP_SECTION)
      continue
    }

    // Skip until we hit the next --- after setup
    if (sectionState === 'skip-setup') {
      if (line === '---' && i > 0 && lines[i - 1] === '') {
        // Check if we've passed the component dependencies table
        // Look back for the table end
        let foundTable = false
        for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
          if (lines[j].startsWith('| Chart')) {
            foundTable = true
            break
          }
        }
        if (foundTable) {
          sectionState = 'normal'
          output.push('')
          output.push('---')
          continue
        }
      }
      continue
    }

    // ─── Replace SECTION 2: Import Patterns ─────────────────────────
    if (line === '# ═══ SECTION 2: COMPONENT IMPORT PATTERNS ═══') {
      sectionState = 'skip-import-section'
      output.push(CLI_IMPORT_SECTION)
      continue
    }

    if (sectionState === 'skip-import-section') {
      // Skip until we hit SECTION 3
      if (line === '# ═══ SECTION 3: ALL COMPONENTS (38) ═══') {
        sectionState = 'normal'
        output.push('')
        output.push('---')
        output.push('')
        output.push(line)
      }
      continue
    }

    // ─── Replace Performance section ────────────────────────────────
    if (line === '## Performance') {
      sectionState = 'skip-performance'
      output.push(CLI_PERFORMANCE_SECTION)
      continue
    }

    if (sectionState === 'skip-performance') {
      if (line === '---') {
        sectionState = 'normal'
        output.push('')
        output.push('---')
      }
      continue
    }

    // ─── Replace Links section ──────────────────────────────────────
    if (line === '## Links') {
      sectionState = 'skip-links'
      output.push(CLI_LINKS_SECTION)
      continue
    }

    if (sectionState === 'skip-links') {
      // Skip until end of file
      continue
    }

    // ─── Transform Forbidden Patterns section import references ─────
    // Lines like: import * as Dialog from '@radix-ui/react-dialog'   → import { Modal } from '@7onic-ui/react'
    // Must come BEFORE the general import transformer (the line also matches from '@7onic-ui/react')
    if (line.includes("'@7onic-ui/react'") && line.includes('→')) {
      const transformed = line.replace(
        /import \{ (\w+) \} from '@7onic-ui\/react'/,
        (_, name) => {
          const file = EXPORT_TO_FILE[name] || name.toLowerCase()
          return `import { ${name} } from '@/components/ui/${file}'`
        },
      )
      output.push(transformed)
      continue
    }

    // ─── Transform import lines ─────────────────────────────────────
    if (line.match(/from\s+'@7onic-ui\/react(?:\/chart)?'/)) {
      // Check if this line is inside a "WRONG" example
      const isWrongExample = line.includes('// WRONG') || line.includes('// ❌')
      if (isWrongExample) {
        // Keep WRONG examples as-is (they show what NOT to do)
        output.push(line)
      } else {
        output.push(transformImportLine(line))
      }
      continue
    }

    // ─── Transform inline @7onic-ui/react references in text ────────
    // e.g., "import from `@7onic-ui/react/chart` (separate entry point)"
    if (line.includes('`@7onic-ui/react/chart`') && !line.includes('Before:') && !line.includes('// Before')) {
      output.push(line.replace(/`@7onic-ui\/react\/chart`/g, '`@/components/ui/chart`'))
      continue
    }

    // ─── Chart Patterns: npm install recharts → CLI auto-prompt ─────
    if (line === '**⚠️ recharts is required.** Auto-install when using any Chart component:') {
      output.push('**⚠️ recharts is required.** The CLI prompts to install it when you run `npx 7onic add chart`.')
      output.push('')
      output.push('If you need to install manually:')
      // Keep the next code block as-is (npm install recharts)
      continue
    }

    // ─── Import Pattern section within SECTION 4 ────────────────────
    if (line === '## Import Pattern') {
      // Replace the entire Import Pattern subsection
      output.push('## Import Pattern')
      output.push('')
      output.push('```tsx')
      output.push('// ✅ Each component from its own file')
      output.push("import { Button } from '@/components/ui/button'")
      output.push("import { Card } from '@/components/ui/card'")
      output.push("import { Input } from '@/components/ui/input'")
      output.push("import { toast } from '@/components/ui/toast'")
      output.push('')
      output.push('// ✅ Chart component')
      output.push("import { Chart } from '@/components/ui/chart'")
      output.push('')
      output.push('// ❌ Never import Radix directly')
      output.push("import * as Dialog from '@radix-ui/react-dialog'  // WRONG → use Modal")
      output.push('```')

      // Skip the original Import Pattern section
      i++
      while (i < lines.length) {
        if (lines[i] === '---') {
          output.push('')
          output.push('---')
          break
        }
        i++
      }
      continue
    }

    // ─── Default: keep line as-is ───────────────────────────────────
    output.push(line)
  }

  const result = output.join('\n')
  fs.writeFileSync(outPath, result, 'utf-8')

  // Stats
  const reactImports = (content.match(/@7onic-ui\/react/g) || []).length
  const cliImports = (result.match(/@\/components\/ui\//g) || []).length
  const remaining = (result.match(/@7onic-ui\/react/g) || []).length

  console.log('✅ Generated public/llms-cli.txt')
  console.log(`   Lines: ${result.split('\n').length}`)
  console.log(`   Original @7onic-ui/react references: ${reactImports}`)
  console.log(`   Transformed to @/components/ui/: ${cliImports}`)
  console.log(`   Remaining @7onic-ui/react references: ${remaining}`)

  if (remaining > 0) {
    // Show remaining references for review
    const resultLines = result.split('\n')
    console.log('\n   Remaining references (review these):')
    resultLines.forEach((l, idx) => {
      if (l.includes('@7onic-ui/react')) {
        console.log(`   L${idx + 1}: ${l.trim().slice(0, 100)}`)
      }
    })
  }
}

main()
