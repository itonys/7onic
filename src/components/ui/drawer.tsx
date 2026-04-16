'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
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

// ─── Types ──────────────────────────────────────────────────
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// ─── Animation class mapping (static strings for Tailwind scanner) ──
const ANIMATION_CLASSES: Record<DrawerSide, string> = {
  right:  'data-[state=open]:animate-drawer-right-enter data-[state=closed]:animate-drawer-right-exit',
  left:   'data-[state=open]:animate-drawer-left-enter data-[state=closed]:animate-drawer-left-exit',
  top:    'data-[state=open]:animate-drawer-top-enter data-[state=closed]:animate-drawer-top-exit',
  bottom: 'data-[state=open]:animate-drawer-bottom-enter data-[state=closed]:animate-drawer-bottom-exit',
}

// ─── Size variants ──────────────────────────────────────────
const drawerSizeHorizontal = cva('', {
  variants: {
    size: {
      sm:   'w-[320px]',
      md:   'w-[400px]',
      lg:   'w-[480px]',
      xl:   'w-[640px]',
      full: 'w-full',
    },
  },
  defaultVariants: { size: 'md' },
})

const drawerSizeVertical = cva('', {
  variants: {
    size: {
      sm:   'h-[320px]',
      md:   'h-[400px]',
      lg:   'h-[480px]',
      xl:   'h-[640px]',
      full: 'h-full',
    },
  },
  defaultVariants: { size: 'md' },
})

// ═══════════════════════════════════════════════════════════════
// Drawer
// ═══════════════════════════════════════════════════════════════

// ─── Drawer (Root) — wrapper to avoid Object.assign mutating DialogPrimitive.Root ──
function DrawerRoot(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />
}

// ─── DrawerTrigger ──────────────────────────────────────────
const DrawerTrigger = DialogPrimitive.Trigger

// ─── DrawerPortal ───────────────────────────────────────────
const DrawerPortal = DialogPrimitive.Portal

// ─── DrawerClose ────────────────────────────────────────────
const DrawerClose = DialogPrimitive.Close

// ─── DrawerOverlay ──────────────────────────────────────────
const DrawerOverlay = React.forwardRef<
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
DrawerOverlay.displayName = 'DrawerOverlay'

// ─── DrawerContent ──────────────────────────────────────────
export interface DrawerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'children'> {
  /** Side from which the drawer slides in */
  side?: DrawerSide
  /** Panel size (width for left/right, height for top/bottom) */
  size?: DrawerSize
  /** Show built-in close button */
  showCloseButton?: boolean
  /** Custom close icon (replaces default X) */
  closeIcon?: React.ReactNode
  children?: React.ReactNode
}

const SIDE_POSITION: Record<DrawerSide, string> = {
  right:  'inset-y-0 right-0',
  left:   'inset-y-0 left-0',
  top:    'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = 'right', size = 'md', showCloseButton = true, closeIcon, ...props }, ref) => {
  const isHorizontal = side === 'left' || side === 'right'
  const sizeClass = isHorizontal
    ? drawerSizeHorizontal({ size })
    : drawerSizeVertical({ size })

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-modal flex flex-col bg-background text-foreground shadow-xl',
          'focus:outline-none',
          SIDE_POSITION[side],
          isHorizontal ? 'max-w-full h-full' : 'max-h-full w-full',
          sizeClass,
          ANIMATION_CLASSES[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
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
        )}
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = 'DrawerContent'

// ─── DrawerHeader ───────────────────────────────────────────
const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
    {...props}
  />
))
DrawerHeader.displayName = 'DrawerHeader'

// ─── DrawerTitle ────────────────────────────────────────────
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

// ─── DrawerDescription ─────────────────────────────────────
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-md text-text-muted', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'

// ─── DrawerBody ─────────────────────────────────────────────
const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-6', className)}
    {...props}
  />
))
DrawerBody.displayName = 'DrawerBody'

// ─── DrawerFooter ───────────────────────────────────────────
const DrawerFooter = React.forwardRef<
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
DrawerFooter.displayName = 'DrawerFooter'

// ─── Namespace: Drawer ──────────────────────────────────────
const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
})

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Drawer {
  export type ContentProps = DrawerContentProps
}

// ─── Exports ────────────────────────────────────────────────
export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
  drawerSizeHorizontal,
  drawerSizeVertical,
}
