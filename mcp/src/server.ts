// All MCP SDK touchpoints live in this file (MCP-SERVER-PLAN: isolate the
// SDK surface so a future SDK major migration stays local to server.ts).
// Tool handlers are plain functions in src/tools/* returning JSON-serializable
// objects; this file only wraps them in the MCP content envelope.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  searchTokens, searchTokensSchema,
  getToken, getTokenSchema,
  suggestTokens, suggestTokensSchema,
} from './tools/tokens.js'
import {
  listComponents, listComponentsSchema,
  getComponent, getComponentSchema,
  getComponentExamples, getComponentExamplesSchema,
} from './tools/components.js'
import { getLayoutPattern, getLayoutPatternSchema } from './tools/layout.js'
import {
  validateCodeTool, validateCodeSchema,
  getGuidelines, getGuidelinesSchema,
} from './tools/validate.js'
import { RESOURCES } from './resources/content.js'
import { buildInstructions, createPrototypePrompt } from './instructions.js'
import { z } from 'zod'

export const SERVER_NAME = '7onic-design'
export const SERVER_VERSION = '0.0.1'

interface ToolDef {
  name: string
  description: string
  // SDK boundary: schemas are zod raw shapes, handlers take parsed args.
  inputSchema: Record<string, unknown>
  handler: (args: any) => unknown
}

const TOOLS: ToolDef[] = [
  {
    name: 'search_tokens',
    description:
      'Search 7onic design tokens by name, utility class, or purpose (English/Japanese/Korean). ' +
      'Returns token names, CSS variables, whitelisted utility classes, and current values.',
    inputSchema: searchTokensSchema,
    handler: searchTokens,
  },
  {
    name: 'get_token',
    description:
      'Look up one 7onic token by exact name, CSS variable, or utility class ' +
      '(e.g. "primary", "--color-text", "text-sm"). Returns value(s) and allowed classes.',
    inputSchema: getTokenSchema,
    handler: getToken,
  },
  {
    name: 'suggest_tokens',
    description:
      'REQUIRED before using any raw value (hex/rgb color, px/rem size, ms duration, opacity). ' +
      'Returns the nearest 7onic tokens; if no exact match, returns the user-confirmation prompt ' +
      'that MUST be asked before bypassing tokens.',
    inputSchema: suggestTokensSchema,
    handler: suggestTokens,
  },
  {
    name: 'list_components',
    description:
      'List or fuzzy-search the 41 7onic components (English/Japanese/Korean queries). ' +
      'Filter by category: Forms, Data Display, Layout, Overlay, Feedback, Navigation, Charts, AI Components.',
    inputSchema: listComponentsSchema,
    handler: listComponents,
  },
  {
    name: 'get_component',
    description:
      'Get one 7onic component: props, variants, sizes, sub-components, import path, ' +
      'accessibility notes, and docs URLs. Call this before writing JSX that uses the component.',
    inputSchema: getComponentSchema,
    handler: getComponent,
  },
  {
    name: 'get_component_examples',
    description:
      'Get machine-verified JSX examples for a 7onic component, optionally filtered by scenario ' +
      '(e.g. "donut", "controlled"). Copy imports exactly as shown.',
    inputSchema: getComponentExamplesSchema,
    handler: getComponentExamples,
  },
  {
    name: 'validate_code',
    description:
      'REQUIRED before returning generated TSX/JSX: checks the code against the 7onic design-system ' +
      'rules (token whitelist, semantic-first colors, no arbitrary values, no dark: prefix, ' +
      'components over raw HTML, no visual overrides). Returns violations with line numbers and ' +
      'locale-aware fixes (en/ja/ko).',
    inputSchema: validateCodeSchema,
    handler: validateCodeTool,
  },
  {
    name: 'get_guidelines',
    description:
      'Get 7onic design-system guidance by topic: core-principle, whitelist, forbidden, ' +
      'custom-values, third-party, self-check, or workflow (how the designer–engineer bridge ' +
      'keeps design and code in sync).',
    inputSchema: getGuidelinesSchema,
    handler: getGuidelines,
  },
  {
    name: 'get_layout_pattern',
    description:
      'Get a whitelist-compliant responsive layout recipe: symmetric (equal columns), ' +
      'reading (prose column), section (page rhythm), element (component composition), inline. ' +
      'Grid system: 4/8/12 columns (mobile/tablet/desktop).',
    inputSchema: getLayoutPatternSchema,
    handler: getLayoutPattern,
  },
]

function asText(result: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
}

export function createServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: buildInstructions() },
  )

  server.registerPrompt(
    'create_prototype',
    {
      title: 'Create a 7onic prototype',
      description:
        'Guided workflow for building a prototype page/screen with 7onic components and tokens: ' +
        'component discovery → token lookup → layout recipes → validate_code loop.',
      argsSchema: {
        brief: z.string().describe('What to build, e.g. "SaaS billing settings page with a plan table"'),
        locale: z.enum(['en', 'ja', 'ko']).optional().describe('Language for user-facing copy (default: en)'),
      },
    },
    ({ brief, locale }) => ({
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: createPrototypePrompt(brief, locale) },
        },
      ],
    }),
  )

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema as any },
      async (args: any) => asText(tool.handler(args)),
    )
  }

  for (const res of RESOURCES) {
    server.registerResource(
      res.name,
      res.uri,
      { description: res.description, mimeType: 'text/markdown' },
      async () => ({
        contents: [{ uri: res.uri, mimeType: 'text/markdown', text: res.render() }],
      }),
    )
  }

  return server
}
