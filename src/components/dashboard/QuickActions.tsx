'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Stethoscope,
  UserPlus,
  CalendarPlus,
  Scan,
  ArrowRight,
  Search,
  Users,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  color: {
    bg: string
    icon: string
    hover: string
  }
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-patient',
    label: 'Nouveau patient',
    description: 'Enregistrer un nouveau patient',
    icon: UserPlus,
    href: '/dashboard/patients/new',
    color: {
      bg: 'bg-[#148F77]/10',
      icon: 'text-[#148F77]',
      hover: 'hover:bg-[#148F77]/20',
    },
  },
  {
    id: 'new-consultation',
    label: 'Nouvelle consultation',
    description: 'Démarrer une consultation',
    icon: Stethoscope,
    href: '/dashboard/patients',
    color: {
      bg: 'bg-[#1B4F72]/10',
      icon: 'text-[#1B4F72]',
      hover: 'hover:bg-[#1B4F72]/20',
    },
  },
  {
    id: 'new-appointment',
    label: 'Nouveau rendez-vous',
    description: 'Planifier un rendez-vous',
    icon: CalendarPlus,
    href: '/dashboard/agenda',
    color: {
      bg: 'bg-[#F39C12]/10',
      icon: 'text-[#F39C12]',
      hover: 'hover:bg-[#F39C12]/20',
    },
  },
  {
    id: 'scan-chifa',
    label: 'Scanner Chifa',
    description: 'Scanner une carte Chifa',
    icon: Scan,
    color: {
      bg: 'bg-purple-500/10',
      icon: 'text-purple-500',
      hover: 'hover:bg-purple-500/20',
    },
  },
]

export interface QuickActionsProps {
  actions?: QuickAction[]
  className?: string
}

export function QuickActions({ actions = defaultActions, className }: QuickActionsProps) {
  const router = useRouter()
  const [showPatientSearch, setShowPatientSearch] = React.useState(false)
  const [showScannerDialog, setShowScannerDialog] = React.useState(false)
  const [patients, setPatients] = React.useState<Array<{
    id: string
    firstName: string
    lastName: string
    phone?: string | null
  }>>([])
  const [searchLoading, setSearchLoading] = React.useState(false)

  // Search patients when dialog opens
  const searchPatients = React.useCallback(async (query: string) => {
    if (!query) {
      setPatients([])
      return
    }
    
    setSearchLoading(true)
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Error searching patients:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleActionClick = (action: QuickAction) => {
    if (action.id === 'new-consultation') {
      setShowPatientSearch(true)
    } else if (action.id === 'scan-chifa') {
      setShowScannerDialog(true)
    } else if (action.href) {
      router.push(action.href)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setShowPatientSearch(false)
    router.push(`/dashboard/patients/${patientId}?startConsultation=true`)
  }

  return (
    <>
      <Card className={cn('h-full border-none shadow-md overflow-hidden bg-white', className)}>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#1B4F72]" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-slate-100 transition-all duration-300 group relative overflow-hidden',
                    action.color.hover,
                    'cursor-pointer bg-slate-50/50 hover:bg-white hover:shadow-lg hover:-translate-y-1'
                  )}
                >
                  <div className={cn(
                    'h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-inner',
                    action.color.bg
                  )}>
                    <Icon className={cn('h-7 w-7 transition-all duration-300 group-hover:rotate-12', action.color.icon)} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-slate-900">{action.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  {/* Subtle hover indicator */}
                  <div className={cn("absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full opacity-50", action.color.bg.replace('/10', ''))} />
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Patient Search Dialog for New Consultation */}
      <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1B4F72]" />
              Rechercher un patient
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un patient pour démarrer une nouvelle consultation
            </DialogDescription>
          </DialogHeader>
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Rechercher par nom, prénom ou téléphone..."
              onValueChange={searchPatients}
            />
            <CommandList>
              <CommandEmpty>
                {searchLoading ? 'Recherche...' : 'Aucun patient trouvé'}
              </CommandEmpty>
              <CommandGroup heading="Patients">
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={`${patient.firstName} ${patient.lastName}`}
                    onSelect={() => handlePatientSelect(patient.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 rounded-full bg-[#1B4F72] flex items-center justify-center text-white text-sm">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {patient.phone && (
                          <p className="text-xs text-muted-foreground">
                            {patient.phone}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setShowPatientSearch(false)}>
              Annuler
            </Button>
            <Button asChild className="bg-[#148F77] hover:bg-[#148F77]/90">
              <Link href="/dashboard/patients/new">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouveau patient
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scanner Chifa Placeholder Dialog */}
      <Dialog open={showScannerDialog} onOpenChange={setShowScannerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-purple-500" />
              Scanner carte Chifa
            </DialogTitle>
            <DialogDescription>
              Fonctionnalité à venir
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Scan className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Scanner une carte Chifa
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Cette fonctionnalité sera bientôt disponible. Elle vous permettra de scanner 
              la carte Chifa d'un patient pour récupérer automatiquement ses informations.
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => setShowScannerDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
