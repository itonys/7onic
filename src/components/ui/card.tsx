'use client'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── Context for size propagation ──
type CardSize = 'sm' | 'default' | 'lg'
type CardDirection = 'vertical' | 'horizontal'

const CardContext = React.createContext<{ size: CardSize; direction: CardDirection }>({
  size: 'default',
  direction: 'vertical',
})

function useCard() {
  return React.useContext(CardContext)
}

// ── Card (Root) ──
const cardVariants = cva(
  'flex overflow-hidden transition-all duration-normal',
  {
    variants: {
      variant: {
        default: 'bg-background-paper border border-border-subtle shadow-sm',
        outline: 'bg-background-paper border border-border',
        ghost: 'bg-transparent',
      },
      size: {
        sm: '',
        default: '',
        lg: '',
      },
      radius: {
        sm: 'rounded-sm',       // 2px
        base: 'rounded',        // 4px
        md: 'rounded-md',       // 6px
        lg: 'rounded-lg',       // 8px
        xl: 'rounded-xl',       // 12px
        '2xl': 'rounded-2xl',   // 16px
      },
      direction: {
        vertical: 'flex-col',
        horizontal: 'flex-row',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'xl',
      direction: 'vertical',
    },
  }
)

export type CardVariant = 'default' | 'outline' | 'ghost'
export type CardRadius = 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Visual style */
  variant?: CardVariant
  /** Content padding scale */
  size?: CardSize
  /** Border radius */
  radius?: CardRadius
  /** Layout direction */
  direction?: CardDirection
  /** Enable hover effect for interactive cards */
  interactive?: boolean
  /** Render as child element (Slot pattern) */
  asChild?: boolean
}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    radius = 'xl',
    direction = 'vertical',
    interactive = false,
    asChild = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'div'

    // Horizontal: separate CardImage from rest, wrap rest in flex-col
    let content = children
    if (direction === 'horizontal') {
      const childArray = React.Children.toArray(children)
      const imageChildren: React.ReactNode[] = []
      const otherChildren: React.ReactNode[] = []

      childArray.forEach((child) => {
        if (React.isValidElement(child) && child.type === CardImage) {
          imageChildren.push(child)
        } else {
          otherChildren.push(child)
        }
      })

      content = (
        <>
          {imageChildren}
          <div className="flex-1 flex flex-col min-w-0">
            {otherChildren}
          </div>
        </>
      )
    }

    return (
      <CardContext.Provider value={{ size, direction }}>
        <Comp
          ref={ref}
          className={cn(
            cardVariants({ variant, size, radius, direction }),
            interactive && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
            className
          )}
          {...props}
        >
          {content}
        </Comp>
      </CardContext.Provider>
    )
  }
)
CardRoot.displayName = 'Card'

// ── Size-based padding map (responsive: mobile → desktop) ──

const sizePaddingXMap = {
  sm: 'px-4',               // 16px
  default: 'px-4 sm:px-6',  // 16px → 24px
  lg: 'px-6 sm:px-8',       // 24px → 32px
} as const

const sizePaddingYMap = {
  sm: 'py-3',               // 12px
  default: 'py-3 sm:py-4',  // 12px → 16px
  lg: 'py-4 sm:py-5',       // 16px → 20px
} as const

// Top padding for CardHeader — optical balance (top >= sides)
const sizePaddingTMap = {
  sm: 'pt-5',               // 20px
  default: 'pt-5 sm:pt-6',  // 20px → 24px
  lg: 'pt-6 sm:pt-8',       // 24px → 32px
} as const

// Inner bottom padding (between sections) — tighter than outer
const sizeInnerPbMap = {
  sm: 'pb-3',               // 12px
  default: 'pb-3 sm:pb-4',  // 12px → 16px
  lg: 'pb-3 sm:pb-4',       // 12px → 16px (default와 동일)
} as const

// Last-child bottom padding for CardContent (when no footer) — match pt
const sizeLastPbMap = {
  sm: 'last:pb-5',                    // 20px
  default: 'last:pb-5 sm:last:pb-6',  // 20px → 24px
  lg: 'last:pb-6 sm:last:pb-8',       // 24px → 32px
} as const

