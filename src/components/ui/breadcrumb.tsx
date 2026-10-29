'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// ─── Context ──────────────────────────────────────────────

type BreadcrumbContextValue = {
  size?: 'sm' | 'default' | 'lg'
  separator?: React.ReactNode
  maxItems?: number
  itemsBeforeCollapse?: number
  itemsAfterCollapse?: number
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
  /** Collapse the middle items into an ellipsis when there are more items than this (undefined = no collapse) */
  maxItems?: number
  /** Items kept before the ellipsis when collapsed */
  itemsBeforeCollapse?: number
  /** Items kept after the ellipsis when collapsed */
  itemsAfterCollapse?: number
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, size = 'default', maxItems, itemsBeforeCollapse = 1, itemsAfterCollapse = 1, ...props }, ref) => (
    <BreadcrumbContext.Provider value={{ size, separator, maxItems, itemsBeforeCollapse, itemsAfterCollapse }}>
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn('', className)}
        {...props}
      />
    </BreadcrumbContext.Provider>
  )
)
Breadcrumb.displayName = 'Breadcrumb'

// ─── BreadcrumbList ───────────────────────────────────────

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, children, ...props }, ref) => {
    const { size = 'default', maxItems, itemsBeforeCollapse = 1, itemsAfterCollapse = 1 } = useBreadcrumbContext()
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
      >
        {collapseItems(children, maxItems, itemsBeforeCollapse, itemsAfterCollapse)}
      </ol>
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

// ─── Collapse ─────────────────────────────────────────────

// Items are often rendered from a list as <Fragment>{separator}{item}</Fragment>,
// so fragments are unwrapped before counting.
function flattenFragments(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((node) =>
    React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment
      ? flattenFragments(node.props.children).map((child) =>
          // Prefix keys so children of different fragments stay unique
          React.isValidElement(child) ? React.cloneElement(child, { key: `${node.key}${child.key}` }) : child
        )
      : [node]
  )
}

// Groups children into segments (the separator before an item + the item),
// then keeps the first `before` and last `after` segments around one ellipsis
// item. The user's own separators are reused, so custom separators survive.
function collapseItems(children: React.ReactNode, maxItems: number | undefined, before: number, after: number) {
  if (maxItems === undefined) return children

  const nodes = flattenFragments(children)
  const segments: { separator: React.ReactNode; nodes: React.ReactNode[] }[] = []
  let pendingSeparator: React.ReactNode = null
  for (const node of nodes) {
    const type = React.isValidElement(node) ? node.type : null
    if (type === BreadcrumbSeparator) {
      pendingSeparator = node
    } else if (type === BreadcrumbItem) {
      segments.push({ separator: pendingSeparator, nodes: [node] })
      pendingSeparator = null
    } else if (segments.length > 0) {
      segments[segments.length - 1].nodes.push(node)
    } else {
      segments.push({ separator: null, nodes: [node] })
    }
  }

  if (segments.length <= maxItems || before + after >= segments.length) return children

  const head = segments.slice(0, before)
  const tail = segments.slice(segments.length - after)
  const render = (list: typeof segments) => list.flatMap((seg) => (seg.separator ? [seg.separator, ...seg.nodes] : seg.nodes))
  const ellipsisSeparator = segments[before].separator

  return [
    ...render(head),
    ...(ellipsisSeparator ? [ellipsisSeparator] : []),
    <BreadcrumbItem key="breadcrumb-collapsed">
      <BreadcrumbEllipsis />
    </BreadcrumbItem>,
    ...render(tail),
  ]
}

// ─── Exports ──────────────────────────────────────────────

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
