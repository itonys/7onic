'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Size maps
// ============================================================================

/** Textarea padding per size */
const fieldPaddingMap = {
  sm:      'pt-2.5 px-3 text-md',
  default: 'pt-3 px-4 text-md',
  lg:      'pt-4 px-5 text-base',
} as const

/** Submit row padding per size */
const submitWrapperMap = {
  sm:      'px-2.5 pb-2.5',
  default: 'px-3 pb-3',
  lg:      'px-4 pb-4',
} as const

/** Submit button dimensions per size */
const submitSizeMap = {
  sm:      'h-7 w-7',
  default: 'h-8 w-8',
  lg:      'h-9 w-9',
} as const

/** Submit button radius — auto-calculated from container radius (min rounded-md) */
const submitRadiusMap = {
  sm:    'rounded-md',
  md:    'rounded-md',
  lg:    'rounded-md',
  xl:    'rounded-lg',
  '2xl': 'rounded-xl',
  full:  'rounded-full',
} as const

/** Submit button radius — direct class map for explicit buttonRadius prop */
const buttonRadiusClassMap: Record<ChatInputRadius, string> = {
  sm:    'rounded-sm',
  md:    'rounded-md',
  lg:    'rounded-lg',
  xl:    'rounded-xl',
  '2xl': 'rounded-2xl',
  full:  'rounded-full',
}

/** Submit icon size class per size */
const submitIconSizeMap = {
  sm:      'icon-xs',
  default: 'icon-xs',
  lg:      'icon-sm',
} as const

/** Character count text size per size */
const countStyleMap = {
  sm:      'text-xs',
  default: 'text-xs',
  lg:      'text-sm',
} as const

/** Approximate line-height (px) per size for auto-resize */
const lineHeightMap = {
  sm:      20,
  default: 22,
  lg:      24,
} as const

/** Field padding in inline layout — horizontal only (vertical centering via flex) */
const inlineFieldPaddingMap = {
  sm:      'px-3 text-md',
  default: 'px-4 text-md',
  lg:      'px-5 text-base',
} as const

/** Submit wrapper padding in inline layout — symmetric vertical */
const submitWrapperInlineMap = {
  sm:      'px-2.5 py-2.5',
  default: 'px-3 py-3',
  lg:      'px-4 py-4',
} as const

// ============================================================================
// CVA — root container variants
// ============================================================================

