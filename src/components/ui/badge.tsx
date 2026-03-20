'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Badge color maps for variant × color combinations
// Uses semantic tokens (*.tint, text-text-*) for v4 dark mode compatibility
const colorMap = {
  default: {
    solid: 'bg-foreground text-background',
    subtle: 'bg-background-muted text-foreground',
    outline: 'border-border text-foreground',
  },
  primary: {
    solid: 'bg-primary text-primary-foreground',
    subtle: 'bg-primary-tint text-text-primary',
    outline: 'border-primary text-text-primary',
  },
  success: {
    solid: 'bg-success text-success-foreground',
    subtle: 'bg-success-tint text-text-success',
    outline: 'border-success text-text-success',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground',
    subtle: 'bg-warning-tint text-text-warning',
    outline: 'border-warning text-text-warning',
  },
  error: {
    solid: 'bg-error text-error-foreground',
    subtle: 'bg-error-tint text-text-error',
    outline: 'border-error text-text-error',
  },
  info: {
    solid: 'bg-info text-info-foreground',
    subtle: 'bg-info-tint text-text-info',
    outline: 'border-info text-text-info',
  },
} as const

const badgeVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors select-none',
  {
    variants: {
      size: {
        sm: 'h-5 min-w-5 px-1.5 text-2xs gap-1',       // 20px height, 6px paddingX, 11px font
        default: 'h-6 min-w-6 px-2 text-xs gap-1',      // 24px height, 8px paddingX, 12px font
        lg: 'h-7 min-w-7 px-2.5 text-sm gap-1.5',       // 28px height, 10px paddingX, 13px font
      },
      radius: {
        sm: 'rounded-sm',       // 2px
        base: 'rounded',        // 4px
        md: 'rounded-md',       // 6px
        lg: 'rounded-lg',       // 8px
        full: 'rounded-full',   // 9999px
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'full',
    },
  }
)

// Icon sizes per badge size
const badgeIconSizes = {
  sm: 'icon-2xs',      // 12px
  default: 'icon-2xs', // 12px
  lg: 'icon-xs',       // 14px
} as const

// Dot sizes per badge size
const badgeDotSizes = {
  sm: 'w-1 h-1',
  default: 'w-1.5 h-1.5',
  lg: 'w-1.5 h-1.5',
} as const

// Dot colors per color (matches the solid background)
const dotColorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
} as const

export type BadgeVariant = 'solid' | 'subtle' | 'outline'
export type BadgeColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'default' | 'lg'
export type BadgeRadius = 'sm' | 'base' | 'md' | 'lg' | 'full'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Visual style */
  variant?: BadgeVariant
  /** Semantic color */
  color?: BadgeColor
  /** Leading icon slot */
  icon?: React.ReactNode
  /** Show a status dot before text */
  dot?: boolean
  /** Show a remove button */
  removable?: boolean
  /** Callback when remove button is clicked */
  onRemove?: () => void
  /** Render as child element (Slot pattern) */
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'subtle',
    color = 'default',
    size,
    radius,
    icon,
    dot = false,
    removable = false,
    onRemove,
    asChild = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'span'
    const resolvedSize = size || 'default'

    // Color classes from variant × color map
    const colorClasses = colorMap[color][variant]
    // Outline variant needs border
    const outlineClasses = variant === 'outline' ? 'border bg-transparent' : ''

    // Dot color: in solid variant use currentColor (white/foreground), otherwise use semantic color
    const dotColor = variant === 'solid' ? 'bg-current' : dotColorMap[color]

    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({ size, radius }),
          colorClasses,
          outlineClasses,
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn('shrink-0 rounded-full', badgeDotSizes[resolvedSize], dotColor)}
            aria-hidden="true"
          />
        )}
        {icon && (
          <span
            className={cn('shrink-0 [&>svg]:w-full [&>svg]:h-full', badgeIconSizes[resolvedSize])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
        {removable && (
          <button
            type="button"
            className="shrink-0 -mr-0.5 ml-0.5 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            aria-label="Remove"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </Comp>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
