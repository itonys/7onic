'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Built-in Icons ──────────────────────────────────────

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ChevronsLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
    </svg>
  )
}

function ChevronsRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
    </svg>
  )
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  )
}

// ─── usePagination Hook ──────────────────────────────────

export type PaginationRange = (number | 'dots')[]

export interface UsePaginationProps {
  /** Total number of pages */
  total: number
  /** Number of siblings on each side of current page */
  siblings?: number
  /** Number of boundary pages at start/end */
  boundaries?: number
  /** Current active page (1-based) */
  page: number
}

function range(start: number, end: number): number[] {
  const result: number[] = []
  for (let i = start; i <= end; i++) result.push(i)
  return result
}

export function usePagination({
  total,
  siblings = 1,
  boundaries = 1,
  page,
}: UsePaginationProps): PaginationRange {
  if (total <= 0) return []

  const totalPageNumbers = siblings * 2 + 3 + boundaries * 2
  if (totalPageNumbers >= total) {
    return range(1, total)
  }

  const leftSiblingIndex = Math.max(page - siblings, boundaries + 1)
  const rightSiblingIndex = Math.min(page + siblings, total - boundaries)

  const showLeftDots = leftSiblingIndex > boundaries + 2
  const showRightDots = rightSiblingIndex < total - boundaries - 1

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblings + boundaries
    const leftRange = range(1, leftItemCount)
    return [...leftRange, 'dots' as const, ...range(total - boundaries + 1, total)]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblings + boundaries
    const rightRange = range(total - rightItemCount + 1, total)
    return [...range(1, boundaries), 'dots' as const, ...rightRange]
  }

  return [
    ...range(1, boundaries),
    'dots' as const,
    ...range(leftSiblingIndex, rightSiblingIndex),
    'dots' as const,
    ...range(total - boundaries + 1, total),
  ]
}

// ─── Context ─────────────────────────────────────────────

export type PaginationSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl'
export type PaginationVariant = 'default' | 'outline' | 'ghost'
export type PaginationColor = 'default' | 'primary'
export type PaginationRadius = 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'full'

type PaginationContextValue = {
  page: number
  total: number
  siblings: number
  boundaries: number
  size: PaginationSize
  variant: PaginationVariant
  color: PaginationColor
  radius: PaginationRadius
  disabled: boolean
  loop: boolean
  onPageChange: (page: number) => void
  paginationRange: PaginationRange
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null)

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext)
  if (!ctx) throw new Error('Pagination components must be used within <Pagination>')
  return ctx
}

// ─── Size Map ────────────────────────────────────────────

const paginationSizeMap = {
  xs: { item: 'h-7 min-w-7 text-xs', icon: 'icon-xs', gap: 'gap-1' },
  sm: { item: 'h-8 min-w-8 text-sm', icon: 'icon-xs', gap: 'gap-1' },
  default: { item: 'h-9 min-w-9 text-md', icon: 'icon-sm', gap: 'gap-1' },
  lg: { item: 'h-10 min-w-10 text-md', icon: 'icon-sm', gap: 'gap-1.5' },
  xl: { item: 'h-12 min-w-12 text-base', icon: 'icon-sm', gap: 'gap-1.5' },
} as const

// ─── Item Variants (CVA) ─────────────────────────────────

