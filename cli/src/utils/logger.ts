import pc from 'picocolors'

export const logger = {
  info(msg: string) {
    console.log(pc.cyan('i'), msg)
  },
  success(msg: string) {
    console.log(pc.green('✓'), msg)
  },
  warn(msg: string) {
    console.log(pc.yellow('!'), msg)
  },
  error(msg: string) {
    console.error(pc.red('✗'), msg)
  },
  break() {
    console.log('')
  },
  title(msg: string) {
    console.log(pc.bold(msg))
  },
}
