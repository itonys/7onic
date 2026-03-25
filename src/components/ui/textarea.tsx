'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

const textareaVariants = cva(
  [
    'flex w-full bg-background text-foreground placeholder:text-foreground/30',
    'border transition-colors duration-micro',
    'focus:[outline:2px_solid_transparent]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-muted',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-border hover:border-border-strong',
        filled: 'border-transparent bg-background-muted',
      },
      focusRing: {
        true: '',
        false: '',
      },
      size: {
        compact: 'px-3 py-2 text-md',   // 12px padding / 14px font - compact spaces
        default: 'px-4 py-3 text-base', // 16px padding / 16px font - standard
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
        full: 'rounded-3xl', // rounded-full looks unnatural on textarea, using 3xl instead
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      state: {
        default: '',
        error: 'border-error hover:border-error focus:border-error shadow-[0_0_0_2px_var(--color-focus-ring-error)]',
      },
    },
    compoundVariants: [
      // focusRing: true → show custom focus ring
      { focusRing: true, className: 'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)]' },
      // focusRing: false → keep same state as hover
      { variant: 'default', focusRing: false, className: 'focus:border-border-strong' },
      // filled + error
      {
        variant: 'filled',
        state: 'error',
        className: 'border-transparent hover:border-transparent focus:border-transparent bg-[var(--color-error-bg)] hover:bg-[var(--color-error-bg)] focus:bg-[var(--color-error-bg)] shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'default',
      resize: 'vertical',
      state: 'default',
      focusRing: false,
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  focusRing?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, radius, resize, state, error, focusRing, id, rows = 4, onPointerDown, onFocus, onBlur, ...props }, ref) => {
    const fieldContext = useFieldContext()
    const resolvedError = error ?? fieldContext?.error
    const resolvedState = resolvedError ? 'error' : state
    const textareaId = id ?? fieldContext?.id
    const isDisabled = props.disabled ?? fieldContext?.disabled

    // Keyboard focus detection (when focusRing: false, auto-show ring on Tab navigation)
    const pointerRef = React.useRef(false)
    const windowBlurredRef = React.useRef(false)
    const [keyboardFocus, setKeyboardFocus] = React.useState(false)

    // Track window blur/focus to distinguish Tab navigation from window re-activation
    React.useEffect(() => {
      const onBlur = () => { windowBlurredRef.current = true }
      const onFocus = () => { requestAnimationFrame(() => { windowBlurredRef.current = false }) }
      window.addEventListener('blur', onBlur)
      window.addEventListener('focus', onFocus)
      return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus) }
    }, [])

    const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLTextAreaElement>) => {
      pointerRef.current = true
      onPointerDown?.(e)
    }, [onPointerDown])

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!pointerRef.current && !focusRing && !windowBlurredRef.current) {
        setKeyboardFocus(true)
      }
      pointerRef.current = false
      onFocus?.(e)
    }, [focusRing, onFocus])

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      setKeyboardFocus(false)
      pointerRef.current = false
      onBlur?.(e)
    }, [onBlur])

    // Build aria-describedby from context
    const ariaDescribedBy = fieldContext
      ? [
          resolvedError ? `${fieldContext.id}-error` : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      : undefined

    return (
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          textareaVariants({ variant, size, radius, resize, state: resolvedState, focusRing }),
          keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
          className
        )}
        aria-invalid={resolvedError || undefined}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        ref={ref}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