const paginationItemVariants = cva(
  'inline-flex items-center justify-center select-none transition-colors duration-fast font-semibold focus-visible:focus-ring',
  {
    variants: {
      radius: {
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      radius: 'md',
    },
  }
)

// ─── Variant Style Helpers ───────────────────────────────

// Active color maps
const activeColorMap = {
  default: 'bg-foreground text-background',
  primary: 'bg-primary text-primary-foreground',
} as const

const ghostActiveColorMap = {
  default: 'bg-background-muted text-foreground font-bold',
  primary: 'bg-background-muted text-primary',
} as const

function getItemClasses(variant: PaginationVariant, color: PaginationColor, isActive: boolean, disabled: boolean) {
  if (disabled) {
    return variant === 'outline'
      ? 'border border-border text-disabled-foreground pointer-events-none opacity-50'
      : 'border border-transparent text-disabled-foreground pointer-events-none opacity-50'
  }
  if (isActive) {
    switch (variant) {
      case 'outline':
        return `border ${color === 'default' ? 'border-foreground' : 'border-primary'} ${activeColorMap[color]}`
      case 'ghost':
        return `border border-transparent ${ghostActiveColorMap[color]}`
      case 'default':
      default:
        return `border border-transparent ${activeColorMap[color]}`
    }
  }
  switch (variant) {
    case 'outline':
      return 'border border-border text-text-muted hover:bg-background-muted hover:text-foreground'
    case 'ghost':
      return 'border border-transparent text-text-muted hover:bg-background-muted hover:text-foreground'
    case 'default':
    default:
      return 'border border-transparent text-text-muted hover:bg-background-muted hover:text-foreground'
  }
}

// ─── Pagination (Root) ───────────────────────────────────

export interface PaginationProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** Total number of pages */
  total?: number
  /** Controlled active page (1-based) */
  value?: number
  /** Initial page for uncontrolled mode */
  defaultValue?: number
  /** Page change callback */
  onChange?: (page: number) => void
  /** Number of siblings on each side of current page */
  siblings?: number
  /** Number of boundary pages at start/end */
  boundaries?: number
  /** Component size */
  size?: PaginationSize
  /** Visual variant */
  variant?: PaginationVariant
  /** Active page color */
  color?: PaginationColor
  /** Border radius */
  radius?: PaginationRadius
  /** Disable all interactions */
  disabled?: boolean
  /** Show previous/next controls */
  withControls?: boolean
  /** Show first/last controls */
  withEdges?: boolean
  /** Loop from last to first and vice versa */
  loop?: boolean
}

const PaginationRoot = React.forwardRef<HTMLElement, PaginationProps>(
  ({
    className,
    total = 1,
    value,
    defaultValue = 1,
    onChange,
    siblings = 1,
    boundaries = 1,
    size = 'default',
    variant = 'default',
    color = 'default',
    radius = 'md',
    disabled = false,
    withControls = true,
    withEdges = false,
    loop = false,
    children,
    ...props
  }, ref) => {
    // Controlled / Uncontrolled
    const [internalPage, setInternalPage] = React.useState(defaultValue)
    const isControlled = value !== undefined
    const page = isControlled ? value : internalPage

    const handlePageChange = React.useCallback((newPage: number) => {
      if (disabled) return
      const clamped = Math.max(1, Math.min(total, newPage))
      if (!isControlled) setInternalPage(clamped)
      onChange?.(clamped)
    }, [disabled, total, isControlled, onChange])

    const paginationRange = usePagination({ total, siblings, boundaries, page })

    const contextValue = React.useMemo<PaginationContextValue>(() => ({
      page,
      total,
      siblings,
      boundaries,
      size,
      variant,
      color,
      radius,
      disabled,
      loop,
      onPageChange: handlePageChange,
      paginationRange,
    }), [page, total, siblings, boundaries, size, variant, color, radius, disabled, loop, handlePageChange, paginationRange])

    return (
      <PaginationContext.Provider value={contextValue}>
        <nav
          ref={ref}
          role="navigation"
          aria-label="pagination"
          className={cn('', className)}
          {...props}
        >
          {children ?? (
            <PaginationContent>
              {withEdges && <PaginationItem><PaginationFirst /></PaginationItem>}
              {withControls && <PaginationItem><PaginationPrevious /></PaginationItem>}
              <PaginationItems />
              {withControls && <PaginationItem><PaginationNext /></PaginationItem>}
              {withEdges && <PaginationItem><PaginationLast /></PaginationItem>}
            </PaginationContent>
          )}
        </nav>
      </PaginationContext.Provider>
    )
  }
)
PaginationRoot.displayName = 'Pagination'

// ─── PaginationContent ───────────────────────────────────

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, ...props }, ref) => {
    const { size } = usePaginationContext()
    const sizeClass = paginationSizeMap[size]
    return (
      <ul
        ref={ref}
        className={cn('flex flex-wrap items-center', sizeClass.gap, className)}
        {...props}
      />
    )
  }
)
PaginationContent.displayName = 'PaginationContent'

// ─── PaginationItem ──────────────────────────────────────

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('', className)} {...props} />
  )
)
PaginationItem.displayName = 'PaginationItem'

// ─── PaginationLink ──────────────────────────────────────

