'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

interface SidebarItem {
  name: string
  href: string
  badge?: string
  children?: SidebarItem[]
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const componentSections: SidebarSection[] = [
  {
    title: 'はじめに',
    items: [
      { name: 'Overview', href: '/components' },
      { name: 'Installation', href: '/components/installation' },
      { name: 'Theming', href: '/components/theming' },
    ],
  },
  {
    title: 'フォーム',
    items: [
      {
        name: 'Button',
        href: '/components/button',
        children: [
          { name: 'IconButton', href: '/components/icon-button' },
          { name: 'ButtonGroup', href: '/components/button-group' },
        ]
      },
      { name: 'Input', href: '/components/input' },
      { name: 'Textarea', href: '/components/textarea' },
      { name: 'Select', href: '/components/select' },
      { name: 'Dropdown', href: '/components/dropdown' },
      { name: 'Checkbox', href: '/components/checkbox' },
      { name: 'Radio', href: '/components/radio' },
      { name: 'Switch', href: '/components/switch' },
      {
        name: 'Toggle',
        href: '/components/toggle',
        children: [
          { name: 'ToggleGroup', href: '/components/toggle-group' },
        ]
      },
      { name: 'Segmented', href: '/components/segmented' },
      { name: 'Slider', href: '/components/slider' },
    ],
  },
  {
    title: 'データ表示',
    items: [
      { name: 'Avatar', href: '/components/avatar' },
      { name: 'Badge', href: '/components/badge' },
      { name: 'Card', href: '/components/card' },
      { name: 'Table', href: '/components/table' },
    ],
  },
  {
    title: 'レイアウト',
    items: [
      { name: 'Tabs', href: '/components/tabs' },
      { name: 'Accordion', href: '/components/accordion' },
      { name: 'Divider', href: '/components/divider' },
    ],
  },
  {
    title: 'オーバーレイ',
    items: [
      { name: 'Modal', href: '/components/modal' },
      { name: 'Drawer', href: '/components/drawer' },
      { name: 'Tooltip', href: '/components/tooltip' },
      { name: 'Popover', href: '/components/popover' },
    ],
  },
  {
    title: 'フィードバック',
    items: [
      { name: 'Alert', href: '/components/alert' },
      { name: 'Toast', href: '/components/toast' },
      { name: 'Progress', href: '/components/progress' },
      { name: 'Skeleton', href: '/components/skeleton' },
      { name: 'Spinner', href: '/components/spinner' },
    ],
  },
  {
    title: 'ナビゲーション',
    items: [
      { name: 'Breadcrumb', href: '/components/breadcrumb' },
      { name: 'Pagination', href: '/components/pagination' },
      { name: 'Menu', href: '/components/menu' },
    ],
  },
  {
    title: 'AIコンポーネント',
    items: [
      { name: 'ChatMessage', href: '/components/chat-message', badge: 'New' },
      { name: 'ChatInput', href: '/components/chat-input', badge: 'New' },
      { name: 'TypingIndicator', href: '/components/typing-indicator', badge: 'New' },
      { name: 'QuickReply', href: '/components/quick-reply', badge: 'New' },
    ],
  },
  {
    title: 'チャート',
    items: [
      { name: 'LineChart', href: '/components/line-chart' },
      { name: 'AreaChart', href: '/components/area-chart' },
      { name: 'BarChart', href: '/components/bar-chart' },
      { name: 'PieChart', href: '/components/pie-chart' },
      { name: 'MetricCard', href: '/components/metric-card' },
    ],
  },
]

const foundationSections: SidebarSection[] = [
  {
    title: 'はじめに',
    items: [
      { name: 'Overview', href: '/design-tokens' },
      { name: 'Installation', href: '/design-tokens/installation' },
    ],
  },
  {
    title: 'デザイントークン',
    items: [
      { name: 'Colors', href: '/design-tokens/colors' },
      { name: 'Typography', href: '/design-tokens/typography' },
      { name: 'Spacing', href: '/design-tokens/spacing' },
      { name: 'Shadows', href: '/design-tokens/shadows' },
      { name: 'Border Radius', href: '/design-tokens/radius' },
      { name: 'Border Width', href: '/design-tokens/border-width' },
      { name: 'Breakpoints', href: '/design-tokens/breakpoints' },
      { name: 'z-Index', href: '/design-tokens/z-index' },
      { name: 'Opacity', href: '/design-tokens/opacity' },
      { name: 'Icon Sizes', href: '/design-tokens/icon-sizes' },
      { name: 'Duration', href: '/design-tokens/duration' },
      { name: 'Easing', href: '/design-tokens/easing' },
      { name: 'Scale', href: '/design-tokens/scale' },
      { name: 'Animation', href: '/design-tokens/animation' },
    ],
  },
  {
    title: 'デザインガイド',
    items: [
      { name: 'Icons', href: '/guidelines/icons' },
      { name: 'Accessibility', href: '/guidelines/accessibility' },
      { name: 'Tailwind Versions', href: '/guidelines/tailwind-versions' },
    ],
  },
]

interface SidebarProps {
  type?: 'components' | 'foundations'
}

function SidebarNavItem({ item, pathname, depth = 0 }: { item: SidebarItem; pathname: string; depth?: number }) {
  const isActive = pathname === item.href
  const hasChildren = item.children && item.children.length > 0
  const isChildActive = hasChildren && item.children?.some(child => pathname === child.href)
  const [isOpen, setIsOpen] = React.useState(isActive || isChildActive)
  const prevPathname = React.useRef(pathname)

  React.useEffect(() => {
    // Only auto-open on page navigation, not on every render
    if (prevPathname.current !== pathname) {
      if (isActive || isChildActive) {
        setIsOpen(true)
      }
      prevPathname.current = pathname
    }
  }, [pathname, isActive, isChildActive])

  // With submenu: Link + Accordion toggle
  if (hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between py-2 text-sm rounded-lg transition-all duration-fast',
            depth === 0 ? 'px-3' : 'pl-7 pr-3',
            isActive
              ? 'bg-background-muted text-foreground font-semibold'
              : 'text-text-muted hover:text-foreground hover:bg-background-muted'
          )}
        >
          <span>{item.name}</span>
          <svg
            className={cn('icon-sm text-text-muted transition-transform duration-fast', isOpen && 'rotate-90')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        {isOpen && (
          <ul className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <SidebarNavItem key={child.href} item={child} pathname={pathname} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  // Without submenu: Render as link
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center justify-between py-2 text-sm rounded-lg transition-all duration-fast',
          depth === 0 ? 'px-3' : 'pl-7 pr-3',
          isActive
            ? 'bg-background-muted text-foreground font-semibold'
            : 'text-text-muted hover:text-foreground hover:bg-background-muted'
        )}
      >
        <span>{item.name}</span>
        {item.badge && (
          <span className="text-2xs font-semibold text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}

export function Sidebar({ type = 'components' }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const sections = type === 'components' ? componentSections : foundationSections

  // Keyboard shortcut: Cmd/Ctrl + B
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleCollapse()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCollapse])

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background hidden lg:flex flex-col border-r border-border transition-all duration-normal ease-out",
        isCollapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      {/* Scrollable nav content */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 w-64">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 pt-4 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

// Mobile Sidebar
export function MobileSidebar({ type = 'components' }: SidebarProps) {
  const { isOpen, setIsOpen } = useSidebar()
  const pathname = usePathname()
  const sections = type === 'components' ? componentSections : foundationSections

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <aside className="lg:hidden fixed left-0 top-0 z-modal w-72 h-full bg-background shadow-xl animate-slide-in-from-left">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <span className="font-semibold text-foreground">メニュー</span>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-background-muted transition-all duration-fast"
            aria-label="メニューを閉じる"
          >
            <svg className="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 pt-4 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <SidebarNavItem key={item.href} item={item} pathname={pathname} />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
