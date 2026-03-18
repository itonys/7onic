/**
 * Design System - Tailwind CSS v3 Preset
 * ⚠️ Auto-generated from figma-tokens.json — DO NOT EDIT
 *
 * Non-color values reference CSS variables from variables.css for auto-sync.
 * Primitive colors use HEX for Tailwind v3 opacity modifier support (bg-white/10, etc.).
 * Semantic colors use rgb() with RGB channel variables for opacity modifier support (bg-primary/50, etc.).
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

        // Semantic colors (rgb() with alpha-value for opacity modifier support)
        background: {
          DEFAULT: 'rgb(var(--color-background-rgb) / <alpha-value>)',
          paper: 'rgb(var(--color-background-paper-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--color-background-elevated-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-background-muted-rgb) / <alpha-value>)',
        },
        foreground: 'rgb(var(--color-text-rgb) / <alpha-value>)',

        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-primary-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-primary-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-text-rgb) / <alpha-value>)',
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
          DEFAULT: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-secondary-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-secondary-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-secondary-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-text-rgb) / <alpha-value>)',
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
          DEFAULT: 'rgb(var(--color-success-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-success-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-success-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-success-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-success-text-rgb) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-warning-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-warning-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-warning-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-warning-text-rgb) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-error-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-error-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-error-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-error-text-rgb) / <alpha-value>)',
          bg: 'rgb(var(--color-error-bg-rgb) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-info-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-info-active-rgb) / <alpha-value>)',
          tint: 'rgb(var(--color-info-tint-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-info-text-rgb) / <alpha-value>)',
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
          DEFAULT: 'rgb(var(--color-border-rgb) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong-rgb) / <alpha-value>)',
          subtle: 'rgb(var(--color-border-subtle-rgb) / <alpha-value>)',
        },
        ring: {
          DEFAULT: 'rgb(var(--color-focus-ring-rgb) / <alpha-value>)',
          error: 'rgb(var(--color-focus-ring-error-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-background-muted-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-text-muted-rgb) / <alpha-value>)',
        },
        disabled: {
          DEFAULT: 'rgb(var(--color-disabled-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--color-disabled-text-rgb) / <alpha-value>)',
        },

        // Chart colors
        chart: {
          '1': 'rgb(var(--color-chart-1-rgb) / <alpha-value>)',
          '2': 'rgb(var(--color-chart-2-rgb) / <alpha-value>)',
          '3': 'rgb(var(--color-chart-3-rgb) / <alpha-value>)',
          '4': 'rgb(var(--color-chart-4-rgb) / <alpha-value>)',
          '5': 'rgb(var(--color-chart-5-rgb) / <alpha-value>)',
        },

        // Text
        text: {
          DEFAULT: 'rgb(var(--color-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted-rgb) / <alpha-value>)',
          subtle: 'rgb(var(--color-text-subtle-rgb) / <alpha-value>)',
          link: 'rgb(var(--color-text-link-rgb) / <alpha-value>)',
          primary: 'rgb(var(--color-text-primary-rgb) / <alpha-value>)',
          info: 'rgb(var(--color-text-info-rgb) / <alpha-value>)',
          success: 'rgb(var(--color-text-success-rgb) / <alpha-value>)',
          error: 'rgb(var(--color-text-error-rgb) / <alpha-value>)',
          warning: 'rgb(var(--color-text-warning-rgb) / <alpha-value>)',
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
        'spin': 'var(--duration-spin)',
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
        '95': 'var(--scale-95)',
        'pressed': 'var(--scale-pressed)',
      },

      keyframes: {
        'checkbox-enter': {
          from: { 'opacity': '0', 'transform': 'scale(0.75)' },
          to: { 'opacity': '1', 'transform': 'scale(1)' },
        },
        'radio-enter': {
          from: { 'opacity': '0', 'transform': 'scale(0.5)' },
          to: { 'opacity': '1', 'transform': 'scale(1)' },
        },
        'fade-in': {
          from: { 'opacity': '0' },
          to: { 'opacity': '1' },
        },
        'fade-out': {
          from: { 'opacity': '1' },
          to: { 'opacity': '0' },
        },
        'modal-overlay-enter': {
          from: { 'opacity': '0' },
          to: { 'opacity': '1' },
        },
        'modal-overlay-exit': {
          from: { 'opacity': '1' },
          to: { 'opacity': '0' },
        },
        'modal-content-enter': {
          from: { 'opacity': '0', 'transform': 'scale(0.95) translateY(8px)' },
          to: { 'opacity': '1', 'transform': 'scale(1) translateY(0)' },
        },
        'modal-content-exit': {
          from: { 'opacity': '1', 'transform': 'scale(1) translateY(0)' },
          to: { 'opacity': '0', 'transform': 'scale(0.95) translateY(8px)' },
        },
        'nav-viewport-enter': {
          from: { 'opacity': '0', 'transform': 'scale(0.98) translateY(-2px)' },
          to: { 'opacity': '1', 'transform': 'scale(1) translateY(0)' },
        },
        'nav-viewport-exit': {
          from: { 'opacity': '1', 'transform': 'scale(1) translateY(0)' },
          to: { 'opacity': '0', 'transform': 'scale(0.98) translateY(-2px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        'spin': {
          from: {  },
          to: {  },
        },
      },

      animation: {
        'checkbox-enter': 'checkbox-enter var(--duration-micro) var(--easing-ease-out)',
        'radio-enter': 'radio-enter var(--duration-micro) var(--easing-ease-out)',
        'fade-in': 'fade-in var(--duration-normal) var(--easing-ease-out)',
        'fade-out': 'fade-out var(--duration-normal) var(--easing-ease-out)',
        'modal-overlay-enter': 'modal-overlay-enter var(--duration-normal) var(--easing-ease-out)',
        'modal-overlay-exit': 'modal-overlay-exit var(--duration-fast) var(--easing-ease-out)',
        'modal-content-enter': 'modal-content-enter var(--duration-normal) var(--easing-ease-out)',
        'modal-content-exit': 'modal-content-exit var(--duration-fast) var(--easing-ease-out)',
        'nav-viewport-enter': 'nav-viewport-enter var(--duration-micro) var(--easing-ease-out)',
        'nav-viewport-exit': 'nav-viewport-exit var(--duration-fast) var(--easing-ease-out)',
        'accordion-down': 'accordion-down var(--duration-normal) var(--easing-ease-out)',
        'accordion-up': 'accordion-up var(--duration-normal) var(--easing-ease-out)',
        'collapsible-down': 'collapsible-down var(--duration-normal) var(--easing-ease-out)',
        'collapsible-up': 'collapsible-up var(--duration-normal) var(--easing-ease-out)',
        'spin': 'spin var(--duration-spin) var(--easing-linear) infinite',
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
    // Animation utilities (generated from semantic.animation)
    function({ addUtilities }) {
      addUtilities({
        '.animate-checkbox-enter': { 'animation': 'checkbox-enter var(--duration-micro) var(--easing-ease-out)' },
        '.animate-radio-enter': { 'animation': 'radio-enter var(--duration-micro) var(--easing-ease-out)' },
        '.animate-fade-in': { 'animation': 'fade-in var(--duration-normal) var(--easing-ease-out)' },
        '.animate-fade-out': { 'animation': 'fade-out var(--duration-normal) var(--easing-ease-out)' },
        '.animate-modal-overlay-enter': { 'animation': 'modal-overlay-enter var(--duration-normal) var(--easing-ease-out)' },
        '.animate-modal-overlay-exit': { 'animation': 'modal-overlay-exit var(--duration-fast) var(--easing-ease-out)' },
        '.animate-modal-content-enter': { 'animation': 'modal-content-enter var(--duration-normal) var(--easing-ease-out)' },
        '.animate-modal-content-exit': { 'animation': 'modal-content-exit var(--duration-fast) var(--easing-ease-out)' },
        '.animate-nav-viewport-enter': { 'animation': 'nav-viewport-enter var(--duration-micro) var(--easing-ease-out)' },
        '.animate-nav-viewport-exit': { 'animation': 'nav-viewport-exit var(--duration-fast) var(--easing-ease-out)' },
        '.animate-accordion-down': { 'animation': 'accordion-down var(--duration-normal) var(--easing-ease-out)' },
        '.animate-accordion-up': { 'animation': 'accordion-up var(--duration-normal) var(--easing-ease-out)' },
        '.animate-collapsible-down': { 'animation': 'collapsible-down var(--duration-normal) var(--easing-ease-out)' },
        '.animate-collapsible-up': { 'animation': 'collapsible-up var(--duration-normal) var(--easing-ease-out)' },
        '.animate-spin': { 'animation': 'spin var(--duration-spin) var(--easing-linear) infinite' },
      })
    },
  ],
}
