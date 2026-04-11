'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Dot diameter per size (px) */
const DOT_SIZES = { sm: 4, default: 6, lg: 8 } as const

/** Gap between dots per size (px) */
const DOT_GAP = { sm: 3, default: 4, lg: 5 } as const

/** Animation speed in ms */
const SPEED_MS = { slow: 1600, default: 1100, fast: 700 } as const

/** Number of dots */
const DOT_COUNT = 3

// ============================================================================
// Color mapping
// ============================================================================

const bgColorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  muted:   'bg-text-subtle',
} as const

// ============================================================================
// Variants (CVA)
// ============================================================================

const typingIndicatorVariants = cva(
  'inline-flex items-center',
  {
    variants: {
      size: {
        sm:      'gap-1.5 text-xs',
        default: 'gap-2 text-sm',
        lg:      'gap-2.5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export interface TypingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof typingIndicatorVariants> {
  /** Animation style */
  variant?: 'dots' | 'cursor'
  /** Indicator color */
  color?: 'default' | 'primary' | 'muted'
  /** Animation speed */
  speed?: 'slow' | 'default' | 'fast'
  /** Accessible label (also shown as visual text when showLabel is true) */
  label?: string
  /** Render label text alongside the indicator */
  showLabel?: boolean
}

// ============================================================================
// Component
// ============================================================================

const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  (
    {
      className,
      variant = 'dots',
      size,
      color = 'muted',
      speed = 'default',
      label = 'Typing',
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const resolvedSize = size ?? 'default'

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn(typingIndicatorVariants({ size }), className)}
        {...props}
      >
        {variant === 'dots' && (
          <DotsIndicator size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'cursor' && (
          <CursorIndicator size={resolvedSize} color={color} />
        )}
        {showLabel && (
          <span className="text-text-muted select-none">{label}</span>
        )}
      </div>
    )
  }
)
TypingIndicator.displayName = 'TypingIndicator'

// ============================================================================
// Dots Indicator — 3 staggered bouncing dots (reuses animate-spinner-dot)
// ============================================================================

function DotsIndicator({
  size,
  color,
  speed,
}: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'muted'
  speed: 'slow' | 'default' | 'fast'
}) {
  const dotSize = DOT_SIZES[size]
  const gap = DOT_GAP[size]
  const duration = SPEED_MS[speed]

  return (
    <div className="inline-flex items-center" style={{ gap }}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-spinner-dot motion-reduce:animate-none motion-reduce:opacity-60',
            bgColorMap[color]
          )}
          style={{
            width: dotSize,
            height: dotSize,
            animationDuration: `${duration}ms`,
            animationDelay: `${i * (duration / DOT_COUNT / 1.5)}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Cursor sizes per component size
// ============================================================================

const CURSOR_SIZE = {
  sm:      { width: 2, height: 14 },
  default: { width: 2.5, height: 20 },
  lg:      { width: 3, height: 26 },
} as const

// ============================================================================
// Cursor Indicator — blinking cursor (text-cursor style)
// ============================================================================

function CursorIndicator({
  size,
  color,
}: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'muted'
}) {
  const { width, height } = CURSOR_SIZE[size]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-full animate-typing-cursor motion-reduce:animate-none motion-reduce:opacity-60',
        bgColorMap[color]
      )}
      style={{ width, height, animationDuration: '1200ms' }}
    />
  )
}

export { TypingIndicator, typingIndicatorVariants }
