'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Context to pass style props from TabsList to TabsTrigger
type TabsStyleContextValue = {
  variant?: 'line' | 'enclosed' | 'pill'
  size?: 'sm' | 'md' | 'default' | 'lg'
  fitted?: boolean
  color?: 'default' | 'primary'
  radius?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}
const TabsStyleContext = React.createContext<TabsStyleContextValue>({})
const useTabsStyleContext = () => React.useContext(TabsStyleContext)

// ─── TabsList ────────────────────────────────────────────────

const tabsListVariants = cva(
  'inline-flex items-center text-text-subtle',
  {
    variants: {
      variant: {
        line: 'border-b border-border bg-transparent gap-0',
        enclosed: 'border-b border-border bg-transparent gap-0',
        pill: 'bg-background-muted p-1 gap-1',
      },
      fitted: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'line',
      fitted: false,
    },
  }
)

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  size?: 'sm' | 'md' | 'default' | 'lg'
  /** Indicator color for line variant */
  color?: 'default' | 'primary'
  /** Top border-radius for enclosed variant, container radius for pill variant */
  radius?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, fitted, color, radius, ...props }, ref) => {
  const resolvedVariant = variant || 'line'
  return (
    <TabsStyleContext.Provider value={{ variant: resolvedVariant, size: size || 'default', fitted: fitted ?? false, color: color || 'default', radius: radius || 'md' }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          tabsListVariants({ variant, fitted }),
          resolvedVariant === 'pill' && pillListRadiusClasses[radius || 'md'],
          className
        )}
        {...props}
      />
    </TabsStyleContext.Provider>
  )
})
TabsList.displayName = 'TabsList'

// ─── TabsTrigger ─────────────────────────────────────────────

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'transition-all duration-micro ease-out cursor-pointer',
    'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:text-text-subtle disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        line: [
          'border-b-2 border-transparent -mb-px',
          'hover:text-foreground hover:border-border',
          'data-[state=active]:text-foreground data-[state=active]:font-semibold',
        ].join(' '),
        enclosed: [
          'border border-transparent -mb-px',
          'hover:text-foreground',
          'data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-background',
          'data-[state=active]:border-border data-[state=active]:border-b-background',
        ].join(' '),
        pill: [
          'hover:text-foreground',
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm',
        ].join(' '),
      },
      size: {
        sm: 'h-8 text-sm',       // 32px, 13px
        md: 'h-9 text-sm',       // 36px, 13px
        default: 'h-10 text-md', // 40px, 14px
        lg: 'h-12 text-base',    // 48px, 16px
      },
      fitted: {
        true: 'flex-1',
        false: '',
      },
    },
    compoundVariants: [
      // Padding per variant × size
      { variant: 'line', size: 'sm', className: 'px-3' },
      { variant: 'line', size: 'md', className: 'px-3.5' },
      { variant: 'line', size: 'default', className: 'px-4' },
      { variant: 'line', size: 'lg', className: 'px-6' },
      { variant: 'enclosed', size: 'sm', className: 'px-3' },
      { variant: 'enclosed', size: 'md', className: 'px-3.5' },
      { variant: 'enclosed', size: 'default', className: 'px-4' },
      { variant: 'enclosed', size: 'lg', className: 'px-6' },
      // Pill: reduced height + Segmented-matching font/padding
      { variant: 'pill', size: 'sm', className: 'h-6 text-xs px-3.5' },
      { variant: 'pill', size: 'md', className: 'h-7 text-sm px-3.5' },
      { variant: 'pill', size: 'default', className: 'h-8 text-sm px-4' },
      { variant: 'pill', size: 'lg', className: 'h-10 text-md px-6' },
    ],
    defaultVariants: {
      variant: 'line',
      size: 'default',
      fitted: false,
    },
  }
)

// Icon size mapping for tabs (same as Button icon+text pattern)
const triggerIconSizeClasses = {
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
} as const

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    Omit<VariantProps<typeof tabsTriggerVariants>, 'variant' | 'size' | 'fitted'> {}

// Line variant: active indicator color
const lineColorClasses = {
  default: 'data-[state=active]:border-foreground',
  primary: 'data-[state=active]:border-primary',
} as const

// Enclosed variant: top border-radius
const enclosedRadiusClasses = {
  none: 'rounded-t-none',
  sm: 'rounded-t-sm',
  base: 'rounded-t',
  md: 'rounded-t-md',
  lg: 'rounded-t-lg',
  xl: 'rounded-t-xl',
} as const

// Pill variant: container radius (applied to TabsList, matches Segmented scale)
const pillListRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const

// Pill variant: item radius (one step smaller than container, matches Segmented item scale)
const pillItemRadiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  base: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-md',
  xl: 'rounded-lg',
  '2xl': 'rounded-xl',
  '3xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, ...props }, ref) => {
  const { variant, size, fitted, color, radius } = useTabsStyleContext()
  const resolvedSize = size || 'default'

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tabsTriggerVariants({ variant, size: resolvedSize, fitted }),
        triggerIconSizeClasses[resolvedSize],
        variant === 'line' && lineColorClasses[color || 'default'],
        variant === 'enclosed' && enclosedRadiusClasses[(radius || 'md') as keyof typeof enclosedRadiusClasses],
        variant === 'pill' && pillItemRadiusClasses[radius || 'md'],
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = 'TabsTrigger'

// ─── TabsContent ─────────────────────────────────────────────

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:focus-ring',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

// ─── Tabs (Root) ─────────────────────────────────────────────

const Tabs = TabsPrimitive.Root

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
}
