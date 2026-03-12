import type { Config } from 'tailwindcss'

const config: Config = {
  presets: [require('./tokens/tailwind/v3-preset')],
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Docs-site only: prepend next/font CSS variable bindings
      // Preset already has base font stacks from figma-tokens
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-sans-jp)', 'Inter', 'Noto Sans JP', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [
    // Docs-site only: tailwindcss-animate (not distributed to users)
    require('tailwindcss-animate'),
  ],
}

export default config
