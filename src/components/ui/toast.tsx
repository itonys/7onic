'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Built-in status icons (shared with Alert — no external dependency) ──────
// All icons: Lucide-compatible 24×24 viewBox, strokeWidth=2, rounded caps/joins
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

const LoadingIcon = ({ className }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
  </svg>
)

// ─── Status icon mapping ─────────────────────────────────────────
const STATUS_ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
  default: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
  loading: LoadingIcon,
}

// ─── Color × Type class mapping ─────────────────────────────────
const colorMap: Record<ToastType, string> = {
  default: 'bg-background-paper text-foreground border-border shadow-lg',
  success: 'bg-success-tint text-text-success border-success/20 shadow-lg',
  error: 'bg-error-tint text-text-error border-error/20 shadow-lg',
  warning: 'bg-warning-tint text-text-warning border-warning/20 shadow-lg',
  info: 'bg-info-tint text-text-info border-info/20 shadow-lg',
  loading: 'bg-background-paper text-foreground border-border shadow-lg',
}

const richColorMap: Record<ToastType, string> = {
  default: 'bg-foreground text-background border-transparent shadow-lg',
  success: 'bg-success text-success-foreground border-transparent shadow-lg',
  error: 'bg-error text-error-foreground border-transparent shadow-lg',
  warning: 'bg-warning text-warning-foreground border-transparent shadow-lg',
  info: 'bg-info text-info-foreground border-transparent shadow-lg',
  loading: 'bg-foreground text-background border-transparent shadow-lg',
}

// ─── Constants (JS cannot read CSS variables at runtime) ─────────
const TOAST_EXIT_DURATION = 200    // --duration-normal (200ms)
const TOAST_MIN_RESUME_MS = 500    // --duration-slowest (500ms) — minimum time after hover resume
const TOAST_WIDTH = 360            // fixed toast width — smallest mobile viewport baseline
const TOAST_VIEWPORT_MARGIN = 48   // 2 × offset default (24px) — viewport safe area
const TOAST_STACK_OFFSET = 8       // --spacing-2 (8px) — vertical gap between stacked toasts
const TOAST_STACK_SCALE_STEP = 0.05  // scale reduction per stack level (0.95, 0.90, ...)
const TOAST_STACK_OPACITY_STEP = 0.15 // opacity reduction per stack level (0.85, 0.70, ...)
const TOAST_STACK_VISIBLE_LAYERS = 3  // max visible stacked layers before hidden

