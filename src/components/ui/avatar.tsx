'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Avatar root variants
const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden bg-background-muted select-none',
  {
    variants: {
      size: {
        xs:      'w-6 h-6',        // 24px
        sm:      'w-8 h-8',        // 32px
        default: 'w-10 h-10',      // 40px
        lg:      'w-12 h-12',      // 48px
        xl:      'w-16 h-16',      // 64px
        '2xl':   'w-20 h-20',      // 80px
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
    },
    defaultVariants: { size: 'default', shape: 'circle' },
  }
)

// Status dot sizes per avatar size
const statusDotSizes = {
  xs:      'w-1.5 h-1.5',
  sm:      'w-2 h-2',
  default: 'w-2.5 h-2.5',
  lg:      'w-3 h-3',
  xl:      'w-3.5 h-3.5',
  '2xl':   'w-4 h-4',
}

// Status dot colors
const statusColors = {
  online:  'bg-success',
  offline: 'bg-text-muted',
  busy:    'bg-error',
  away:    'bg-warning',
}

// Fallback font sizes per avatar size
const fallbackFontSizes = {
  xs:      'text-2xs',
  sm:      'text-xs',
  default: 'text-sm',
  lg:      'text-base',
  xl:      'text-xl',
  '2xl':   'text-2xl',
}

// Negative margin per size for AvatarGroup overlap
const groupNegativeMargins = {
  xs:      '-space-x-1.5',
  sm:      '-space-x-2',
  default: '-space-x-2.5',
  lg:      '-space-x-3',
  xl:      '-space-x-4',
  '2xl':   '-space-x-5',
}

// Colorized fallback palette (12 colors × 2 variants) — exception 13 in TOKEN-EXCEPTIONS.md
const avatarColors = [
  { vivid: { bg: 'bg-[#DC2626]', text: 'text-white' }, soft: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' } },  // red
  { vivid: { bg: 'bg-[#EA580C]', text: 'text-white' }, soft: { bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]' } },  // orange
  { vivid: { bg: 'bg-[#D97706]', text: 'text-white' }, soft: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' } },  // amber
  { vivid: { bg: 'bg-[#CA8A04]', text: 'text-white' }, soft: { bg: 'bg-[#FEF9C3]', text: 'text-[#A16207]' } },  // yellow
  { vivid: { bg: 'bg-[#059669]', text: 'text-white' }, soft: { bg: 'bg-[#D1FAE5]', text: 'text-[#047857]' } },  // emerald
  { vivid: { bg: 'bg-[#0D9488]', text: 'text-white' }, soft: { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]' } },  // teal
  { vivid: { bg: 'bg-[#0891B2]', text: 'text-white' }, soft: { bg: 'bg-[#CFFAFE]', text: 'text-[#0E7490]' } },  // cyan
  { vivid: { bg: 'bg-[#2563EB]', text: 'text-white' }, soft: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' } },  // blue
  { vivid: { bg: 'bg-[#4F46E5]', text: 'text-white' }, soft: { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]' } },  // indigo
  { vivid: { bg: 'bg-[#7C3AED]', text: 'text-white' }, soft: { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' } },  // violet
  { vivid: { bg: 'bg-[#9333EA]', text: 'text-white' }, soft: { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]' } },  // purple
  { vivid: { bg: 'bg-[#DB2777]', text: 'text-white' }, soft: { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]' } },  // pink
] as const

export type AvatarColorVariant = 'vivid' | 'soft'

/** Extract initials from a name string (e.g. "John Doe" → "JD", "김민수" → "김민") */
function getAvatarInitials(name: string, maxChars = 2): string {
  const trimmed = name.trim()
  if (!trimmed) return ''

  // CJK: use first character(s) directly
  const cjkRegex = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/
  if (cjkRegex.test(trimmed.charAt(0))) {
    return trimmed.slice(0, maxChars)
  }

  // Split on spaces, hyphens, underscores, dots
  const parts = trimmed.split(/[\s\-_.]+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  // First + last part initials
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0))
    .toUpperCase()
    .slice(0, maxChars)
}

/** Hash a name string to a deterministic avatar color pair (djb2 xor variant) */
function getAvatarColor(name: string, variant: AvatarColorVariant = 'vivid') {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash) ^ name.charCodeAt(i)
  }
  return avatarColors[(hash >>> 0) % avatarColors.length][variant]
}

export type AvatarSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
export type AvatarShape = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: AvatarStatus
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, status, children, ...props }, ref) => {
  const resolvedSize = size || 'default'

  if (!status) {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
    )
  }

  // Wrap with an outer span so the status dot is not clipped by overflow-hidden
  return (
    <span className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      <span
        className={cn(
          'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
          statusDotSizes[resolvedSize],
          statusColors[status]
        )}
      />
    </span>
  )
})
Avatar.displayName = 'Avatar'

export interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('object-cover w-full h-full', className)}
    {...props}
  />
))
AvatarImage.displayName = 'AvatarImage'

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  size?: AvatarSize
  /** Shorthand: auto-generates initials + color from a name. Children override auto-initials. */
  name?: string
  /** Pass a name/key to enable colorized mode. The string is hashed to pick a deterministic color. */
  colorized?: string
  /** Color style: "vivid" (strong bg + white text) or "soft" (pastel bg + dark text). Default: "vivid" */
  colorVariant?: AvatarColorVariant
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, size, name, colorized, colorVariant = 'vivid', children, ...props }, ref) => {
  const resolvedSize = size || 'default'
  const colorKey = name || colorized
  const color = colorKey ? getAvatarColor(colorKey, colorVariant) : null
  const resolvedChildren = children ?? (name ? getAvatarInitials(name) : undefined)
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex items-center justify-center w-full h-full font-medium',
        color ? [color.bg, color.text] : 'bg-background-muted text-text-muted',
        fallbackFontSizes[resolvedSize],
        className
      )}
      {...props}
    >
      {resolvedChildren}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = 'AvatarFallback'

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarSize
  shape?: AvatarShape
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size = 'default', shape = 'circle', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const visibleChildren = max ? childArray.slice(0, max) : childArray
    const overflowCount = max ? childArray.length - max : 0

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          groupNegativeMargins[size],
          '[&>*]:ring-2 [&>*]:ring-background',
          className
        )}
        {...props}
      >
        {visibleChildren}
        {overflowCount > 0 && (
          <Avatar size={size} shape={shape}>
            <AvatarFallback size={size}>+{overflowCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants, avatarColors, getAvatarColor, getAvatarInitials }