export interface PaginationLinkProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Page number this link navigates to */
  page: number
  /** Whether this page is currently active (auto-detected from context if omitted) */
  isActive?: boolean
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, page: targetPage, isActive: isActiveProp, ...props }, ref) => {
    const ctx = usePaginationContext()
    const isActive = isActiveProp ?? (ctx.page === targetPage)
    const sizeClass = paginationSizeMap[ctx.size]

    return (
      <button
        ref={ref}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Go to page ${targetPage}`}
        disabled={ctx.disabled}
        onClick={() => ctx.onPageChange(targetPage)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, isActive, ctx.disabled),
          className
        )}
        {...props}
      >
        {targetPage}
      </button>
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

// ─── PaginationPrevious ──────────────────────────────────

export interface PaginationPreviousProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationPrevious = React.forwardRef<HTMLButtonElement, PaginationPreviousProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || (!ctx.loop && ctx.page <= 1)

    const handleClick = () => {
      if (ctx.page <= 1) {
        if (ctx.loop) ctx.onPageChange(ctx.total)
      } else {
        ctx.onPageChange(ctx.page - 1)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to previous page"
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronLeftIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationPrevious.displayName = 'PaginationPrevious'

// ─── PaginationNext ──────────────────────────────────────

export interface PaginationNextProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationNext = React.forwardRef<HTMLButtonElement, PaginationNextProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || (!ctx.loop && ctx.page >= ctx.total)

    const handleClick = () => {
      if (ctx.page >= ctx.total) {
        if (ctx.loop) ctx.onPageChange(1)
      } else {
        ctx.onPageChange(ctx.page + 1)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to next page"
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronRightIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationNext.displayName = 'PaginationNext'

// ─── PaginationFirst ─────────────────────────────────────

export interface PaginationFirstProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationFirst = React.forwardRef<HTMLButtonElement, PaginationFirstProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || ctx.page <= 1

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to first page"
        disabled={isDisabled}
        onClick={() => ctx.onPageChange(1)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronsLeftIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationFirst.displayName = 'PaginationFirst'

// ─── PaginationLast ──────────────────────────────────────

export interface PaginationLastProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Custom icon */
  icon?: React.ReactNode
}

const PaginationLast = React.forwardRef<HTMLButtonElement, PaginationLastProps>(
  ({ className, icon, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    const isDisabled = ctx.disabled || ctx.page >= ctx.total

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Go to last page"
        disabled={isDisabled}
        onClick={() => ctx.onPageChange(ctx.total)}
        className={cn(
          paginationItemVariants({ radius: ctx.radius }),
          sizeClass.item,
          getItemClasses(ctx.variant, ctx.color, false, isDisabled),
          className
        )}
        {...props}
      >
        {icon ?? <ChevronsRightIcon className={sizeClass.icon} />}
      </button>
    )
  }
)
PaginationLast.displayName = 'PaginationLast'

// ─── PaginationEllipsis ──────────────────────────────────

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => {
    const ctx = usePaginationContext()
    const sizeClass = paginationSizeMap[ctx.size]
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center text-text-muted',
          sizeClass.item,
          className
        )}
        {...props}
      >
        <EllipsisIcon className={sizeClass.icon} />
        <span className="sr-only">More pages</span>
      </span>
    )
  }
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

// ─── PaginationItems (Convenience) ───────────────────────

const PaginationItems = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const ctx = usePaginationContext()
    return (
      <div ref={ref} className={cn('contents', className)} {...props}>
        {ctx.paginationRange.map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === 'dots' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink page={item} />
            )}
          </PaginationItem>
        ))}
      </div>
    )
  }
)
PaginationItems.displayName = 'PaginationItems'

// ─── Exports ─────────────────────────────────────────────

// ─── Namespace ──────────────────────────────────────────
const Pagination = Object.assign(PaginationRoot, {
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  First: PaginationFirst,
  Last: PaginationLast,
  Ellipsis: PaginationEllipsis,
  Items: PaginationItems,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Pagination {
  export type LinkProps = PaginationLinkProps
  export type PreviousProps = PaginationPreviousProps
  export type NextProps = PaginationNextProps
  export type FirstProps = PaginationFirstProps
  export type LastProps = PaginationLastProps
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  PaginationItems,
  paginationItemVariants,
  paginationSizeMap,
}
