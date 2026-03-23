'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// Constants
// ============================================================================

/** Ring SVG sizes per size variant (diameter in px) */
const RING_SIZES = {
  sm: 16,
  default: 24,
  lg: 32,
} as const

/** Ring stroke widths per size */
const RING_STROKE = {
  sm: 2,
  default: 2.5,
  lg: 3,
} as const

/** Dot sizes (diameter in px) */
const DOT_SIZES = {
  sm: 4,
  default: 6,
  lg: 8,
} as const

/** Dot container gap per size */
const DOT_GAP = {
  sm: 3,
  default: 4,
  lg: 5,
} as const

/** Bar widths per size */
const BAR_WIDTHS = {
  sm: 2,
  default: 3,
  lg: 4,
} as const

/** Bar heights per size */
const BAR_HEIGHTS = {
  sm: 12,
  default: 16,
  lg: 24,
} as const

/** Bar gap per size */
const BAR_GAP = {
  sm: 2,
  default: 3,
  lg: 4,
} as const

/** Orbit sizes (diameter in px) */
const ORBIT_SIZES = {
  sm: 22,
  default: 32,
  lg: 44,
} as const

/** Orbit ring stroke widths per size */
const ORBIT_STROKE = {
  sm: 2.5,
  default: 3,
  lg: 3.5,
} as const


/** Number of dots in dots variant */
const DOT_COUNT = 3

/** Number of bars in bars variant */
const BAR_COUNT = 4

/** SVG viewBox for ring spinner */
const RING_VIEWBOX = 24

/** SVG center for ring spinner */
const RING_CENTER = 12

// ============================================================================
// Color mapping
// ============================================================================

const strokeColorMap = {
  default: 'stroke-foreground',
  primary: 'stroke-primary',
  current: 'stroke-current',
} as const

const bgColorMap = {
  default: 'bg-foreground',
  primary: 'bg-primary',
  current: 'bg-current',
} as const

// ============================================================================
// Speed mapping
// ============================================================================

/** Speed durations in ms for ring/dots/bars */
const SPEED_MS = { slow: 1500, default: 1000, fast: 750 } as const
/** Speed durations in ms for orbit (slower) */
const ORBIT_SPEED_MS = { slow: 2000, default: 1500, fast: 1000 } as const

// ============================================================================
// Variants (CVA)
// ============================================================================

const spinnerVariants = cva(
  'inline-flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        sm: '',
        default: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export type OrbitStyle = 'ring' | 'dots' | 'cube' | 'flip' | 'morph'

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Visual variant */
  variant?: 'ring' | 'dots' | 'bars' | 'orbit'
  /** Orbit sub-style (only when variant="orbit") */
  orbitStyle?: OrbitStyle
  /** Spinner color */
  color?: 'default' | 'primary' | 'current'
  /** Animation speed */
  speed?: 'slow' | 'default' | 'fast'
  /** Accessibility label */
  label?: string
}

// ============================================================================
// Component
// ============================================================================

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    variant = 'ring',
    orbitStyle = 'ring',
    size,
    color = 'default',
    speed = 'default',
    label,
    ...props
  }, ref) => {
    const resolvedSize = size || 'default'

    const orbitMap = {
      ring: OrbitSpinner,
      dots: OrbitDotsSpinner,
      cube: OrbitCubeSpinner,
      flip: OrbitFlipSpinner,
      morph: OrbitMorphSpinner,
    } as const

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || 'Loading'}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      >
        {variant === 'ring' && (
          <RingSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'dots' && (
          <DotsSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'bars' && (
          <BarsSpinner size={resolvedSize} color={color} speed={speed} />
        )}
        {variant === 'orbit' && (() => {
          const OrbitComponent = orbitMap[orbitStyle]
          return <OrbitComponent size={resolvedSize} color={color} speed={speed} />
        })()}
      </div>
    )
  }
)
Spinner.displayName = 'Spinner'

// ============================================================================
// Ring Spinner (SVG circle with animate-spin)
// ============================================================================

function RingSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = RING_SIZES[size]
  const stroke = RING_STROKE[size]
  const r = (RING_VIEWBOX - stroke) / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg
      viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
      width={diameter}
      height={diameter}
      fill="none"
      className="animate-spin"
      style={{ animationDuration: `${SPEED_MS[speed]}ms` }}
    >
      {/* Track */}
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={r}
        className="stroke-border"
        strokeWidth={stroke}
      />
      {/* Indicator */}
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={r}
        className={strokeColorMap[color]}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ============================================================================
// Dots Spinner (3 pulsing dots)
// ============================================================================

function DotsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const dotSize = DOT_SIZES[size]
  const gap = DOT_GAP[size]

  return (
    <div className="inline-flex items-center" style={{ gap }}>
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-spinner-dot',
            bgColorMap[color],
          )}
          style={{
            width: dotSize,
            height: dotSize,
            animationDuration: `${SPEED_MS[speed]}ms`,
            animationDelay: `${i * (SPEED_MS[speed] / DOT_COUNT / 1.5)}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Bars Spinner (4 pulsing bars)
// ============================================================================

function BarsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const barWidth = BAR_WIDTHS[size]
  const barHeight = BAR_HEIGHTS[size]
  const gap = BAR_GAP[size]

  return (
    <div className="inline-flex items-center" style={{ gap, height: barHeight }}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-spinner-bar origin-center',
            bgColorMap[color],
          )}
          style={{
            width: barWidth,
            height: barHeight,
            animationDuration: `${SPEED_MS[speed]}ms`,
            animationDelay: `${i * (SPEED_MS[speed] / BAR_COUNT / 1.5)}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Orbit Spinner (3D rotating ring)
// ============================================================================

const orbitTextColorMap = {
  default: 'text-foreground',
  primary: 'text-primary',
  current: '',
} as const

function OrbitSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = ORBIT_SIZES[size]
  const stroke = ORBIT_STROKE[size]
  const r = (RING_VIEWBOX - stroke * 2) / 2
  const circumference = 2 * Math.PI * r

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: diameter,
        height: diameter,
        perspective: diameter * 3,
        position: 'relative',
      }}
    >
      {/* Ring 1 — solid, Y-axis rotation */}
      <svg
        viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
        width={diameter}
        height={diameter}
        fill="none"
        className="absolute inset-0 animate-spinner-orbit"
        style={{ animationDuration: `${ORBIT_SPEED_MS[speed]}ms` }}
      >
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
        />
      </svg>
      {/* Ring 2 — solid, perpendicular, reverse direction */}
      <svg
        viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
        width={diameter}
        height={diameter}
        fill="none"
        className="absolute inset-0 animate-spinner-orbit"
        style={{
          animationDuration: `${ORBIT_SPEED_MS[speed]}ms`,
          transform: 'rotateZ(90deg)',
          animationDirection: 'reverse',
          animationDelay: '-0.4s',
          opacity: 0.35,
        }}
      >
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
        />
      </svg>
    </div>
  )
}

// ============================================================================
// Orbit Dots — 3 dots orbiting in 3D path
// ============================================================================

/** Orbit dot size per spinner size */
const ORBIT_DOT_SIZE = { sm: 3, default: 4, lg: 6 } as const

function OrbitDotsSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const diameter = ORBIT_SIZES[size]
  const dotSize = ORBIT_DOT_SIZE[size]
  const orbitRadius = (diameter - dotSize) / 2

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: diameter,
        height: diameter,
        perspective: diameter * 3,
        position: 'relative',
      }}
    >
      <div
        className="animate-spinner-orbit"
        style={{
          animationDuration: `${ORBIT_SPEED_MS[speed]}ms`,
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {[0, 120, 240].map((angle) => (
          <div
            key={angle}
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: 'currentColor',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${orbitRadius}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Cube — wireframe cube rotating in 3D
// ============================================================================

/** Cube face sizes per spinner size */
const CUBE_SIZES = { sm: 12, default: 18, lg: 26 } as const

function OrbitCubeSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const cubeSize = CUBE_SIZES[size]
  const half = cubeSize / 2
  const radius = Math.round(cubeSize * 0.15)

  const overlap = 1
  const faceBase: React.CSSProperties = {
    position: 'absolute',
    width: cubeSize + overlap * 2,
    height: cubeSize + overlap * 2,
    backgroundColor: 'currentColor',
    borderRadius: radius,
    top: -overlap,
    left: -overlap,
  }

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: cubeSize,
        height: cubeSize,
        perspective: cubeSize * 6,
      }}
    >
      {/* Diagonal tilt — shows top + corner for depth */}
      <div
        style={{
          width: cubeSize,
          height: cubeSize,
          transform: 'rotateX(-25deg) rotateZ(15deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Y-axis rotation */}
        <div
          className="animate-spinner-orbit"
          style={{
            animationDuration: `${ORBIT_SPEED_MS[speed]}ms`,
            width: cubeSize,
            height: cubeSize,
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{ ...faceBase, transform: `translateZ(${half}px)`, opacity: 0.25 }} />
          <div style={{ ...faceBase, transform: `translateZ(${-half}px)`, opacity: 0.1 }} />
          <div style={{ ...faceBase, transform: `rotateY(-90deg) translateZ(${half}px)`, opacity: 0.2 }} />
          <div style={{ ...faceBase, transform: `rotateY(90deg) translateZ(${half}px)`, opacity: 0.2 }} />
          <div style={{ ...faceBase, transform: `rotateX(90deg) translateZ(${half}px)`, opacity: 0.15 }} />
          <div style={{ ...faceBase, transform: `rotateX(-90deg) translateZ(${half}px)`, opacity: 0.08 }} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Flip — rounded square tumbling in 3D
// ============================================================================

/** Flip square sizes per spinner size */
const FLIP_SIZES = { sm: 14, default: 20, lg: 28 } as const

function OrbitFlipSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const sqSize = FLIP_SIZES[size]

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: sqSize,
        height: sqSize,
        perspective: sqSize * 4,
      }}
    >
      <div style={{ transform: 'rotateX(25deg)', transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
        <div
          className="animate-spinner-orbit"
          style={{
            animationDuration: `${ORBIT_SPEED_MS[speed]}ms`,
            width: '100%',
            height: '100%',
            borderRadius: '25%',
            backgroundColor: 'currentColor',
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Orbit Morph — organic shape morphing + 3D rotation
// ============================================================================

/** Morph sizes per spinner size */
const MORPH_SIZES = { sm: 16, default: 24, lg: 34 } as const

function OrbitMorphSpinner({ size, color, speed }: {
  size: 'sm' | 'default' | 'lg'
  color: 'default' | 'primary' | 'current'
  speed: 'slow' | 'default' | 'fast'
}) {
  const morphSize = MORPH_SIZES[size]

  return (
    <div
      className={cn(orbitTextColorMap[color])}
      style={{
        width: morphSize,
        height: morphSize,
        perspective: morphSize * 3,
      }}
    >
      <div
        className="animate-spinner-morph"
        style={{
          animationDuration: `${ORBIT_SPEED_MS[speed]}ms`,
          width: '100%',
          height: '100%',
          backgroundColor: 'currentColor',
          opacity: 0.85,
        }}
      />
    </div>
  )
}

export { Spinner, spinnerVariants }