// ─── Toast variants (CVA) ────────────────────────────────────────
const toastVariants = cva(
  'group pointer-events-auto relative flex items-center gap-2.5 border w-full overflow-hidden transition-all',
  {
    variants: {
      size: {
        sm: 'p-3 text-sm rounded-md',
        default: 'p-4 text-md rounded-lg',
        lg: 'p-5 text-md rounded-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ─── Types ───────────────────────────────────────────────────────
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
export type ToastSize = 'sm' | 'default' | 'lg'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  type: ToastType
  message: React.ReactNode
  description?: React.ReactNode
  duration?: number
  dismissible?: boolean
  closeButton?: boolean
  icon?: React.ReactNode
  action?: ToastAction
  cancel?: ToastAction
  onDismiss?: (toast: ToastData) => void
  onAutoClose?: (toast: ToastData) => void
  className?: string
  /** Promise state — managed internally */
  _promiseState?: 'loading' | 'success' | 'error'
}

// ─── Global toast store ──────────────────────────────────────────
type ToastListener = () => void

interface ToastStore {
  toasts: ToastData[]
  listeners: Set<ToastListener>
  addToast: (toast: ToastData) => void
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<ToastData>) => void
  removeAll: () => void
  subscribe: (listener: ToastListener) => () => void
}

function createToastStore(): ToastStore {
  const store: ToastStore = {
    toasts: [],
    listeners: new Set(),
    addToast(toast) {
      store.toasts = [toast, ...store.toasts]
      store.listeners.forEach((l) => l())
    },
    removeToast(id) {
      store.toasts = store.toasts.filter((t) => t.id !== id)
      store.listeners.forEach((l) => l())
    },
    updateToast(id, updates) {
      store.toasts = store.toasts.map((t) => (t.id === id ? { ...t, ...updates } : t))
      store.listeners.forEach((l) => l())
    },
    removeAll() {
      store.toasts = []
      store.listeners.forEach((l) => l())
    },
    subscribe(listener) {
      store.listeners.add(listener)
      return () => { store.listeners.delete(listener) }
    },
  }
  return store
}

const globalStore = createToastStore()

function useToastStore() {
  const [, forceUpdate] = React.useState(0)
  React.useEffect(() => {
    return globalStore.subscribe(() => forceUpdate((n) => n + 1))
  }, [])
  return globalStore.toasts
}

// ─── Toast ID generator ─────────────────────────────────────────
let toastCounter = 0
function genId() {
  toastCounter += 1
  return `toast-${toastCounter}-${Date.now()}`
}

// ═══════════════════════════════════════════════════════════════════
// Imperative API: toast()
// ═══════════════════════════════════════════════════════════════════

interface ToastOptions {
  id?: string
  description?: React.ReactNode
  duration?: number
  dismissible?: boolean
  closeButton?: boolean
  icon?: React.ReactNode
  action?: ToastAction
  cancel?: ToastAction
  onDismiss?: (toast: ToastData) => void
  onAutoClose?: (toast: ToastData) => void
  className?: string
}

interface PromiseOptions<T> {
  loading: React.ReactNode
  success: React.ReactNode | ((data: T) => React.ReactNode)
  error: React.ReactNode | ((err: unknown) => React.ReactNode)
  finally?: () => void
  description?: {
    loading?: React.ReactNode
    success?: React.ReactNode | ((data: T) => React.ReactNode)
    error?: React.ReactNode | ((err: unknown) => React.ReactNode)
  }
}

function createToast(message: React.ReactNode, type: ToastType, opts?: ToastOptions): string {
  const id = opts?.id ?? genId()

  // If updating existing toast, just update
  const existing = globalStore.toasts.find((t) => t.id === id)
  if (existing) {
    globalStore.updateToast(id, { message, type, ...opts })
    return id
  }

  globalStore.addToast({
    id,
    type,
    message,
    description: opts?.description,
    duration: opts?.duration,
    dismissible: opts?.dismissible,
    closeButton: opts?.closeButton,
    icon: opts?.icon,
    action: opts?.action,
    cancel: opts?.cancel,
    onDismiss: opts?.onDismiss,
    onAutoClose: opts?.onAutoClose,
    className: opts?.className,
  })
  return id
}

function toast(message: React.ReactNode, opts?: ToastOptions): string {
  return createToast(message, 'default', opts)
}

toast.success = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'success', opts)

toast.error = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'error', opts)

toast.warning = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'warning', opts)

toast.info = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'info', opts)

toast.loading = (message: React.ReactNode, opts?: ToastOptions) =>
  createToast(message, 'loading', { ...opts, duration: 0 })

toast.promise = <T,>(
  promise: Promise<T>,
  opts: PromiseOptions<T>,
  toastOpts?: ToastOptions
): Promise<T> => {
  const id = createToast(opts.loading, 'loading', {
    ...toastOpts,
    duration: 0,
  })

  promise
    .then((data) => {
      const msg = typeof opts.success === 'function' ? opts.success(data) : opts.success
      const desc = typeof opts.description?.success === 'function'
        ? opts.description.success(data)
        : opts.description?.success
      globalStore.updateToast(id, {
        type: 'success',
        message: msg,
        description: desc,
        duration: toastOpts?.duration,
        _promiseState: 'success',
      })
    })
    .catch((err) => {
      const msg = typeof opts.error === 'function' ? opts.error(err) : opts.error
      const desc = typeof opts.description?.error === 'function'
        ? opts.description.error(err)
        : opts.description?.error
      globalStore.updateToast(id, {
        type: 'error',
        message: msg,
        description: desc,
        duration: toastOpts?.duration,
        _promiseState: 'error',
      })
    })
    .finally(() => {
      opts.finally?.()
    })

  return promise
}

toast.dismiss = (id?: string) => {
  if (id) {
    globalStore.removeToast(id)
  } else {
    globalStore.removeAll()
  }
}

toast.custom = (render: (t: ToastData) => React.ReactNode, opts?: ToastOptions): string => {
  const id = opts?.id ?? genId()
  globalStore.addToast({
    id,
    type: 'default',
    message: render as unknown as React.ReactNode,
    duration: opts?.duration,
    dismissible: opts?.dismissible,
    className: opts?.className,
    onDismiss: opts?.onDismiss,
    onAutoClose: opts?.onAutoClose,
    _promiseState: undefined,
  })
  return id
}

