'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { cn } from '@/lib/utils'

// Searchable page data
const searchData = [
  // Design Tokens
  { id: 'colors', title: 'Colors', desc: 'カラーパレット', href: '/design-tokens/colors', category: 'Design Tokens', keywords: ['color', 'palette', '色'] },
  { id: 'typography', title: 'Typography', desc: 'タイポグラフィ', href: '/design-tokens/typography', category: 'Design Tokens', keywords: ['font', 'text', 'フォント'] },
  { id: 'spacing', title: 'Spacing', desc: '余白・間隔', href: '/design-tokens/spacing', category: 'Design Tokens', keywords: ['space', 'padding', 'margin'] },
  { id: 'shadows', title: 'Shadows', desc: 'シャドウ', href: '/design-tokens/shadows', category: 'Design Tokens', keywords: ['shadow', 'elevation'] },
  { id: 'radius', title: 'Border Radius', desc: '角丸', href: '/design-tokens/radius', category: 'Design Tokens', keywords: ['radius', 'rounded', 'corner'] },
  { id: 'border-width', title: 'Border Width', desc: 'ボーダー幅', href: '/design-tokens/border-width', category: 'Design Tokens', keywords: ['border', 'width'] },
  { id: 'breakpoints', title: 'Breakpoints', desc: 'ブレイクポイント', href: '/design-tokens/breakpoints', category: 'Design Tokens', keywords: ['responsive', 'breakpoint'] },
  { id: 'z-index', title: 'Z-Index', desc: 'レイヤー順序', href: '/design-tokens/z-index', category: 'Design Tokens', keywords: ['z-index', 'layer'] },
  { id: 'opacity', title: 'Opacity', desc: '透明度', href: '/design-tokens/opacity', category: 'Design Tokens', keywords: ['opacity', 'transparency'] },
  { id: 'icon-sizes', title: 'Icon Sizes', desc: 'アイコンサイズ', href: '/design-tokens/icon-sizes', category: 'Design Tokens', keywords: ['icon', 'size'] },
  { id: 'duration', title: 'Duration', desc: 'アニメーション時間', href: '/design-tokens/duration', category: 'Design Tokens', keywords: ['duration', 'animation'] },
  { id: 'easing', title: 'Easing', desc: 'イージング', href: '/design-tokens/easing', category: 'Design Tokens', keywords: ['easing', 'animation'] },
  { id: 'scale', title: 'Scale', desc: 'スケール変換', href: '/design-tokens/scale', category: 'Design Tokens', keywords: ['scale', 'transform'] },
  { id: 'animation', title: 'Animation', desc: 'アニメーション', href: '/design-tokens/animation', category: 'Design Tokens', keywords: ['animation', 'enter', 'fade', 'zoom', 'keyframes'] },
  // Components
  { id: 'button', title: 'Button', desc: 'ボタン', href: '/components/button', category: 'Components', keywords: ['button', 'click', 'ボタン'] },
  { id: 'icon-button', title: 'IconButton', desc: 'アイコンボタン', href: '/components/icon-button', category: 'Components', keywords: ['icon', 'button'] },
  { id: 'button-group', title: 'ButtonGroup', desc: 'ボタングループ', href: '/components/button-group', category: 'Components', keywords: ['button', 'group'] },
  { id: 'toggle', title: 'Toggle', desc: 'トグル', href: '/components/toggle', category: 'Components', keywords: ['toggle', 'switch'] },
  { id: 'checkbox', title: 'Checkbox', desc: 'チェックボックス', href: '/components/checkbox', category: 'Components', keywords: ['checkbox', 'check', 'チェック'] },
  { id: 'radio', title: 'Radio', desc: 'ラジオ', href: '/components/radio', category: 'Components', keywords: ['radio', 'option', 'ラジオ'] },
  { id: 'switch', title: 'Switch', desc: 'スイッチ', href: '/components/switch', category: 'Components', keywords: ['switch', 'toggle', 'スイッチ'] },
  { id: 'slider', title: 'Slider', desc: 'スライダー', href: '/components/slider', category: 'Components', keywords: ['slider', 'range', 'スライダー'] },
  { id: 'segmented', title: 'Segmented', desc: 'セグメント', href: '/components/segmented', category: 'Components', keywords: ['segment', 'tabs', 'segmented'] },
  { id: 'tabs', title: 'Tabs', desc: 'タブ', href: '/components/tabs', category: 'Components', keywords: ['tabs', 'tab', 'panel', 'タブ'] },
  // Guidelines
  { id: 'icons', title: 'Icons', desc: 'アイコン', href: '/guidelines/icons', category: 'Guidelines', keywords: ['icon', 'lucide'] },
  { id: 'accessibility', title: 'Accessibility', desc: 'アクセシビリティ', href: '/guidelines/accessibility', category: 'Guidelines', keywords: ['a11y', 'accessibility'] },
]

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [mounted, setMounted] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Mount check for Portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setSearch('')
    }
  }, [open])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  // Group by category
  const groupedData = React.useMemo(() => {
    const groups: Record<string, typeof searchData> = {}
    searchData.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [])

  if (!open || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-modal bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Command Dialog */}
      <div className="fixed inset-0 z-modal flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
        <Command
          className={cn(
            'pointer-events-auto w-full max-w-md rounded-xl overflow-hidden',
            'bg-background shadow-xl'
          )}
          shouldFilter={true}
          role="dialog"
          aria-modal="true"
          aria-label="ページ検索"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-border">
            <svg className="icon-md text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="トークン、コンポーネントを検索..."
              className="flex-1 h-8 bg-transparent text-sm text-foreground placeholder:text-text-muted outline-none border-none"
            />
            <kbd className="text-2xs font-mono text-text-subtle px-2 py-1 bg-background-muted rounded-base border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="py-8 text-center text-text-muted">
              <p className="text-sm">検索結果がありません</p>
            </Command.Empty>

            {Object.entries(groupedData).map(([category, items]) => (
              <Command.Group
                key={category}
                heading={
                  <div className="px-2 py-2 text-xs font-bold text-foreground">
                    {category}
                  </div>
                }
              >
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.title} ${item.desc} ${item.keywords.join(' ')}`}
                    onSelect={() => handleSelect(item.href)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer',
                      'text-sm text-text-muted',
                      'data-[selected=true]:bg-background-muted data-[selected=true]:text-foreground'
                    )}
                  >
                    <span>{item.title}</span>
                    <span className="text-xs text-text-subtle">{item.desc}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-2xs text-text-subtle">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className="w-7 h-6 flex items-center justify-center bg-background-muted rounded-base border border-border font-mono">↑↓</kbd>
                <span>移動</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="w-7 h-6 flex items-center justify-center bg-background-muted rounded-base border border-border font-mono">↵</kbd>
                <span>選択</span>
              </span>
            </div>
          </div>
        </Command>
      </div>
    </>,
    document.body
  )
}
