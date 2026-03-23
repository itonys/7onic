'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Pulse animation duration in ms (slower = more premium) */
const PULSE_DURATION_MS = 2000
/** Wave animation duration in ms */
const WAVE_DURATION_MS = 1800

/**
 * Wave shimmer gradient — wide sweep with soft edges.
 * 5 gradient stops create a broader, smoother light band.
 */
const WAVE_GRADIENT = [
  'transparent 0%',
  'transparent 30%',
  'var(--color-background-elevated) 50%',
  'transparent 70%',
  'transparent 100%',
].join(', ')

/**
 * Multi-line text width pattern.
 * Last line is always shorter for natural appearance.
 */
const MULTI_LINE_WIDTHS = ['100%', '92%', '100%', '85%', '75%'] as const

// ============================================================================
// Variants (CVA)
// ============================================================================

const skeletonVariants = cva(
  'bg-background-muted',
  {
    variants: {
      variant: {
        text: 'rounded-md h-4 w-full',
        circular: 'rounded-full w-10 h-10',
        rectangular: 'rounded-xl w-full h-24',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Animation style */
  animation?: 'pulse' | 'wave' | false
  /** Custom width */
  width?: string | number
  /** Custom height */
  height?: string | number
  /** Custom border radius */
  radius?: string | number
  /** Number of text lines (text variant only, generates stacked lines) */
  count?: number
  /** Conditional loading — true: show skeleton, false: render children */
  loading?: boolean
  /** Children to render when loading=false */
  children?: React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

const SkeletonBlock = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'count' | 'loading' | 'children'>>(
  ({
    className,
    variant = 'text',
    animation = 'pulse',
    width,
    height,
    radius,
    style,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          skeletonVariants({ variant }),
          animation === 'pulse' && 'animate-skeleton-pulse',
          animation === 'wave' && 'relative overflow-hidden',
          className,
        )}
        style={{
          ...style,
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
          ...(radius != null ? { borderRadius: radius } : {}),
          ...(animation === 'pulse' ? { animationDuration: `${PULSE_DURATION_MS}ms` } : {}),
        }}
        {...props}
      >
        {animation === 'wave' && (
          <div
            className="absolute inset-0 animate-skeleton-wave"
            style={{
              animationDuration: `${WAVE_DURATION_MS}ms`,
              background: `linear-gradient(90deg, ${WAVE_GRADIENT})`,
            }}
          />
        )}
      </div>
    )
  }
)
SkeletonBlock.displayName = 'SkeletonBlock'

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    count,
    loading,
    children,
    variant = 'text',
    ...rest
  }, ref) => {
    // loading mode — show skeleton or children
    if (loading !== undefined) {
      if (!loading) return <>{children}</>
      // When loading, fall through to render skeleton
    }

    // count mode — render multiple text lines
    if (count != null && count > 1 && variant === 'text') {
      return (
        <div ref={ref} className="space-y-2.5" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => {
            const widthPattern = MULTI_LINE_WIDTHS[i % MULTI_LINE_WIDTHS.length]
            const isLast = i === count - 1
            return (
              <SkeletonBlock
                key={i}
                variant="text"
                style={{ width: isLast ? '60%' : widthPattern }}
                {...rest}
              />
            )
          })}
        </div>
      )
    }

    return <SkeletonBlock ref={ref} variant={variant} {...rest} />
  }
)
Skeleton.displayName = 'Skeleton'

export { Skeleton, skeletonVariants }
