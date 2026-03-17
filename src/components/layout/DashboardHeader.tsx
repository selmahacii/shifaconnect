'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu, LayoutDashboard } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarContent } from './DashboardSidebar'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/patients': 'Gestion des Patients',
  '/dashboard/consultations': 'Consultations Médicales',
  '/dashboard/prescriptions': 'Gestion des Ordonnances',
  '/dashboard/agenda': 'Agenda & Rendez-vous',
  '/dashboard/settings': 'Paramètres de votre Cabinet',
}

export function DashboardHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const title = React.useMemo(() => {
    const match = Object.keys(routeTitles)
      .filter(route => pathname.startsWith(route))
      .sort((a, b) => b.length - a.length)[0]
    return routeTitles[match] || 'Tableau de bord'
  }, [pathname])

  const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })
  const capitalizedDate = today.split(' ').map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(' ')

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-[#1B4F72]">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none bg-[#1B4F72] w-[300px]">
             <SidebarContent onNavItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter leading-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-[#1B4F72] hidden sm:block" />
            {title}
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-[#148F77] uppercase tracking-widest hidden sm:block">
            Système Shifa-Connect v2.0
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        {/* Date Section */}
        <div className="hidden lg:flex flex-col items-end text-neutral-800 border-r pr-6 border-slate-100 h-10 justify-center">
          <p className="text-sm font-black tracking-tight leading-none text-slate-900">{capitalizedDate}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessión Active</p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile-first logic) */}
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl md:hidden bg-slate-50 border border-slate-100 text-slate-500">
            <Search className="h-5 w-5" />
          </Button>

          {/* Desktop Search (Placeholder for expansion) */}
          <div className="relative hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 transition-all focus-within:ring-2 focus-within:ring-[#1B4F72]/10 focus-within:bg-white focus-within:border-[#1B4F72]/20">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              placeholder="Rechercher dossiers..." 
              className="bg-transparent border-none focus:ring-0 text-sm h-11 w-48 font-bold text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-[#1B4F72]/5 hover:bg-[#1B4F72]/10 border border-[#1B4F72]/10 text-[#1B4F72] transition-all">
              <Bell className="h-5 w-5 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#E74C3C] rounded-full border-2 border-white animate-pulse"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
