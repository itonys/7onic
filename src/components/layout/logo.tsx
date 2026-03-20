/* Brand logo */
import { Logo7onicIcon, Logo7onicIconMono } from './logo-7onic'
import { siteConfig } from '@/site.config'

/* Logo text styles */
const logoTextClass = 'text-base font-bold text-foreground leading-none'
const logoSubtitleClass = 'text-[8px] font-semibold text-text-muted leading-none tracking-[0.2em]'

/* Mark — no background (header, docs) */
export function BrandIcon({ className, size }: { className?: string; size?: number }) {
  return <Logo7onicIcon className={className} size={size} />
}

/* Mono mark — footer/print */
export function BrandIconMono({ className, size }: { className?: string; size?: number }) {
  return <Logo7onicIconMono className={className} size={size} />
}

/* Logo text — brand name + subtitle */
function LogoText() {
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className={logoTextClass}>{siteConfig.name}</span>
      <span className={logoSubtitleClass}>{siteConfig.subtitle}</span>
    </span>
  )
}

/* Color logo set — symbol + text */
export function BrandLogo({ className, size }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <BrandIcon size={size} />
      <LogoText />
    </span>
  )
}

/* Mono logo set — symbol + text */
export function BrandLogoMono({ className, size }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <BrandIconMono size={size} />
      <LogoText />
    </span>
  )
}
