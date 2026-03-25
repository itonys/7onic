'use client'

import * as React from 'react'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

// ─── Built-in Icons ───────────────────────────────────────

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ─── Radius Configuration ─────────────────────────────────

type NavigationMenuRadius = 'sm' | 'md' | 'lg' | 'xl'

const contentRadiusMap: Record<NavigationMenuRadius, string> = {
  sm: 'rounded',        // 4px
  md: 'rounded-md',     // 6px
  lg: 'rounded-lg',     // 8px
  xl: 'rounded-xl',     // 12px
}

const itemRadiusMap: Record<NavigationMenuRadius, string> = {
  sm: 'rounded-sm',     // 2px
  md: 'rounded',        // 4px
  lg: 'rounded-md',     // 6px
  xl: 'rounded-lg',     // 8px
}

// ─── Contexts ─────────────────────────────────────────────

type NavigationMenuContextValue = {
  orientation: 'horizontal' | 'vertical'
  size: 'sm' | 'md' | 'default' | 'lg'
  collapsed: boolean
  radius: NavigationMenuRadius
  fontWeight: 'normal' | 'semibold'
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue>({
  orientation: 'horizontal',
  size: 'default',
  collapsed: false,
  radius: 'lg',
  fontWeight: 'normal',
})
const useNavigationMenuContext = () => React.useContext(NavigationMenuContext)

// Whether we're inside NavigationMenuContent (affects link styling)
const ContentLevelContext = React.createContext(false)

// ─── Size Configuration ───────────────────────────────────

const navigationMenuSizeMap = {
  sm: {
    trigger: 'h-8 text-sm px-3 gap-2',
    link: 'h-8 text-sm px-3 gap-2',
    icon: 'icon-xs',
    collapsedSquare: 'size-8', collapsedWidth: 56,
    dropdownLink: 'px-3 py-1.5 text-sm gap-2',
    subLink: 'h-8 text-sm pl-8 pr-3 gap-2',
    groupLabel: 'text-2xs px-3 mb-1', groupMargin: 'mt-4 first:mt-0',
  },
  md: {
    trigger: 'h-9 text-md px-3.5 gap-2',
    link: 'h-9 text-md px-3.5 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-9', collapsedWidth: 60,
    dropdownLink: 'px-3 py-1.5 text-md gap-2',
    subLink: 'h-9 text-md pl-9 pr-3.5 gap-2',
    groupLabel: 'text-xs px-3.5 mb-1', groupMargin: 'mt-4 first:mt-0',
  },
  default: {
    trigger: 'h-10 text-md px-4 gap-2',
    link: 'h-10 text-md px-4 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-10', collapsedWidth: 64,
    dropdownLink: 'px-3 py-2 text-md gap-2',
    subLink: 'h-10 text-md pl-10 pr-4 gap-2',
    groupLabel: 'text-xs px-4 mb-1.5', groupMargin: 'mt-5 first:mt-0',
  },
  lg: {
    trigger: 'h-12 text-base px-6 gap-2',
    link: 'h-12 text-base px-6 gap-2',
    icon: 'icon-sm',
    collapsedSquare: 'size-12', collapsedWidth: 72,
    dropdownLink: 'px-3 py-2.5 text-base gap-2',
    subLink: 'h-12 text-base pl-12 pr-6 gap-2',
    groupLabel: 'text-xs px-4 mb-2', groupMargin: 'mt-6 first:mt-0',
  },
} as const

// ─── NavigationMenu (Root) ────────────────────────────────

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size of the menu items */
  size?: 'sm' | 'md' | 'default' | 'lg'
  /** Vertical only: show icons only (collapsed sidebar) */
  collapsed?: boolean
  /** Vertical only: sidebar width (default: 256px / 16rem) */
  width?: number | string
  /** Vertical only: collapsed sidebar width (default: 64px / 4rem) */
  collapsedWidth?: number | string
  /** Border radius for dropdown content and items */
  radius?: NavigationMenuRadius
  /** Font weight for menu items (default: normal, active items always use semibold) */
  fontWeight?: 'normal' | 'semibold'
  /** Horizontal only: delay before hover opens in ms */
  delayDuration?: number
  /** Horizontal only: skip delay when moving between triggers */
  skipDelayDuration?: number
  /** Controlled active menu item value */
  value?: string
  /** Default active menu item value (uncontrolled) */
  defaultValue?: string
  /** Callback when active item changes */
  onValueChange?: (value: string) => void
}

