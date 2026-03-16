'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
  },
  {
    title: 'Consultations',
    href: '/dashboard/consultations',
    icon: Stethoscope,
  },
  {
    title: 'Ordonnances',
    href: '/dashboard/prescriptions',
    icon: FileText,
  },
  {
    title: 'Agenda',
    href: '/dashboard/agenda',
    icon: Calendar,
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { doctor, logout } = useAuthStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const doctorName = doctor?.clinicName || doctor?.user?.name || 'Dr. Médecin'
  const doctorInitials = doctorName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col border-r border-white/10 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ backgroundColor: '#1B4F72' }}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">Shifa-Connect</span>
              </div>
            </div>
            <span 
              className="text-xs text-white/60 mt-0.5 mr-8"
              style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
              dir="rtl"
            >
              الشفاء كونيكت
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active ? 'text-white' : 'text-white/70'
                    )}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium bg-white text-foreground shadow-lg">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}

        {/* Separator */}
        <Separator className="my-3 bg-white/10" />

        {/* Bottom Navigation Items */}
        {bottomNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active ? 'text-white' : 'text-white/70'
                    )}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium bg-white text-foreground shadow-lg">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>

      {/* Doctor Info & Logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src={doctor?.user?.avatar || ''} alt={doctorName} />
              <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{doctorName}</p>
              <p className="text-xs text-white/60 truncate">Médecin généraliste</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-foreground shadow-lg">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src={doctor?.user?.avatar || ''} alt={doctorName} />
              <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-foreground shadow-lg">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <Separator className="bg-white/10" />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full text-white/70 hover:text-white hover:bg-white/10',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
