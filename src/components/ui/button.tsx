'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useButtonGroup } from './button-group'

// Solid color maps (applied when variant="solid")
const solidColorMap = {
  default: 'bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80',
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
  destructive: 'bg-error text-error-foreground hover:bg-error-hover active:bg-error-active',
} as const

export type ButtonColor = keyof typeof solidColorMap

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'font-semibold',
        outline: 'border border-border bg-background text-foreground hover:bg-background-muted font-normal',
        ghost: 'text-foreground hover:bg-background-muted font-normal',
        link: 'text-text-link underline-offset-4 hover:underline font-normal',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',     // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',       // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',     // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2', // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',    // 48px height, 24px paddingX, 16px font
        icon: 'h-10 w-10',
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
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
      radius: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Solid variant color */
  color?: ButtonColor
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  selected?: boolean
  fontWeight?: 'normal' | 'semibold'
  pressEffect?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant: variantProp,
    color: colorProp,
    size: sizeProp,
    radius: radiusProp,
    fullWidth,
    asChild = false,
    loading = false,
    disabled: disabledProp,
    leftIcon,
    rightIcon,
    selected = false,
    fontWeight: fontWeightProp,
    pressEffect,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const groupContext = useButtonGroup()

    // Use context values as fallback, individual props take precedence
    const variant = variantProp ?? groupContext?.variant ?? 'solid'
    const color = colorProp ?? 'default'
    const size = sizeProp ?? groupContext?.size
    const radius = radiusProp ?? groupContext?.radius
    const disabled = disabledProp ?? groupContext?.disabled

    // Priority: direct prop > ButtonGroup context > variant default (no class)
    const fontWeight = fontWeightProp ?? groupContext?.fontWeight

    // FontWeight class (overrides variant default)
    const fontWeightClass = fontWeight === 'normal' ? 'font-normal' : fontWeight === 'semibold' ? 'font-semibold' : ''

    // Icon size for button with text (5-step scale)
    // xs~sm: 14px, md~default~lg: 16px
    const iconSizeClass = {
      xs: 'icon-xs',      // 14px
      sm: 'icon-xs',      // 14px
      md: 'icon-sm',      // 16px
      default: 'icon-sm', // 16px
      lg: 'icon-sm',      // 16px
      icon: 'icon-md',    // icon-only → 20px
    }[size || 'default']

    // Selected styles by variant (used in ButtonGroup)
    const selectedStyles = selected ? (
      variant === 'outline' ? 'bg-background-muted' :
      variant === 'ghost' ? 'font-semibold' : ''
    ) : ''

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, fullWidth }), variant === 'solid' && solidColorMap[color], pressEffect !== false && 'active:scale-pressed', fontWeightClass, selectedStyles, className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-pressed={selected || undefined}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className={cn(iconSizeClass, 'animate-spin')}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className={cn(iconSizeClass, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className={cn(iconSizeClass, '[&>svg]:w-full [&>svg]:h-full')} aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