const NavigationMenuRoot = React.forwardRef<HTMLElement, NavigationMenuProps>(
  ({
    className,
    orientation = 'horizontal',
    size = 'default',
    collapsed = false,
    width,
    collapsedWidth,
    radius = 'lg',
    fontWeight = 'normal',
    delayDuration = 200,
    skipDelayDuration = 300,
    value,
    defaultValue,
    onValueChange,
    children,
    style,
    ...props
  }, ref) => {
    const contextValue = React.useMemo(
      () => ({ orientation, size, collapsed: orientation === 'vertical' ? collapsed : false, radius, fontWeight }),
      [orientation, size, collapsed, radius, fontWeight]
    )

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuContext.Provider value={contextValue}>
          <NavigationMenuPrimitive.Root
            ref={ref as React.Ref<HTMLDivElement>}
            className={cn('relative', className)}
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            value={value}
            defaultValue={defaultValue ?? ''}
            onValueChange={onValueChange}
          >
            {children}
          </NavigationMenuPrimitive.Root>
        </NavigationMenuContext.Provider>
      )
    }

    // Vertical mode
    const resolvedWidth = collapsed
      ? (collapsedWidth ?? navigationMenuSizeMap[size].collapsedWidth)
      : (width ?? 256)
    const widthValue = typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth

    return (
      <NavigationMenuContext.Provider value={contextValue}>
        <nav
          ref={ref}
          aria-label="navigation"
          className={cn(
            'flex flex-col',
            'transition-[width] duration-normal ease-out',
            className
          )}
          style={{ width: widthValue, ...style }}
          {...props}
        >
          {children}
        </nav>
      </NavigationMenuContext.Provider>
    )
  }
)
NavigationMenuRoot.displayName = 'NavigationMenu'

// ─── NavigationMenuList ───────────────────────────────────

export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {}

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.List
          ref={ref}
          className={cn('flex items-center gap-1', className)}
          {...props}
        >
          {children}
        </NavigationMenuPrimitive.List>
      )
    }

    return (
      <ul
        ref={ref}
        className={cn('flex flex-col gap-0.5', className)}
        {...props}
      >
        {children}
      </ul>
    )
  }
)
NavigationMenuList.displayName = 'NavigationMenuList'

// ─── NavigationMenuItem ───────────────────────────────────

export interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Value identifier for Radix (horizontal mode) */
  value?: string
  /** Vertical only: default open state for sub-menu */
  defaultOpen?: boolean
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, value, defaultOpen = false, children, ...props }, ref) => {
    const { orientation, collapsed } = useNavigationMenuContext()
    const [open, setOpen] = React.useState(defaultOpen)

    // Auto-close sub-menus when collapsed
    React.useEffect(() => {
      if (collapsed) setOpen(false)
    }, [collapsed])

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.Item
          ref={ref}
          className={cn('relative', className)}
          value={value}
          {...props}
        >
          {children}
        </NavigationMenuPrimitive.Item>
      )
    }

    // Vertical: wrap in Collapsible.Root for sub-menu support
    return (
      <CollapsiblePrimitive.Root
        open={collapsed ? false : open}
        onOpenChange={collapsed ? undefined : setOpen}
        asChild
      >
        <li ref={ref} className={cn('', className)} {...props}>
          {children}
        </li>
      </CollapsiblePrimitive.Root>
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenuItem'

// ─── NavigationMenuTrigger ────────────────────────────────

export interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon displayed before the label */
  icon?: React.ReactNode
  /** Custom chevron icon (default: built-in ChevronDown for horizontal, ChevronRight for vertical) */
  chevronIcon?: React.ReactNode
}

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, icon, chevronIcon, ...props }, ref) => {
    const { orientation, size, collapsed, radius, fontWeight: fw } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]
    const fwClass = fw === 'semibold' ? 'font-semibold' : 'font-normal'

    if (orientation === 'horizontal') {
      return (
        <NavigationMenuPrimitive.Trigger
          ref={ref}
          className={cn(
            'group inline-flex items-center justify-center',
            s.trigger,
            'gap-0',
            fwClass, 'text-text-muted',
            'transition-colors duration-fast',
            'hover:text-foreground',
            'data-[state=open]:text-foreground',
            'focus-visible:focus-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            className
          )}
          {...props}
        >
          {icon && <span className={cn('shrink-0 mr-2', s.icon)}>{icon}</span>}
          {children}
          <span className={cn('shrink-0 ml-1 text-text-subtle transition-transform duration-fast group-data-[state=open]:rotate-180', s.icon)}>
            {chevronIcon ?? <ChevronDownIcon className="size-full" />}
          </span>
        </NavigationMenuPrimitive.Trigger>
      )
    }

    // Vertical: Collapsible trigger
    return (
      <CollapsiblePrimitive.Trigger
        ref={ref}
        className={cn(
          'group flex items-center cursor-pointer',
          contentRadiusMap[radius],
          collapsed
            ? [s.collapsedSquare, 'justify-center mx-auto']
            : ['w-full', s.trigger],
          fwClass, 'text-text-muted transition-colors duration-fast',
          'hover:text-foreground hover:bg-background-muted',
          !collapsed && 'data-[state=open]:text-foreground',
          'focus-visible:focus-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...(collapsed && typeof children === 'string' ? { title: children } : {})}
        {...props}
      >
        {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{children}</span>
            <span
              className={cn(
                'shrink-0 text-text-subtle transition-transform duration-normal',
                s.icon,
                'group-data-[state=open]:rotate-90'
              )}
            >
              {chevronIcon ?? <ChevronRightIcon className="size-full" />}
            </span>
          </>
        )}
      </CollapsiblePrimitive.Trigger>
    )
  }
)
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

