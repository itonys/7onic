'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { TypingIndicator, type TypingIndicatorProps } from '@/components/ui/typing-indicator'

// ============================================================================
// Types
// ============================================================================

export type ChatMessageRole       = 'user' | 'assistant'
export type ChatMessageVariant    = 'bubble' | 'flat'
export type ChatMessageColor      = 'default' | 'muted' | 'primary' | 'dark'
export type ChatMessageSize       = 'sm' | 'default' | 'lg'
export type ChatMessageRadius     = 'md' | 'lg' | 'xl' | '2xl'
export type ChatMessageAvatarSize = 'sm' | 'md' | 'lg'

/** Built-in status presets (pass as string to Footer.status for auto-rendering) */
export type ChatMessageStatus = 'sending' | 'sent' | 'read' | 'error'

// ============================================================================
// Context — propagates root props to sub-components
// ============================================================================

interface ChatMessageContextValue {
  role:    ChatMessageRole
  variant: ChatMessageVariant
  color:   ChatMessageColor
  size:    ChatMessageSize
  radius:  ChatMessageRadius
  tail:    boolean
  typing:  boolean | Omit<TypingIndicatorProps, 'className'>
  actions?: React.ReactNode
}

const ChatMessageContext = React.createContext<ChatMessageContextValue>({
  role:    'assistant',
  variant: 'bubble',
  color:   'default',
  size:    'default',
  radius:  '2xl',
  tail:    true,
  typing:  false,
  actions: undefined,
})

// ============================================================================
// Size maps
// ============================================================================

/** Bubble padding per size */
const bubblePaddingMap: Record<ChatMessageSize, string> = {
  sm:      'px-3 py-1.5',
  default: 'px-3.5 py-2',
  lg:      'px-4 py-2.5',
}

/** Bubble text class per size */
const bubbleTextMap: Record<ChatMessageSize, string> = {
  sm:      'text-sm',
  default: 'text-md',
  lg:      'text-base',
}

/** Footer text size per size */
const footerTextMap: Record<ChatMessageSize, string> = {
  sm:      'text-2xs',
  default: 'text-2xs',
  lg:      'text-xs',
}

/** Gap between avatar and content per message size */
const rowGapMap: Record<ChatMessageSize, string> = {
  sm:      'gap-2',
  default: 'gap-2.5',
  lg:      'gap-3',
}

/** Gap override when avatarSize is explicitly set */
const avatarGapMap: Record<ChatMessageAvatarSize, string> = {
  sm: 'gap-1.5',
  md: 'gap-2.5',
  lg: 'gap-3',
}

// ============================================================================
// Chat avatar sizes (independent from message size)
// ============================================================================

const chatAvatarSizeMap: Record<ChatMessageAvatarSize, string> = {
  sm: 'w-6 h-6',   // 24px
  md: 'w-7 h-7',   // 28px
  lg: 'w-8 h-8',   // 32px
}

const chatAvatarFontMap: Record<ChatMessageAvatarSize, string> = {
  sm: 'text-2xs',
  md: 'text-2xs',
  lg: 'text-xs',
}

// ============================================================================
// Bubble radius — static maps for Tailwind JIT scanner compatibility
// ============================================================================

/**
 * Asymmetric with tail: tail corner = rounded-none (0px).
 * assistant → tail at bottom-left | user → tail at bottom-right
 */
const bubbleRadiusTailMap: Record<ChatMessageRadius, Record<ChatMessageRole, string>> = {
  md:    { assistant: 'rounded-tl-md   rounded-tr-md   rounded-br-md   rounded-bl-none', user: 'rounded-tl-md   rounded-tr-md   rounded-br-none rounded-bl-md'   },
  lg:    { assistant: 'rounded-tl-lg   rounded-tr-lg   rounded-br-lg   rounded-bl-none', user: 'rounded-tl-lg   rounded-tr-lg   rounded-br-none rounded-bl-lg'   },
  xl:    { assistant: 'rounded-tl-xl   rounded-tr-xl   rounded-br-xl   rounded-bl-none', user: 'rounded-tl-xl   rounded-tr-xl   rounded-br-none rounded-bl-xl'   },
  '2xl': { assistant: 'rounded-tl-2xl  rounded-tr-2xl  rounded-br-2xl  rounded-bl-none', user: 'rounded-tl-2xl  rounded-tr-2xl  rounded-br-none rounded-bl-2xl'  },
}

