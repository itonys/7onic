import type { Metadata } from 'next'
import { siteConfig } from '@/site.config'

// Helper to create consistent page metadata
function page(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name} Design System`,
      description,
    },
  }
}

// ═══ Component pages ═══

export const componentSEO = {
  index: page(
    'Components',
    'Production-ready, accessible React components built on Radix UI. Customizable with Tailwind CSS and design tokens.',
  ),
  accordion: page(
    'Accordion',
    'Collapsible content sections with 3 variants, single/multiple mode, and customizable icon position. Built on Radix UI.',
  ),
  alert: page(
    'Alert',
    'Contextual feedback component with 3 variants, 4 color states, closable option, and automatic icon mapping.',
  ),
  'area-chart': page(
    'Area Chart',
    'Area chart component with 4 interpolation types, gradient/solid variants, stacked mode, and hover fade. Built on Recharts.',
  ),
  avatar: page(
    'Avatar',
    'User avatar with 6 sizes, shape options, status indicator, AvatarGroup, and automatic CJK initial extraction.',
  ),
  badge: page(
    'Badge',
    'Inline status indicator with 3 variants, 6 colors, 3 sizes, dot mode, icon support, and removable option.',
  ),
  'bar-chart': page(
    'Bar Chart',
    'Bar chart component with horizontal/vertical layout, stacked mode, rounded corners, and hover fade. Built on Recharts.',
  ),
  breadcrumb: page(
    'Breadcrumb',
    'Navigation breadcrumb with 3 sizes, custom separators, and auto-collapse for long paths. WAI-ARIA compliant.',
  ),
  button: page(
    'Button',
    'Versatile button with 4 variants, 4 colors, 5 sizes, press effect, loading state, and icon support. Built on Radix UI.',
  ),
  'button-group': page(
    'ButtonGroup',
    'Group buttons with shared variant, size, and disabled state. Automatic context propagation to child buttons.',
  ),
  card: page(
    'Card',
    'Content container with 3 variants, 3 sizes, interactive mode, image overlay, and optical padding balance.',
  ),
  checkbox: page(
    'Checkbox',
    'Form checkbox with 2 colors, customizable size and radius. Supports indeterminate state. Built on Radix UI.',
  ),
  divider: page(
    'Divider',
    'Visual separator with 3 line styles, 3 colors, horizontal/vertical orientation, and optional label placement.',
  ),
  drawer: page(
    'Drawer',
    'Slide-in panel from any edge with 5 sizes, directional animations, and full modal support. Built on Radix Dialog.',
  ),
  dropdown: page(
    'Dropdown',
    'Dropdown menu with 3 sizes, keyboard navigation, submenus, checkable items, and separator groups. Built on Radix UI.',
  ),
  'icon-button': page(
    'IconButton',
    'Icon-only button with 5 variants including subtle, 4 colors, 5 sizes, and accessible aria-label support.',
  ),
  input: page(
    'Input',
    'Text input with 5 sizes, 9 radius options, Field wrapper for label/error, and keyboard-only focus ring detection.',
  ),
  installation: page(
    'Installation',
    'Get started with 7onic — install components and tokens via npm, yarn, or pnpm. Setup guides for Tailwind v3 and v4.',
  ),
  'line-chart': page(
    'Line Chart',
    'Line chart component with 4 interpolation types, dot markers, series highlighting, and hover fade. Built on Recharts.',
  ),
  'metric-card': page(
    'Metric Card',
    'Dashboard metric display with 3 variants, 3 sizes, trend indicator, and description. Context-based size propagation.',
  ),
  modal: page(
    'Modal',
    'Dialog overlay with 6 sizes, 2 scroll behaviors, AlertModal variant, and close button. Built on Radix Dialog.',
  ),
  'navigation-menu': page(
    'Navigation Menu',
    'Horizontal/vertical navigation with collapsible sidebar, size options, and hover indicator. Built on Radix UI.',
  ),
  pagination: page(
    'Pagination',
    'Page navigation with 5 sizes, 3 variants, 2 colors, boundary control, loop option, and usePagination hook.',
  ),
  'pie-chart': page(
    'Pie Chart',
    'Pie and donut chart with inside/outside labels, active shape highlight, and customizable padding angle. Built on Recharts.',
  ),
  popover: page(
    'Popover',
    'Floating content panel with 2 variants including glassmorphism, arrow support, and 4-direction placement. Built on Radix UI.',
  ),
  progress: page(
    'Progress',
    'Linear and circular progress indicator with 3 sizes, striped variant, custom labels, and animation. Built on Radix UI.',
  ),
  radio: page(
    'Radio',
    'Radio group with 2 colors, size options, and context-based color propagation to child radios. Built on Radix UI.',
  ),
  segmented: page(
    'Segmented',
    'Segmented control with 4 sizes and customizable radius. Tab-like selection for mutually exclusive options.',
  ),
  select: page(
    'Select',
    'Dropdown select with 5 sizes, 9 radius options, grouped items, and flush mode. Built on Radix UI.',
  ),
  skeleton: page(
    'Skeleton',
    'Loading placeholder with text/circular/rectangular variants, pulse/wave animations, and conditional rendering.',
  ),
  slider: page(
    'Slider',
    'Range slider with 2 colors, size options, and smooth thumb interaction. Built on Radix UI.',
  ),
  spinner: page(
    'Spinner',
    'Loading spinner with 4 variants — ring, dots, bars, and orbit with 5 sub-styles including 3D effects.',
  ),
  switch: page(
    'Switch',
    'Toggle switch with 5 colors, label positioning, custom icons, and accessible keyboard support. Built on Radix UI.',
  ),
  table: page(
    'Table',
    'Data table with 3 sizes, 3 variants, sortable columns, row selection with checkbox, and sticky header.',
  ),
  tabs: page(
    'Tabs',
    'Tab navigation with 3 variants — line, enclosed, pill — 4 sizes, 2 colors, and fitted mode. Built on Radix UI.',
  ),
  textarea: page(
    'Textarea',
    'Multi-line text input with size and radius options, Field wrapper for label/error, and auto-resize support.',
  ),
  theming: page(
    'Theming',
    'Customize 7onic with design tokens — light/dark mode, CSS variables, and Tailwind configuration guide.',
  ),
  toast: page(
    'Toast',
    'Notification toast with 6 types, 6 positions, rich colors, promise support, stacking, and imperative API.',
  ),
  toggle: page(
    'Toggle',
    'Pressable toggle button with 5 sizes, variant options, press effect, and controlled/uncontrolled modes. Built on Radix UI.',
  ),
  'toggle-group': page(
    'Toggle Group',
    'Group of toggle buttons with single/multiple selection, shared variant and size context. Built on Radix UI.',
  ),
  tooltip: page(
    'Tooltip',
    'Hover tooltip with 2 variants including glassmorphism, arrow support, and WCAG 1.4.13 compliance. Built on Radix UI.',
  ),
} as const

// ═══ Design token pages ═══

export const tokenSEO = {
  index: page(
    'Design Tokens',
    'Figma-synced design tokens — colors, typography, spacing, and more. Single source of truth for CSS, Tailwind, and JS.',
  ),
  animation: page(
    'Animation Tokens',
    '54 animation tokens with named 1:1 keyframe matching — toast, spinner, skeleton, and progress animations.',
  ),
  'border-width': page(
    'Border Width Tokens',
    '5 border width tokens from hairline to thick. Consistent border sizing across all components.',
  ),
  breakpoints: page(
    'Breakpoint Tokens',
    '5 responsive breakpoints for mobile-first design. Aligned with Tailwind CSS breakpoint system.',
  ),
  colors: page(
    'Color Tokens',
    '72 primitive colors + semantic tokens for light and dark mode. RGB channel support for opacity modifiers.',
  ),
  duration: page(
    'Duration Tokens',
    '8 transition duration tokens from instant to slow. Consistent timing across animations and interactions.',
  ),
  easing: page(
    'Easing Tokens',
    '5 easing curve tokens for smooth transitions. Standard, ease-in, ease-out, ease-in-out, and spring.',
  ),
  'icon-sizes': page(
    'Icon Size Tokens',
    '6 icon size tokens from 12px to 32px. Mapped to component sizes for consistent icon scaling.',
  ),
  installation: page(
    'Token Installation',
    'Install and configure design tokens — setup guides for Tailwind v3, Tailwind v4, and plain CSS variables.',
  ),
  opacity: page(
    'Opacity Tokens',
    '21 opacity tokens with CSS percentage and JS decimal output. For layering, overlays, and disabled states.',
  ),
  radius: page(
    'Border Radius Tokens',
    '9 border radius tokens from none to full. Consistent rounding across buttons, cards, inputs, and more.',
  ),
  scale: page(
    'Scale Tokens',
    '4 transform scale tokens for hover effects and press interactions. Subtle scaling for UI feedback.',
  ),
  shadows: page(
    'Shadow Tokens',
    '6 shadow elevation tokens from subtle to dramatic. Consistent depth perception across components.',
  ),
  spacing: page(
    'Spacing Tokens',
    '18 spacing tokens on a consistent scale. Used for padding, margin, and gap across all components.',
  ),
  typography: page(
    'Typography Tokens',
    '11 font sizes with CJK-optimized scale, 3 weights, and 2 font families. Semantic typography presets included.',
  ),
  'z-index': page(
    'Z-Index Tokens',
    '13 z-index tokens for layering — from base content to modals, toasts, and tooltips.',
  ),
} as const

// ═══ Guideline pages ═══

export const guidelineSEO = {
  accessibility: page(
    'Accessibility',
    'WCAG-compliant accessibility guide — keyboard navigation, screen reader support, and ARIA patterns for all components.',
  ),
  icons: page(
    'Icons',
    'Icon usage guidelines — 6 size tokens, Lucide React integration, and best practices for icon placement.',
  ),
  'tailwind-versions': page(
    'Tailwind v3 vs v4',
    'Side-by-side comparison of Tailwind v3 and v4 setup. The ecosystem\'s only design system supporting both versions.',
  ),
} as const