// ─── NavigationMenuContent ────────────────────────────────

export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, size, collapsed, radius } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]

    if (orientation === 'horizontal') {
      return (
        <ContentLevelContext.Provider value={true}>
          <NavigationMenuPrimitive.Content
            ref={ref}
            className={cn(
              'absolute left-0 top-full z-dropdown pt-1',
              'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
              className
            )}
            {...props}
          >
            <div className={cn('min-w-[180px] border border-border bg-background shadow-lg p-1.5 grid gap-0.5', contentRadiusMap[radius])}>
              {children}
            </div>
          </NavigationMenuPrimitive.Content>
        </ContentLevelContext.Provider>
      )
    }

    // Vertical: Collapsible content (hidden when collapsed)
    if (collapsed) return null

    return (
      <ContentLevelContext.Provider value={true}>
        <CollapsiblePrimitive.Content
          ref={ref}
          className={cn(
            'overflow-hidden',
            'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
          )}
          {...props}
        >
          <div className={cn(
            'flex flex-col gap-0.5 py-1',
            className
          )}>
            {children}
          </div>
        </CollapsiblePrimitive.Content>
      </ContentLevelContext.Provider>
    )
  }
)
NavigationMenuContent.displayName = 'NavigationMenuContent'

// ─── NavigationMenuLink ───────────────────────────────────

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether the link represents the current page */
  active?: boolean
  /** Compose with custom link component (Radix Slot) */
  asChild?: boolean
  /** Icon displayed before the label */
  icon?: React.ReactNode
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active, asChild, icon, children, ...props }, ref) => {
    const { orientation, size, collapsed, radius, fontWeight: fw } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]
    const fwClass = fw === 'semibold' ? 'font-semibold' : 'font-normal'
    const inContent = React.useContext(ContentLevelContext)

    if (orientation === 'horizontal') {
      // Exclude onSelect to avoid React vs Radix type conflict
      const { onSelect, ...radixSafeProps } = props as any

      // Content-level links (inside dropdown): block style with hover bg
      if (inContent) {
        return (
          <NavigationMenuPrimitive.Link
            ref={ref}
            className={cn(
              'flex items-center w-full',
              s.dropdownLink,
              itemRadiusMap[radius],
              'text-text-muted transition-colors duration-fast',
              'hover:text-foreground hover:bg-background-muted',
              active && 'text-foreground bg-background-muted font-semibold',
              'focus-visible:focus-ring',
              className
            )}
            active={active}
            asChild={asChild}
            onSelect={onSelect}
            {...radixSafeProps}
          >
            {asChild ? children : (
              <>
                {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
                {children}
              </>
            )}
          </NavigationMenuPrimitive.Link>
        )
      }

      // Top-level horizontal links: text only, no hover bg
      return (
        <NavigationMenuPrimitive.Link
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center',
            s.link,
            fwClass, 'text-text-muted',
            'transition-colors duration-fast',
            'hover:text-foreground',
            active && 'text-foreground font-semibold',
            'focus-visible:focus-ring',
            className
          )}
          active={active}
          asChild={asChild}
          onSelect={onSelect}
          {...radixSafeProps}
        >
          {asChild ? children : (
            <>
              {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
              {children}
            </>
          )}
        </NavigationMenuPrimitive.Link>
      )
    }

    // ── Vertical mode ──

    const Comp = asChild ? Slot : 'a'

    // Content-level links (sub-menu items): compact, indented
    if (inContent) {
      return (
        <Comp
          ref={ref}
          className={cn(
            'flex items-center w-full cursor-pointer',
            contentRadiusMap[radius],
            s.subLink,
            'text-text-muted transition-colors duration-fast',
            'hover:text-foreground hover:bg-background-muted',
            active && 'text-foreground bg-background-muted font-semibold',
            'focus-visible:focus-ring',
            className
          )}
          {...(active ? { 'aria-current': 'page' as const } : {})}
          {...props}
        >
          {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
          {!collapsed && children}
        </Comp>
      )
    }

    // Top-level vertical links
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative flex items-center cursor-pointer',
          contentRadiusMap[radius],
          collapsed
            ? [s.collapsedSquare, 'justify-center mx-auto']
            : ['w-full', s.link],
          'text-text-muted transition-colors duration-fast',
          'hover:text-foreground hover:bg-background-muted',
          active && 'text-foreground bg-background-muted font-semibold',
          'focus-visible:focus-ring',
          className
        )}
        {...(active ? { 'aria-current': 'page' as const } : {})}
        {...(collapsed && typeof children === 'string' ? { title: children } : {})}
        {...props}
      >
        {icon && <span className={cn('shrink-0', s.icon)}>{icon}</span>}
        {!collapsed && <span className="truncate">{children}</span>}
      </Comp>
    )
  }
)
NavigationMenuLink.displayName = 'NavigationMenuLink'

