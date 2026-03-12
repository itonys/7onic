import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig({
  entry: ['src/components/ui/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@radix-ui/*', 'recharts'],
  esbuildOptions(options) {
    options.alias = {
      '@': path.resolve(__dirname, 'src'),
    }
  },
})
