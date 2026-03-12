/**
 * Runner script for sync-tokens (dev / docs-site usage)
 * Generates all token files including globals.css injection.
 *
 * Usage: npx tsx scripts/run-sync.ts [--force] [--dry-run]
 */
import { main } from './sync-tokens'

main().catch((err) => {
  console.error('❌ sync-tokens failed:', err.message)
  process.exit(1)
})
