'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleGroupVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
)

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center text-sm text-text-muted transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
        outline: 'border border-border bg-transparent hover:bg-background-muted hover:text-foreground data-[state=on]:bg-background-muted data-[state=on]:text-foreground',
      },
      fontWeight: {
        normal: 'font-normal',
        semibold: 'font-semibold',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',      // 28px height, 10px paddingX, 12px font
        sm: 'h-8 px-3 text-sm gap-2',        // 32px height, 12px paddingX, 13px font
        md: 'h-9 px-3.5 text-md gap-2',      // 36px height, 14px paddingX, 14px font
        default: 'h-10 px-4 text-md gap-2',  // 40px height, 16px paddingX, 14px font
        lg: 'h-12 px-6 text-base gap-2',     // 48px height, 24px paddingX, 16px font
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      fontWeight: 'normal',
    },
  }
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupItemVariants>
>({
  variant: 'default',
  size: 'default',
  radius: 'default',
  fontWeight: 'normal',
})

type ToggleGroupSingleProps = {
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type ToggleGroupMultipleProps = {
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ToggleGroupBaseProps = Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'dir'
> & {
  disabled?: boolean
  rovingFocus?: boolean
  orientation?: 'horizontal' | 'vertical'
  dir?: 'ltr' | 'rtl'
  loop?: boolean
  children?: React.ReactNode
}

export type ToggleGroupProps = ToggleGroupBaseProps &
  VariantProps<typeof toggleGroupVariants> &
  VariantProps<typeof toggleGroupItemVariants> &
  (ToggleGroupSingleProps | ToggleGroupMultipleProps)

const ToggleGroupRoot = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, orientation, variant, size, radius, fontWeight, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      toggleGroupVariants({ orientation }),
      // Attached style for horizontal
      orientation !== 'vertical' && [
        '[&>*:not(:first-child)]:rounded-l-none',
        '[&>*:not(:last-child)]:rounded-r-none',
        '[&>*:not(:first-child)]:-ml-px',
        '[&>*]:relative',
        '[&>*:hover]:z-10',
        '[&>*:focus-visible]:z-10',
        '[&>*:active]:scale-none',
      ],
      // Attached style for vertical
      orientation === 'vertical' && [
        '[&>*:not(:first-child)]:rounded-t-none',
        '[&>*:not(:last-child)]:rounded-b-none',
        '[&>*:not(:first-child)]:-mt-px',
        '[&>*]:relative',
        '[&>*]:w-full',
        '[&>*:hover]:z-10',
        '[&>*:focus-visible]:z-10',
        '[&>*:active]:scale-none',
      ],
      className
    )}
    orientation={orientation}
    {...(props as React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>)}
  >
    <ToggleGroupContext.Provider value={{ variant, size, radius, fontWeight }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroupRoot.displayName = ToggleGroupPrimitive.Root.displayName

export interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    Omit<VariantProps<typeof toggleGroupItemVariants>, 'fontWeight'> {
  fontWeight?: 'normal' | 'semibold'
}

// Icon size for toggle group (5-step scale, Icon+Text mode)
// xs~sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  xs: '[&>svg]:icon-xs',      // 14px
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, radius, fontWeight, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const resolvedSize = size || context.size || 'default'

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleGroupItemVariants({
          variant: variant || context.variant,
          size: resolvedSize,
          radius: radius || context.radius,
          fontWeight: fontWeight || context.fontWeight,
        }),
        iconSizeClasses[resolvedSize],
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

// ─── Namespace ──────────────────────────────────────────
const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ToggleGroup {
  export type ItemProps = ToggleGroupItemProps
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants, toggleGroupItemVariants }
