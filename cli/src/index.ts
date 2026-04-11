import { init } from './commands/init'
import { add } from './commands/add'
import { logger } from './utils/logger'
import pc from 'picocolors'

declare const __CLI_VERSION__: string
const VERSION = __CLI_VERSION__

const HELP = `
${pc.bold('7onic')} — Add 7onic design system components to your project

${pc.bold('Usage:')}
  npx 7onic <command> [options]

${pc.bold('Commands:')}
  init                  Initialize 7onic in your project
  add <component...>    Add components to your project

${pc.bold('Init options:')}
  --tailwind v3|v4      Set Tailwind version (default: auto-detect)
  --yes, -y             Skip prompts, use defaults

${pc.bold('Add options:')}
  --all                 Add all components
  --overwrite           Overwrite existing files
  --yes, -y             Skip prompts

${pc.bold('Global options:')}
  --version, -v         Show version
  --help, -h            Show this help message

${pc.bold('Examples:')}
  npx 7onic init
  npx 7onic init --tailwind v3 --yes
  npx 7onic add button card input
  npx 7onic add --all
`

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP)
    return
  }

  if (command === '--version' || command === '-v') {
    console.log(VERSION)
    return
  }

  switch (command) {
    case 'init':
      await init(args.slice(1))
      break
    case 'add':
      await add(args.slice(1))
      break
    default:
      logger.error(`Unknown command: ${command}`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch((err) => {
  logger.error(err.message || String(err))
  process.exit(1)
})
