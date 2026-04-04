'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Default chevron icon (built-in, no external dependency)
const DefaultChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

// Context to pass style props from Accordion root to children
type AccordionStyleContextValue = {
  variant?: 'default' | 'bordered' | 'splitted'
  size?: 'sm' | 'default' | 'lg'
  iconPosition?: 'left' | 'right'
}
const AccordionStyleContext = React.createContext<AccordionStyleContextValue>({})
const useAccordionStyleContext = () => React.useContext(AccordionStyleContext)

// ─── Accordion (Root) ────────────────────────────────────────

const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: 'divide-y divide-border',
      bordered: 'divide-y divide-border border border-border rounded-xl',
      splitted: 'flex flex-col gap-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  variant?: 'default' | 'bordered' | 'splitted'
  size?: 'sm' | 'default' | 'lg'
  iconPosition?: 'left' | 'right'
  collapsible?: boolean
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: ((value: string) => void) | ((value: string[]) => void)
  disabled?: boolean
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, variant = 'default', size = 'default', iconPosition = 'right', type = 'single', collapsible = true, defaultValue, value, onValueChange, disabled, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Radix single/multiple union type conflict
    const restProps = props as any
    const sharedClassName = cn(accordionVariants({ variant }), className)

    const radixProps = type === 'multiple'
      ? {
          type: 'multiple' as const,
          defaultValue: defaultValue as string[] | undefined,
          value: value as string[] | undefined,
          onValueChange: onValueChange as ((value: string[]) => void) | undefined,
          disabled,
        }
      : {
          type: 'single' as const,
          collapsible,
          defaultValue: defaultValue as string | undefined,
          value: value as string | undefined,
          onValueChange: onValueChange as ((value: string) => void) | undefined,
          disabled,
        }

    return (
      <AccordionStyleContext.Provider value={{ variant, size, iconPosition }}>
          <AccordionPrimitive.Root
          ref={ref}
          className={sharedClassName}
          {...radixProps}
          {...restProps}
        />
      </AccordionStyleContext.Provider>
    )
  }
)
AccordionRoot.displayName = 'Accordion'

// ─── AccordionItem ───────────────────────────────────────────

const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: '',
      bordered: '',
      splitted: 'border border-border rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    Omit<VariantProps<typeof accordionItemVariants>, 'variant'> {}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => {
  const { variant } = useAccordionStyleContext()
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  )
})
AccordionItem.displayName = 'AccordionItem'

// ─── AccordionTrigger ────────────────────────────────────────

const accordionTriggerVariants = cva(
  [
    'flex flex-1 items-center gap-3 font-semibold text-foreground',
    'transition-all duration-micro ease-out cursor-pointer',
    'hover:bg-background-muted/50',
    'focus-visible:focus-ring focus-visible:rounded-md',
    'disabled:pointer-events-none disabled:text-text-subtle disabled:opacity-50',
    '[&[data-state=open]>svg.accordion-chevron]:rotate-180',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'py-3 px-4 text-sm',     // 13px
        default: 'py-4 px-4 text-md', // 14px
        lg: 'py-5 px-6 text-base',    // 16px
      },
      iconPosition: {
        left: 'flex-row',
        right: 'flex-row-reverse justify-between',
      },
    },
    defaultVariants: {
      size: 'default',
      iconPosition: 'right',
    },
  }
)

// Icon size per trigger size
const triggerIconSizeClasses = {
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
} as const

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Custom indicator icon (replaces default chevron) */
  icon?: React.ReactNode
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, icon, ...props }, ref) => {
  const { size, iconPosition } = useAccordionStyleContext()
  const resolvedSize = size || 'default'

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'group',
          accordionTriggerVariants({ size: resolvedSize, iconPosition }),
          className
        )}
        {...props}
      >
        {icon || (
          <DefaultChevronIcon className={cn(
            'accordion-chevron shrink-0 text-text-muted transition-transform duration-normal',
            triggerIconSizeClasses[resolvedSize]
          )} />
        )}
        <span className="text-left">{children}</span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

// ─── AccordionContent ────────────────────────────────────────

const accordionContentSizeClasses = {
  sm: 'px-4 pb-3 text-sm',
  default: 'px-4 pb-4 text-md',
  lg: 'px-6 pb-5 text-base',
} as const

export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
  const { size } = useAccordionStyleContext()
  const resolvedSize = size || 'default'

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn(
        'text-text-muted',
        accordionContentSizeClasses[resolvedSize],
        className
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = 'AccordionContent'

// ─── Exports ─────────────────────────────────────────────────

// ─── Namespace ──────────────────────────────────────────
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Accordion {
  export type ItemProps = AccordionItemProps
  export type TriggerProps = AccordionTriggerProps
  export type ContentProps = AccordionContentProps
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionVariants,
  accordionTriggerVariants,
}
