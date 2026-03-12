/* SVG path data — Single Source */
const PATHS = {
  horizontal: 'M3.22388 0.873132C1.44338 0.873132 0 2.31651 0 4.09701C0 5.87751 1.44338 7.32089 3.22388 7.32089L13.7015 7.32089C15.482 7.32089 16.9254 5.87751 16.9254 4.09701C16.9254 2.31651 15.482 0.873132 13.7015 0.873132L3.22388 0.873132Z',
  diagonal: 'M16.7417 5.1912C17.3507 3.51808 16.5561 1.69286 14.9669 1.11446C13.3778 0.536056 11.5959 1.4235 10.9869 3.09663L4.18734 21.7783C3.57838 23.4514 4.37297 25.2766 5.96211 25.855C7.55125 26.4334 9.33318 25.546 9.94214 23.8729L16.7417 5.1912Z',
  mask: 'M17.0458 5.30189C17.6547 3.62877 16.7921 1.77877 15.1189 1.1698C13.4458 0.560834 11.5958 1.4235 10.9868 3.09663L4.18728 21.7783C3.57831 23.4514 4.44098 25.3014 6.11411 25.9104C7.78723 26.5193 9.63723 25.6567 10.2462 23.9835L17.0458 5.30189Z',
} as const

/* Color preset */
const COLOR = { horizontal: '#F46181', diagonal: '#37D0DE', intersection: '#6D70E3' } as const

/* 7onic ベースマーク — Capsule Cross "7" */
function Logo7onicBase({
  className, size = 27, colors, prefix,
}: {
  className?: string
  size?: number
  colors: { horizontal: string; diagonal: string; intersection: string }
  prefix: string
}) {
  return (
    <svg
      viewBox="0 0 18 27"
      width={size * 2 / 3}
      height={size}
      className={className}
      aria-label="7onic"
    >
      <defs>
        <clipPath id={`${prefix}-clip`}>
          <rect width="18" height="27" fill="white" />
        </clipPath>
        <mask id={`${prefix}-m`} style={{ maskType: 'alpha' } as React.CSSProperties} maskUnits="userSpaceOnUse" x="3" y="0" width="15" height="27">
          <path d={PATHS.mask} fill="white" />
        </mask>
      </defs>
      <g clipPath={`url(#${prefix}-clip)`}>
        <path d={PATHS.horizontal} fill={colors.horizontal} />
        <path d={PATHS.diagonal} fill={colors.diagonal} />
        <g mask={`url(#${prefix}-m)`}>
          <path d={PATHS.horizontal} fill={colors.intersection} />
        </g>
      </g>
    </svg>
  )
}

/* 7onic カラーマーク — ヘッダー・文書内 */
export function Logo7onicIcon({ className, size }: { className?: string; size?: number }) {
  return <Logo7onicBase className={className} size={size} colors={COLOR} prefix="7onic" />
}

/* 7onic モノクロマーク — フッター・印刷用 (ライト: ダークグレー系, ダーク: ライトグレー系) */
export function Logo7onicIconMono({ className, size = 27 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 18 27"
      width={size * 2 / 3}
      height={size}
      className={className}
      aria-label="7onic"
    >
      <defs>
        <clipPath id="7onic-mono-clip">
          <rect width="18" height="27" fill="white" />
        </clipPath>
        <mask id="7onic-mono-m" style={{ maskType: 'alpha' } as React.CSSProperties} maskUnits="userSpaceOnUse" x="3" y="0" width="15" height="27">
          <path d={PATHS.mask} fill="white" />
        </mask>
      </defs>
      <g clipPath="url(#7onic-mono-clip)">
        <path d={PATHS.horizontal} className="fill-[#9CA3AF] dark:fill-[#6B7280]" />
        <path d={PATHS.diagonal} className="fill-[#4B5563] dark:fill-[#D1D5DB]" />
        <g mask="url(#7onic-mono-m)">
          <path d={PATHS.horizontal} className="fill-[#1F2937] dark:fill-[#F3F4F6]" />
        </g>
      </g>
    </svg>
  )
}
