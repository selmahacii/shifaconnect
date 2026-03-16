'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { formatDateWithDayName } from '@/lib/utils/dates'

interface HeaderProps {
  sidebarCollapsed?: boolean
  onMenuToggle?: () => void
  pageTitle?: string
}

// French day and month names
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function getFrenchDate(): string {
  const now = new Date()
  const day = DAYS_FR[now.getDay()]
  const date = now.getDate()
  const month = MONTHS_FR[now.getMonth()]
  const year = now.getFullYear()
  return `${day}, ${date} ${month} ${year}`
}

export function Header({ sidebarCollapsed, onMenuToggle, pageTitle }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentDate, setCurrentDate] = React.useState('')
  const { doctor, user, logout } = useAuthStore()

  // Update date on client side
  React.useEffect(() => {
    setCurrentDate(getFrenchDate())
    const interval = setInterval(() => {
      setCurrentDate(getFrenchDate())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const doctorName = doctor?.clinicName || user?.name || 'Dr. Médecin'
  const doctorInitials = doctorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Mock notifications - in real app, these would come from API
  const notifications = [
    {
      id: 1,
      title: 'Nouvelle consultation',
      message: 'Un patient vous attend',
      time: '5 min',
      unread: true,
    },
    {
      id: 2,
      title: 'Ordonnance à renouveler',
      message: 'Traitement en cours',
      time: '1h',
      unread: true,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/patients?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center border-b border-border bg-card px-4 transition-all duration-300',
        sidebarCollapsed ? 'left-16 right-0' : 'left-64 right-0'
      )}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Page Title & Date */}
      <div className="hidden md:flex flex-col mr-6">
        <h1 className="text-lg font-semibold text-foreground">
          {pageTitle || 'Tableau de bord'}
        </h1>
        <span className="text-xs text-muted-foreground">{currentDate}</span>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un patient (nom, téléphone, n° dossier)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-muted/50"
        />
      </form>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2">
        {/* Date display for mobile */}
        <div className="md:hidden text-xs text-muted-foreground mr-2">
          {currentDate.split(',')[0]}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} nouvelles
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      notification.unread && 'text-primary'
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={user?.avatar || ''} alt={doctorName} />
                <AvatarFallback 
                  className="text-white text-sm font-medium"
                  style={{ backgroundColor: '#1B4F72' }}
                >
                  {doctorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{doctorName}</span>
                <span className="text-xs text-muted-foreground">
                  Médecin généraliste
                </span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push('/dashboard/settings')}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
