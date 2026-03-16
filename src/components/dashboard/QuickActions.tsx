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
    href: '/patients/new',
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
    href: '/consultations',
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
    href: '/agenda',
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
    router.push(`/consultations?new=true&patientId=${patientId}`)
  }

  return (
    <>
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 group',
                    action.color.bg,
                    action.color.hover,
                    'border-transparent hover:border-transparent cursor-pointer'
                  )}
                >
                  <div className={cn(
                    'h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
                    action.color.bg
                  )}>
                    <Icon className={cn('h-6 w-6', action.color.icon)} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {action.description}
                    </p>
                  </div>
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
              <Link href="/patients/new">
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
