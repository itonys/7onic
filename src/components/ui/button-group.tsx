'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ButtonGroup Context
type ButtonGroupContextValue = {
  variant?: 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  fontWeight?: 'normal' | 'semibold'
  disabled?: boolean
}

const ButtonGroupContext = React.createContext<ButtonGroupContextValue | null>(null)

export function useButtonGroup() {
  return React.useContext(ButtonGroupContext)
}

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  attached?: boolean
  variant?: 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'default' | 'lg'
  radius?: 'none' | 'sm' | 'base' | 'default' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  fontWeight?: 'normal' | 'semibold'
  disabled?: boolean
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({
    className,
    orientation = 'horizontal',
    attached = true,
    variant,
    size,
    radius,
    fontWeight,
    disabled,
    children,
    ...props
  }, ref) => {
    const contextValue = React.useMemo(() => ({
      variant,
      size,
      radius,
      fontWeight,
      disabled,
    }), [variant, size, radius, fontWeight, disabled])

    return (
      <ButtonGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          className={cn(
            'inline-flex',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            // Attached mode: use negative margin to overlap borders, raise z-index on hover/focus
            attached && orientation === 'horizontal' && [
              '[&>*:not(:first-child)]:rounded-l-none',
              '[&>*:not(:last-child)]:rounded-r-none',
              '[&>*:not(:first-child)]:-ml-px',
              '[&>*]:relative',
              '[&>*:hover]:z-10',
              '[&>*:focus-visible]:z-10',
              '[&>*:active]:scale-none',
              '[&>*:hover]:border-border',
            ],
            attached && orientation === 'vertical' && [
              '[&>*:not(:first-child)]:rounded-t-none',
              '[&>*:not(:last-child)]:rounded-b-none',
              '[&>*:not(:first-child)]:-mt-px',
              '[&>*]:relative',
              '[&>*]:w-full',
              '[&>*:hover]:z-10',
              '[&>*:focus-visible]:z-10',
              '[&>*:active]:scale-none',
              '[&>*:hover]:border-border',
            ],
            !attached && 'gap-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext.Provider>
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
