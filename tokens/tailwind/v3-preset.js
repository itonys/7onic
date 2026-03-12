/**
 * Design System - Tailwind CSS v3 Preset
 * ⚠️ Auto-generated from figma-tokens.json — DO NOT EDIT
 *
 * Non-color values reference CSS variables from variables.css for auto-sync.
 * Primitive colors use HEX for Tailwind v3 opacity modifier support (bg-white/10, etc.).
 * Semantic colors use var() for light/dark mode — opacity modifier (bg-primary/50) is NOT supported.
 *
 * Usage:
 * ```js
 * // tailwind.config.js
 * module.exports = {
 *   presets: [require('@7onic-ui/react/tailwind-preset')],
 * }
 * ```
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Standalone primitive colors (HEX for opacity modifier support: bg-white/10, etc.)
        white: '#FFFFFF',
        black: '#000000',

        // Semantic colors (CSS variables for light/dark mode)
        background: {
          DEFAULT: 'var(--color-background)',
          paper: 'var(--color-background-paper)',
          elevated: 'var(--color-background-elevated)',
          muted: 'var(--color-background-muted)',
        },
        foreground: 'var(--color-text)',

        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          tint: 'var(--color-primary-tint)',
          foreground: 'var(--color-primary-text)',
          '50': '#DBF8FB',
          '100': '#B2F0F5',
          '200': '#89E8F0',
          '300': '#60E0EB',
          '400': '#37D8E6',
          '500': '#1AC6D5',
          '600': '#15A0AC',
          '700': '#107A84',
          '800': '#0B545B',
          '900': '#062E32',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          active: 'var(--color-secondary-active)',
          tint: 'var(--color-secondary-tint)',
          foreground: 'var(--color-secondary-text)',
          '50': '#F8FAFC',
          '100': '#F1F5F9',
          '200': '#E2E8F0',
          '300': '#CBD5E1',
          '400': '#94A3B8',
          '500': '#64748B',
          '600': '#475569',
          '700': '#334155',
          '800': '#1E293B',
          '900': '#0F172A',
        },

        // Status colors
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          active: 'var(--color-success-active)',
          tint: 'var(--color-success-tint)',
          foreground: 'var(--color-success-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          active: 'var(--color-warning-active)',
          tint: 'var(--color-warning-tint)',
          foreground: 'var(--color-warning-text)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          hover: 'var(--color-error-hover)',
          active: 'var(--color-error-active)',
          tint: 'var(--color-error-tint)',
          foreground: 'var(--color-error-text)',
          bg: 'var(--color-error-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          active: 'var(--color-info-active)',
          tint: 'var(--color-info-tint)',
          foreground: 'var(--color-info-text)',
        },

        // Primitive color palettes (HEX for opacity modifier support)
        gray: {
          '50': '#F9F9FA',
          '100': '#F4F4F5',
          '200': '#E4E4E6',
          '300': '#D4D4D4',
          '400': '#9A9A9A',
          '500': '#6B6B6B',
          '600': '#4A4A4A',
          '700': '#3C3C3C',
          '800': '#2D2D2D',
          '900': '#212121',
        },
        blue: {
          '50': '#EFF6FF',
          '100': '#DBEAFE',
          '200': '#BFDBFE',
          '300': '#93C5FD',
          '400': '#60A5FA',
          '500': '#3B82F6',
          '600': '#2563EB',
          '700': '#1D4ED8',
          '800': '#1E40AF',
          '900': '#1E3A8A',
        },
        green: {
          '50': '#ECFDF5',
          '100': '#D1FAE5',
          '200': '#A7F3D0',
          '300': '#6EE7B7',
          '400': '#34D399',
          '500': '#10B981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065F46',
          '900': '#064E3B',
        },
        yellow: {
          '50': '#FFFBEB',
          '100': '#FEF3C7',
          '200': '#FDE68A',
          '300': '#FCD34D',
          '400': '#FBBF24',
          '500': '#F59E0B',
          '600': '#D97706',
          '700': '#B45309',
          '800': '#92400E',
          '900': '#78350F',
        },
        red: {
          '50': '#FEF2F2',
          '100': '#FEE2E2',
          '200': '#FECACA',
          '300': '#FCA5A5',
          '400': '#F87171',
          '500': '#EF4444',
          '600': '#DC2626',
          '700': '#B91C1C',
          '800': '#991B1B',
          '900': '#7F1D1D',
        },

        // UI colors
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          subtle: 'var(--color-border-subtle)',
        },
        ring: {
          DEFAULT: 'var(--color-focus-ring)',
          error: 'var(--color-focus-ring-error)',
        },
        muted: {
          DEFAULT: 'var(--color-background-muted)',
          foreground: 'var(--color-text-muted)',
        },
        disabled: {
          DEFAULT: 'var(--color-disabled)',
          foreground: 'var(--color-disabled-text)',
        },

        // Chart colors
        chart: {
          '1': 'var(--color-chart-1)',
          '2': 'var(--color-chart-2)',
          '3': 'var(--color-chart-3)',
          '4': 'var(--color-chart-4)',
          '5': 'var(--color-chart-5)',
        },

        // Text
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          link: 'var(--color-text-link)',
          primary: 'var(--color-text-primary)',
          info: 'var(--color-text-info)',
          success: 'var(--color-text-success)',
          error: 'var(--color-text-error)',
          warning: 'var(--color-text-warning)',
        },
      },

      fontSize: {
        '2xs': ['var(--font-size-2xs)', { lineHeight: 'var(--line-height-2xs)' }],
        'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        'md': ['var(--font-size-md)', { lineHeight: 'var(--line-height-md)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-2xl)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-3xl)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-4xl)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-5xl)' }],
      },

      fontFamily: {
        'sans': ['var(--font-family-sans)'],
        'mono': ['var(--font-family-mono)'],
      },

      spacing: {
        '0': 'var(--spacing-0)',
        '0.5': 'var(--spacing-0-5)',
        '1': 'var(--spacing-1)',
        '1.5': 'var(--spacing-1-5)',
        '2': 'var(--spacing-2)',
        '2.5': 'var(--spacing-2-5)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '7': 'var(--spacing-7)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '14': 'var(--spacing-14)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
      },

      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'base': 'var(--radius-base)',
        'DEFAULT': 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },

      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'primary-glow': 'var(--shadow-primary-glow)',
      },

      zIndex: {
        '0': 'var(--z-index-0)',
        '10': 'var(--z-index-10)',
        '20': 'var(--z-index-20)',
        '30': 'var(--z-index-30)',
        '40': 'var(--z-index-40)',
        '50': 'var(--z-index-50)',
        'sticky': 'var(--z-index-sticky)',
        'dropdown': 'var(--z-index-dropdown)',
        'overlay': 'var(--z-index-overlay)',
        'modal': 'var(--z-index-modal)',
        'popover': 'var(--z-index-popover)',
        'tooltip': 'var(--z-index-tooltip)',
        'toast': 'var(--z-index-toast)',
      },

      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'micro': 'var(--duration-micro)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
        'slowest': 'var(--duration-slowest)',
      },

      transitionTimingFunction: {
        'linear': 'var(--easing-linear)',
        'ease': 'var(--easing-ease)',
        'ease-in': 'var(--easing-ease-in)',
        'ease-out': 'var(--easing-ease-out)',
        'ease-in-out': 'var(--easing-ease-in-out)',
      },

      opacity: {
        '0': 'var(--opacity-0)',
        '5': 'var(--opacity-5)',
        '10': 'var(--opacity-10)',
        '15': 'var(--opacity-15)',
        '20': 'var(--opacity-20)',
        '25': 'var(--opacity-25)',
        '30': 'var(--opacity-30)',
        '35': 'var(--opacity-35)',
        '40': 'var(--opacity-40)',
        '45': 'var(--opacity-45)',
        '50': 'var(--opacity-50)',
        '55': 'var(--opacity-55)',
        '60': 'var(--opacity-60)',
        '65': 'var(--opacity-65)',
        '70': 'var(--opacity-70)',
        '75': 'var(--opacity-75)',
        '80': 'var(--opacity-80)',
        '85': 'var(--opacity-85)',
        '90': 'var(--opacity-90)',
        '95': 'var(--opacity-95)',
        '100': 'var(--opacity-100)',
      },

      scale: {
        '50': 'var(--scale-50)',
        '75': 'var(--scale-75)',
        'pressed': 'var(--scale-pressed)',
      },

      keyframes: {
        'spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'enter': {
          from: {
            opacity: 'var(--tw-enter-opacity, 1)',
            transform: 'translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale(var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))',
          },
        },
      },

      animation: {
        'spin': 'spin 1s linear infinite',
        'in': 'enter var(--duration-micro) var(--easing-ease-out)',
      },
    },
  },
  plugins: [
    // Icon size utilities (icon-xs, icon-sm, icon-md, icon-lg, icon-xl)
    function({ addUtilities }) {
      addUtilities({
        '.icon-xs': { width: 'var(--icon-size-xs)', height: 'var(--icon-size-xs)' },
        '.icon-sm': { width: 'var(--icon-size-sm)', height: 'var(--icon-size-sm)' },
        '.icon-md': { width: 'var(--icon-size-md)', height: 'var(--icon-size-md)' },
        '.icon-lg': { width: 'var(--icon-size-lg)', height: 'var(--icon-size-lg)' },
        '.icon-xl': { width: 'var(--icon-size-xl)', height: 'var(--icon-size-xl)' },
      })
    },
    // Scale reset for grouped buttons (override active:scale-pressed)
    function({ addUtilities }) {
      addUtilities({
        '.scale-none': { transform: 'none !important' },
      })
    },
    // Focus ring utility (v3/v4 compatible)
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          outline: '2px solid transparent',
          'outline-offset': '2px',
          'box-shadow': '0 0 0 2px var(--color-focus-ring)',
        },
      })
    },
    // Enter animation utilities (generated from primitive.animation)
    function({ addUtilities }) {
      addUtilities({
        '.animate-in': {
          'animation-name': 'enter',
          'animation-duration': 'var(--duration-micro)',
          'animation-timing-function': 'var(--easing-ease-out)',
          '--tw-enter-opacity': 'initial',
          '--tw-enter-scale': 'initial',
          '--tw-enter-rotate': 'initial',
          '--tw-enter-translate-x': 'initial',
          '--tw-enter-translate-y': 'initial',
        },
        '.fade-in-0': { '--tw-enter-opacity': '0' },
        '.zoom-in-75': { '--tw-enter-scale': '0.75' },
        '.zoom-in-50': { '--tw-enter-scale': '0.5' },
      })
    },
  ],
}
