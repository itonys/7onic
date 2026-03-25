'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useFieldContext } from './field'

const inputVariants = cva(
  [
    'flex w-full bg-background text-foreground placeholder:text-foreground/30',
    'border transition-colors duration-micro',
    'focus:[outline:2px_solid_transparent]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-muted',
    'file:border-0 file:bg-transparent file:text-sm file:font-semibold',
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
        xs: 'h-9 px-3 text-sm',          // 36px / 12px padding / 13px font (3.0:1)
        sm: 'h-10 px-3 text-md',         // 40px / 12px padding / 14px font (3.3:1)
        default: 'h-11 px-4 text-base',  // 44px / 16px padding / 16px font (2.75:1)
        lg: 'h-12 px-4 text-base',       // 48px / 16px padding / 16px font (3.0:1)
        xl: 'h-14 px-4 text-base',        // 56px / 16px padding / 16px font (3.5:1)
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
      state: 'default',
      focusRing: false,
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  focusRing?: boolean
}

// Icon size for input (2-step scale)
// xs~sm: 14px, default~xl: 16px
const iconSizeClasses = {
  xs: 'icon-xs',      // 14px
  sm: 'icon-xs',      // 14px
  default: 'icon-sm', // 16px
  lg: 'icon-sm',      // 16px
  xl: 'icon-sm',      // 16px
}

// Icon padding (padding + icon + gap)
const iconPaddingClasses = {
  xs: { left: 'pl-8', right: 'pr-8' },       // 12px + 14px icon + 6px gap = 32px
  sm: { left: 'pl-9', right: 'pr-9' },       // 12px + 14px icon + 8px gap = 34px → 36px
  default: { left: 'pl-10', right: 'pr-10' }, // 16px + 16px icon + 8px gap = 40px
  lg: { left: 'pl-10', right: 'pr-10' },     // 16px + 16px icon + 8px gap = 40px
  xl: { left: 'pl-10', right: 'pr-10' },     // 16px + 16px icon + 8px gap = 40px
}

// Icon position (matches horizontal padding)
const iconPositionClasses = {
  xs: { left: 'left-3', right: 'right-3' },      // 12px
  sm: { left: 'left-3', right: 'right-3' },      // 12px
  default: { left: 'left-4', right: 'right-4' }, // 16px
  lg: { left: 'left-4', right: 'right-4' },      // 16px
  xl: { left: 'left-4', right: 'right-4' },      // 16px
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, radius, state, type, leftIcon, rightIcon, error, focusRing, id, onPointerDown, onFocus, onBlur, ...props }, ref) => {
    const fieldContext = useFieldContext()
    const resolvedSize = size || 'default'
    const resolvedError = error ?? fieldContext?.error
    const resolvedState = resolvedError ? 'error' : state
    const inputId = id ?? fieldContext?.id
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

    const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLInputElement>) => {
      pointerRef.current = true
      onPointerDown?.(e)
    }, [onPointerDown])

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (!pointerRef.current && !focusRing && !windowBlurredRef.current) {
        setKeyboardFocus(true)
      }
      pointerRef.current = false
      onFocus?.(e)
    }, [focusRing, onFocus])

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
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

    const focusHandlers = {
      onPointerDown: handlePointerDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }

    // If icons are present, wrap input in a container
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-text-muted z-10',
              iconPositionClasses[resolvedSize].left,
              `[&>svg]:${iconSizeClasses[resolvedSize]}`
            )}>
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, radius, state: resolvedState, focusRing }),
              keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
              leftIcon && iconPaddingClasses[resolvedSize].left,
              rightIcon && iconPaddingClasses[resolvedSize].right,
              className
            )}
            aria-invalid={resolvedError || undefined}
            aria-describedby={ariaDescribedBy}
            disabled={isDisabled}
            ref={ref}
            {...focusHandlers}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none text-text-muted z-10',
              iconPositionClasses[resolvedSize].right,
              `[&>svg]:${iconSizeClasses[resolvedSize]}`
            )}>
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        id={inputId}
        className={cn(
          inputVariants({ variant, size, radius, state: resolvedState, focusRing }),
          keyboardFocus && 'shadow-[0_0_0_2px_var(--color-focus-ring)]',
          className
        )}
        aria-invalid={resolvedError || undefined}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        ref={ref}
        {...focusHandlers}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
