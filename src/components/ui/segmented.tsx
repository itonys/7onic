'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Context to pass variant and size from Segmented to SegmentedItem
type SegmentedContextValue = {
  variant?: 'default' | 'outline' | 'underline' | 'ghost'
  size?: 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}
const SegmentedContext = React.createContext<SegmentedContextValue>({})
const useSegmentedContext = () => React.useContext(SegmentedContext)

const segmentedVariants = cva(
  'inline-flex items-center text-text-subtle',
  {
    variants: {
      variant: {
        default: 'bg-background-muted gap-1',
        outline: 'bg-background border border-border gap-1',
        underline: 'bg-transparent border-b border-border gap-0',
        ghost: 'bg-transparent gap-1',
      },
      size: {
        sm: 'h-8',        // 32px height
        md: 'h-9',        // 36px height
        default: 'h-10',  // 40px height
        lg: 'h-12',       // 48px height
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
      fontWeight: {
        normal: '[&>*]:font-normal',
        semibold: '[&>*]:font-semibold',
      },
    },
    compoundVariants: [
      // Padding for default/outline/ghost variants
      { variant: 'default', className: 'p-1' },
      { variant: 'outline', className: 'p-1' },
      { variant: 'ghost', className: 'p-1' },
      // Underline has no padding
      { variant: 'underline', className: 'p-0' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      fontWeight: 'normal',
    },
  }
)

const segmentedItemVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap h-full',
    'transition-all duration-micro ease-out',
    'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        // Default: light background when selected, text emphasis on hover
        default: [
          'hover:text-foreground',
          'data-[state=checked]:bg-background data-[state=checked]:text-foreground',
          'data-[state=checked]:shadow-sm',
        ].join(' '),
        // Outline: gray background when selected
        outline: [
          'data-[state=checked]:bg-background-muted data-[state=checked]:text-foreground',
          'hover:text-foreground hover:bg-background-muted',
        ].join(' '),
        // Underline: bottom border indicator (Stripe/GitHub style)
        underline: [
          'border-b-2 border-transparent -mb-px',
          'hover:text-foreground hover:border-border',
          'data-[state=checked]:text-foreground data-[state=checked]:border-foreground',
        ].join(' '),
        // Ghost: pill background only on selected (Notion/Figma style)
        ghost: [
          'hover:text-foreground hover:bg-background-muted',
          'data-[state=checked]:bg-background-muted data-[state=checked]:text-foreground',
        ].join(' '),
      },
      size: {
        sm: 'text-xs',      // 12px
        md: 'text-sm',      // 13px
        default: 'text-sm', // 13px
        lg: 'text-md',      // 14px
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        default: 'rounded-md',
        lg: 'rounded-md',
        xl: 'rounded-lg',
        '2xl': 'rounded-xl',
        '3xl': 'rounded-2xl',
        full: 'rounded-full',
      },
      // Content type determines padding and aspect ratio
      contentType: {
        // Icon only: square aspect ratio like IconButton
        icon: 'aspect-square',
        // Icon + text: rectangular (gap is set via compoundVariants)
        'icon-text': '',
        // Text only: standard button padding
        text: '',
      },
    },
    compoundVariants: [
      // Icon + text - same padding rules as Button/Toggle
      { contentType: 'icon-text', size: 'sm', className: 'px-3 gap-2' },      // 12px padding, 8px gap
      { contentType: 'icon-text', size: 'md', className: 'px-3.5 gap-2' },   // 14px padding, 8px gap
      { contentType: 'icon-text', size: 'default', className: 'px-4 gap-2' }, // 16px padding, 8px gap
      { contentType: 'icon-text', size: 'lg', className: 'px-6 gap-2' },      // 24px padding, 8px gap
      // Text only - same padding rules as Button/Toggle
      { contentType: 'text', size: 'sm', className: 'px-3.5' },    // 14px
      { contentType: 'text', size: 'md', className: 'px-3.5' },    // 14px
      { contentType: 'text', size: 'default', className: 'px-4' }, // 16px
      { contentType: 'text', size: 'lg', className: 'px-6' },      // 24px
      // Underline variant has no rounded corners
      { variant: 'underline', className: 'rounded-none' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      contentType: 'text',
    },
  }
)

export interface SegmentedProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof segmentedVariants> {}

const Segmented = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  SegmentedProps
>(({ className, variant, size, radius, fontWeight, ...props }, ref) => {
  // All variants default to normal font weight
  const resolvedFontWeight = fontWeight ?? 'normal'

  return (
    <SegmentedContext.Provider value={{ variant: variant || 'default', size: size || 'default', radius: radius || 'default' }}>
      <RadioGroupPrimitive.Root
        className={cn(segmentedVariants({ variant, size, radius, fontWeight: resolvedFontWeight }), className)}
        {...props}
        ref={ref}
      />
    </SegmentedContext.Provider>
  )
})
Segmented.displayName = 'Segmented'

// Icon size for segmented control (4-step scale, Icon+Text mode)
// sm: 14px, md~default~lg: 16px
const iconSizeClasses = {
  sm: '[&>svg]:icon-xs',      // 14px
  md: '[&>svg]:icon-sm',      // 16px
  default: '[&>svg]:icon-sm', // 16px
  lg: '[&>svg]:icon-sm',      // 16px
}

export interface SegmentedItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    Omit<VariantProps<typeof segmentedItemVariants>, 'variant'> {}

const SegmentedItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  SegmentedItemProps
>(({ className, children, size, radius, contentType, ...props }, ref) => {
  const { variant, size: contextSize, radius: contextRadius } = useSegmentedContext()
  const resolvedSize = size || contextSize || 'default'
  const resolvedRadius = radius || contextRadius || 'default'

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        segmentedItemVariants({ variant, size: resolvedSize, radius: resolvedRadius, contentType }),
        iconSizeClasses[resolvedSize],
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
SegmentedItem.displayName = 'SegmentedItem'

export { Segmented, SegmentedItem, segmentedVariants, segmentedItemVariants }
