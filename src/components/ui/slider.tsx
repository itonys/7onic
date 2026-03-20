'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Slider root variants
const sliderVariants = cva(
  'relative flex touch-none select-none',
  {
    variants: {
      size: {
        sm: '',
        default: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// Track sizes per orientation
const trackSizes = {
  sm: 'h-1 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-1',
  default: 'h-1.5 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-1.5',
  lg: 'h-2 data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-2',
}

// Thumb sizes
const thumbSizes = {
  sm: 'w-[var(--component-slider-thumb-sm)] h-[var(--component-slider-thumb-sm)]',
  default: 'w-[var(--component-slider-thumb-default)] h-[var(--component-slider-thumb-default)]',
  lg: 'w-[var(--component-slider-thumb-lg)] h-[var(--component-slider-thumb-lg)]',
}

// Content font sizes (for startContent / endContent)
const contentSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
}

// Color maps for range and thumb
const sliderColorMap = {
  default: {
    range: 'bg-foreground',
    thumb: 'bg-background border-foreground',
    thumbHover: 'hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-text)_16%,transparent)] hover:border-foreground',
    thumbActive: 'active:shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-text)_16%,transparent)]',
  },
  primary: {
    range: 'bg-primary',
    thumb: 'bg-primary-foreground border-primary',
    thumbHover: 'hover:shadow-primary-glow hover:border-primary-hover',
    thumbActive: 'active:shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]',
  },
} as const

export type SliderColor = keyof typeof sliderColorMap

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  /** Track and thumb color */
  color?: SliderColor
  /** Tooltip display mode: auto (hover/drag), always, never */
  showTooltip?: 'auto' | 'always' | 'never'
  /** Custom formatter for tooltip value */
  formatLabel?: (value: number) => string
  /** Content to display before the slider (icon, label, etc.) */
  startContent?: React.ReactNode
  /** Content to display after the slider */
  endContent?: React.ReactNode
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, size, color = 'default', value, defaultValue, onValueChange, showTooltip = 'never', formatLabel, startContent, endContent, orientation, ...props }, ref) => {
  const resolvedSize = size || 'default'
  const thumbCount = value?.length ?? defaultValue?.length ?? 1
  const hasTooltip = showTooltip !== 'never'
  const hasWrapper = !!(startContent || endContent)
  const isVertical = orientation === 'vertical'

  // Track value internally for tooltip display
  const [internalValue, setInternalValue] = React.useState(
    () => value ?? defaultValue ?? Array(thumbCount).fill(props.min ?? 0)
  )
  const displayValues = value ?? internalValue

  const handleValueChange = React.useCallback((newValue: number[]) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  const sliderRoot = (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        sliderVariants({ size }),
        isVertical
          ? 'h-full w-auto flex-col items-center'
          : 'w-full items-center',
        hasWrapper && (isVertical ? 'flex-1 min-h-0' : 'flex-1 min-w-0'),
        !hasWrapper && className
      )}
      value={value}
      defaultValue={defaultValue}
      onValueChange={hasTooltip ? handleValueChange : onValueChange}
      orientation={orientation}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow overflow-hidden rounded-full bg-border',
          isVertical ? 'h-full' : 'w-full',
          trackSizes[resolvedSize]
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute rounded-full', sliderColorMap[color].range,
            isVertical
              ? 'w-full transition-[top,bottom] duration-fast ease-out'
              : 'h-full transition-[left,right] duration-fast ease-out'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            'group/thumb block rounded-full border-2 shadow-sm', sliderColorMap[color].thumb,
            isVertical
              ? 'transition-[top,box-shadow,border-color] duration-fast ease-out'
              : 'transition-[left,box-shadow,border-color] duration-fast ease-out',
            sliderColorMap[color].thumbHover,
            sliderColorMap[color].thumbActive,
            'focus-visible:focus-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            thumbSizes[resolvedSize]
          )}
        >
          {hasTooltip && (
            <div
              className={cn(
                'absolute pointer-events-none',
                'transition-all duration-fast ease-out',
                isVertical
                  ? 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right'
                  : 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
                showTooltip === 'always'
                  ? 'opacity-100 scale-100'
                  : [
                      'opacity-0 scale-95',
                      'group-hover/thumb:opacity-100 group-hover/thumb:scale-100',
                      'group-active/thumb:opacity-100 group-active/thumb:scale-100',
                      'group-focus-visible/thumb:opacity-100 group-focus-visible/thumb:scale-100',
                    ]
              )}
            >
              <div className="relative bg-foreground text-background text-xs font-semibold font-mono tabular-nums px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                {formatLabel ? formatLabel(displayValues[i]) : displayValues[i]}
                {/* Arrow */}
                {isVertical ? (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-foreground" />
                ) : (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                )}
              </div>
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )

  if (!hasWrapper) return sliderRoot

  return (
    <div className={cn(
      isVertical ? 'inline-flex flex-col items-center gap-2 h-full' : 'flex items-center gap-3',
      className
    )}>
      {startContent && (
        <span className={cn('shrink-0 text-text-muted select-none', contentSizes[resolvedSize], props.disabled && 'opacity-50')}>
          {startContent}
        </span>
      )}
      {sliderRoot}
      {endContent && (
        <span className={cn('shrink-0 text-text-muted select-none', contentSizes[resolvedSize], props.disabled && 'opacity-50')}>
          {endContent}
        </span>
      )}
    </div>
  )
})
Slider.displayName = 'Slider'

export { Slider, sliderVariants }
