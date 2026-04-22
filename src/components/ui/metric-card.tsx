'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── CVA Variants ──

const metricCardVariants = cva(
  'transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border',
        elevated: 'bg-background-paper shadow-md',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'p-4',
        default: 'p-4 sm:p-5',
        lg: 'p-4 sm:p-6',
      },
      radius: {
        none: 'rounded-none',    // 0px
        sm: 'rounded-sm',        // 2px
        base: 'rounded',         // 4px
        default: 'rounded-xl',   // 12px - card default
        lg: 'rounded-lg',        // 8px
        xl: 'rounded-xl',        // 12px
        '2xl': 'rounded-2xl',    // 16px
        '3xl': 'rounded-3xl',    // 24px
        full: 'rounded-full',    // 9999px
      },
    },
    defaultVariants: { variant: 'default', size: 'default', radius: 'default' },
  }
)

// ── Size maps ──

const valueSizes = {
  sm: 'text-xl',
  default: 'text-2xl',
  lg: 'text-3xl',
} as const

const titleSizes = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-sm',
} as const

const iconWrapperSizes = {
  sm: '[&>svg]:icon-sm',
  default: '[&>svg]:icon-md',
  lg: '[&>svg]:icon-lg',
} as const

// ── Trend config ──

const trendConfig = {
  up: { color: 'text-text-success', srLabel: 'Increased' },
  down: { color: 'text-text-error', srLabel: 'Decreased' },
  neutral: { color: 'text-text-muted', srLabel: 'No change' },
} as const

// ── Context ──

type MetricCardContextValue = { size: 'sm' | 'default' | 'lg'; animated: boolean }
const MetricCardContext = React.createContext<MetricCardContextValue>({ size: 'default', animated: false })

// ── Types ──

export type MetricCardVariant = 'default' | 'elevated' | 'ghost'
export type MetricCardSize = 'sm' | 'default' | 'lg'
export type MetricCardRadius = 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
export type MetricCardTrendDirection = 'up' | 'down' | 'neutral'

// ── MetricCard (root) ──

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  animated?: boolean
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, variant, size, radius, animated = false, children, ...props }, ref) => {
    const resolvedSize = (size || 'default') as MetricCardSize
    return (
      <MetricCardContext.Provider value={{ size: resolvedSize, animated }}>
        <div
          ref={ref}
          className={cn(metricCardVariants({ variant, size, radius }), className)}
          {...props}
        >
          {children}
        </div>
      </MetricCardContext.Provider>
    )
  }
)
MetricCard.displayName = 'MetricCard'

// ── MetricCardHeader ──

export interface MetricCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const MetricCardHeader = React.forwardRef<HTMLDivElement, MetricCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    />
  )
)
MetricCardHeader.displayName = 'MetricCardHeader'

// ── MetricCardTitle ──

export interface MetricCardTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardTitle = React.forwardRef<HTMLParagraphElement, MetricCardTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = React.useContext(MetricCardContext)
    return (
      <p
        ref={ref}
        className={cn(titleSizes[size], 'font-semibold text-text-muted', className)}
        {...props}
      />
    )
  }
)
MetricCardTitle.displayName = 'MetricCardTitle'

// ── MetricCardValue ──

export interface MetricCardValueProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardValue = React.forwardRef<HTMLParagraphElement, MetricCardValueProps>(
  ({ className, children, ...props }, ref) => {
    const { size, animated } = React.useContext(MetricCardContext)
    const [display, setDisplay] = React.useState<React.ReactNode>(children)

    React.useEffect(() => {
      if (!animated || typeof children !== 'string') { setDisplay(children); return }
      const numMatch = children.match(/[\d,.]+/)
      if (!numMatch) { setDisplay(children); return }
      const numStr = numMatch[0].replace(/,/g, '')
      const target = parseFloat(numStr)
      if (isNaN(target)) { setDisplay(children); return }
      const prefix = children.slice(0, children.indexOf(numMatch[0]))
      const suffix = children.slice(children.indexOf(numMatch[0]) + numMatch[0].length)
      const steps = 24
      const duration = 700
      let step = 0
      setDisplay(prefix + '0' + suffix)
      const timer = setInterval(() => {
        step++
        const eased = 1 - Math.pow(1 - step / steps, 3)
        const current = target * eased
        const formatted = target >= 1000
          ? Math.floor(current).toLocaleString()
          : current.toFixed(numStr.includes('.') ? 2 : 0)
        setDisplay(prefix + formatted + suffix)
        if (step >= steps) { setDisplay(children); clearInterval(timer) }
      }, duration / steps)
      return () => clearInterval(timer)
    }, [children, animated])

    return (
      <p
        ref={ref}
        className={cn(valueSizes[size], 'font-bold text-foreground mt-1', className)}
        {...props}
      >
        {display}
      </p>
    )
  }
)
MetricCardValue.displayName = 'MetricCardValue'

// ── MetricCardTrend ──

export interface MetricCardTrendProps extends React.HTMLAttributes<HTMLParagraphElement> {
  direction: MetricCardTrendDirection
}

const MetricCardTrend = React.forwardRef<HTMLParagraphElement, MetricCardTrendProps>(
  ({ className, direction, children, ...props }, ref) => {
    const config = trendConfig[direction]
    return (
      <p
        ref={ref}
        className={cn('flex items-center gap-1 text-sm mt-2', config.color, className)}
        {...props}
      >
        {direction === 'up' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        )}
        {direction === 'down' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
        {direction === 'neutral' && (
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        )}
        <span className="sr-only">{config.srLabel}</span>
        {children}
      </p>
    )
  }
)
MetricCardTrend.displayName = 'MetricCardTrend'

// ── MetricCardDescription ──

export interface MetricCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const MetricCardDescription = React.forwardRef<HTMLParagraphElement, MetricCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-text-muted mt-1', className)}
      {...props}
    />
  )
)
MetricCardDescription.displayName = 'MetricCardDescription'

// ── MetricCardSymbol ──

export interface MetricCardSymbolProps extends React.HTMLAttributes<HTMLDivElement> {}

const MetricCardSymbol = React.forwardRef<HTMLDivElement, MetricCardSymbolProps>(
  ({ className, ...props }, ref) => {
    const { size } = React.useContext(MetricCardContext)
    return (
      <div
        ref={ref}
        className={cn('text-text-muted', iconWrapperSizes[size], className)}
        {...props}
      />
    )
  }
)
MetricCardSymbol.displayName = 'MetricCardSymbol'

// ── Exports ──
export {
  MetricCard,
  MetricCardHeader,
  MetricCardTitle,
  MetricCardValue,
  MetricCardTrend,
  MetricCardDescription,
  MetricCardSymbol,
  metricCardVariants,
}