const chatInputVariants = cva(
  [
    'flex flex-col w-full overflow-hidden cursor-text',
    'transition-colors duration-micro',
  ].join(' '),
  {
    variants: {
      variant: {
        outline: [
          'border border-border bg-background',
          'hover:border-border-strong',
          'focus-within:border-border-strong focus-within:hover:border-border-strong',
        ].join(' '),
        filled: [
          'border border-transparent bg-background-muted',
          'focus-within:border-border',
        ].join(' '),
      },
      radius: {
        sm:    'rounded-sm',
        md:    'rounded-md',
        lg:    'rounded-lg',
        xl:    'rounded-xl',
        '2xl': 'rounded-2xl',
        full:  'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'outline',
      radius:  'xl',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export type ChatInputSize    = 'sm' | 'default' | 'lg'
export type ChatInputVariant = 'outline' | 'filled'
export type ChatInputRadius  = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
export type ChatInputColor   = 'default' | 'primary'
export type ChatInputLayout  = 'default' | 'inline'

// ============================================================================
// Context
// ============================================================================

interface ChatInputContextValue {
  size:           ChatInputSize
  color:          ChatInputColor
  layout:         ChatInputLayout
  radius:         ChatInputRadius
  disabled:       boolean
  isEmpty:        boolean
  charCount:      number
  showCount:      boolean
  maxLength:      number | undefined
  _setIsEmpty:    React.Dispatch<React.SetStateAction<boolean>>
  _setCharCount:  React.Dispatch<React.SetStateAction<number>>
  _setShowCount:  React.Dispatch<React.SetStateAction<boolean>>
  _setMaxLength:  React.Dispatch<React.SetStateAction<number | undefined>>
  _fieldRef:      React.MutableRefObject<HTMLTextAreaElement | null>
  _handleSubmit:  () => void
}

const ChatInputContext = React.createContext<ChatInputContextValue>({
  size:           'default',
  color:          'default',
  layout:         'default',
  radius:         'xl',
  disabled:       false,
  isEmpty:        true,
  charCount:      0,
  showCount:      false,
  maxLength:      undefined,
  _setIsEmpty:    () => {},
  _setCharCount:  () => {},
  _setShowCount:  () => {},
  _setMaxLength:  () => {},
  _fieldRef:      { current: null },
  _handleSubmit:  () => {},
})

// ============================================================================
// Props interfaces
// ============================================================================

export interface ChatInputRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'>,
    VariantProps<typeof chatInputVariants> {
  /** Visual style of the container */
  variant?: ChatInputVariant
  /** Corner radius */
  radius?: ChatInputRadius
  /** Size scale */
  size?: ChatInputSize
  /** Submit button color — default (dark) or primary (brand) */
  color?: ChatInputColor
  /** Layout direction — default (stacked) or inline (field + button side by side) */
  layout?: ChatInputLayout
  /** Disable all interaction */
  disabled?: boolean
  /** Called when the user submits (Enter key or Submit button) — receives current field value */
  onSubmit?: (value: string) => void
}

export interface ChatInputFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Maximum visible rows before the field scrolls */
  maxRows?: number
  /** Show character counter — requires maxLength to be set */
  showCount?: boolean
}

export interface ChatInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show loading/stop state — keeps button enabled so user can stop generation */
  loading?: boolean
  /** Called when clicked during loading state (e.g., stop generation) */
  onStop?: () => void
  /** Override the auto-calculated button radius */
  buttonRadius?: ChatInputRadius
}

// ============================================================================
// ChatInput — Root container
// ============================================================================

const ChatInput = React.forwardRef<HTMLDivElement, ChatInputRootProps>(
  (
    {
      className,
      variant  = 'outline',
      radius   = 'xl',
      size     = 'default',
      color    = 'default',
      layout   = 'default',
      disabled = false,
      onSubmit,
      children,
      ...props
    },
    ref
  ) => {
    const [isEmpty,    setIsEmpty]    = React.useState(true)
    const [charCount,  setCharCount]  = React.useState(0)
    const [showCount,  setShowCount]  = React.useState(false)
    const [maxLength,  setMaxLength]  = React.useState<number | undefined>(undefined)
    const fieldRef = React.useRef<HTMLTextAreaElement | null>(null)

    const handleSubmit = React.useCallback(() => {
      const el = fieldRef.current
      if (!el || disabled) return
      const value = el.value.trim()
      if (!value) return
      onSubmit?.(value)
      // Auto-clear in uncontrolled mode
      // Controlled-mode users should clear value inside their onSubmit callback
      el.value = ''
      el.style.height = 'auto'
      setIsEmpty(true)
      setCharCount(0)
    }, [disabled, onSubmit])

    const contextValue = React.useMemo<ChatInputContextValue>(
      () => ({
        size,
        color,
        layout,
        radius,
        disabled,
        isEmpty,
        charCount,
        showCount,
        maxLength,
        _setIsEmpty:   setIsEmpty,
        _setCharCount: setCharCount,
        _setShowCount: setShowCount,
        _setMaxLength: setMaxLength,
        _fieldRef:     fieldRef,
        _handleSubmit: handleSubmit,
      }),
      [size, color, layout, radius, disabled, isEmpty, charCount, showCount, maxLength, handleSubmit]
    )

    const handleContainerClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        // Focus the textarea when clicking anywhere in the container (not on a button)
        if (!disabled && !(e.target as HTMLElement).closest('button')) {
          fieldRef.current?.focus()
        }
      },
      [disabled]
    )

    return (
      <ChatInputContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-disabled={disabled || undefined}
          onClick={handleContainerClick}
          className={cn(
            chatInputVariants({ variant, radius }),
            layout === 'inline' && 'flex-row',
            disabled && 'opacity-50 pointer-events-none',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ChatInputContext.Provider>
    )
  }
)
ChatInput.displayName = 'ChatInput'

// ============================================================================
// ChatInputField — Auto-resizing textarea
// ============================================================================

const ChatInputField = React.forwardRef<HTMLTextAreaElement, ChatInputFieldProps>(
  (
    {
      className,
      maxRows   = 8,
      showCount = false,
      maxLength,
      placeholder,
      onChange,
      onKeyDown,
      disabled,
      ...props
    },
    forwardedRef
  ) => {
    const ctx = React.useContext(ChatInputContext)
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)
    const isDisabled = disabled ?? ctx.disabled

    // Sync showCount + maxLength into root context on mount/update
    React.useEffect(() => {
      ctx._setShowCount(showCount)
      ctx._setMaxLength(maxLength)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCount, maxLength])

    // Merge forwarded ref + internal ref + context field ref
    const setRef = React.useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalRef.current = el
        ctx._fieldRef.current = el
        if (typeof forwardedRef === 'function') {
          forwardedRef(el)
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [forwardedRef]
    )

    // Adjust textarea height to content, bounded by maxRows
    const autoResize = React.useCallback(() => {
      const el = internalRef.current
      if (!el) return
      el.style.height = 'auto'
      const maxHeight = maxRows * lineHeightMap[ctx.size]
      const newHeight = Math.min(el.scrollHeight, maxHeight)
      el.style.height = `${newHeight}px`
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
    }, [ctx.size, maxRows])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        ctx._setIsEmpty(val.trim() === '')
        ctx._setCharCount(val.length)
        autoResize()
        onChange?.(e)
      },
      [ctx, autoResize, onChange]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter = submit | Shift+Enter = new line
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          ctx._handleSubmit()
        }
        onKeyDown?.(e)
      },
      [ctx, onKeyDown]
    )

    return (
      <div className={cn('flex-1 min-w-0', ctx.layout === 'inline' && 'flex items-center self-stretch')}>
        <textarea
          ref={setRef}
          rows={1}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={isDisabled}
          className={cn(
            'w-full bg-transparent text-foreground placeholder:text-foreground/30',
            'resize-none outline-none focus:outline-none',
            'disabled:cursor-not-allowed',
            'overflow-hidden',
            ctx.layout === 'inline' ? inlineFieldPaddingMap[ctx.size] : fieldPaddingMap[ctx.size],
            className
          )}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </div>
    )
  }
)
ChatInputField.displayName = 'ChatInputField'