/** Symmetric: all corners same radius */
const bubbleRadiusSymMap: Record<ChatMessageRadius, string> = {
  md:    'rounded-md',
  lg:    'rounded-lg',
  xl:    'rounded-xl',
  '2xl': 'rounded-2xl',
}

// ============================================================================
// Bubble color helper — applies to both roles uniformly
// ============================================================================

function getBubbleColors(color: ChatMessageColor, variant: ChatMessageVariant): string {
  if (variant === 'flat') {
    return color === 'muted' ? 'bg-background-muted' : ''
  }
  switch (color) {
    case 'default': return 'bg-background-paper border border-border text-foreground'
    case 'muted':   return 'bg-background-muted text-foreground'
    case 'primary': return 'bg-primary text-primary-foreground'
    case 'dark':    return 'bg-foreground text-background'
  }
}

// ============================================================================
// Built-in status labels
// ============================================================================

const builtInStatusLabels: Record<string, { label: string; className: string }> = {
  sending: { label: 'Sending...', className: 'text-text-subtle' },
  sent:    { label: 'Sent',       className: 'text-text-subtle' },
  read:    { label: 'Read',       className: 'text-text-subtle' },
  error:   { label: 'Failed',     className: 'text-error' },
}

// ============================================================================
// TypingIndicator size mapping (chat sizes → indicator sizes)
// ============================================================================

const typingSizeMap: Record<ChatMessageSize, 'sm' | 'default' | 'lg'> = {
  sm:      'sm',
  default: 'sm',
  lg:      'default',
}

/** Minimum bubble width when typing — accounts for dot size + padding per chat size */
const typingMinWidthMap: Record<ChatMessageSize, string> = {
  sm:      'min-w-12',
  default: 'min-w-12',
  lg:      'min-w-16',
}

// ============================================================================
// Props interfaces
// ============================================================================

export interface ChatMessageRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sender role — controls alignment (left=assistant, right=user) */
  role?: ChatMessageRole
  /** Bubble visual style */
  variant?: ChatMessageVariant
  /** Bubble background color */
  color?: ChatMessageColor
  /** Size scale — affects text and padding */
  size?: ChatMessageSize
  /** Bubble corner radius */
  radius?: ChatMessageRadius
  /** Asymmetric tail corner (radius=0 on the avatar side) */
  tail?: boolean
  /** Show typing indicator inside Content. Pass true for defaults, or TypingIndicatorProps for custom. */
  typing?: boolean | Omit<TypingIndicatorProps, 'className'>
  /** Avatar size — overrides default gap between avatar and bubble */
  avatarSize?: ChatMessageAvatarSize
  /** Action buttons revealed on hover */
  actions?: React.ReactNode
}

export interface ChatMessageAvatarProps {
  /** Avatar size: sm(24px), md(28px), lg(32px) */
  size?: ChatMessageAvatarSize
  /** Image URL */
  src?: string
  /** Alt text for avatar image */
  alt?: string
  /** Initials to display when no image (1–2 characters) */
  initials?: string
  /** Custom icon or ReactNode to render inside the avatar */
  icon?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChatMessageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChatMessageFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pre-formatted timestamp string (e.g. "12:34 PM") */
  timestamp?: string
  /** Status: built-in preset ('sending' | 'sent' | 'read' | 'error') or custom ReactNode */
  status?: React.ReactNode
  /** Size override (defaults to context value from ChatMessage root) */
  size?: ChatMessageSize
}

// ============================================================================
// ChatMessage Root
// ============================================================================

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageRootProps>(
  (
    {
      className,
      role       = 'assistant',
      variant    = 'bubble',
      color      = 'default',
      size       = 'default',
      radius     = '2xl',
      tail       = true,
      typing     = false,
      avatarSize,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const ctx = React.useMemo<ChatMessageContextValue>(
      () => ({ role, variant, color, size, radius, tail, typing, actions }),
      [role, variant, color, size, radius, tail, typing, actions]
    )

    const gapClass = avatarSize ? avatarGapMap[avatarSize] : rowGapMap[size]

    return (
      <ChatMessageContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(
            'group/message flex items-end',
            gapClass,
            role === 'user' && variant !== 'flat' ? 'flex-row-reverse' : 'flex-row',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ChatMessageContext.Provider>
    )
  }
)
ChatMessage.displayName = 'ChatMessage'

// ============================================================================
// Default AI sparkle icon
// ============================================================================

function DefaultAiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3/5 h-3/5" aria-hidden="true">
      <path d="M12 3l1.8 5.4 5.4 1.8-5.4 1.8L12 17.4l-1.8-5.4L4.8 10.2l5.4-1.8z" />
      <path d="M19.5 3.5l.8 2.4 2.4.8-2.4.8L19.5 10l-.8-2.5-2.4-.8 2.4-.8z" opacity=".6" />
      <path d="M4.5 14.5l.7 2 2 .7-2 .7L4.5 20l-.7-2-2-.7 2-.7z" opacity=".4" />
    </svg>
  )
}

