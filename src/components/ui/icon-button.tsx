'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
        destructive: 'bg-error text-error-foreground hover:bg-error-hover active:bg-error-active',
        outline: 'border border-border bg-background text-foreground hover:bg-background-muted hover:border-border-strong',
        ghost: 'text-foreground hover:bg-background-muted',
        subtle: 'text-text-muted hover:text-foreground hover:bg-background-muted',
      },
      size: {
        xs: 'h-7 w-7',      // 28px - spacing.7
        sm: 'h-8 w-8',      // 32px - spacing.8
        md: 'h-9 w-9',      // 36px - spacing.9
        default: 'h-10 w-10', // 40px - spacing.10
        lg: 'h-12 w-12',    // 48px - spacing.12
      },
      radius: {
        none: 'rounded-none',      // 0px - primitive.borderRadius.none
        sm: 'rounded-sm',          // 2px - primitive.borderRadius.sm
        base: 'rounded',           // 4px - primitive.borderRadius.base
        default: 'rounded-md',     // 6px - primitive.borderRadius.md (Figma button default)
        lg: 'rounded-lg',          // 8px - primitive.borderRadius.lg
        xl: 'rounded-xl',          // 12px - primitive.borderRadius.xl
        '2xl': 'rounded-2xl',      // 16px - primitive.borderRadius.2xl
        '3xl': 'rounded-3xl',      // 24px - primitive.borderRadius.3xl
        full: 'rounded-full',      // 9999px - primitive.borderRadius.full
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  loading?: boolean
  pressEffect?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, radius, asChild = false, loading, pressEffect, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Icon size for icon-only button (5-step scale)
    // XS: 14px, SM~MD: 16px, Default: 20px, LG: 24px
    const iconSize = {
      xs: 'icon-xs',      // 14px
      sm: 'icon-sm',      // 16px
      md: 'icon-sm',      // 16px
      default: 'icon-md', // 20px
      lg: 'icon-lg',      // 24px
    }[size || 'default']

    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, radius }), pressEffect !== false && 'active:scale-pressed', className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <svg
            className={cn(iconSize, 'animate-spin')}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <span className={cn(iconSize, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">
            {children}
          </span>
        )}
      </Comp>
    )
  }
)
IconButton.displayName = 'IconButton'

export { IconButton, iconButtonVariants }
