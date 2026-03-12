'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site.config'
import { useTheme } from './theme-provider'
import { useSidebar } from './sidebar-context'
import { SearchCommand } from './search-command'
import { BrandLogo } from './logo'

export function Header() {
  const navigation = siteConfig.navigation
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const { toggle, isCollapsed, toggleCollapse } = useSidebar()
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Keyboard shortcut: ⌘K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Smart header - hide on scroll down, show on scroll up
  const [isVisible, setIsVisible] = React.useState(true)
  const [lastScrollY, setLastScrollY] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show header when at top or scrolling up
      if (currentScrollY < 10 || currentScrollY < lastScrollY) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Show sidebar toggle only on pages with sidebar
  const showSidebarToggle = pathname?.startsWith('/components') || pathname?.startsWith('/design-tokens') || pathname?.startsWith('/guidelines')

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-sticky h-16 bg-background border-b border-border transition-transform duration-slow",
        !isVisible && "md:translate-y-0 -translate-y-full"
      )}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between relative">
        {/* Left side - Sidebar toggle + Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sidebar Toggle (mobile: open overlay, desktop: collapse/expand) */}
          {showSidebarToggle && (
            <>
              {/* Mobile toggle - hamburger menu */}
              <button
                onClick={toggle}
                className="lg:hidden w-10 h-10 -ml-2 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-micro active:scale-pressed focus-visible:focus-ring"
                aria-label="サイドバーを開く"
              >
                <SidebarIcon className="icon-md" />
              </button>
              {/* Desktop toggle - panel icons */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex w-10 h-10 -ml-2 rounded-md items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-micro active:scale-pressed focus-visible:focus-ring"
                aria-label={isCollapsed ? "サイドバーを表示" : "サイドバーを隠す"}
              >
                {isCollapsed ? (
                  <PanelLeftOpenIcon className="icon-md" />
                ) : (
                  <PanelLeftCloseIcon className="icon-md" />
                )}
              </button>
            </>
          )}

          {/* Logo — アイコン + テキスト */}
          <Link href="/" className="group">
            <BrandLogo size={27} />
          </Link>
        </div>

        {/* Desktop Navigation — ヘッダー中央に配置 */}
        <nav aria-label="メインナビゲーション" className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {navigation.map((item) => {
            if (item.soon) {
              return (
                <span
                  key={item.name}
                  className="px-4 py-2 text-sm font-semibold text-text-subtle opacity-40 cursor-not-allowed select-none inline-flex items-center gap-1.5"
                >
                  {item.name}
                  <span className="text-2xs">Soon</span>
                </span>
              )
            }
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-semibold transition-colors duration-fast',
                  isActive
                    ? 'text-foreground'
                    : 'text-text-muted hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button - Icon only (small screens) */}
          <button
            className="lg:hidden w-10 h-10 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-micro active:scale-pressed focus-visible:focus-ring"
            onClick={() => setSearchOpen(true)}
            aria-label="検索"
          >
            <SearchIcon className="icon-md" />
          </button>

          {/* Search Button - Spotlight Style (large screens) */}
          <button
            className="hidden lg:flex items-center justify-between w-48 h-10 px-4 text-sm text-text-muted bg-background-muted hover:bg-border rounded-full transition-all duration-normal"
            onClick={() => setSearchOpen(true)}
          >
            <div className="flex items-center gap-2">
              <SearchIcon className="icon-sm" />
              <span>検索...</span>
            </div>
            <kbd className="text-2xs bg-background text-text-subtle px-2 py-1 rounded-full border border-border font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-micro active:scale-pressed focus-visible:focus-ring"
            aria-label="テーマを切り替え"
          >
            {resolvedTheme === 'dark' ? (
              <SunIcon className="icon-md" />
            ) : (
              <MoonIcon className="icon-md" />
            )}
          </button>

          {/* GitHub Link — レポURL確定後に表示 */}
          {/* <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-micro active:scale-pressed focus-visible:focus-ring"
            aria-label="GitHub"
          >
            <GitHubIcon className="icon-md" />
          </a> */}
        </div>
      </div>

      {/* Mobile Navigation Bar - Fixed below header, follows header visibility */}
      <nav aria-label="モバイルナビゲーション" className={cn(
        "lg:hidden fixed top-16 left-0 right-0 z-sticky bg-background border-b border-border overflow-x-auto overscroll-none scrollbar-hide transition-transform duration-slow",
        !isVisible && "-translate-y-[112px]"
      )}>
        <div className="flex min-w-full">
          {navigation.map((item) => {
            if (item.soon) {
              return (
                <span
                  key={item.name}
                  className="flex-1 px-2 py-3 text-xs font-semibold text-center whitespace-nowrap text-text-subtle opacity-40 cursor-not-allowed select-none inline-flex items-center justify-center gap-1"
                >
                  {item.mobileName}
                  <span className="text-2xs">Soon</span>
                </span>
              )
            }
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex-1 px-2 py-3 text-xs font-semibold text-center whitespace-nowrap transition-colors duration-fast',
                  isActive
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-text-muted'
                )}
              >
                {item.mobileName}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Search Command */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}

// Icons
function SidebarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      {/* AlignLeft style - lines with different lengths */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

// GitHub icon — レポURL確定後に使用予定
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

// Panel Left Open icon (Lucide style) - sidebar is collapsed, click to open
function PanelLeftOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9l3 3-3 3" />
    </svg>
  )
}

// Panel Left Close icon (Lucide style) - sidebar is open, click to close
function PanelLeftCloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-3 3 3 3" />
    </svg>
  )
}

