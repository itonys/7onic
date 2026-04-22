'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

// ─── Animation class mapping (static strings for Tailwind scanner) ──
const ANIMATION_CLASSES: Record<TooltipSide, string> = {
  top:    'data-[state=delayed-open]:animate-tooltip-top-enter data-[state=instant-open]:animate-tooltip-top-enter data-[state=closed]:animate-tooltip-top-exit',
  bottom: 'data-[state=delayed-open]:animate-tooltip-bottom-enter data-[state=instant-open]:animate-tooltip-bottom-enter data-[state=closed]:animate-tooltip-bottom-exit',
  left:   'data-[state=delayed-open]:animate-tooltip-left-enter data-[state=instant-open]:animate-tooltip-left-enter data-[state=closed]:animate-tooltip-left-exit',
  right:  'data-[state=delayed-open]:animate-tooltip-right-enter data-[state=instant-open]:animate-tooltip-right-enter data-[state=closed]:animate-tooltip-right-exit',
}

// ─── Content variants ────────────────────────────────────────
const tooltipContentVariants = cva(
  'z-tooltip rounded-lg font-normal select-none max-w-72',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background shadow-lg',
        inverted: 'bg-background-paper/95 text-foreground border border-border-subtle shadow-lg backdrop-blur-sm',
      },
      size: {
        sm: 'text-xs px-2.5 py-1',
        default: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// ─── Arrow fill mapping (matches content variant background) ──
const ARROW_FILL: Record<string, string> = {
  default: 'fill-foreground drop-shadow-sm',
  inverted: 'fill-background-paper drop-shadow-sm',
}

// ═══════════════════════════════════════════════════════════════
// Tooltip
// ═══════════════════════════════════════════════════════════════

// ─── TooltipProvider ─────────────────────────────────────────
const TooltipProvider = TooltipPrimitive.Provider

// ─── Tooltip (Root) — Props type ──
export interface TooltipRootProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  /** Delay in ms before tooltip appears */
  delayDuration?: number
}

// ─── Tooltip (Root) — thin wrapper to expose as named export with default delayDuration ──
function Tooltip({ delayDuration = 200, ...props }: TooltipRootProps) {
  return <TooltipPrimitive.Root delayDuration={delayDuration} {...props} />
}

// ─── TooltipTrigger ──────────────────────────────────────────
const TooltipTrigger = TooltipPrimitive.Trigger

// ─── TooltipPortal ───────────────────────────────────────────
const TooltipPortal = TooltipPrimitive.Portal

// ─── TooltipContent ──────────────────────────────────────────
export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {
  /** Show arrow pointing to trigger */
  showArrow?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant = 'default', size, side = 'top', sideOffset = 6, showArrow = true, children, ...props }, ref) => {
  const resolvedSide = side as TooltipSide

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          tooltipContentVariants({ variant, size }),
          ANIMATION_CLASSES[resolvedSide],
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={ARROW_FILL[variant || 'default']}
            width={10}
            height={5}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = 'TooltipContent'

// ─── TooltipArrow (standalone, for manual placement outside Content) ──
const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn('fill-foreground', className)}
    width={8}
    height={4}
    {...props}
  />
))
TooltipArrow.displayName = 'TooltipArrow'

// ─── Exports ────────────────────────────────────────────────
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipPortal,
  TooltipProvider,
  tooltipContentVariants,
}
