'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/patients': 'Gestion des Patients',
  '/dashboard/consultations': 'Consultations Médicales',
  '/dashboard/prescriptions': 'Gestion des Ordonnances',
  '/dashboard/agenda': 'Agenda & Rendez-vous',
  '/dashboard/settings': 'Paramètres',
}

export function DashboardHeader() {
  const pathname = usePathname()
  const title = React.useMemo(() => {
    // Find closest match for nested routes
    const match = Object.keys(routeTitles)
      .filter(route => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0]
    return routeTitles[match] || 'Dashboard'
  }, [pathname])

  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: fr })
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-slate-800 hidden lg:block min-w-[200px]">
          {title}
        </h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md w-full hidden md:block ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un patient..." 
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Date display */}
        <div className="hidden xl:block text-right">
          <p className="text-sm font-semibold text-slate-700">{capitalizedDate}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Aujourd'hui</p>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-50 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>
    </header>
  )
}
