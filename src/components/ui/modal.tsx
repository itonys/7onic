'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── Default Close Icon (built-in, no external dependency) ──
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── Style Context ──────────────────────────────────────────
type ModalStyleContextValue = {
  scrollBehavior: 'inside' | 'outside'
}
const ModalStyleContext = React.createContext<ModalStyleContextValue>({
  scrollBehavior: 'outside',
})

// ═══════════════════════════════════════════════════════════════
// Modal (Dialog)
// ═══════════════════════════════════════════════════════════════

// ─── Modal (Root) ───────────────────────────────────────────
const Modal = DialogPrimitive.Root

// ─── ModalTrigger ───────────────────────────────────────────
const ModalTrigger = DialogPrimitive.Trigger

// ─── ModalPortal ────────────────────────────────────────────
const ModalPortal = DialogPrimitive.Portal

// ─── ModalClose ─────────────────────────────────────────────
const ModalClose = DialogPrimitive.Close

// ─── ModalOverlay ───────────────────────────────────────────
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-black/50',
      'data-[state=open]:animate-modal-overlay-enter data-[state=closed]:animate-modal-overlay-exit',
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = 'ModalOverlay'

// ─── ModalContent ───────────────────────────────────────────
const modalContentVariants = cva('', {
  variants: {
    size: {
      xs: 'max-w-[360px]',   // 360px — simple confirmation
      sm: 'max-w-[480px]',   // 480px — standard (default)
      md: 'max-w-[600px]',   // 600px — standard form
      lg: 'max-w-[760px]',   // 760px — complex form
      xl: 'max-w-[960px]',   // 960px — table, dashboard
      full: 'max-w-none',    // full width (constrained by wrapper padding)
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  /** Scroll behavior when content overflows */
  scrollBehavior?: 'inside' | 'outside'
  /** Show built-in close button */
  showCloseButton?: boolean
  /** Custom close icon (replaces default X) */
  closeIcon?: React.ReactNode
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, size = 'sm', scrollBehavior = 'outside', showCloseButton = true, closeIcon, ...props }, ref) => {
  const isInside = scrollBehavior === 'inside'
  const isFull = size === 'full'
  const useInsideScroll = isInside || isFull

  const closeButton = showCloseButton && (
    <DialogPrimitive.Close className={cn(
      'absolute right-4 top-4 rounded-md p-1',
      'text-text-muted hover:text-foreground',
      'transition-colors duration-fast',
      'focus-visible:focus-ring focus-visible:outline-none',
      'disabled:pointer-events-none'
    )}>
      {closeIcon || <DefaultCloseIcon className="icon-sm" />}
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )

  if (!useInsideScroll) {
    // Outside scroll: DialogPrimitive.Content becomes the full-screen scrollable container.
    // Radix's internal RemoveScroll detects its own root element as scrollable,
    // allowing wheel/touch scroll events to pass through correctly.
    return (
      <ModalPortal>
        <ModalOverlay />
        <ModalStyleContext.Provider value={{ scrollBehavior: 'outside' }}>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'fixed inset-0 z-modal overflow-y-auto',
              'focus:outline-none',
              'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
            )}
            {...props}
          >
            {/* Backdrop click area: closes dialog when clicking outside the panel */}
            <DialogPrimitive.Close asChild>
              <div className="flex min-h-full items-center justify-center p-4">
                <div
                  className={cn(
                    'relative w-full rounded-xl bg-background shadow-xl overflow-hidden',
                    modalContentVariants({ size }),
                    className,
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                  {closeButton}
                </div>
              </div>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </ModalStyleContext.Provider>
      </ModalPortal>
    )
  }

  // Inside scroll / full: DialogPrimitive.Content is the visual modal panel.
  return (
    <ModalPortal>
      <ModalOverlay />
      <ModalStyleContext.Provider value={{ scrollBehavior: 'inside' }}>
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'relative w-full rounded-xl bg-background shadow-xl overflow-hidden',
              'focus:outline-none',
              'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
              modalContentVariants({ size }),
              isInside && 'flex flex-col max-h-[85vh]',
              isFull && 'flex flex-col h-full',
              className,
            )}
            {...props}
          >
            {children}
            {closeButton}
          </DialogPrimitive.Content>
        </div>
      </ModalStyleContext.Provider>
    </ModalPortal>
  )
})
ModalContent.displayName = 'ModalContent'

