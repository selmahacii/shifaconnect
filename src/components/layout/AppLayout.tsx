'use client'

import * as React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

export function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            'flex min-h-screen flex-col transition-all duration-300',
            isMobile ? 'pt-16 pb-20' : sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}
        >
          {/* Header */}
          <Header 
            sidebarCollapsed={isMobile ? true : sidebarCollapsed} 
            pageTitle={pageTitle}
          />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card py-4 px-6 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: '#1B4F72' }}>Shifa-Connect</span>
                <span className="text-xs">الشفاء كونيكت</span>
                <span>© {new Date().getFullYear()}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Système opérationnel
                </span>
              </p>
            </div>
          </footer>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </TooltipProvider>
  )
}