// ─── NavigationMenuGroup (vertical only) ──────────────────

export interface NavigationMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group header label */
  label?: string
}

const NavigationMenuGroup = React.forwardRef<HTMLDivElement, NavigationMenuGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    const { size, collapsed } = useNavigationMenuContext()
    const s = navigationMenuSizeMap[size]

    return (
      <div ref={ref} role="group" className={cn(label && !collapsed && s.groupMargin, className)} {...props}>
        {label && !collapsed && (
          <div className={cn(
            'font-semibold text-text-subtle uppercase tracking-wider select-none',
            s.groupLabel,
          )}>
            {label}
          </div>
        )}
        <ul className="flex flex-col gap-0.5">
          {children}
        </ul>
      </div>
    )
  }
)
NavigationMenuGroup.displayName = 'NavigationMenuGroup'

// ─── NavigationMenuIndicator ──────────────────────────────

export interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Active indicator dot color (default: dark/foreground, primary: brand color) */
  color?: 'default' | 'primary'
}

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  ({ className, color = 'default', ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    // Vertical: active indicator is built into NavigationMenuLink styling
    if (orientation === 'vertical') return null

    return (
      <NavigationMenuPrimitive.Indicator
        ref={ref}
        className={cn(
          'z-10 flex h-[3px] items-end justify-center overflow-hidden',
          'transition-[width,transform] duration-normal ease-out',
          'data-[state=visible]:animate-fade-in data-[state=hidden]:animate-fade-out',
          className
        )}
        {...props}
      >
        <div className={cn(
          'relative h-full w-full rounded-full',
          color === 'default' ? 'bg-foreground' : 'bg-primary'
        )} />
      </NavigationMenuPrimitive.Indicator>
    )
  }
)
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator'

// ─── NavigationMenuViewport ───────────────────────────────

export interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useNavigationMenuContext()

    // Vertical mode does not use a viewport
    if (orientation === 'vertical') return null

    return (
      <div className="absolute left-0 top-full z-dropdown w-auto pt-1">
        <NavigationMenuPrimitive.Viewport
          ref={ref}
          className={cn(
            'relative overflow-hidden',
            'border border-border bg-background rounded-xl shadow-lg',
            'h-[var(--radix-navigation-menu-viewport-height)]',
            'w-[var(--radix-navigation-menu-viewport-width)]',
            'transition-[width,height] duration-fast ease-out',
            'data-[state=open]:animate-nav-viewport-enter',
            'data-[state=closed]:animate-nav-viewport-exit',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
NavigationMenuViewport.displayName = 'NavigationMenuViewport'

// ─── Exports ──────────────────────────────────────────────

// ─── Namespace ──────────────────────────────────────────
const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Group: NavigationMenuGroup,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace NavigationMenu {
  export type ListProps = NavigationMenuListProps
  export type ItemProps = NavigationMenuItemProps
  export type TriggerProps = NavigationMenuTriggerProps
  export type ContentProps = NavigationMenuContentProps
  export type LinkProps = NavigationMenuLinkProps
  export type GroupProps = NavigationMenuGroupProps
  export type IndicatorProps = NavigationMenuIndicatorProps
  export type ViewportProps = NavigationMenuViewportProps
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuGroup,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuSizeMap,
  type NavigationMenuRadius,
}
