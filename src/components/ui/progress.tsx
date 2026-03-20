'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Circular SVG viewBox size */
const CIRCULAR_VIEWBOX = 100
/** Circular center point */
const CIRCULAR_CENTER = 50

/** Circular sizes (diameter in px) */
const CIRCULAR_SIZES = {
  sm: 32,
  default: 48,
  lg: 64,
} as const

/** Circular stroke thickness per size */
const CIRCULAR_THICKNESS = {
  sm: 4,
  default: 5,
  lg: 6,
} as const

/** Circular value font sizes */
const CIRCULAR_FONT_SIZES = {
  sm: 'text-2xs',
  default: 'text-xs',
  lg: 'text-sm',
} as const

// ============================================================================
// Linear Progress
// ============================================================================

const linearTrackVariants = cva(
  'relative w-full overflow-hidden bg-border rounded-full',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const colorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
} as const

const circularColorMap = {
  default: 'stroke-foreground',
  primary: 'stroke-primary',
} as const

const valueFontSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
} as const

// ============================================================================
// Types
// ============================================================================

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'children'>,
    VariantProps<typeof linearTrackVariants> {
  /** Progress type */
  type?: 'linear' | 'circular'
  /** Current value (0 to max) */
  value?: number
  /** Maximum value */
  max?: number
  /** Visual variant (linear only) */
  variant?: 'default' | 'striped'
  /** Indicator color */
  color?: 'default' | 'primary'
  /** Custom indicator class (overrides color) */
  indicatorClassName?: string
  /** Show percentage value */
  showValue?: boolean
  /** Custom label formatter */
  formatLabel?: (value: number, max: number) => string
  /** Animate striped variant */
  animated?: boolean
  /** Circular stroke thickness override */
  thickness?: number
  /** Accessibility label */
  label?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({
  className,
  type = 'linear',
  value = 0,
  max = 100,
  size,
  variant = 'default',
  color = 'default',
  indicatorClassName,
  showValue = false,
  formatLabel,
  animated = false,
  thickness,
  label,
  ...props
}, ref) => {
  const resolvedSize = size || 'default'
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100

  const valueLabel = formatLabel
    ? formatLabel(clampedValue, max)
    : `${Math.round(percentage)}%`

  // ── Circular ──
  if (type === 'circular') {
    const diameter = CIRCULAR_SIZES[resolvedSize]
    const strokeWidth = thickness ?? CIRCULAR_THICKNESS[resolvedSize]
    const r = (CIRCULAR_VIEWBOX - strokeWidth) / 2
    const circumference = 2 * Math.PI * r
    const offset = circumference * (1 - percentage / 100)

    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="relative" style={{ width: diameter, height: diameter }}>
          <svg
            viewBox={`0 0 ${CIRCULAR_VIEWBOX} ${CIRCULAR_VIEWBOX}`}
            className="transform -rotate-90"
            width={diameter}
            height={diameter}
          >
            {/* Track */}
            <circle
              cx={CIRCULAR_CENTER}
              cy={CIRCULAR_CENTER}
              r={r}
              fill="none"
              className="stroke-border"
              strokeWidth={strokeWidth}
            />
            {/* Indicator */}
            <circle
              cx={CIRCULAR_CENTER}
              cy={CIRCULAR_CENTER}
              r={r}
              fill="none"
              className={cn(indicatorClassName || circularColorMap[color], 'transition-[stroke-dashoffset] duration-normal ease-out')}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          {/* Center value */}
          {showValue && resolvedSize !== 'sm' && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center font-semibold font-mono tabular-nums text-foreground',
              CIRCULAR_FONT_SIZES[resolvedSize]
            )}>
              {valueLabel}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Linear ──
  const stripedBg = variant === 'striped'
    ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]'
    : ''

  return (
    <div className={cn('flex items-center gap-3', showValue && 'w-full', className)}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(linearTrackVariants({ size }))}
        value={clampedValue}
        max={max}
        aria-label={label}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full transition-[width] duration-normal ease-out rounded-full',
            indicatorClassName || colorMap[color],
            stripedBg,
            animated && variant === 'striped' && 'animate-progress-stripe',
          )}
          style={{ width: `${percentage}%` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className={cn(
          'shrink-0 font-semibold font-mono tabular-nums text-foreground',
          valueFontSizes[resolvedSize]
        )}>
          {valueLabel}
        </span>
      )}
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress, linearTrackVariants }
