'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

interface MainContentProps {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar()

  return (
    <main className={cn(
      // pt-28 for mobile (header + nav), lg:pt-16 for desktop (header only)
      "pt-28 lg:pt-16 min-h-screen transition-all duration-normal ease-out",
      isCollapsed ? "" : "lg:pl-64"
    )}>
      {/* Uses "reading" layout padding (Y > X) for documentation site */}
      <div className={cn(
        "mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 lg:py-10 transition-all duration-normal ease-out",
        isCollapsed ? "max-w-[1536px]" : "max-w-7xl"
      )}>
        {children}
      </div>
    </main>
  )
}
