'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Field Context for sharing state between components
interface FieldContextValue {
  id: string
  error?: boolean
  disabled?: boolean
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext() {
  return React.useContext(FieldContext)
}

// Field wrapper
const fieldVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-1.5',
      default: 'gap-2',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    gap: 'default',
  },
})

export interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> {
  error?: boolean
  disabled?: boolean
}

const FieldRoot = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, gap, error, disabled, children, ...props }, ref) => {
    const id = React.useId()

    return (
      <FieldContext.Provider value={{ id, error, disabled }}>
        <div
          ref={ref}
          className={cn(fieldVariants({ gap }), className)}
          data-error={error || undefined}
          data-disabled={disabled || undefined}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    )
  }
)
FieldRoot.displayName = 'Field'

// Field Label
export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const context = useFieldContext()

    return (
      <label
        ref={ref}
        htmlFor={context?.id}
        className={cn(
          'text-md font-semibold text-foreground', // 14px - primary field identifier
          context?.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
    )
  }
)
FieldLabel.displayName = 'FieldLabel'

// Field Error
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const context = useFieldContext()

  if (!children) return null

  return (
    <p
      ref={ref}
      id={context ? `${context.id}-error` : undefined}
      role="alert"
      className={cn('text-xs text-error pl-1', className)} // 12px - color-distinguished, left-aligned with input text
      {...props}
    >
      {children}
    </p>
  )
})
FieldError.displayName = 'FieldError'

// Field Character Count
const FieldCharCount = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const context = useFieldContext()

  return (
    <p
      ref={ref}
      id={context ? `${context.id}-charcount` : undefined}
      className={cn(
        'text-xs text-text-muted text-right pr-1 -mt-1', // 12px - right-aligned, 4px gap from input (gap-2 8px - mt-1 4px)
        context?.disabled && 'opacity-50',
        className
      )}
      {...props}
    />
  )
})
FieldCharCount.displayName = 'FieldCharCount'

// ─── Namespace ──────────────────────────────────────────
const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Error: FieldError,
  CharCount: FieldCharCount,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Field {
  export type LabelProps = FieldLabelProps
}

export { Field, FieldLabel, FieldError, FieldCharCount, useFieldContext }
