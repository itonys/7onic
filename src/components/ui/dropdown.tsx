'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

// Radius variants for Content and Item (concentric rounded rectangles)
type DropdownMenuRadius = 'md' | 'lg' | 'xl'

const contentRadiusMap: Record<DropdownMenuRadius, string> = {
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px (default)
}

const itemRadiusMap: Record<DropdownMenuRadius, string> = {
  md: 'rounded',        // 4px — perceptual balance (67%)
  lg: 'rounded-md',     // 6px — perceptual balance (75%)
  xl: 'rounded-lg',     // 8px — perceptual balance (67%)
}

// Size variants
type DropdownMenuSize = 'sm' | 'md' | 'lg'

const itemSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-sm',
  lg: 'px-3 py-2.5 text-md',
}

const indicatorItemSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'py-1.5 pl-6 pr-2 text-xs',
  md: 'py-1.5 pl-8 pr-2 text-sm',
  lg: 'py-2.5 pl-10 pr-3 text-md',
}

const indicatorSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'left-2 h-3 w-3',
  md: 'left-2 h-3.5 w-3.5',
  lg: 'left-3 h-4 w-4',
}

const labelSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-2 py-1.5 text-xs',
  lg: 'px-3 py-2.5 text-xs',
}

const flushItemPaddingMap: Record<DropdownMenuSize, string> = {
  sm: 'px-3',
  md: 'px-3',
  lg: 'px-4',
}

const flushIndicatorItemPaddingMap: Record<DropdownMenuSize, string> = {
  sm: 'pl-7 pr-3',
  md: 'pl-9 pr-3',
  lg: 'pl-11 pr-4',
}

const insetSizeMap: Record<DropdownMenuSize, string> = {
  sm: 'pl-6',
  md: 'pl-8',
  lg: 'pl-10',
}

// Style context — propagates radius, flush, size from Content to children
const DropdownMenuStyleContext = React.createContext<{
  radius: DropdownMenuRadius
  flush: boolean
  size: DropdownMenuSize
}>({ radius: 'lg', flush: false, size: 'md' })

// Root — state management (controlled / uncontrolled)
const DropdownMenuRoot = DropdownMenuPrimitive.Root

// Trigger — the element that toggles the menu
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

// Group — groups related items
const DropdownMenuGroup = DropdownMenuPrimitive.Group

// Sub — submenu root
const DropdownMenuSub = DropdownMenuPrimitive.Sub

// RadioGroup — radio selection group
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

// Content — the floating panel (rendered in a Portal)
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    radius?: DropdownMenuRadius
    flush?: boolean
    size?: DropdownMenuSize
  }
>(({ className, sideOffset = 4, radius = 'md', flush = false, size = 'md', onCloseAutoFocus, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuStyleContext.Provider value={{ radius, flush, size }}>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onCloseAutoFocus?.(e)
        }}
        className={cn(
          'z-dropdown min-w-[8rem] overflow-hidden border border-border bg-background shadow-lg',
          flush ? 'py-1' : 'p-1',
          contentRadiusMap[radius],
          className
        )}
        {...props}
      />
    </DropdownMenuStyleContext.Provider>
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

// Item — a single menu item
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        itemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

// CheckboxItem — item with a checkbox indicator
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        indicatorItemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushIndicatorItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className={cn('absolute flex items-center justify-center', indicatorSizeMap[size])}>
        <DropdownMenuPrimitive.ItemIndicator>
          <svg className="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

// RadioItem — item within a RadioGroup
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center outline-none',
        indicatorItemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushIndicatorItemPaddingMap[size],
        'transition-colors duration-fast',
        'focus:bg-background-muted',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className={cn('absolute flex items-center justify-center', indicatorSizeMap[size])}>
        <DropdownMenuPrimitive.ItemIndicator>
          <svg className="icon-xs" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="12" r="6" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
})
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

// Label — non-interactive group heading
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => {
  const { flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'font-semibold text-text-muted',
        labelSizeMap[size],
        flush && flushItemPaddingMap[size],
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

// Separator — visual divider between groups
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { flush } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('h-px bg-border my-1', !flush && '-mx-1', className)}
      {...props}
    />
  )
})
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

// SubTrigger — item that opens a submenu
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => {
  const { radius, flush, size } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center outline-none',
        itemSizeMap[size],
        !flush && itemRadiusMap[radius],
        flush && flushItemPaddingMap[size],
        'focus:bg-background-muted data-[state=open]:bg-background-muted',
        inset && insetSizeMap[size],
        className
      )}
      {...props}
    >
      {children}
      <svg className="ml-auto icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  )
})
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

// SubContent — the floating panel for a submenu
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  const { radius, flush } = React.useContext(DropdownMenuStyleContext)
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-dropdown min-w-[8rem] overflow-hidden border border-border bg-background shadow-lg',
        flush ? 'py-1' : 'p-1',
        contentRadiusMap[radius],
        className
      )}
      {...props}
    />
  )
})
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

// Shortcut — keyboard shortcut hint text
function DropdownMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto pl-4 text-xs text-text-subtle tracking-widest', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export type { DropdownMenuRadius, DropdownMenuSize }

// ─── Namespace ──────────────────────────────────────────
const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  Shortcut: DropdownMenuShortcut,
})

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
}