// ═══════════════════════════════════════════════════════════════════
// ToastItem — individual toast renderer
// ═══════════════════════════════════════════════════════════════════

interface ToastItemProps {
  data: ToastData
  position: ToastPosition
  size: ToastSize
  closeButton: boolean
  richColors: boolean
  defaultDuration: number
  onRemove: (id: string) => void
}

const ToastItem = React.memo(function ToastItem({
  data,
  position,
  size,
  closeButton: globalCloseButton,
  richColors,
  defaultDuration,
  onRemove,
}: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const [isEntered, setIsEntered] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = React.useRef<number>(0)
  const startTimeRef = React.useRef<number>(0)

  // Enter animation — play once on mount, then remove class
  React.useEffect(() => {
    const timer = setTimeout(() => setIsEntered(true), TOAST_EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [])

  const showClose = data.closeButton ?? globalCloseButton
  const dismissible = data.dismissible !== false
  const duration = data.type === 'loading' ? 0 : (data.duration ?? defaultDuration)

  // ARIA — error/warning use assertive, others polite
  const role = data.type === 'error' || data.type === 'warning' ? 'alert' : 'status'
  const ariaLive = data.type === 'error' || data.type === 'warning' ? 'assertive' : 'polite'

  const colors = richColors ? richColorMap[data.type] : colorMap[data.type]
  const StatusIcon = STATUS_ICONS[data.type]

  // Animation classes based on position
  const enterAnim = position.includes('right')
    ? 'animate-toast-slide-in-right'
    : position.includes('left')
      ? 'animate-toast-slide-in-left'
      : position.includes('top')
        ? 'animate-toast-slide-in-top'
        : 'animate-toast-slide-in-bottom'

  const exitAnim = position.includes('right')
    ? 'animate-toast-slide-out-right'
    : position.includes('left')
      ? 'animate-toast-slide-out-left'
      : position.includes('top')
        ? 'animate-toast-slide-out-top'
        : 'animate-toast-slide-out-bottom'

  const handleDismiss = React.useCallback(() => {
    if (!dismissible) return
    setIsExiting(true)
    data.onDismiss?.(data)
    // Wait for exit animation then remove
    setTimeout(() => onRemove(data.id), TOAST_EXIT_DURATION)
  }, [data, dismissible, onRemove])

  const handleAutoClose = React.useCallback(() => {
    setIsExiting(true)
    data.onAutoClose?.(data)
    setTimeout(() => onRemove(data.id), TOAST_EXIT_DURATION)
  }, [data, onRemove])

  // Auto-dismiss timer with pause support
  React.useEffect(() => {
    if (duration <= 0) return

    remainingRef.current = duration
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(handleAutoClose, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, handleAutoClose])

  // Pause/resume on hover
  const handleMouseEnter = React.useCallback(() => {
    if (duration <= 0) return
    setIsPaused(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      remainingRef.current -= Date.now() - startTimeRef.current
    }
  }, [duration])

  const handleMouseLeave = React.useCallback(() => {
    if (duration <= 0) return
    setIsPaused(false)
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(handleAutoClose, Math.max(remainingRef.current, TOAST_MIN_RESUME_MS))
  }, [duration, handleAutoClose])

  // Reset timer when toast updates (promise resolve)
  React.useEffect(() => {
    if (data._promiseState === 'success' || data._promiseState === 'error') {
      const newDuration = data.duration ?? defaultDuration
      if (newDuration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current)
        remainingRef.current = newDuration
        startTimeRef.current = Date.now()
        timerRef.current = setTimeout(handleAutoClose, newDuration)
      }
    }
  }, [data._promiseState, data.duration, defaultDuration, handleAutoClose])

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(
        toastVariants({ size }),
        colors,
        isExiting ? exitAnim : !isEntered ? enterAnim : undefined,
        isExiting && 'pointer-events-none',
        data.className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      {data.icon !== undefined ? (
        data.icon && <span className="shrink-0">{data.icon}</span>
      ) : (
        data.type !== 'default' && (
          <span className="shrink-0">
            <StatusIcon className="icon-sm" />
          </span>
        )
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{data.message}</div>
        {data.description && (
          <div className={cn('mt-1 opacity-80', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {data.description}
          </div>
        )}
      </div>

      {/* Actions */}
      {(data.action || data.cancel) && (
        <div className="flex items-center gap-1.5 shrink-0">
          {data.cancel && (
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => {
                data.cancel!.onClick()
                handleDismiss()
              }}
            >
              {data.cancel.label}
            </button>
          )}
          {data.action && (
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-foreground/5 hover:bg-foreground/15 transition-colors"
              onClick={() => {
                data.action!.onClick()
                handleDismiss()
              }}
            >
              {data.action.label}
            </button>
          )}
        </div>
      )}

      {/* Close button */}
      {showClose && dismissible && (
        <button
          type="button"
          className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:focus-ring"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <DefaultCloseIcon className="icon-sm" />
        </button>
      )}

    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════
// Toaster — renders all toasts
// ═══════════════════════════════════════════════════════════════════

export interface ToasterProps {
  /** Position on screen */
  position?: ToastPosition
  /** Default auto-dismiss duration in ms (0 = persistent) */
  duration?: number
  /** Max visible toasts */
  visibleToasts?: number
  /** Show close button on all toasts */
  closeButton?: boolean
  /** Use rich (filled) colors for status toasts — default: true */
  richColors?: boolean
  /** Expand all toasts (no stacking) */
  expand?: boolean
  /** Offset from screen edge in px */
  offset?: number
  /** Gap between toasts in px */
  gap?: number
  /** Toast size */
  size?: ToastSize
  /** Additional className for container */
  className?: string
}

function Toaster({
  position = 'bottom-right',
  duration = 4000,
  visibleToasts = 5,
  closeButton = false,
  richColors = true,
  expand = false,
  offset = 24,
  gap = 8,
  size = 'default',
  className,
}: ToasterProps) {
  const toasts = useToastStore()
  const [expanded, setExpanded] = React.useState(false)

  const handleRemove = React.useCallback((id: string) => {
    globalStore.removeToast(id)
  }, [])

  const visible = toasts.slice(0, visibleToasts)

  const isTop = position.startsWith('top')
  const isCenter = position.includes('center')
  const isRight = position.includes('right')
  const isLeft = position.includes('left')

  // Position styles
  const positionClasses = cn(
    'fixed z-toast flex flex-col pointer-events-none',
    isTop ? 'top-0' : 'bottom-0',
    isCenter ? 'left-1/2 -translate-x-1/2' : isRight ? 'right-0' : 'left-0',
  )

  return (
    <section
      aria-label="Notifications"
      className={cn(positionClasses, className)}
      style={{
        padding: offset,
        gap,
        width: isCenter ? 'auto' : undefined,
        maxWidth: isCenter ? `calc(100vw - ${TOAST_VIEWPORT_MARGIN}px)` : undefined,
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {visible.map((t, index) => {
        const isStacked = !expand && !expanded && index > 0
        return (
          <div
            key={t.id}
            className="transition-[transform,opacity] duration-normal ease-out"
            style={{
              width: TOAST_WIDTH,
              maxWidth: `calc(100vw - ${TOAST_VIEWPORT_MARGIN}px)`,
              ...(isStacked
                ? {
                    position: 'absolute' as const,
                    ...(isTop ? { top: offset + index * TOAST_STACK_OFFSET } : { bottom: offset + index * TOAST_STACK_OFFSET }),
                    ...(isCenter
                      ? { left: '50%', transform: `translateX(-50%) scale(${1 - index * TOAST_STACK_SCALE_STEP})` }
                      : isRight
                        ? { right: offset, transform: `scale(${1 - index * TOAST_STACK_SCALE_STEP})` }
                        : { left: offset, transform: `scale(${1 - index * TOAST_STACK_SCALE_STEP})` }),
                    opacity: index < TOAST_STACK_VISIBLE_LAYERS ? 1 - index * TOAST_STACK_OPACITY_STEP : 0,
                    zIndex: visibleToasts - index,
                    pointerEvents: 'none' as const,
                  }
                : { zIndex: visibleToasts - index }),
            }}
          >
            <ToastItem
              data={t}
              position={position}
              size={size}
              closeButton={closeButton}
              richColors={richColors}
              defaultDuration={duration}
              onRemove={handleRemove}
            />
          </div>
        )
      })}
    </section>
  )
}
Toaster.displayName = 'Toaster'

// ─── Exports ─────────────────────────────────────────────────────
export {
  toast,
  Toaster,
  toastVariants,
}

export type {
  ToastOptions,
  PromiseOptions,
}
