'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Color maps for checked state
const radioColorMap = {
  default: {
    border: 'data-[state=checked]:border-foreground',
    dot: 'bg-foreground',
  },
  primary: {
    border: 'data-[state=checked]:border-primary',
    dot: 'bg-primary',
  },
} as const

export type RadioColor = keyof typeof radioColorMap

// Context to pass size, weight, color from RadioGroup to RadioGroupItem
type RadioGroupContextValue = {
  size: 'sm' | 'default' | 'lg'
  weight: 'thin' | 'bold'
  color: RadioColor
  disabled?: boolean
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({ size: 'default', weight: 'bold', color: 'default' })

// RadioGroup container
const radioGroupVariants = cva('grid gap-3', {
  variants: {
    orientation: {
      vertical: 'grid-cols-1',
      horizontal: 'grid-flow-col auto-cols-max gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  size?: 'sm' | 'default' | 'lg'
  weight?: 'thin' | 'bold'
  /** Checked state color */
  color?: RadioColor
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, size = 'default', weight = 'bold', color = 'default', disabled, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedDisabled = disabled ?? fieldContext?.disabled

  return (
    <RadioGroupContext.Provider value={{ size, weight, color, disabled: resolvedDisabled }}>
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(radioGroupVariants({ orientation }), className)}
        orientation={orientation || undefined}
        disabled={resolvedDisabled}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = 'RadioGroup'

// RadioGroupItem circle variants
const radioItemVariants = cva(
  [
    'relative shrink-0 rounded-full border-border hover:border-border-strong transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    // Transparent hit area expansion via ::after
    "after:absolute after:content-['']",
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5 after:-inset-[5px]',     // 14px circle → 24px click
        default: 'w-4 h-4 after:-inset-2',          // 16px circle → 32px click
        lg: 'w-5 h-5 after:-inset-2',               // 20px circle → 36px click
      },
      weight: {
        thin: 'border',   // 1px
        bold: 'border-2', // 2px
      },
    },
    defaultVariants: {
      size: 'default',
      weight: 'bold',
    },
  }
)

// Dot sizes per radio size
const dotSizes = {
  sm: 'w-1.5 h-1.5',       // 6px
  default: 'w-2 h-2',      // 8px
  lg: 'w-2.5 h-2.5',       // 10px
}

// Label font sizes
const labelSizes = {
  sm: 'text-xs',       // 12px
  default: 'text-md',  // 14px
  lg: 'text-base',     // 16px
}

// Gap between radio and label
const gapSizes = {
  sm: 'gap-1.5',
  default: 'gap-2',
  lg: 'gap-2.5',
}

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, disabled, ...props }, ref) => {
  const { size, weight, color, disabled: groupDisabled } = React.useContext(RadioGroupContext)
  const resolvedDisabled = disabled ?? groupDisabled
  const itemId = React.useId()

  const radio = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={label ? itemId : undefined}
      disabled={resolvedDisabled}
      className={cn(
        radioItemVariants({ size, weight }),
        radioColorMap[color].border,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center animate-radio-enter">
        <div className={cn('rounded-full', radioColorMap[color].dot, dotSizes[size])} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )

  if (!label) return radio

  return (
    <div className={cn('group flex items-center', gapSizes[size])}>
      <div className="flex items-center">
        {radio}
      </div>
      <label
        htmlFor={itemId}
        className={cn(
          labelSizes[size],
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
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioItemVariants }
