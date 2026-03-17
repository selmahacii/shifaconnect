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
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { title: 'Tableau de bord', href: '/dashboard', icon: Home },
  { title: 'Patients', href: '/dashboard/patients', icon: Users },
  { title: 'Consultations', href: '/dashboard/consultations', icon: Stethoscope },
  { title: 'Ordonnances', href: '/dashboard/prescriptions', icon: FileText },
  { title: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

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
    <aside 
      className={cn(
        "relative flex flex-col bg-[#1B4F72] text-white transition-all duration-300 h-screen",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-1.5 shadow-sm overflow-hidden">
            <img src="/image.png" alt="Shifa logo" className="h-8 w-8 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-tight">Shifa-Connect</span>
              <span className="text-[10px] text-white/70 font-medium tracking-widest text-center mt-0.5">الشفاء كونيكت</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                isActive 
                  ? "bg-white/20 text-white font-semibold" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-white")} />
              {!isCollapsed && <span className="text-sm truncate">{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-[#1B4F72] border border-white/20 rounded-full p-1 text-white/70 hover:text-white hidden md:block"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User & Logout Section */}
      <div className="p-4 mt-auto border-t border-white/10 space-y-4">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-2")}>
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-white/10 text-white text-xs">{initials || <User className="h-5 w-5" />}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-[10px] text-white/60 truncate">Connecté</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-white/70 hover:bg-red-500/20 hover:text-red-300 gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm">Déconnexion</span>}
        </Button>
      </div>
    </aside>
  )
}
