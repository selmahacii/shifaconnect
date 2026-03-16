import * as React from 'react'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block sticky top-0 h-screen">
        <DashboardSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
