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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  title: string
  shortTitle: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    shortTitle: 'Accueil',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Patients',
    shortTitle: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
  },
  {
    title: 'Consultations',
    shortTitle: 'Consult.',
    href: '/dashboard/consultations',
    icon: Stethoscope,
  },
  {
    title: 'Ordonnances',
    shortTitle: 'Ordonn.',
    href: '/dashboard/prescriptions',
    icon: FileText,
  },
  {
    title: 'Agenda',
    shortTitle: 'Agenda',
    href: '/dashboard/agenda',
    icon: Calendar,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 min-w-[44px] min-h-[44px] transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      active && 'text-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.shortTitle}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                {item.title}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </nav>
  )
}
