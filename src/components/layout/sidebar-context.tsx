'use client'

import * as React from 'react'

interface SidebarContextType {
  // Mobile sidebar (overlay)
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
  // Desktop sidebar (collapsible)
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleCollapse: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

const STORAGE_KEY = 'sidebar-collapsed'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  // Load collapsed state from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{
      isOpen,
      setIsOpen,
      toggle,
      isCollapsed,
      setIsCollapsed,
      toggleCollapse
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  // Return a no-op version if not inside provider (e.g., home page)
  if (!context) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      toggle: () => {},
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleCollapse: () => {}
    }
  }
  return context
}
