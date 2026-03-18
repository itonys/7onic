'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Context ──────────────────────────────────────────────

type BreadcrumbContextValue = {
  size?: 'sm' | 'default' | 'lg'
  separator?: React.ReactNode
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({})
const useBreadcrumbContext = () => React.useContext(BreadcrumbContext)

// ─── Default Separator Icon ───────────────────────────────

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

// ─── Ellipsis Icon ────────────────────────────────────────

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

// ─── Breadcrumb (Root) ────────────────────────────────────

const breadcrumbSizeMap = {
  sm: { text: 'text-xs', icon: 'icon-xs', gap: 'gap-1.5' },
  default: { text: 'text-sm', icon: 'icon-xs', gap: 'gap-2' },
  lg: { text: 'text-md', icon: 'icon-sm', gap: 'gap-2' },
} as const

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** Separator element between items */
  separator?: React.ReactNode
  /** Size of the breadcrumb */
  size?: 'sm' | 'default' | 'lg'
  /** Max items before collapsing (undefined = no collapse) */
  maxItems?: number
  /** Items visible before the ellipsis when collapsed */
  itemsBeforeCollapse?: number
  /** Items visible after the ellipsis when collapsed */
  itemsAfterCollapse?: number
}

const BreadcrumbRoot = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, size = 'default', ...props }, ref) => (
    <BreadcrumbContext.Provider value={{ size, separator }}>
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn('', className)}
        {...props}
      />
    </BreadcrumbContext.Provider>
  )
)
BreadcrumbRoot.displayName = 'Breadcrumb'

// ─── BreadcrumbList ───────────────────────────────────────

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => {
    const { size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <ol
        ref={ref}
        className={cn(
          'flex flex-wrap items-center',
          sizeClass.gap,
          sizeClass.text,
          'text-text-muted',
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = 'BreadcrumbList'

// ─── BreadcrumbItem ───────────────────────────────────────

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

// ─── BreadcrumbLink ───────────────────────────────────────

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** Use Radix Slot to compose with custom link components */
  asChild?: boolean
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a'
    return (
      <Comp
        ref={ref}
        className={cn(
          'transition-colors duration-fast hover:text-foreground',
          className
        )}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

// ─── BreadcrumbPage ───────────────────────────────────────

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground', className)}
      {...props}
    />
  )
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

// ─── BreadcrumbSeparator ──────────────────────────────────

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ children, className, ...props }, ref) => {
    const { separator, size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex items-center text-text-subtle', className)}
        {...props}
      >
        {children ?? separator ?? <ChevronRightIcon className={sizeClass.icon} />}
      </li>
    )
  }
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

// ─── BreadcrumbEllipsis ───────────────────────────────────

export interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<'span'> {}

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => {
    const { size = 'default' } = useBreadcrumbContext()
    const sizeClass = breadcrumbSizeMap[size]
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <EllipsisIcon className={sizeClass.icon} />
        <span className="sr-only">More</span>
      </span>
    )
  }
)
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

// ─── Exports ──────────────────────────────────────────────

// ─── Namespace ──────────────────────────────────────────
const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Breadcrumb {
  export type LinkProps = BreadcrumbLinkProps
  export type EllipsisProps = BreadcrumbEllipsisProps
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  breadcrumbSizeMap,
}
