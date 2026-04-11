'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Color mapping per variant × color
// ============================================================================

const colorMap = {
  default: {
    outline: 'border border-border text-foreground bg-background hover:bg-background-muted',
    filled:  'bg-background-muted text-foreground hover:bg-background-elevated',
    ghost:   'text-foreground hover:bg-background-muted',
  },
  primary: {
    outline: 'border border-primary text-text-primary bg-background hover:bg-primary-tint',
    filled:  'bg-primary-tint text-text-primary hover:bg-primary/20',
    ghost:   'text-text-primary hover:bg-primary-tint',
  },
} as const

// ============================================================================
// Context — propagates variant/color/size/radius from Root to Items
// ============================================================================

type QuickReplyContextValue = {
  size:    QuickReplySize
  variant: QuickReplyVariant
  color:   QuickReplyColor
  radius:  QuickReplyRadius
}

const QuickReplyContext = React.createContext<QuickReplyContextValue>({
  size:    'default',
  variant: 'outline',
  color:   'default',
  radius:  'full',
})

// ============================================================================
// Variants (CVA)
// ============================================================================

const quickReplyRootVariants = cva(
  'flex items-center',
  {
    variants: {
      layout: {
        scroll: 'overflow-x-auto',
        wrap:   'flex-wrap',
      },
      gap: {
        sm:      'gap-1.5',
        default: 'gap-2',
        lg:      'gap-2.5',
      },
    },
    defaultVariants: {
      layout:  'scroll',
      gap:     'default',
    },
  }
)

const quickReplyItemVariants = cva(
  [
    'inline-flex items-center justify-center',
    'whitespace-nowrap font-semibold shrink-0',
    'transition-colors duration-fast cursor-pointer',
    'focus-visible:outline-none focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      size: {
        sm:      'h-7 px-2.5 text-xs gap-1.5',    // 28px
        default: 'h-8 px-3 text-sm gap-1.5',       // 32px
        lg:      'h-9 px-3.5 text-md gap-1.5',     // 36px
      },
      radius: {
        md:   'rounded-md',    // 6px
        lg:   'rounded-lg',    // 8px
        full: 'rounded-full',  // 9999px
      },
    },
    defaultVariants: {
      size:   'default',
      radius: 'full',
    },
  }
)

// ============================================================================
// Icon sizes per item size
// ============================================================================

const iconSizeMap = {
  sm:      'icon-xs',  // 14px
  default: 'icon-xs',  // 14px
  lg:      'icon-sm',  // 16px
} as const

// ============================================================================
// Types
// ============================================================================

export type QuickReplyLayout  = 'scroll' | 'wrap'
export type QuickReplyVariant = 'outline' | 'filled' | 'ghost'
export type QuickReplyColor   = 'default' | 'primary'
export type QuickReplySize    = 'sm' | 'default' | 'lg'
export type QuickReplyRadius  = 'md' | 'lg' | 'full'
export type QuickReplyGap     = 'sm' | 'default' | 'lg'

export interface QuickReplyRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof quickReplyRootVariants> {
  /** Layout mode: horizontal scroll or wrap to multiple rows */
  layout?:  QuickReplyLayout
  /** Visual style applied to all child Items */
  variant?: QuickReplyVariant
  /** Color theme applied to all child Items */
  color?:   QuickReplyColor
  /** Chip size applied to all child Items */
  size?:    QuickReplySize
  /** Border radius applied to all child Items */
  radius?:  QuickReplyRadius
  /** Gap between Items */
  gap?:     QuickReplyGap
}

export interface QuickReplyItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading icon (SVG or ReactNode) */
  icon?:    React.ReactNode
  /** Render as child element (Slot pattern) */
  asChild?: boolean
}

// ============================================================================
// QuickReply Root — group container that propagates style via Context
// ============================================================================

const QuickReplyRoot = React.forwardRef<HTMLDivElement, QuickReplyRootProps>(
  (
    {
      className,
      layout  = 'scroll',
      gap     = 'default',
      variant = 'outline',
      color   = 'default',
      size    = 'default',
      radius  = 'full',
      role    = 'group',
      children,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo<QuickReplyContextValue>(
      () => ({ size, variant, color, radius }),
      [size, variant, color, radius]
    )

    return (
      <QuickReplyContext.Provider value={contextValue}>
        <div
          ref={ref}
          role={role}
          className={cn(quickReplyRootVariants({ layout, gap }), className)}
          {...props}
        >
          {children}
        </div>
      </QuickReplyContext.Provider>
    )
  }
)
QuickReplyRoot.displayName = 'QuickReply'

// ============================================================================
// QuickReply Item — individual chip button
// ============================================================================

const QuickReplyItem = React.forwardRef<HTMLButtonElement, QuickReplyItemProps>(
  ({ className, icon, asChild = false, children, ...props }, ref) => {
    const { size, variant, color, radius } = React.useContext(QuickReplyContext)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Comp = asChild ? (Slot as any) : 'button'
    const colorClasses = colorMap[color][variant]

    return (
      <Comp
        ref={ref}
        type={!asChild ? 'button' : undefined}
        {...props}
        className={cn(
          quickReplyItemVariants({ size, radius }),
          colorClasses,
          className
        )}
      >
        {icon && (
          <span
            className={cn('shrink-0 [&>svg]:w-full [&>svg]:h-full', iconSizeMap[size])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
      </Comp>
    )
  }
)
QuickReplyItem.displayName = 'QuickReply.Item'

// ============================================================================
// Namespace export (compound pattern)
// ============================================================================

const QuickReply = Object.assign(QuickReplyRoot, {
  Item: QuickReplyItem,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace QuickReply {
  export type RootProps = QuickReplyRootProps
  export type ItemProps = QuickReplyItemProps
}

export {
  QuickReply,
  QuickReplyRoot,
  QuickReplyItem,
  quickReplyRootVariants,
  quickReplyItemVariants,
}