// ============================================================================
// ChatMessageAvatar — wraps Avatar component with chat-specific sizes
// ============================================================================

const ChatMessageAvatar = React.forwardRef<HTMLSpanElement, ChatMessageAvatarProps>(
  ({ className, size: avatarSize = 'md', src, alt = 'Avatar', initials, icon }, ref) => (
    <Avatar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      aria-hidden="true"
      className={cn(chatAvatarSizeMap[avatarSize], 'shrink-0', className)}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className={cn('font-semibold', chatAvatarFontMap[avatarSize])}>
        {icon ?? (initials || <DefaultAiIcon />)}
      </AvatarFallback>
    </Avatar>
  )
)
ChatMessageAvatar.displayName = 'ChatMessageAvatar'

// ============================================================================
// ChatMessageContent
// ============================================================================

const ChatMessageContent = React.forwardRef<HTMLDivElement, ChatMessageContentProps>(
  ({ className, children, ...props }, ref) => {
    const { role, variant, color, size, radius, tail, typing, actions } = React.useContext(ChatMessageContext)
    const isTyping = !!typing
    const typingProps = typeof typing === 'object' ? typing : {}

    // Dark bubble backgrounds need inverted typing dot colors
    const isDarkBg = color === 'primary' || color === 'dark'
    const invertDots = variant === 'bubble' && isDarkBg

    // flat variant never has a tail (asymmetric corner)
    const effectiveTail = variant === 'flat' ? false : tail
    const radiusClasses = effectiveTail
      ? bubbleRadiusTailMap[radius][role]
      : bubbleRadiusSymMap[radius]

    const bubble = (
      <div
        ref={ref}
        className={cn(
          bubbleTextMap[size],
          variant === 'bubble' && 'max-w-[75%]',
          isTyping && [typingMinWidthMap[size], 'text-center'],
          getBubbleColors(color, variant),
          (variant === 'bubble' || variant === 'flat') && bubblePaddingMap[size],
          (variant === 'bubble' || (variant === 'flat' && color === 'muted')) && radiusClasses,
          className
        )}
        {...props}
      >
        {isTyping ? (
          <TypingIndicator
            size={typingSizeMap[size]}
            color="muted"
            {...typingProps}
            className={cn('align-middle', invertDots && '[&>div>div]:bg-current')}
          />
        ) : children}
      </div>
    )

    if (!actions) return bubble

    return (
      <div className={cn('flex items-end gap-1.5', role === 'user' && variant !== 'flat' ? 'flex-row-reverse' : 'flex-row')}>
        {bubble}
        <div className={cn(
          'shrink-0 flex items-center gap-1 pb-0.5',
          'opacity-0 group-hover/message:opacity-100',
          'transition-opacity duration-normal',
        )}>
          {actions}
        </div>
      </div>
    )
  }
)
ChatMessageContent.displayName = 'ChatMessageContent'

// ============================================================================
// ChatMessageFooter
// ============================================================================

const ChatMessageFooter = React.forwardRef<HTMLDivElement, ChatMessageFooterProps>(
  (
    {
      className,
      timestamp,
      status,
      role: roleProp,
      size: sizeProp,
      children,
      ...props
    },
    ref
  ) => {
    const ctx = React.useContext(ChatMessageContext)
    const role    = roleProp ?? ctx.role
    const size    = sizeProp ?? ctx.size
    const variant = ctx.variant

    // Resolve status: built-in preset string → label, or pass-through ReactNode
    const statusContent = React.useMemo(() => {
      if (status == null) return null
      if (typeof status === 'string' && status in builtInStatusLabels) {
        const { label, className: cls } = builtInStatusLabels[status]
        return <span className={cls}>{label}</span>
      }
      return status
    }, [status])

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1 select-none',
          footerTextMap[size],
          'text-text-subtle',
          role === 'user' && variant !== 'flat' ? 'justify-end' : 'justify-start',
          className
        )}
        {...props}
      >
        {children}
        {statusContent}
        {timestamp && <span>{timestamp}</span>}
      </div>
    )
  }
)
ChatMessageFooter.displayName = 'ChatMessageFooter'

export {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageFooter,
}
