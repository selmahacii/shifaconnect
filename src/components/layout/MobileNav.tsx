'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Accueil', href: '/dashboard', icon: Home },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Consult.', href: '/dashboard/consultations', icon: Stethoscope },
  { label: 'Ordon.', href: '/dashboard/prescriptions', icon: FileText },
  { label: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center justify-around h-16 px-2">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
              isActive ? "text-[#1B4F72]" : "text-slate-400"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
