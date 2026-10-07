// Entry point: stdio transport only (MCP-SERVER-PLAN).
// IMPORTANT: stdout is the JSON-RPC channel - never console.log here.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer, SERVER_NAME, SERVER_VERSION } from './server.js'

async function main(): Promise<void> {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`${SERVER_NAME} v${SERVER_VERSION} connected over stdio`)
}

main().catch((error) => {
  console.error('Fatal:', error)
  process.exit(1)
})
