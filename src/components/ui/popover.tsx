'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Default Close Icon (built-in, no external dependency) ──
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── Types ──────────────────────────────────────────────────
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

// ─── Animation class mapping (static strings for Tailwind scanner) ──
const ANIMATION_CLASSES: Record<PopoverSide, string> = {
  top:    'data-[state=open]:animate-popover-top-enter data-[state=closed]:animate-popover-top-exit',
  bottom: 'data-[state=open]:animate-popover-bottom-enter data-[state=closed]:animate-popover-bottom-exit',
  left:   'data-[state=open]:animate-popover-left-enter data-[state=closed]:animate-popover-left-exit',
  right:  'data-[state=open]:animate-popover-right-enter data-[state=closed]:animate-popover-right-exit',
}

// ─── Content variants ────────────────────────────────────────
const popoverContentVariants = cva(
  'relative z-popover font-normal select-none w-auto max-w-[calc(100vw-16px)] outline-none',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border shadow-lg',
        elevated: 'bg-background-paper/95 border border-border-subtle shadow-xl backdrop-blur-sm',
      },
      size: {
        sm: 'text-sm p-3 rounded-lg',
        default: 'text-sm p-4 rounded-xl',
        lg: 'text-md p-5 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// ─── Arrow styles ──────────────────────────────────────────────
// default: CSS rotated square with 2-side border (seamless connection)
// elevated: Radix SVG arrow with drop-shadow (glassmorphism, subtle border)
const CSS_ARROW_CLASSES: Record<PopoverSide, string> = {
  bottom: '-top-[5px] left-1/2 -translate-x-1/2 border-t border-l border-border',
  top: '-bottom-[5px] left-1/2 -translate-x-1/2 border-b border-r border-border',
  right: '-left-[5px] top-1/2 -translate-y-1/2 border-b border-l border-border',
  left: '-right-[5px] top-1/2 -translate-y-1/2 border-t border-r border-border',
}

const ARROW_ELEVATED = 'fill-background-paper drop-shadow-sm'

// ═══════════════════════════════════════════════════════════════
// Popover
// ═══════════════════════════════════════════════════════════════

// ─── PopoverRoot — wrapper to avoid Object.assign mutating Radix primitive ──
export interface PopoverRootProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {}

function PopoverRoot(props: PopoverRootProps) {
  return <PopoverPrimitive.Root {...props} />
}

// ─── PopoverTrigger ──────────────────────────────────────────
const PopoverTrigger = PopoverPrimitive.Trigger

// ─── PopoverPortal ───────────────────────────────────────────
const PopoverPortal = PopoverPrimitive.Portal

// ─── PopoverAnchor ───────────────────────────────────────────
const PopoverAnchor = PopoverPrimitive.Anchor

// ─── PopoverClose ────────────────────────────────────────────
const PopoverClose = PopoverPrimitive.Close

// ─── PopoverContent ──────────────────────────────────────────
export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {
  /** Show arrow pointing to trigger */
  showArrow?: boolean
  /** Show built-in close button */
  showClose?: boolean
  /** Custom close icon (replaces default X icon) */
  closeIcon?: React.ReactNode
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, variant = 'default', size, side = 'bottom', sideOffset, showArrow = true, showClose = false, closeIcon, children, ...props }, ref) => {
  const resolvedSide = side as PopoverSide
  // CSS arrow (default) needs more gap since it doesn't occupy layout space
  const resolvedOffset = sideOffset ?? (variant === 'default' && showArrow ? 12 : 6)

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={resolvedOffset}
        className={cn(
          popoverContentVariants({ variant, size }),
          ANIMATION_CLASSES[resolvedSide],
          className,
        )}
        {...props}
      >
        {showClose && (
          <PopoverPrimitive.Close
            className="absolute top-3 right-3 rounded-md p-1 text-text-muted hover:text-foreground hover:bg-background-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Close"
          >
            {closeIcon || <DefaultCloseIcon className="icon-sm" />}
          </PopoverPrimitive.Close>
        )}
        {children}
        {showArrow && variant === 'default' && (
          <div
            className={cn(
              'absolute w-2.5 h-2.5 rotate-45 bg-background-paper',
              CSS_ARROW_CLASSES[resolvedSide],
            )}
          />
        )}
        {showArrow && variant === 'elevated' && (
          <PopoverPrimitive.Arrow
            className={ARROW_ELEVATED}
            width={12}
            height={6}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = 'PopoverContent'

// ─── PopoverArrow (standalone, for manual placement outside Content) ──
const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn('fill-background-paper', className)}
    width={10}
    height={5}
    {...props}
  />
))
PopoverArrow.displayName = 'PopoverArrow'

// ─── Namespace: Popover ──────────────────────────────────────
const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Anchor: PopoverAnchor,
  Portal: PopoverPortal,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Popover {
  export type ContentProps = PopoverContentProps
  export type RootProps = PopoverRootProps
}

// ─── Exports ────────────────────────────────────────────────
export {
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  PopoverAnchor,
  PopoverPortal,
  popoverContentVariants,
}
