'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Color maps for checked/indeterminate state
const checkboxColorMap = {
  default: 'data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:border-foreground data-[state=indeterminate]:text-background',
  primary: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
} as const

export type CheckboxColor = keyof typeof checkboxColorMap

// Checkbox box variants
const checkboxVariants = cva(
  [
    'peer relative shrink-0 border-border transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'hover:border-border-strong',
    // Transparent hit area expansion via ::after
    "after:absolute after:content-['']",
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5 after:-inset-[5px]',  // 14px box → 24px click
        default: 'w-4 h-4 after:-inset-2',    // 16px box → 32px click
        lg: 'w-5 h-5 after:-inset-2',         // 20px box → 36px click
      },
      radius: {
        none: 'rounded-none',  // 0px — sharp square
        sm: 'rounded-sm',      // 2px — default checkbox style
        md: 'rounded',         // 4px — softer corners
      },
      weight: {
        thin: 'border',   // 1px
        bold: 'border-2', // 2px
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'sm',
      weight: 'bold',
    },
  }
)

// Check icon sizes per checkbox size
const checkIconSizes = {
  sm: 'w-2.5 h-2.5',  // 10px in 14px box
  default: 'w-3 h-3', // 12px in 16px box
  lg: 'icon-xs',       // 14px in 20px box
}

// Label font sizes per checkbox size
const labelSizes = {
  sm: 'text-xs',     // 12px
  default: 'text-md', // 14px
  lg: 'text-base',   // 16px
}

// Gap between checkbox and label
const gapSizes = {
  sm: 'gap-1.5',
  default: 'gap-2',
  lg: 'gap-2.5',
}

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'children'>,
    VariantProps<typeof checkboxVariants> {
  /** Checked state color */
  color?: CheckboxColor
  label?: string
  radius?: 'none' | 'sm' | 'md'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, radius, weight, color = 'default', label, disabled, id, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedSize = size || 'default'
  const resolvedDisabled = disabled ?? fieldContext?.disabled
  const generatedId = React.useId()
  const checkboxId = id ?? fieldContext?.id ?? generatedId

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      disabled={resolvedDisabled}
      className={cn(
        checkboxVariants({ size, radius, weight }),
        checkboxColorMap[color],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center animate-checkbox-enter">
        <CheckIcon className={checkIconSizes[resolvedSize]} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label) return checkbox

  return (
    <div className={cn('group flex items-center', gapSizes[resolvedSize])}>
      <div className="flex items-center">
        {checkbox}
      </div>
      <label
        htmlFor={checkboxId}
        className={cn(
          labelSizes[resolvedSize],
          'text-text-muted cursor-pointer select-none transition-colors duration-micro',
          'group-hover:text-foreground',
          resolvedDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {label}
      </label>
    </div>
  )
})
Checkbox.displayName = 'Checkbox'

// Check icon — renders ✓ for checked, — for indeterminate
function CheckIcon({ className }: { className?: string }) {
  return (
    <>
      {/* Check mark (shown when data-state=checked on parent Indicator) */}
      <svg
        className={cn(className, 'hidden [[data-state=checked]_&]:block')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {/* Dash (shown when data-state=indeterminate on parent Indicator) */}
      <svg
        className={cn(className, 'hidden [[data-state=indeterminate]_&]:block')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    </>
  )
}

export { Checkbox, checkboxVariants }
