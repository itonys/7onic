'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Base styles without size (for iconOnly mode)
const toggleBaseStyles = 'inline-flex items-center justify-center text-text-muted transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50'

const toggleVariants = cva(
  toggleBaseStyles,
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        ghost: 'bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground',
        'outline-ghost': 'border border-border bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:border-border',
      },
      fontWeight: {
        normal: 'font-normal',
        semibold: 'font-semibold',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',     // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',       // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',     // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2', // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',    // 48px height, 24px paddingX, 16px font
      },
      radius: {
        none: 'rounded-none',      // 0px - primitive.borderRadius.none
        sm: 'rounded-sm',          // 2px - primitive.borderRadius.sm
        base: 'rounded',           // 4px - primitive.borderRadius.base
        default: 'rounded-md',     // 6px - primitive.borderRadius.md
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
      radius: 'default',  // 6px - primitive.borderRadius.md (Figma button default)
      fontWeight: 'normal',
    },
  }
)

// iconOnly sizes - square like IconButton (same width and height, no padding)
const iconOnlySizes = {
  xs: 'h-7 w-7',      // 28px × 28px - spacing.7
  sm: 'h-8 w-8',      // 32px × 32px - spacing.8
  md: 'h-9 w-9',      // 36px × 36px - spacing.9
  default: 'h-10 w-10', // 40px × 40px - spacing.10
  lg: 'h-12 w-12',    // 48px × 48px - spacing.12
}

// Radius classes for iconOnly mode
const radiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  default: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// Variant classes for iconOnly mode
const variantClasses = {
  default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
  outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
  ghost: 'bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground',
  'outline-ghost': 'border border-border bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:border-border',
}

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    Omit<VariantProps<typeof toggleVariants>, 'fontWeight'> {
  iconOnly?: boolean
  fontWeight?: 'normal' | 'semibold'
  pressEffect?: boolean
}

// Icon size for text+icon mode (5-step scale)
// xs~sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  xs: '[&>svg]:icon-xs',      // 14px
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, radius, fontWeight, iconOnly, pressEffect, ...props }, ref) => {
  const sizeKey = size || 'default'
  const radiusKey = radius || 'default'
  const variantKey = variant || 'default'
  const fontWeightClass = fontWeight === 'normal' ? 'font-normal' : fontWeight === 'semibold' ? 'font-semibold' : 'font-normal'

  // When iconOnly, build classes manually without padding
  if (iconOnly) {
    // Icon only uses larger icon sizes (like IconButton, 5-step scale)
    // XS: 14px, SM~MD: 16px, Default: 20px, LG: 24px
    const iconOnlyIconSize = {
      xs: '[&>svg]:icon-xs',      // 14px
      sm: '[&>svg]:icon-sm',      // 16px
      md: '[&>svg]:icon-sm',      // 16px
      default: '[&>svg]:icon-md', // 20px
      lg: '[&>svg]:icon-lg',      // 24px
    }[sizeKey]

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(
          toggleBaseStyles,
          pressEffect !== false && 'active:scale-pressed',
          fontWeightClass,
          variantClasses[variantKey],
          iconOnlySizes[sizeKey],
          radiusClasses[radiusKey],
          iconOnlyIconSize,
          className
        )}
        {...props}
      />
    )
  }

  // Normal mode with padding
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        toggleVariants({ variant, size, radius, fontWeight }),
        pressEffect !== false && 'active:scale-pressed',
        iconSizeClasses[sizeKey],
        className
      )}
      {...props}
    />
  )
})

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