// ============================================================================
// ChatInputSubmit — Send / stop button
// ============================================================================

const ChatInputSubmit = React.forwardRef<HTMLButtonElement, ChatInputSubmitProps>(
  (
    {
      className,
      loading      = false,
      onStop,
      children,
      disabled,
      onClick,
      buttonRadius,
      ...props
    },
    ref
  ) => {
    const ctx = React.useContext(ChatInputContext)

    // Disabled: context disabled | user prop | empty field (only when not loading)
    const isDisabled = (disabled ?? ctx.disabled) || (!loading && ctx.isEmpty)

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading) {
          onStop?.()
        } else if (!isDisabled) {
          ctx._handleSubmit()
        }
        onClick?.(e)
      },
      [ctx, isDisabled, loading, onStop, onClick]
    )

    return (
      <div className={cn('flex items-center justify-end gap-2 shrink-0 cursor-default', ctx.layout === 'inline' ? submitWrapperInlineMap[ctx.size] : submitWrapperMap[ctx.size])}>
        {ctx.showCount && ctx.maxLength != null && (
          <span className={cn('text-text-subtle select-none', countStyleMap[ctx.size])}>
            {ctx.charCount} / {ctx.maxLength}
          </span>
        )}
        <button
          ref={ref}
          type="button"
          disabled={isDisabled && !loading}
          aria-label={loading ? 'Stop generating' : 'Send message'}
          className={cn(
            'inline-flex items-center justify-center shrink-0',
            buttonRadius ? buttonRadiusClassMap[buttonRadius] : submitRadiusMap[ctx.radius],
            'transition-all duration-fast',
            'focus-visible:outline-none focus-visible:focus-ring',
            submitSizeMap[ctx.size],
            // Loading state — enabled, pulsing
            loading && ctx.color === 'default' && 'bg-foreground text-background animate-pulse cursor-pointer',
            loading && ctx.color === 'primary' && 'bg-primary text-primary-foreground animate-pulse cursor-pointer',
            // Enabled state
            !loading && !isDisabled && ctx.color === 'default' && [
              'bg-foreground text-background',
              'hover:bg-foreground/90 active:bg-foreground/80 active:scale-pressed cursor-pointer',
            ],
            !loading && !isDisabled && ctx.color === 'primary' && [
              'bg-primary text-primary-foreground',
              'hover:bg-primary-hover active:scale-pressed cursor-pointer',
            ],
            // Disabled state
            !loading && isDisabled && 'bg-background-muted text-text-subtle pointer-events-none',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          <span
            aria-hidden="true"
            className={cn('flex items-center justify-center', submitIconSizeMap[ctx.size])}
          >
            {children ?? (loading ? <StopIcon /> : <SendIcon />)}
          </span>
        </button>
      </div>
    )
  }
)
ChatInputSubmit.displayName = 'ChatInputSubmit'

// ============================================================================
// Built-in SVG icons — no external icon dependency
// ============================================================================

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9l20-7Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  )
}

export {
  ChatInput,
  ChatInputField,
  ChatInputSubmit,
  chatInputVariants,
}
