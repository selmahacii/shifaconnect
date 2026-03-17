'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Users, 
  Stethoscope, 
  FileText, 
  Calendar, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Settings,
  Bell,
  Menu,
  LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { title: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Patients', href: '/dashboard/patients', icon: Users },
  { title: 'Consultations', href: '/dashboard/consultations', icon: Stethoscope },
  { title: 'Ordonnances', href: '/dashboard/prescriptions', icon: FileText },
  { title: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  { title: 'Paramètres', href: '/dashboard/settings', icon: Settings },
]

export function SidebarContent({ isCollapsed = false, onNavItemClick }: { isCollapsed?: boolean, onNavItemClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const userName = user?.name || 'Docteur'

  const handleLogout = async () => {
    await logout()
    toast.info('Déconnexion réussie')
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="flex flex-col h-full bg-[#1B4F72] text-white">
      {/* Logo Section */}
      <div className={cn(
        "flex flex-col items-center justify-center py-10 transition-all duration-300",
        isCollapsed ? "px-2" : "px-6"
      )}>
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="rounded-2xl bg-white p-2 shadow-xl border border-white/20 shrink-0 group hover:rotate-6 transition-transform">
            <img src="/image.png" alt="Shifa logo" className="h-9 w-9 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-black text-2xl tracking-tighter leading-none italic uppercase">Shifa</span>
              <span className="font-bold text-xs text-white/60 tracking-[0.2em] uppercase mt-0.5 ml-0.5">Connect</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2.5 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={onNavItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group",
                isActive 
                  ? "bg-white text-[#1B4F72] font-black shadow-lg shadow-black/20" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#1B4F72]" : "text-white/60 group-hover:text-white")} />
              {!isCollapsed && <span className="text-sm font-semibold tracking-tight truncate">{item.title}</span>}
              {isActive && !isCollapsed && (
                <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-[#1B4F72]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 mt-auto border-t border-white/10 space-y-6 pt-6 mb-4">
        <div className={cn(
          "flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 transition-all group hover:bg-white/10", 
          isCollapsed ? "justify-center p-2" : "px-3"
        )}>
          <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg group-hover:border-[#148F77] transition-colors">
            <AvatarFallback className="bg-[#148F77] text-white text-xs font-black">{initials || <User className="h-5 w-5" />}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-black truncate">{userName}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                Dépêche
              </p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "h-12 w-full justify-start text-white/50 hover:bg-red-500 hover:text-white gap-3 rounded-2xl transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-bold uppercase tracking-tight">Quitter</span>}
        </Button>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex relative flex-col border-r border-white/10 transition-all duration-500 ease-in-out h-screen z-20 shadow-2xl overflow-hidden",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-white border border-[#1B4F72]/20 rounded-full p-1.5 text-[#1B4F72] shadow-xl hover:scale-110 transition-all z-30 flex items-center justify-center group"
          aria-label={isCollapsed ? "Déplié" : "Replié"}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile Drawer (Handled by DashboardHeader) */}
    </>
  )
}
