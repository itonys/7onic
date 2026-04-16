'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

// Radius (matches Input — set at Root, propagates to Trigger and Content)
type SelectRadius = 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'

const triggerRadiusMap: Record<SelectRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  default: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

// Auto-mapping: root radius → content radius (3 levels)
type SelectContentRadius = 'md' | 'lg' | 'xl'

const contentRadiusFromRoot: Record<SelectRadius, SelectContentRadius> = {
  none: 'md',
  sm: 'md',
  base: 'md',
  default: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': 'xl',
  '3xl': 'xl',
  full: 'xl',
}

const contentRadiusMap: Record<SelectContentRadius, string> = {
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px
}

const itemRadiusMap: Record<SelectContentRadius, string> = {
  md: 'rounded',        // 4px — perceptual balance (67%)
  lg: 'rounded-md',     // 6px — perceptual balance (75%)
  xl: 'rounded-lg',     // 8px — perceptual balance (67%)
}

// Size variants (matches Input component)
type SelectSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl'

// Trigger sizes (identical to Input)
const triggerSizeMap: Record<SelectSize, string> = {
  xs: 'h-9 px-3 text-sm',          // 36px
  sm: 'h-10 px-3 text-md',         // 40px
  default: 'h-11 px-4 text-base',  // 44px
  lg: 'h-12 px-4 text-base',       // 48px
  xl: 'h-14 px-4 text-base',       // 56px
}

// Trigger icon sizes (matches Input icon pattern)
const triggerIconSizeMap: Record<SelectSize, string> = {
  xs: 'icon-xs',      // 14px
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
  xl: 'icon-sm',      // 16px
}

// Auto-mapping: trigger size → content item size (3 levels)
type SelectItemSize = 'sm' | 'md' | 'lg'

const itemSizeFromTrigger: Record<SelectSize, SelectItemSize> = {
  xs: 'sm',
  sm: 'sm',
  default: 'md',
  lg: 'md',
  xl: 'lg',
}

// Item sizes (font matches Trigger for seamless selection, padding controls density)
const itemSizeMap: Record<SelectItemSize, string> = {
  sm: 'pl-2 pr-6 py-1.5 text-sm',
  md: 'pl-3 pr-8 py-1.5 text-base',
  lg: 'pl-3 pr-10 py-2.5 text-base',
}

// Item indicator (check mark) — right-aligned
const indicatorSizeMap: Record<SelectItemSize, string> = {
  sm: 'right-2 h-3 w-3',
  md: 'right-2 h-3.5 w-3.5',
  lg: 'right-3 h-4 w-4',
}

// Label sizes
const labelSizeMap: Record<SelectItemSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-xs',
  lg: 'px-3 py-2.5 text-xs',
}

// Flush mode — items span full width, no inner radius
const flushItemPaddingMap: Record<SelectItemSize, string> = {
  sm: 'pl-3 pr-7',
  md: 'pl-4 pr-9',
  lg: 'pl-4 pr-11',
}

const flushIndicatorSizeMap: Record<SelectItemSize, string> = {
  sm: 'right-3 h-3 w-3',
  md: 'right-3 h-3.5 w-3.5',
  lg: 'right-4 h-4 w-4',
}

const flushLabelPaddingMap: Record<SelectItemSize, string> = {
  sm: 'px-3',
  md: 'px-3',
  lg: 'px-4',
}

// Root context — set at Root, consumed by Trigger and Content
const SelectRootContext = React.createContext<{
  size: SelectSize
  radius: SelectRadius
}>({ size: 'default', radius: 'default' })

// Style context — set at Content, consumed by Item/Label
const SelectStyleContext = React.createContext<{
  contentRadius: SelectContentRadius
  itemSize: SelectItemSize
  flush: boolean
}>({ contentRadius: 'xl', itemSize: 'md', flush: false })

// Root — state management + size/radius context
const SelectRoot = ({
  size = 'default',
  radius = 'default',
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
  size?: SelectSize
  radius?: SelectRadius
}) => (
  <SelectRootContext.Provider value={{ size, radius }}>
    <SelectPrimitive.Root {...props} />
  </SelectRootContext.Provider>
)

// Value — displays selected value or placeholder
const SelectValue = SelectPrimitive.Value

// Group — groups related items
const SelectGroup = SelectPrimitive.Group

// Trigger — the element that opens the select (reads size + radius from context)
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { size, radius } = React.useContext(SelectRootContext)
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between bg-background text-foreground hover:bg-background-muted',
        'border border-border',
        triggerRadiusMap[radius],
        'transition-colors duration-micro outline-transparent',
        'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)] focus:[outline:2px_solid_transparent]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[placeholder]:text-foreground/30',
        triggerSizeMap[size],
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          className={cn('ml-2 shrink-0 text-text-muted', triggerIconSizeMap[size])}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// ScrollUpButton — scroll indicator at top
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex items-center justify-center py-1 cursor-default', className)}
    {...props}
  >
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

// ScrollDownButton — scroll indicator at bottom
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex items-center justify-center py-1 cursor-default', className)}
    {...props}
  >
    <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// Content — the floating panel (reads size + radius from context, auto-maps both)
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    flush?: boolean
  }
>(({ className, children, position = 'popper', sideOffset = 1, flush = false, onCloseAutoFocus, ...props }, ref) => {
  const { size, radius } = React.useContext(SelectRootContext)
  const itemSize = itemSizeFromTrigger[size]
  const contentRadius = contentRadiusFromRoot[radius]
  return (
    <SelectPrimitive.Portal>
      <SelectStyleContext.Provider value={{ contentRadius, itemSize, flush }}>
        <SelectPrimitive.Content
          ref={ref}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            onCloseAutoFocus?.(e)
          }}
          className={cn(
            'relative z-dropdown min-w-[var(--radix-select-trigger-width)] overflow-hidden border border-border bg-background text-foreground shadow-lg',
            flush ? 'py-1' : 'p-1',
            contentRadiusMap[contentRadius],
            position === 'popper' &&
              'max-h-[var(--radix-select-content-available-height)]',
            className
          )}
          position={position}
          sideOffset={sideOffset}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              position === 'popper' &&
                'h-[var(--radix-select-content-available-height)] w-full'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectStyleContext.Provider>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// Item — a single selectable item (with right-aligned check indicator)
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { contentRadius, itemSize, flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center outline-none',
        itemSizeMap[itemSize],
        !flush && itemRadiusMap[contentRadius],
        flush && flushItemPaddingMap[itemSize],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
      <span className={cn('absolute flex items-center justify-center', flush ? flushIndicatorSizeMap[itemSize] : indicatorSizeMap[itemSize])}>
        <SelectPrimitive.ItemIndicator>
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

// Label — non-interactive group heading
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const { itemSize, flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'font-semibold text-text-muted',
        labelSizeMap[itemSize],
        flush && flushLabelPaddingMap[itemSize],
        className
      )}
      {...props}
    />
  )
})
SelectLabel.displayName = SelectPrimitive.Label.displayName

// Separator — visual divider between groups
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { flush } = React.useContext(SelectStyleContext)
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('h-px bg-border my-1', !flush && '-mx-1', className)}
      {...props}
    />
  )
})
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export type { SelectRadius, SelectSize }

// ─── Namespace ──────────────────────────────────────────
const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
})

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}
