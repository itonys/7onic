'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Built-in status icons (no external dependency) ──────────────
// All icons: Lucide-compatible 24×24 viewBox, strokeWidth=2, rounded caps/joins
// Info = circle + "i" | Success = circle + check | Warning = triangle + "!" | Error = circle + small ×
const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const SuccessIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

const ErrorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </svg>
)

const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── Status icon mapping ─────────────────────────────────────────
const STATUS_ICONS: Record<AlertColor, React.FC<{ className?: string }>> = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
}

// ─── Color × Variant class mapping ──────────────────────────────
// Uses semantic tokens (*.tint, text-text-*) — same pattern as Badge
const colorMap = {
  info: {
    default: 'bg-info-tint text-text-info border-info/20',
    outline: 'bg-transparent text-text-info border-info',
    filled: 'bg-info text-info-foreground border-transparent',
  },
  success: {
    default: 'bg-success-tint text-text-success border-success/20',
    outline: 'bg-transparent text-text-success border-success',
    filled: 'bg-success text-success-foreground border-transparent',
  },
  warning: {
    default: 'bg-warning-tint text-text-warning border-warning/20',
    outline: 'bg-transparent text-text-warning border-warning',
    filled: 'bg-warning text-warning-foreground border-transparent',
  },
  error: {
    default: 'bg-error-tint text-text-error border-error/20',
    outline: 'bg-transparent text-text-error border-error',
    filled: 'bg-error text-error-foreground border-transparent',
  },
} as const

// ─── Alert variants ──────────────────────────────────────────────
const alertVariants = cva(
  'group relative flex items-center border w-full [&:has([data-alert-description])]:items-start',
  {
    variants: {
      size: {
        sm: 'gap-2 p-2.5 text-sm',
        default: 'gap-2.5 p-3.5 text-md',
        lg: 'gap-3 p-4 text-md',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'lg',
    },
  }
)

// ─── Size-dependent class maps ──────────────────────────────────
const ICON_SIZE_MAP = {
  sm: 'icon-sm',                // 16px
  default: 'w-[18px] h-[18px]', // 18px — TOKEN-EXCEPTION: no 18px icon token
  lg: 'icon-md',                // 20px
} as const

/** Icon wrapper text class — matches title line-height for vertical alignment */
const ICON_LINE_MAP = {
  sm: 'text-sm',
  default: 'text-md',
  lg: 'text-base',
} as const

const TITLE_SIZE_MAP = {
  sm: 'text-sm font-semibold tracking-tight',
  default: 'text-md font-semibold tracking-tight',
  lg: 'text-base font-semibold tracking-tight',
} as const

const DESC_SIZE_MAP = {
  sm: 'text-xs mt-0.5',
  default: 'text-sm mt-0.5',
  lg: 'text-md mt-0.5',
} as const

// ─── Types ───────────────────────────────────────────────────────
export type AlertVariant = 'default' | 'outline' | 'filled'
export type AlertColor = 'info' | 'success' | 'warning' | 'error'
export type AlertSize = 'sm' | 'default' | 'lg'

// ─── Context ─────────────────────────────────────────────────────
interface AlertContextValue {
  variant: AlertVariant
  color: AlertColor
  size: AlertSize
}

const AlertContext = React.createContext<AlertContextValue>({
  variant: 'default',
  color: 'info',
  size: 'default',
})

function useAlertContext() {
  return React.useContext(AlertContext)
}

// ═══════════════════════════════════════════════════════════════════
// Alert
// ═══════════════════════════════════════════════════════════════════

// ─── AlertRoot ───────────────────────────────────────────────────
export interface AlertRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Visual style */
  variant?: AlertVariant
  /** Semantic color (determines icon, colors, and ARIA role) */
  color?: AlertColor
  /** Size */
  size?: AlertSize
  /** Closable — shows close button */
  closable?: boolean
  /** Close callback */
  onClose?: () => void
  /** Custom close icon */
  closeIcon?: React.ReactNode
  /** Custom status icon (overrides default) */
  icon?: React.ReactNode
  /** Hide the status icon entirely */
  hideIcon?: boolean
}

const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({
    className,
    variant = 'default',
    color = 'info',
    size = 'default',
    radius,
    closable = false,
    onClose,
    closeIcon,
    icon,
    hideIcon = false,
    children,
    ...props
  }, ref) => {
    // error → role="alert" (assertive), others → role="status" (polite)
    const role = color === 'error' ? 'alert' : 'status'
    const colorClasses = colorMap[color][variant]
    const StatusIcon = STATUS_ICONS[color]

    return (
      <AlertContext.Provider value={{ variant, color, size }}>
        <div
          ref={ref}
          role={role}
          className={cn(
            alertVariants({ size, radius }),
            colorClasses,
            className,
          )}
          {...props}
        >
          {/* Icon */}
          {!hideIcon && (
            <span className={cn('shrink-0 flex items-center min-h-[1lh]', ICON_LINE_MAP[size])}>
              {icon || <StatusIcon className={ICON_SIZE_MAP[size]} />}
            </span>
          )}

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Close button */}
          {closable && (
            <button
              type="button"
              className={cn(
                'shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring',
                'group-has-[[data-alert-description]]:absolute',
                size === 'sm'
                  ? 'group-has-[[data-alert-description]]:top-2 group-has-[[data-alert-description]]:right-2'
                  : 'group-has-[[data-alert-description]]:top-3 group-has-[[data-alert-description]]:right-3',
              )}
              onClick={onClose}
              aria-label="Close"
            >
              {closeIcon || <DefaultCloseIcon className="icon-sm" />}
            </button>
          )}
        </div>
      </AlertContext.Provider>
    )
  }
)
AlertRoot.displayName = 'AlertRoot'

// ─── AlertTitle ──────────────────────────────────────────────────
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = useAlertContext()
    return (
      <h5
        ref={ref}
        className={cn(TITLE_SIZE_MAP[size], className)}
        {...props}
      />
    )
  }
)
AlertTitle.displayName = 'AlertTitle'

// ─── AlertDescription ────────────────────────────────────────────
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { variant, size } = useAlertContext()
    return (
      <p
        ref={ref}
        data-alert-description=""
        className={cn(
          DESC_SIZE_MAP[size],
          variant === 'filled' ? 'opacity-90' : 'opacity-80',
          className,
        )}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = 'AlertDescription'

// ─── Namespace: Alert ────────────────────────────────────────────
const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Alert {
  export type RootProps = AlertRootProps
  export type TitleProps = AlertTitleProps
  export type DescriptionProps = AlertDescriptionProps
}

// ─── Exports ─────────────────────────────────────────────────────
export {
  Alert,
  AlertRoot,
  AlertTitle,
  AlertDescription,
  alertVariants,
}
