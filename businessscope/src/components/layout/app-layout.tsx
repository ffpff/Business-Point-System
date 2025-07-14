'use client'

import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  sidebarProps?: {
    className?: string
  }
}

export function AppLayout({ 
  children, 
  showSidebar = false,
  sidebarProps = {}
}: AppLayoutProps) {
  if (!showSidebar) {
    return (
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar {...sidebarProps} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Mobile Sidebar Trigger */}
          <div className="lg:hidden mb-4">
            <MobileSidebar />
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}