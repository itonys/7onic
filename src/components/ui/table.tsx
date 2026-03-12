'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Size variants for table density
type TableSize = 'sm' | 'default' | 'lg'

// Visual style variants
type TableVariant = 'default' | 'bordered' | 'striped'

// Root context — set at Root, consumed by children
const TableContext = React.createContext<{
  size: TableSize
  variant: TableVariant
  stickyHeader: boolean
}>({ size: 'default', variant: 'default', stickyHeader: false })

// Cell padding per size
const cellPaddingMap: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-sm',
  default: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

// Head cell padding per size
const headPaddingMap: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-xs',
  default: 'px-4 py-3 text-xs',
  lg: 'px-6 py-3.5 text-sm',
}

// Checkbox column padding override per size (right padding removed — next column's left padding handles the gap)
const checkboxPaddingMap: Record<TableSize, string> = {
  sm: '[&:has([role=checkbox])]:pl-1 [&:has([role=checkbox])]:pr-0',
  default: '[&:has([role=checkbox])]:pl-2 [&:has([role=checkbox])]:pr-0',
  lg: '[&:has([role=checkbox])]:pl-3 [&:has([role=checkbox])]:pr-0',
}

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border',
        striped: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// ─── Root ────────────────────────────────────────────────────────
export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  /** Table density */
  size?: TableSize
  /** Visual style */
  variant?: TableVariant
  /** Sticky header when scrolling */
  stickyHeader?: boolean
  /** Additional className for the scroll wrapper (e.g. max-h-[400px]) */
  wrapperClassName?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, size = 'default', variant = 'default', stickyHeader = false, wrapperClassName, ...props }, ref) => (
    <TableContext.Provider value={{ size, variant, stickyHeader }}>
      <div className={cn('relative w-full overflow-auto', wrapperClassName)}>
        <table
          ref={ref}
          className={cn(tableVariants({ variant }), className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
)
Table.displayName = 'Table'

// ─── Header ──────────────────────────────────────────────────────
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { stickyHeader } = React.useContext(TableContext)
  return (
    <thead
      ref={ref}
      className={cn(
        '[&_tr]:border-b [&_tr]:border-border',
        stickyHeader && 'sticky top-0 z-10 bg-background',
        className
      )}
      {...props}
    />
  )
})
TableHeader.displayName = 'TableHeader'

// ─── Body ────────────────────────────────────────────────────────
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TableContext)
  return (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-b-0',
        variant === 'striped' && '[&_tr:nth-child(even)]:bg-background-muted',
        className
      )}
      {...props}
    />
  )
})
TableBody.displayName = 'TableBody'

// ─── Footer ──────────────────────────────────────────────────────
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-border bg-background-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

// ─── Row ─────────────────────────────────────────────────────────
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Enable hover highlight */
  interactive?: boolean
  /** Selected state background */
  selected?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, interactive = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      data-selected={selected || undefined}
      className={cn(
        'border-b border-border transition-colors duration-fast',
        interactive && 'hover:bg-background-muted cursor-pointer',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

// ─── Head Cell ───────────────────────────────────────────────────
type SortDirection = 'asc' | 'desc' | null

// Default sort icons
const defaultSortIcons = {
  asc: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  desc: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  default: (
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
}

export interface SortIconSet {
  /** Icon for ascending state */
  asc?: React.ReactNode
  /** Icon for descending state */
  desc?: React.ReactNode
  /** Icon for unsorted (default) state */
  default?: React.ReactNode
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Enable sort indicator */
  sortable?: boolean
  /** Current sort direction */
  sortDirection?: SortDirection
  /** Sort click handler */
  onSort?: () => void
  /** Custom sort icons (overrides built-in icons) */
  sortIcon?: SortIconSet
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable = false, sortDirection = null, onSort, sortIcon, children, ...props }, ref) => {
    const { size } = React.useContext(TableContext)
    const icons = { ...defaultSortIcons, ...sortIcon }

    const content = sortable ? (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors duration-fast group"
        onClick={onSort}
      >
        {children}
        <span className={cn(
          'shrink-0 transition-colors duration-fast',
          sortDirection ? 'text-foreground' : 'text-text-muted'
        )}>
          {sortDirection === 'asc' ? icons.asc
            : sortDirection === 'desc' ? icons.desc
            : icons.default}
        </span>
      </button>
    ) : children

    return (
      <th
        ref={ref}
        className={cn(
          'text-left align-middle font-semibold text-text-muted whitespace-nowrap',
          headPaddingMap[size],
          checkboxPaddingMap[size],
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          sortable && 'select-none',
          className
        )}
        aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}
        {...props}
      >
        {content}
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

// ─── Data Cell ───────────────────────────────────────────────────
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const { size } = React.useContext(TableContext)
    return (
      <td
        ref={ref}
        className={cn(
          'text-foreground align-middle',
          cellPaddingMap[size],
          checkboxPaddingMap[size],
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          className
        )}
        {...props}
      />
    )
  }
)
TableCell.displayName = 'TableCell'

// ─── Caption ─────────────────────────────────────────────────────
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-text-muted', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export type { TableSize, TableVariant, SortDirection }

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
