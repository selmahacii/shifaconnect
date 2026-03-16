'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  Loader2,
  Search,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useToast } from '@/hooks/use-toast'

// Form schema
const newAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),
  appointmentDate: z.string().min(1, 'La date est requise'),
  appointmentTime: z.string().min(1, 'L\'heure est requise'),
  duration: z.coerce.number().min(5, 'La durée est requise'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED']).default('SCHEDULED'),
})

export type NewAppointmentData = z.infer<typeof newAppointmentSchema>

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  fileNumber: string
  phone?: string | null
  gender: string
}

interface NewAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: {
    date?: Date
    time?: string
    patientId?: string
  }
  onSuccess?: () => void
}

// Duration options
const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
]

// Generate time slots
const TIME_SLOTS = Array.from({ length: 40 }, (_, i) => {
  const hour = Math.floor(i / 4) + 8
  const minute = (i % 4) * 15
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
})

export function NewAppointmentDialog({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: NewAppointmentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [patientSearch, setPatientSearch] = React.useState('')
  const [patients, setPatients] = React.useState<PatientOption[]>([])
  const [selectedPatient, setSelectedPatient] = React.useState<PatientOption | null>(null)
  const [showPatientPicker, setShowPatientPicker] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(defaultValues?.date)

  const form = useForm<NewAppointmentData>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      appointmentDate: defaultValues?.date ? format(defaultValues.date, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
      appointmentTime: defaultValues?.time || '09:00',
      duration: 30,
      status: 'SCHEDULED',
      patientId: defaultValues?.patientId || '',
    },
  })

  // Search patients
  React.useEffect(() => {
    if (patientSearch.length >= 2) {
      const fetchPatients = async () => {
        try {
          const response = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}&limit=10`)
          const data = await response.json()
          setPatients(data.patients || [])
        } catch (error) {
          console.error('Error searching patients:', error)
        }
      }
      fetchPatients()
    } else {
      setPatients([])
    }
  }, [patientSearch])

  // Handle patient selection
  const handleSelectPatient = (patient: PatientOption) => {
    setSelectedPatient(patient)
    form.setValue('patientId', patient.id)
    setShowPatientPicker(false)
    setPatientSearch('')
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      form.setValue('appointmentDate', format(date, 'dd/MM/yyyy'))
    }
  }

  // Handle form submission
  const handleSubmit = async (data: NewAppointmentData) => {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      toast({
        title: 'Rendez-vous créé',
        description: 'Le rendez-vous a été créé avec succès.',
      })

      onOpenChange(false)
      form.reset()
      setSelectedPatient(null)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Nouveau rendez-vous
          </DialogTitle>
          <DialogDescription>
            Créer un nouveau rendez-vous
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient *
            </Label>
            
            {selectedPatient ? (
              <Card className="border-primary/30">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                      selectedPatient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                    )}>
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-sm text-muted-foreground">Dossier: {selectedPatient.fileNumber}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null)
                      form.setValue('patientId', '')
                    }}
                  >
                    Changer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Popover open={showPatientPicker} onOpenChange={setShowPatientPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      {form.watch('patientId') ? 'Patient sélectionné' : 'Rechercher un patient...'}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Nom, prénom, téléphone ou N° dossier..."
                      value={patientSearch}
                      onValueChange={setPatientSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {patientSearch.length < 2 
                          ? 'Tapez au moins 2 caractères'
                          : 'Aucun patient trouvé'
                        }
                      </CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={() => handleSelectPatient(patient)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                                patient.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                              )}>
                                {patient.firstName[0]}{patient.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {patient.fileNumber} {patient.phone && `• ${patient.phone}`}
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            
            {form.formState.errors.patientId && (
              <p className="text-sm text-destructive">{form.formState.errors.patientId.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.appointmentDate && (
                <p className="text-sm text-destructive">{form.formState.errors.appointmentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heure *
              </Label>
              <Select
                value={form.watch('appointmentTime')}
                onValueChange={(value) => form.setValue('appointmentTime', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.appointmentTime && (
                <p className="text-sm text-destructive">{form.formState.errors.appointmentTime.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Durée</Label>
              <Select
                value={form.watch('duration')?.toString()}
                onValueChange={(value) => form.setValue('duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as 'SCHEDULED' | 'CONFIRMED')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Planifié</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Motif
            </Label>
            <Textarea
              placeholder="Motif de la consultation..."
              {...form.register('reason')}
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Notes additionnelles..."
              {...form.register('notes')}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le rendez-vous
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewAppointmentDialog
