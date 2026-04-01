import { ImageResponse } from 'next/og'

const SIZE = { width: 1200, height: 630 }

// Shared OG image generator for individual pages
export function generateOGImage(
  title: string,
  category: 'Components' | 'Design Tokens' | 'Guidelines',
  description: string,
) {
  const categoryColor =
    category === 'Components' ? '#F46181' :
    category === 'Design Tokens' ? '#37D0DE' :
    '#6D70E3'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f14 0%, #1a1a24 50%, #0f0f14 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            top: -50,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${categoryColor}0d 0%, transparent 70%)`,
          }}
        />

        {/* Frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 1140,
            height: 570,
            borderRadius: 24,
            border: '1px solid #27272a',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
            position: 'relative',
          }}
        >
          {/* Inner border */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
            }}
          />

          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 100,
              right: 100,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, ${categoryColor}66 50%, transparent 100%)`,
            }}
          />

          {/* Logo "7" small */}
          <svg
            viewBox="0 0 18 27"
            width="36"
            height="54"
            style={{ marginBottom: 24 }}
          >
            <defs>
              <clipPath id="og-clip">
                <rect width="18" height="27" />
              </clipPath>
              <mask
                id="og-mask"
                style={{ maskType: 'alpha' } as React.CSSProperties}
                maskUnits="userSpaceOnUse"
                x="3"
                y="0"
                width="15"
                height="27"
              >
                <path
                  d="M17.0458 5.30189C17.6547 3.62877 16.7921 1.77877 15.1189 1.1698C13.4458 0.560834 11.5958 1.4235 10.9868 3.09663L4.18728 21.7783C3.57831 23.4514 4.44098 25.3014 6.11411 25.9104C7.78723 26.5193 9.63723 25.6567 10.2462 23.9835L17.0458 5.30189Z"
                  fill="white"
                />
              </mask>
            </defs>
            <g clipPath="url(#og-clip)">
              <path
                d="M3.22388 0.873132C1.44338 0.873132 0 2.31651 0 4.09701C0 5.87751 1.44338 7.32089 3.22388 7.32089L13.7015 7.32089C15.482 7.32089 16.9254 5.87751 16.9254 4.09701C16.9254 2.31651 15.482 0.873132 13.7015 0.873132L3.22388 0.873132Z"
                fill="#F46181"
              />
              <path
                d="M16.7417 5.1912C17.3507 3.51808 16.5561 1.69286 14.9669 1.11446C13.3778 0.536056 11.5959 1.4235 10.9869 3.09663L4.18734 21.7783C3.57838 23.4514 4.37297 25.2766 5.96211 25.855C7.55125 26.4334 9.33318 25.546 9.94214 23.8729L16.7417 5.1912Z"
                fill="#37D0DE"
              />
              <g mask="url(#og-mask)">
                <path
                  d="M3.22388 0.873132C1.44338 0.873132 0 2.31651 0 4.09701C0 5.87751 1.44338 7.32089 3.22388 7.32089L13.7015 7.32089C15.482 7.32089 16.9254 5.87751 16.9254 4.09701C16.9254 2.31651 15.482 0.873132 13.7015 0.873132L3.22388 0.873132Z"
                  fill="#6D70E3"
                />
              </g>
            </g>
          </svg>

          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 9999,
              border: `1px solid ${categoryColor}33`,
              background: `${categoryColor}0a`,
              color: categoryColor,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: categoryColor,
              }}
            />
            {category}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 1,
              marginTop: 28,
              marginBottom: 28,
              background: 'linear-gradient(90deg, transparent, #3f3f46, transparent)',
            }}
          />

          {/* Description */}
          <div
            style={{
              display: 'flex',
              maxWidth: 680,
              textAlign: 'center',
              fontSize: 17,
              color: '#a1a1aa',
              lineHeight: 1.6,
            }}
          >
            {description}
          </div>

          {/* Bottom accent line */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 100,
              right: 100,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, ${categoryColor}44 50%, transparent 100%)`,
            }}
          />

          {/* Bottom right branding */}
          <div
            style={{
              position: 'absolute',
              bottom: 28,
              right: 40,
              fontSize: 13,
              color: '#52525b',
              fontWeight: 400,
            }}
          >
            7onic.design
          </div>
        </div>
      </div>
    ),
    { ...SIZE },
  )
}