// ── CardImage ──
// Overlay opacity to Tailwind class mapping
const overlayOpacityMap: Record<number, string> = {
  10: 'from-black/10',
  20: 'from-black/20',
  30: 'from-black/30',
  40: 'from-black/40',
  50: 'from-black/50',
  60: 'from-black/60',
  70: 'from-black/70',
  80: 'from-black/80',
  90: 'from-black/90',
}

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Gradient overlay on image */
  overlay?: boolean
  /** Overlay opacity (10–90). Default: 60 */
  overlayOpacity?: number
  /** Custom class for overlay gradient (overrides overlayOpacity) */
  overlayClassName?: string
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, overlay = false, overlayOpacity = 60, overlayClassName, alt = '', ...props }, ref) => {
    const { direction } = useCard()
    const isHorizontal = direction === 'horizontal'

    // Horizontal: use absolute positioning so the image fills the
    // wrapper height which is determined by the content side via
    // flexbox align-items:stretch (default).
    if (isHorizontal) {
      const opacityClass = overlay
        ? (overlayOpacityMap[overlayOpacity] || 'from-black/60')
        : null

      return (
        <div className={cn('relative shrink-0 w-48 overflow-hidden', className)}>
          <img
            ref={ref}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            {...props}
          />
          {overlay && (
            <div className={cn('absolute inset-0 bg-gradient-to-t to-transparent', overlayClassName || opacityClass)} />
          )}
        </div>
      )
    }

    // Vertical
    if (overlay) {
      const opacityClass = overlayOpacityMap[overlayOpacity] || 'from-black/60'

      return (
        <div className="relative w-full shrink-0 overflow-hidden">
          <img
            ref={ref}
            alt={alt}
            className={cn('w-full object-cover', className)}
            {...props}
          />
          <div className={cn('absolute inset-0 bg-gradient-to-t to-transparent', overlayClassName || opacityClass)} />
        </div>
      )
    }

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn('w-full object-cover shrink-0', className)}
        {...props}
      />
    )
  }
)
CardImage.displayName = 'CardImage'

// ── CardHeader ──
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { size } = useCard()

    // Separate CardAction from other children for proper flex layout
    const childArray = React.Children.toArray(children)
    const actionChildren: React.ReactNode[] = []
    const otherChildren: React.ReactNode[] = []

    childArray.forEach((child) => {
      if (React.isValidElement(child) && child.type === CardAction) {
        actionChildren.push(child)
      } else {
        otherChildren.push(child)
      }
    })

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3',
          sizePaddingXMap[size],
          sizePaddingTMap[size],
          sizeInnerPbMap[size],
          sizeLastPbMap[size],
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0 space-y-3">
          {otherChildren}
        </div>
        {actionChildren}
      </div>
    )
  }
)
CardHeader.displayName = 'CardHeader'

// ── CardTitle ──
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Leading icon */
  icon?: React.ReactNode
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-base font-semibold text-foreground tracking-tight',
          icon && 'flex items-center gap-2',
          className
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 icon-sm [&>svg]:w-full [&>svg]:h-full" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </h3>
    )
  }
)
CardTitle.displayName = 'CardTitle'

// ── CardDescription ──
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-text-muted', className)}
        {...props}
      />
    )
  }
)
CardDescription.displayName = 'CardDescription'

// ── CardAction ──
export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('shrink-0 ml-auto -mr-2 -mt-2', className)}
        {...props}
      />
    )
  }
)
CardAction.displayName = 'CardAction'

// ── CardContent ──
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const { size } = useCard()

    return (
      <div
        ref={ref}
        className={cn(sizePaddingXMap[size], 'pb-0', sizeLastPbMap[size], className)}
        {...props}
      />
    )
  }
)
CardContent.displayName = 'CardContent'

// ── CardFooter ──
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const { size } = useCard()

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          sizePaddingXMap[size],
          sizePaddingYMap[size],
          'mt-auto',
          className
        )}
        {...props}
      />
    )
  }
)
CardFooter.displayName = 'CardFooter'

// ─── Namespace ──────────────────────────────────────────
const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Card {
  export type ImageProps = CardImageProps
  export type HeaderProps = CardHeaderProps
  export type TitleProps = CardTitleProps
  export type DescriptionProps = CardDescriptionProps
  export type ActionProps = CardActionProps
  export type ContentProps = CardContentProps
  export type FooterProps = CardFooterProps
}

export {
  Card,
  CardImage,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  cardVariants,
}
