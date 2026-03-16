
'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Check, Search, Loader2, Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AppointmentSchema, AppointmentSchemaType } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSlot?: { start: Date; end: Date } | null
  onSuccess?: () => void
}

export function AppointmentModal({ open, onOpenChange, selectedSlot, onSuccess }: AppointmentModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [patients, setPatients] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const supabase = createClient()

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      patientId: '',
      appointmentDate: selectedSlot ? format(selectedSlot.start, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      appointmentTime: selectedSlot ? format(selectedSlot.start, 'HH:mm') : '09:00',
      duration: 20,
      reason: '',
      status: 'scheduled',
      notes: '',
    },
  })

  // Pre-fill when slot changes
  React.useEffect(() => {
    if (selectedSlot) {
      form.setValue('appointmentDate', format(selectedSlot.start, 'yyyy-MM-dd'))
      form.setValue('appointmentTime', format(selectedSlot.start, 'HH:mm'))
      const duration = Math.round((selectedSlot.end.getTime() - selectedSlot.start.getTime()) / 60000)
      if (duration > 0) form.setValue('duration', duration)
    }
  }, [selectedSlot, form])

  // Initial patient fetch (top 10)
  React.useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').limit(10)
      if (data) setPatients(data)
    }
    if (open) fetchPatients()
  }, [open, supabase])

  const searchPatients = async (query: string) => {
    if (query.length < 2) return
    setIsSearching(true)
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10)
    if (data) setPatients(data)
    setIsSearching(false)
  }

  async function onSubmit(data: AppointmentSchemaType) {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!doctor) throw new Error('Profil docteur non trouvé')

      const { error } = await (supabase.from('appointments') as any).insert({
        doctor_id: doctor.id,
        patient_id: data.patientId,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        duration: data.duration,
        reason: data.reason,
        status: data.status,
        notes: data.notes,
      })

      if (error) throw error

      toast.success('Rendez-vous planifié')
      onOpenChange(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#1B4F72]">
            <CalendarIcon className="h-5 w-5" />
            Nouveau rendez-vous
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Patient</FormLabel>
                  <PatientSearch 
                    patients={patients}
                    value={field.value}
                    onSelect={field.onChange}
                    onSearch={searchPatients}
                    isSearching={isSearching}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (min)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durée" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="20">20 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Planifié</SelectItem>
                        <SelectItem value="confirmed">Confirmé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif de visite</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Contrôle, Grippe, Résultat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (interne)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes optionnelles..." {...field} className="h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#1B4F72] hover:bg-[#153e5a]" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer le RDV
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function PatientSearch({ patients, value, onSelect, onSearch, isSearching }: any) {
  const [open, setOpen] = React.useState(false)
  const selectedPatient = patients.find((p: any) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? `${selectedPatient?.last_name} ${selectedPatient?.first_name}` : "Rechercher un patient..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Nom du patient..." 
            onValueChange={(v) => onSearch(v)}
          />
          <CommandList>
            {isSearching && <div className="p-4 text-center text-xs text-slate-400">Recherche...</div>}
            <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
            <CommandGroup>
              {patients.map((p: any) => (
                <CommandItem
                  key={p.id}
                  value={p.id}
                  onSelect={() => {
                    onSelect(p.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                      {p.last_name[0]}{p.first_name[0]}
                    </div>
                    <span>{p.last_name} {p.first_name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="p-2 border-t mt-1">
               <Button asChild variant="ghost" size="sm" className="w-full justify-start text-[#1B4F72] h-8 px-2 font-bold">
                 <a href="/dashboard/patients/new">+ Créer un nouveau patient</a>
               </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
