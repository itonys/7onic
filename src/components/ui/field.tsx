'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Field Context for sharing state between components
interface FieldContextValue {
  id: string
  /** id of the FieldLabel, for aria-labelledby on grouped controls */
  labelId: string
  error?: boolean
  disabled?: boolean
  /** A FieldLabel is rendered inside this Field */
  hasLabel: boolean
  /** The Field holds labelled checkboxes / switches / a radio group and no single input */
  isGroup: boolean
  registerLabel: () => () => void
  registerControl: (kind: FieldControlKind) => () => void
}

type FieldControlKind = 'single' | 'group' | 'labelled'

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext() {
  return React.useContext(FieldContext)
}

// Controls tell their Field what they are, so FieldLabel can point at the right thing.
// 'single': one input that takes the Field id (Input, Textarea, a bare Checkbox / Switch);
//   FieldLabel targets it with htmlFor.
// 'group': a Checkbox / Switch with its own label keeps a unique id; the Field becomes
//   role="group" named by FieldLabel instead of every item sharing one id.
// 'labelled': a RadioGroup names itself from FieldLabel (aria-labelledby).
// A single input wins: with one present, FieldLabel keeps pointing at it.
function useFieldControl(kind: FieldControlKind, enabled: boolean) {
  const context = useFieldContext()
  const register = context?.registerControl
  React.useEffect(() => {
    if (!enabled || !register) return
    return register(kind)
  }, [enabled, register, kind])
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

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, gap, error, disabled, children, ...props }, ref) => {
    const id = React.useId()
    const labelId = `${id}-label`
    const [labelCount, setLabelCount] = React.useState(0)
    const [counts, setCounts] = React.useState({ single: 0, group: 0, labelled: 0 })

    const registerLabel = React.useCallback(() => {
      setLabelCount((n) => n + 1)
      return () => setLabelCount((n) => n - 1)
    }, [])
    const registerControl = React.useCallback((kind: FieldControlKind) => {
      setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }))
      return () => setCounts((c) => ({ ...c, [kind]: c[kind] - 1 }))
    }, [])

    const hasLabel = labelCount > 0
    const isGroup = counts.single === 0 && (counts.group > 0 || counts.labelled > 0)
    const asGroup = counts.single === 0 && counts.group > 0
    const contextValue = React.useMemo(
      () => ({ id, labelId, error, disabled, hasLabel, isGroup, registerLabel, registerControl }),
      [id, labelId, error, disabled, hasLabel, isGroup, registerLabel, registerControl]
    )

    return (
      <FieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          role={asGroup ? 'group' : undefined}
          aria-labelledby={asGroup && hasLabel ? labelId : undefined}
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
Field.displayName = 'Field'

// Field Label
export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    const context = useFieldContext()
    const registerLabel = context?.registerLabel
    React.useEffect(() => registerLabel?.(), [registerLabel])

    return (
      <label
        ref={ref}
        id={context?.labelId}
        // Grouped controls have their own labels; the group title targets no input
        htmlFor={context && !context.isGroup ? context.id : undefined}
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

export { Field, FieldLabel, FieldError, FieldCharCount, useFieldContext, useFieldControl }
