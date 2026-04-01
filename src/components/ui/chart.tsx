'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
  // Hover fade state
  hoverFade: boolean
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  // Series-level hover fade (used by ChartLine)
  activeDataKey: string | null
  setActiveDataKey: (key: string | null) => void
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  hoverFade = false,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  /** Enable hover-to-highlight: hovered bar group stays full opacity, others fade. */
  hoverFade?: boolean
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [activeDataKey, setActiveDataKey] = React.useState<string | null>(null)

  return (
    <ChartContext.Provider value={{ config, hoverFade, activeIndex, setActiveIndex, activeDataKey, setActiveDataKey }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        onMouseLeave={hoverFade ? () => { setActiveIndex(null); setActiveDataKey(null) } : undefined}
        className={cn(
          'flex aspect-video w-full justify-center text-xs outline-none [&_*]:outline-none',
          // Responsive axis tick font-size — consumed by ChartXAxis / ChartYAxis via var()
          '[--chart-axis-fs:var(--font-size-2xs)] sm:[--chart-axis-fs:var(--font-size-xs)]',
          // Recharts element overrides — use arbitrary properties for v3/v4 compat
          '[&_.recharts-cartesian-axis-tick_text]:[fill:var(--color-text-muted)]',
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-cartesian-grid_line]:[stroke-dasharray:3_3]',
          '[&_.recharts-curve.recharts-tooltip-cursor]:[stroke:var(--color-border)]',
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-layer]:outline-none',
          "[&_.recharts-polar-grid_[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-radial-bar-background-sector]:[fill:var(--color-background-muted)]',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:[fill:transparent]',
          "[&_.recharts-reference-line_[stroke='#ccc']]:[stroke:var(--color-border)]",
          '[&_.recharts-sector]:outline-none',
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          '[&_.recharts-surface]:outline-none',
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// Tooltip fade-in keyframe — injected once per chart via ChartStyle
const CHART_TOOLTIP_KEYFRAME = '@keyframes chart-tooltip-in{from{opacity:0}to{opacity:1}}'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  const colorCss = colorConfig.length
    ? Object.entries(THEMES)
        .map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`
        )
        .join('\n')
    : ''

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: CHART_TOOLTIP_KEYFRAME + colorCss,
      }}
    />
  )
}

// ─── ChartBar ─────────────────────────────────────────────────────────────────

export type ChartBarRadius = 'none' | 'sm' | 'base' | 'md' | 'lg'
export type ChartBarVariant = 'solid' | 'outline'

// TOKEN-EXCEPTION: SVG fillOpacity requires numeric value.
// Matches --opacity-35 token (0.35).
const CHART_HOVER_FADE_OPACITY = 0.35

// Fade transition for hover effect — uses --duration-fast token via CSS variable
const CHART_FADE_TRANSITION = { transition: 'fill-opacity var(--duration-fast) ease-out, stroke-opacity var(--duration-fast) ease-out' } as const

// TOKEN-EXCEPTION: Recharts Bar radius is an SVG attribute — CSS variables not supported.
// Values mirror --radius-* tokens from variables.css.
const CHART_BAR_RADIUS_MAP: Record<ChartBarRadius, number> = {
  none: 0, // --radius-none: 0px
  sm:   2, // --radius-sm:   2px
  base: 4, // --radius-base: 4px
  md:   6, // --radius-md:   6px
  lg:   8, // --radius-lg:   8px
}

type ChartBarProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Bar>, 'radius'> & {
  /** Named radius token. Auto-adapts corners based on layout and stack position. */
  radius?: ChartBarRadius
  /** 'horizontal' rounds the right side (away from Y-axis). Default: 'vertical' */
  layout?: 'vertical' | 'horizontal'
  /** 'bottom' rounds the bottom corners (base of a stack). Default: 'top' */
  stackPosition?: 'top' | 'bottom'
  /** 'outline' renders a thick border with a semi-transparent fill. Default: 'solid' */
  variant?: ChartBarVariant
}

function ChartBar({
  radius = 'none',
  layout = 'vertical',
  stackPosition = 'top',
  variant = 'solid',
  fill,
  stackId,
  ...props
}: ChartBarProps) {
  const { hoverFade, activeIndex, setActiveIndex } = useChart()
  const r = CHART_BAR_RADIUS_MAP[radius]
  const isStacked = !!stackId || stackPosition === 'bottom'
  const appliedRadius: number | [number, number, number, number] =
    r === 0                                           ? 0
    : variant === 'outline' && !isStacked             ? r                  // outline standalone: all 4 corners (works for negative bars too)
    : layout === 'horizontal' && stackPosition === 'bottom' ? 0           // stacked horiz inner: all flat (connects to next bar)
    : layout === 'horizontal'                         ? [0, r, r, 0]      // horiz tip: right corners
    : stackPosition === 'bottom'                      ? 0                 // vertical stacked base: all flat (sits on axis, top connects to next bar)
    :                                                   [r, r, 0, 0]      // default vertical: top corners only

  // TOKEN-EXCEPTION: SVG stroke is centered by default (half inside, half outside).
  // Custom shape renders an inset rect so the stroke stays fully inside the bar bounds.
  const outlineShape = React.useCallback((shapeProps: RechartsPrimitive.BarShapeProps & { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
    const x = shapeProps.x ?? 0
    const y = shapeProps.y ?? 0
    const width = shapeProps.width ?? 0
    const height = shapeProps.height ?? 0
    if (!width || !height || width <= 0 || height <= 0) return <g />
    const sw = 2
    const inset = sw / 2
    const rx = typeof appliedRadius === 'number' ? Math.max(0, appliedRadius - inset) : 0
    // Hover fade: modulate base outline opacity (fill: 0.4, stroke: 1.0)
    const fadeMultiplier = hoverFade && activeIndex !== null && shapeProps.index !== activeIndex ? CHART_HOVER_FADE_OPACITY : 1
    return (
      <rect
        x={x + inset}
        y={y + inset}
        width={Math.max(0, width - sw)}
        height={Math.max(0, height - sw)}
        rx={rx}
        fill={fill}
        fillOpacity={0.4 * fadeMultiplier}
        stroke={fill}
        strokeOpacity={fadeMultiplier}
        strokeWidth={sw}
        style={hoverFade ? CHART_FADE_TRANSITION : undefined}
      />
    )
  }, [appliedRadius, fill, hoverFade, activeIndex])

  // Solid variant hover-fade shape: renders Rectangle with per-bar opacity
  const solidHoverShape = React.useCallback((shapeProps: any) => {
    const opacity = activeIndex === null ? 1 : shapeProps.index === activeIndex ? 1 : CHART_HOVER_FADE_OPACITY
    return (
      <RechartsPrimitive.Rectangle
        {...shapeProps}
        fillOpacity={opacity}
        style={CHART_FADE_TRANSITION}
      />
    )
  }, [activeIndex])

  // Determine which shape function to use
  const useOutline = variant === 'outline' && !isStacked
  const needsHoverShape = hoverFade && variant === 'solid' && !useOutline

  return (
    <RechartsPrimitive.Bar
      radius={appliedRadius}
      fill={fill}
      stackId={stackId}
      // Disable Recharts animation to prevent label/total flicker on hover
      {...(hoverFade && { isAnimationActive: false })}
      {...(useOutline && { shape: outlineShape as any })}
      {...(needsHoverShape && { shape: solidHoverShape as any })}
      {...(hoverFade && { onMouseEnter: (_: unknown, index: number) => setActiveIndex(index) })}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

// Wrapper: kill position-slide so tooltip appears at the hovered bar instantly.
// Smooth appearance is handled by CSS fade on ChartTooltipContent instead.
function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip animationDuration={0} {...props} />
}

// Recharts 3.x injects these props at runtime via content render prop.
// We define explicit types instead of deriving from RechartsPrimitive.Tooltip.
type TooltipPayloadItem = {
  dataKey?: string | number
  name?: string
  value?: number | string
  type?: string
  color?: string
  payload?: Record<string, unknown>
  fill?: string
}

type ChartTooltipContentProps = React.ComponentProps<'div'> & {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  labelFormatter?: (value: unknown, payload: TooltipPayloadItem[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: unknown, name: string, item: TooltipPayloadItem, index: number, payload: Record<string, unknown>) => React.ReactNode
  color?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-semibold', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-semibold', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
      style={{ animation: 'chart-tooltip-in var(--duration-slow) ease-out' }}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item: TooltipPayloadItem) => item.type !== 'none')
          .map((item: TooltipPayloadItem, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || (item.payload as Record<string, unknown>)?.fill as string || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-text-muted',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload as Record<string, unknown>)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            'shrink-0 rounded-sm',
                            {
                              'h-2.5 w-2.5': indicator === 'dot',
                              'w-1': indicator === 'line',
                              'w-0 border-[1.5px] border-dashed bg-transparent':
                                indicator === 'dashed',
                              'my-0.5': nestLabel && indicator === 'dashed',
                            }
                          )}
                          style={{
                            backgroundColor: indicator === 'dashed' ? 'transparent' : indicatorColor,
                            borderColor: indicatorColor,
                          }}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-text-muted">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-semibold text-foreground tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

// Recharts 3.x legend payload type
type LegendPayloadItem = {
  value?: string
  type?: string
  color?: string
  dataKey?: string
}

type ChartLegendContentProps = React.ComponentProps<'div'> & {
  payload?: LegendPayloadItem[]
  verticalAlign?: 'top' | 'middle' | 'bottom'
  align?: 'left' | 'center' | 'right'
  /** Recharts passes layout when Legend uses layout prop */
  layout?: 'horizontal' | 'vertical'
  hideIcon?: boolean
  nameKey?: string
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  align = 'center',
  layout = 'horizontal',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  const isVertical = layout === 'vertical'

  return (
    <div
      className={cn(
        'flex gap-4',
        isVertical
          ? 'flex-col items-start gap-1.5'
          : [
              'items-center',
              align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center',
              verticalAlign === 'top' ? 'pb-3' : 'pt-3',
            ],
        className
      )}
    >
      {payload
        .filter((item: LegendPayloadItem) => item.type !== 'none')
        .map((item: LegendPayloadItem) => {
          const key = `${nameKey || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-text-muted"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-foreground">{itemConfig?.label}</span>
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// ─── ChartXAxis / ChartYAxis ──────────────────────────────────────────────────

// TOKEN-EXCEPTION: Recharts ignores CSS overrides on axis tick text.
// Wrapper components apply design-token styles via inline style to ensure override.
const CHART_AXIS_TICK_STYLE = { style: { fontSize: 'var(--chart-axis-fs)', fill: 'var(--color-text-subtle)' } } as const

type ChartXAxisProps = React.ComponentProps<typeof RechartsPrimitive.XAxis>
type ChartYAxisProps = React.ComponentProps<typeof RechartsPrimitive.YAxis>

const CHART_XAXIS_PADDING = { left: 16, right: 16 } as const

function ChartXAxis({ tick, padding, ...props }: ChartXAxisProps) {
  return <RechartsPrimitive.XAxis tick={tick ?? CHART_AXIS_TICK_STYLE} padding={padding ?? CHART_XAXIS_PADDING} {...props} />
}

function ChartYAxis({ tick, width = 'auto', ...props }: ChartYAxisProps) {
  return <RechartsPrimitive.YAxis tick={tick ?? CHART_AXIS_TICK_STYLE} width={width} {...props} />
}

// ─── ChartLine ───────────────────────────────────────────────────────────────

export type ChartLineType = 'linear' | 'monotone' | 'step' | 'natural'
export type ChartLineVariant = 'solid' | 'dashed'

// TOKEN-EXCEPTION: SVG strokeDasharray requires numeric values — CSS variables not supported.
const CHART_LINE_DASH = '5 5' as const

// TOKEN-EXCEPTION: SVG r / strokeWidth are geometric attributes — CSS variables not supported.
// Dot: r=3 strokeWidth=2, ActiveDot: r=5 strokeWidth=2
const CHART_DOT_PROPS = { r: 3, strokeWidth: 2 } as const
const CHART_ACTIVE_DOT_PROPS = { r: 5, strokeWidth: 2 } as const

type ChartLineProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Line>, 'type' | 'dot' | 'activeDot'> & {
  /** Curve interpolation type. Default: 'monotone' */
  type?: ChartLineType
  /** Line style. 'dashed' applies stroke-dasharray. Default: 'solid' */
  variant?: ChartLineVariant
  /** Show data point dots. Default: true */
  dot?: boolean
  /** Show highlighted dot on hover. Default: true */
  activeDot?: boolean
}

function ChartLine({
  type = 'monotone',
  variant = 'solid',
  dot: showDot = true,
  activeDot: showActiveDot = true,
  stroke,
  dataKey,
  ...props
}: ChartLineProps) {
  const { hoverFade, activeDataKey, setActiveDataKey } = useChart()

  const isFaded = hoverFade && activeDataKey !== null && activeDataKey !== dataKey
  const opacity = isFaded ? CHART_HOVER_FADE_OPACITY : 1

  // When dashed, override strokeDasharray on dots so they remain solid circles.
  const dotProps = showDot
    ? variant === 'dashed' ? { ...CHART_DOT_PROPS, strokeDasharray: '0' } : CHART_DOT_PROPS
    : false
  const activeDotProps = showActiveDot
    ? variant === 'dashed' ? { ...CHART_ACTIVE_DOT_PROPS, strokeDasharray: '0' } : CHART_ACTIVE_DOT_PROPS
    : false

  return (
    <RechartsPrimitive.Line
      type={type}
      dataKey={dataKey}
      stroke={stroke}
      strokeWidth={2}
      strokeDasharray={variant === 'dashed' ? CHART_LINE_DASH : undefined}
      dot={dotProps}
      activeDot={activeDotProps}
      strokeOpacity={opacity}
      // Disable Recharts animation to prevent flicker on hover
      {...(hoverFade && { isAnimationActive: false })}
      {...(hoverFade && { onMouseEnter: () => setActiveDataKey(dataKey as string) })}
      style={hoverFade ? { transition: 'stroke-opacity var(--duration-fast) ease-out' } : undefined}
      {...props}
    />
  )
}

// ─── ChartArea ───────────────────────────────────────────────────────────────

export type ChartAreaType = 'linear' | 'monotone' | 'step' | 'natural'
export type ChartAreaVariant = 'solid' | 'gradient'

// TOKEN-EXCEPTION: SVG fillOpacity requires numeric value.
const CHART_AREA_DEFAULT_OPACITY = 0.4

type ChartAreaProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Area>, 'type' | 'dot' | 'activeDot'> & {
  /** Curve interpolation type. Default: 'monotone' */
  type?: ChartAreaType
  /** Fill style. 'gradient' auto-generates an SVG linearGradient. Default: 'solid' */
  variant?: ChartAreaVariant
  /** Show data point dots. Default: true */
  dot?: boolean
  /** Show highlighted dot on hover. Default: true */
  activeDot?: boolean
  /** Fill opacity for this area (0–1). Default: 0.4 */
  fillOpacity?: number
}

function ChartArea({
  type = 'monotone',
  variant = 'solid',
  dot: showDot = true,
  activeDot: showActiveDot = true,
  fillOpacity = CHART_AREA_DEFAULT_OPACITY,
  stroke,
  fill,
  dataKey,
  ...props
}: ChartAreaProps) {
  const { hoverFade, activeDataKey, setActiveDataKey } = useChart()

  const isFaded = hoverFade && activeDataKey !== null && activeDataKey !== dataKey
  const opacity = isFaded ? CHART_HOVER_FADE_OPACITY : 1

  const dotProps = showDot
    ? CHART_DOT_PROPS
    : false
  const activeDotProps = showActiveDot
    ? CHART_ACTIVE_DOT_PROPS
    : false

  // Gradient variant: use unique ID referencing dataKey
  const gradientId = `area-gradient-${String(dataKey)}`
  const effectiveFill = variant === 'gradient' ? `url(#${gradientId})` : (fill || stroke)
  const effectiveFillOpacity = variant === 'gradient' ? 1 : fillOpacity

  return (
    <>
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {/* TOKEN-EXCEPTION: SVG stop attributes require inline values */}
            <stop offset="5%" stopColor={fill || stroke} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fill || stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      <RechartsPrimitive.Area
        type={type}
        dataKey={dataKey}
        stroke={stroke}
        fill={effectiveFill}
        fillOpacity={effectiveFillOpacity * opacity}
        strokeWidth={2}
        dot={dotProps}
        activeDot={activeDotProps}
        strokeOpacity={opacity}
        // Disable Recharts animation to prevent flicker on hover
        {...(hoverFade && { isAnimationActive: false })}
        {...(hoverFade && { onMouseEnter: () => setActiveDataKey(dataKey as string) })}
        style={hoverFade ? { transition: 'fill-opacity var(--duration-fast) ease-out, stroke-opacity var(--duration-fast) ease-out' } : undefined}
        {...props}
      />
    </>
  )
}

// ─── ChartPie ────────────────────────────────────────────────────────────────

export type ChartPieVariant = 'pie' | 'donut'
export type ChartPieLabel = 'none' | 'outside' | 'inside'
export type ChartPieLabelContent = 'value' | 'percent'

// TOKEN-EXCEPTION: SVG outerRadius expansion on hover — numeric constant.
const CHART_PIE_ACTIVE_OFFSET = 8

// TOKEN-EXCEPTION: SVG innerRadius for donut variant — numeric constant.
const CHART_PIE_DONUT_INNER_RADIUS = 60

// TOKEN-EXCEPTION: SVG outside label line — numeric constants.
const CHART_PIE_LABEL_RADIAL = 16   // radial segment length from slice edge
const CHART_PIE_LABEL_HORIZ = 20    // horizontal segment length

// TOKEN-EXCEPTION: SVG inside label skip angle — numeric constant.
const CHART_PIE_SKIP_ANGLE = 15     // hide label for slices smaller than this (degrees)

type ChartPieProps = Omit<React.ComponentProps<typeof RechartsPrimitive.Pie>, 'label' | 'labelLine' | 'activeShape'> & {
  /** 'donut' applies innerRadius automatically. Default: 'pie' */
  variant?: ChartPieVariant
  /** Label position. Default: 'none' */
  label?: ChartPieLabel
  /** Label display content. Default: 'value' */
  labelContent?: ChartPieLabelContent
  /** Hover expand effect. Default: true */
  activeShape?: boolean
  /** Override inner radius (default: 0 for pie, 60 for donut) */
  innerRadius?: number
  /** Padding angle between slices (degrees). Default: 0 */
  paddingAngle?: number
  /** Corner radius for slices. Default: 0 */
  cornerRadius?: number
}

function ChartPie({
  variant = 'pie',
  label: labelMode = 'none',
  labelContent = 'value',
  activeShape: showActiveShape = true,
  innerRadius,
  paddingAngle = 0,
  cornerRadius = 0,
  startAngle = 90,
  endAngle = -270,
  ...props
}: ChartPieProps) {
  // Resolve inner radius: explicit prop > variant default
  const resolvedInnerRadius = innerRadius ?? (variant === 'donut' ? CHART_PIE_DONUT_INNER_RADIUS : 0)

  // Active shape: render Sector with expanded outer radius on hover
  const activeShapeConfig = showActiveShape
    ? (props: any) => (
        <RechartsPrimitive.Sector
          {...props}
          outerRadius={props.outerRadius + CHART_PIE_ACTIVE_OFFSET}
        />
      )
    : undefined

  // Resolve display text from labelContent
  const getDisplayText = (entry: any) =>
    labelContent === 'percent'
      ? `${(entry.percent * 100).toFixed(0)}%`
      : entry.value

  // Label rendering
  const labelConfig = labelMode === 'outside'
    ? (entry: any) => {
        const RADIAN = Math.PI / 180
        const { cx, cy, midAngle, outerRadius, fill } = entry

        // Point on slice edge
        const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN)
        const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN)

        // End of radial segment
        const mx = cx + (outerRadius + CHART_PIE_LABEL_RADIAL) * Math.cos(-midAngle * RADIAN)
        const my = cy + (outerRadius + CHART_PIE_LABEL_RADIAL) * Math.sin(-midAngle * RADIAN)

        // Horizontal elbow direction
        const isRight = mx > cx
        const ex = mx + (isRight ? CHART_PIE_LABEL_HORIZ : -CHART_PIE_LABEL_HORIZ)

        return (
          <g>
            <polyline
              points={`${sx},${sy} ${mx},${my} ${ex},${my}`}
              fill="none"
              stroke={fill}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            <text
              x={ex + (isRight ? 4 : -4)}
              y={my}
              textAnchor={isRight ? 'start' : 'end'}
              dominantBaseline="central"
              style={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-muted)' }}
            >
              {getDisplayText(entry)}
            </text>
          </g>
        )
      }
    : labelMode === 'inside'
      ? (entry: any) => {
          // Skip label for small slices
          const angle = Math.abs(entry.endAngle - entry.startAngle)
          if (angle < CHART_PIE_SKIP_ANGLE) return null

          const RADIAN = Math.PI / 180
          const { cx, cy, innerRadius: ir, outerRadius: or, midAngle } = entry
          // Pie: push toward outer edge (0.65). Donut ring: use midpoint (0.5)
          const ratio = ir > 0 ? 0.5 : 0.65
          const radius = ir + (or - ir) * ratio
          const x = cx + radius * Math.cos(-midAngle * RADIAN)
          const y = cy + radius * Math.sin(-midAngle * RADIAN)

          return (
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: 'var(--font-size-xs)', fill: 'white', fontWeight: 600 }}
            >
              {getDisplayText(entry)}
            </text>
          )
        }
      : false

  return (
    <RechartsPrimitive.Pie
      innerRadius={resolvedInnerRadius}
      paddingAngle={paddingAngle}
      cornerRadius={cornerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      label={labelConfig as any}
      labelLine={false}
      activeShape={activeShapeConfig as any}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Namespace ──────────────────────────────────────────
const Chart = Object.assign(ChartContainer, {
  Bar: ChartBar,
  Line: ChartLine,
  Area: ChartArea,
  Pie: ChartPie,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  XAxis: ChartXAxis,
  YAxis: ChartYAxis,
  Style: ChartStyle,
})

export {
  Chart,
  ChartContainer,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartPie,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartXAxis,
  ChartYAxis,
  ChartStyle,
  useChart,
}