// ─── ModalHeader ────────────────────────────────────────────
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
ModalHeader.displayName = 'ModalHeader'

// ─── ModalTitle ─────────────────────────────────────────────
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
ModalTitle.displayName = 'ModalTitle'

// ─── ModalDescription ───────────────────────────────────────
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
ModalDescription.displayName = 'ModalDescription'

// ─── ModalBody ──────────────────────────────────────────────
const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { scrollBehavior } = React.useContext(ModalStyleContext)
  return (
    <div
      ref={ref}
      className={cn(
        'p-6',
        scrollBehavior === 'inside' && 'flex-1 overflow-y-auto',
        className
      )}
      {...props}
    />
  )
})
ModalBody.displayName = 'ModalBody'

// ─── ModalFooter ────────────────────────────────────────────
const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-0',
      className
    )}
    {...props}
  />
))
ModalFooter.displayName = 'ModalFooter'

// ═══════════════════════════════════════════════════════════════
// AlertModal (AlertDialog)
// ═══════════════════════════════════════════════════════════════

// ─── AlertModal (Root) ──────────────────────────────────────
const AlertModal = AlertDialogPrimitive.Root

// ─── AlertModalTrigger ──────────────────────────────────────
const AlertModalTrigger = AlertDialogPrimitive.Trigger

// ─── AlertModalPortal ───────────────────────────────────────
const AlertModalPortal = AlertDialogPrimitive.Portal

// ─── AlertModalOverlay ──────────────────────────────────────
const AlertModalOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-black/50',
      'data-[state=open]:animate-modal-overlay-enter data-[state=closed]:animate-modal-overlay-exit',
      className
    )}
    {...props}
  />
))
AlertModalOverlay.displayName = 'AlertModalOverlay'

// ─── AlertModalContent ──────────────────────────────────────
const alertModalContentVariants = cva('', {
  variants: {
    size: {
      xs: 'max-w-[360px]',  // 360px
      sm: 'max-w-[480px]',  // 480px (default)
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface AlertModalContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof alertModalContentVariants> {}

const AlertModalContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertModalContentProps
>(({ className, children, size = 'sm', ...props }, ref) => (
  <AlertModalPortal>
    <AlertModalOverlay />
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'relative w-full rounded-xl bg-background shadow-xl',
          'focus:outline-none',
          'data-[state=open]:animate-modal-content-enter data-[state=closed]:animate-modal-content-exit',
          alertModalContentVariants({ size }),
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </div>
  </AlertModalPortal>
))
AlertModalContent.displayName = 'AlertModalContent'

// ─── AlertModalHeader ───────────────────────────────────────
const AlertModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
AlertModalHeader.displayName = 'AlertModalHeader'

// ─── AlertModalTitle ────────────────────────────────────────
const AlertModalTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
AlertModalTitle.displayName = 'AlertModalTitle'

// ─── AlertModalDescription ──────────────────────────────────
const AlertModalDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
AlertModalDescription.displayName = 'AlertModalDescription'

// ─── AlertModalBody ─────────────────────────────────────────
const AlertModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
))
AlertModalBody.displayName = 'AlertModalBody'

// ─── AlertModalFooter ───────────────────────────────────────
const AlertModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-end gap-3 p-6 pt-0',
      className
    )}
    {...props}
  />
))
AlertModalFooter.displayName = 'AlertModalFooter'

// ─── AlertModalAction ───────────────────────────────────────
const AlertModalAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={className}
    {...props}
  />
))
AlertModalAction.displayName = 'AlertModalAction'

// ─── AlertModalCancel ───────────────────────────────────────
const AlertModalCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={className}
    {...props}
  />
))
AlertModalCancel.displayName = 'AlertModalCancel'

// ─── Exports ────────────────────────────────────────────────
export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  modalContentVariants,
  AlertModal,
  AlertModalTrigger,
  AlertModalPortal,
  AlertModalOverlay,
  AlertModalContent,
  AlertModalHeader,
  AlertModalTitle,
  AlertModalDescription,
  AlertModalBody,
  AlertModalFooter,
  AlertModalAction,
  AlertModalCancel,
  alertModalContentVariants,
}
