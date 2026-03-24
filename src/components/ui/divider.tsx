'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Divider ─────────────────────────────────────────────────

const dividerVariants = cva('shrink-0', {
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full self-stretch',
    },
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    color: {
      default: 'border-border/60',
      muted: 'border-border-subtle',
      strong: 'border-border-strong',
    },
    spacing: {
      sm: '',
      md: '',
      default: '',
      lg: '',
    },
  },
  compoundVariants: [
    // Horizontal spacing
    { orientation: 'horizontal', spacing: 'sm', className: 'my-2' },
    { orientation: 'horizontal', spacing: 'md', className: 'my-3' },
    { orientation: 'horizontal', spacing: 'default', className: 'my-4' },
    { orientation: 'horizontal', spacing: 'lg', className: 'my-8' },
    // Vertical spacing
    { orientation: 'vertical', spacing: 'sm', className: 'mx-2' },
    { orientation: 'vertical', spacing: 'md', className: 'mx-3' },
    { orientation: 'vertical', spacing: 'default', className: 'mx-4' },
    { orientation: 'vertical', spacing: 'lg', className: 'mx-8' },
    // Horizontal line style (border-top)
    { orientation: 'horizontal', className: 'border-t border-l-0' },
    // Vertical line style (border-left)
    { orientation: 'vertical', className: 'border-l border-t-0' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    color: 'default',
    spacing: 'default',
  },
})

export interface DividerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, 'children' | 'color' | 'orientation'> {
  /** Direction of the divider */
  orientation?: 'horizontal' | 'vertical'
  /** Line style */
  variant?: 'solid' | 'dashed' | 'dotted'
  /** Line color intensity */
  color?: 'default' | 'muted' | 'strong'
  /** Spacing around the divider */
  spacing?: 'sm' | 'md' | 'default' | 'lg'
  /** Content to display on the divider line (horizontal only) */
  label?: React.ReactNode
  /** Label position along the line */
  labelPosition?: 'left' | 'center' | 'right'
}

const Divider = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  DividerProps
>(({
  className,
  orientation = 'horizontal',
  variant = 'solid',
  color = 'default',
  spacing = 'default',
  label,
  labelPosition = 'center',
  decorative = true,
  ...props
}, ref) => {
  // Line style class for label mode
  const lineClass = cn(
    'flex-1',
    variant === 'dashed' ? 'border-dashed' : variant === 'dotted' ? 'border-dotted' : 'border-solid',
    color === 'muted' ? 'border-border-subtle' : color === 'strong' ? 'border-border-strong' : 'border-border/60',
    'border-t'
  )

  // Spacing class for label wrapper
  const spacingClass =
    spacing === 'sm' ? 'my-2'
    : spacing === 'md' ? 'my-3'
    : spacing === 'lg' ? 'my-8'
    : 'my-4'

  // Horizontal with label: render as flex container with two lines
  if (label && orientation === 'horizontal') {
    return (
      <div
        role={decorative ? 'none' : 'separator'}
        aria-orientation="horizontal"
        className={cn(
          'flex items-center w-full',
          spacingClass,
          className
        )}
      >
        <div className={cn(
          lineClass,
          labelPosition === 'left' ? 'max-w-[10%]' : ''
        )} />
        <span className="px-3 text-sm text-text-muted shrink-0 select-none">{label}</span>
        <div className={cn(
          lineClass,
          labelPosition === 'right' ? 'max-w-[10%]' : ''
        )} />
      </div>
    )
  }

  // Default: Radix Separator
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        dividerVariants({ orientation, variant, color, spacing }),
        className
      )}
      {...props}
    />
  )
})
Divider.displayName = 'Divider'

// ─── Exports ─────────────────────────────────────────────────

export { Divider, dividerVariants }
