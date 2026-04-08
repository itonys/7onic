import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig({
  entry: {
    'index': 'src/components/ui/index.ts',
    'chart': 'src/components/ui/chart.tsx',
  },
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
