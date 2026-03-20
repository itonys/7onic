'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

// Switch track variants
const switchVariants = cva(
  [
    'group peer inline-flex shrink-0 cursor-pointer items-center rounded-full',
    'border border-transparent transition-all duration-normal ease-out',
    'focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=unchecked]:bg-border',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'w-[var(--component-switch-track-sm-width)] h-[var(--component-switch-track-sm-height)]',
        default: 'w-[var(--component-switch-track-default-width)] h-[var(--component-switch-track-default-height)]',
        lg: 'w-[var(--component-switch-track-lg-width)] h-[var(--component-switch-track-lg-height)]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// Thumb sizes
const thumbSizes = {
  sm: 'w-[var(--component-switch-thumb-sm)] h-[var(--component-switch-thumb-sm)]',
  default: 'w-[var(--component-switch-thumb-default)] h-[var(--component-switch-thumb-default)]',
  lg: 'w-[var(--component-switch-thumb-lg)] h-[var(--component-switch-thumb-lg)]',
}

// Thumb translate when checked: track_width - thumb_size - 2px (border 1px × 2)
const thumbTranslate = {
  sm: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-sm-width)_-_var(--component-switch-thumb-sm)_-_2px)]',
  default: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-default-width)_-_var(--component-switch-thumb-default)_-_2px)]',
  lg: 'data-[state=checked]:translate-x-[calc(var(--component-switch-track-lg-width)_-_var(--component-switch-thumb-lg)_-_2px)]',
}

// Gap between switch and label
const gapSizes = {
  sm: 'gap-2',      // 8px
  default: 'gap-2.5', // 10px
  lg: 'gap-3',      // 12px
}

// Label font sizes
const labelSizes = {
  sm: 'text-xs',      // 12px
  default: 'text-md',  // 14px
  lg: 'text-base',    // 16px
}

export type SwitchLabelPosition = 'start' | 'end' | 'top' | 'bottom'
export type SwitchColor = 'default' | 'primary' | 'success' | 'warning' | 'error'

// Checked track color per color variant
const checkedTrackColors: Record<SwitchColor, string> = {
  default: 'data-[state=checked]:bg-foreground',
  primary: 'data-[state=checked]:bg-primary',
  success: 'data-[state=checked]:bg-success',
  warning: 'data-[state=checked]:bg-warning',
  error: 'data-[state=checked]:bg-error',
}

// Checked icon color per color variant
const checkedIconColors: Record<SwitchColor, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

// Icon sizes per thumb size
const iconSizes = {
  sm: 'hidden',            // 12px thumb — too small for icons
  default: 'w-2.5 h-2.5', // 10px icon in 16px thumb
  lg: 'w-3.5 h-3.5',      // 14px icon in 20px thumb
}

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  label?: string
  labelPosition?: SwitchLabelPosition
  startLabel?: string
  endLabel?: string
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
  color?: SwitchColor
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, label, labelPosition = 'end', startLabel, endLabel, checkedIcon, uncheckedIcon, color = 'default', disabled, id, ...props }, ref) => {
  const fieldContext = useFieldContext()
  const resolvedSize = size || 'default'
  const resolvedDisabled = disabled ?? fieldContext?.disabled
  const generatedId = React.useId()
  const switchId = id ?? fieldContext?.id ?? generatedId

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      id={switchId}
      disabled={resolvedDisabled}
      className={cn(switchVariants({ size }), checkedTrackColors[color], className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'group/thumb pointer-events-none flex items-center justify-center rounded-full shadow-sm ring-0',
          color === 'default' ? 'bg-background' : 'bg-primary-foreground',
          'transition-transform duration-normal ease-out',
          'data-[state=unchecked]:translate-x-0',
          thumbSizes[resolvedSize],
          thumbTranslate[resolvedSize]
        )}
      >
        {(checkedIcon || uncheckedIcon) && resolvedSize !== 'sm' && (
          <>
            {checkedIcon && (
              <span className={cn(
                iconSizes[resolvedSize],
                checkedIconColors[color],
                'hidden group-data-[state=checked]/thumb:block',
              )}>
                {checkedIcon}
              </span>
            )}
            {uncheckedIcon && (
              <span className={cn(
                iconSizes[resolvedSize],
                'text-text-muted',
                'hidden group-data-[state=unchecked]/thumb:block',
              )}>
                {uncheckedIcon}
              </span>
            )}
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  const labelClassName = cn(
    labelSizes[resolvedSize],
    'text-text-muted cursor-pointer select-none transition-colors duration-micro',
    'group-hover/switch:text-foreground',
    resolvedDisabled && 'opacity-50 cursor-not-allowed'
  )

  // Sides mode: startLabel / endLabel
  if (startLabel || endLabel) {
    return (
      <div className={cn('group/switch flex items-center', gapSizes[resolvedSize])}>
        {startLabel && (
          <label htmlFor={switchId} className={labelClassName}>
            {startLabel}
          </label>
        )}
        <div className="flex items-center">
          {switchEl}
        </div>
        {endLabel && (
          <label htmlFor={switchId} className={labelClassName}>
            {endLabel}
          </label>
        )}
      </div>
    )
  }

  if (!label) return switchEl

  const isVertical = labelPosition === 'top' || labelPosition === 'bottom'
  const isReversed = labelPosition === 'start' || labelPosition === 'top'

  return (
    <div className={cn(
      'group/switch flex',
      isVertical ? 'flex-col items-start gap-1.5' : 'items-center',
      isReversed && (isVertical ? 'flex-col-reverse' : 'flex-row-reverse'),
      !isVertical && gapSizes[resolvedSize],
    )}>
      <div className="flex items-center">
        {switchEl}
      </div>
      <label htmlFor={switchId} className={labelClassName}>
        {label}
      </label>
    </div>
  )
})
Switch.displayName = 'Switch'

export { Switch, switchVariants }
