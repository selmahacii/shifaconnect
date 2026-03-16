'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Moon,
  Sun,
  Loader2,
  Save,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DAYS = [
  { id: 'sunday', name: 'Dimanche', short: 'Dim' },
  { id: 'monday', name: 'Lundi', short: 'Lun' },
  { id: 'tuesday', name: 'Mardi', short: 'Mar' },
  { id: 'wednesday', name: 'Mercredi', short: 'Mer' },
  { id: 'thursday', name: 'Jeudi', short: 'Jeu' },
  { id: 'friday', name: 'Vendredi', short: 'Ven' },
  { id: 'saturday', name: 'Samedi', short: 'Sam' },
]

const workingHoursSchema = z.object({
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
})

const preferencesSchema = z.object({
  workingHours: z.record(workingHoursSchema),
  appointmentDuration: z.number().min(5).max(120),
  theme: z.enum(['light', 'dark', 'system']).optional(),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
  doctor: {
    id: string
    workingHours?: string | null
  }
  onUpdate?: () => void
}

const DEFAULT_WORKING_HOURS: Record<string, { enabled: boolean; start: string; end: string }> = {
  sunday: { enabled: false, start: '08:00', end: '16:00' },
  monday: { enabled: true, start: '08:00', end: '17:00' },
  tuesday: { enabled: true, start: '08:00', end: '17:00' },
  wednesday: { enabled: true, start: '08:00', end: '17:00' },
  thursday: { enabled: true, start: '08:00', end: '17:00' },
  friday: { enabled: true, start: '08:00', end: '17:00' },
  saturday: { enabled: true, start: '08:00', end: '13:00' },
}

export function PreferencesForm({ doctor, onUpdate }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  // Parse working hours from JSON string or use defaults
  const parsedWorkingHours = React.useMemo(() => {
    if (doctor.workingHours) {
      try {
        return JSON.parse(doctor.workingHours)
      } catch {
        return DEFAULT_WORKING_HOURS
      }
    }
    return DEFAULT_WORKING_HOURS
  }, [doctor.workingHours])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      workingHours: parsedWorkingHours,
      appointmentDuration: 15,
      theme: 'light',
    },
  })

  const workingHours = watch('workingHours')

  const toggleDay = (dayId: string) => {
    const day = workingHours[dayId]
    setValue(`workingHours.${dayId}.enabled`, !day.enabled, { shouldDirty: true })
  }

  const updateDayTime = (dayId: string, field: 'start' | 'end', value: string) => {
    setValue(`workingHours.${dayId}.${field}`, value, { shouldDirty: true })
  }

  const onSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: {
            workingHours: JSON.stringify(data.workingHours),
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Préférences mises à jour')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const enabledDaysCount = Object.values(workingHours).filter(d => d.enabled).length

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#F39C12]" />
            Horaires de travail
          </CardTitle>
          <CardDescription>
            Définissez vos jours et horaires de consultation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week Overview */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {DAYS.map((day) => {
                const dayHours = workingHours[day.id]
                return (
                  <div
                    key={day.id}
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                      dayHours?.enabled
                        ? 'bg-[#148F77] text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                    title={dayHours?.enabled ? `${dayHours.start} - ${dayHours.end}` : 'Fermé'}
                  >
                    {day.short.charAt(0)}
                  </div>
                )
              })}
            </div>
            <Badge variant="secondary" className="bg-[#148F77]/10 text-[#148F77]">
              {enabledDaysCount} jours/semaine
            </Badge>
          </div>

          {/* Day by Day Settings */}
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayHours = workingHours[day.id]
              const isEnabled = dayHours?.enabled ?? false

              return (
                <div
                  key={day.id}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border transition-all',
                    isEnabled
                      ? 'bg-background border-[#148F77]/30'
                      : 'bg-muted/30 border-transparent'
                  )}
                >
                  {/* Day Toggle */}
                  <div className="w-32 flex items-center gap-3">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleDay(day.id)}
                    />
                    <span className={cn(
                      'font-medium',
                      isEnabled ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {day.name}
                    </span>
                  </div>

                  {/* Time Inputs */}
                  <div className="flex items-center gap-2 flex-1">
                    {isEnabled ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Sun className="h-4 w-4 text-[#F39C12]" />
                          <Input
                            type="time"
                            className="w-28"
                            value={dayHours?.start || '08:00'}
                            onChange={(e) => updateDayTime(day.id, 'start', e.target.value)}
                          />
                        </div>
                        <span className="text-muted-foreground">à</span>
                        <div className="flex items-center gap-1">
                          <Moon className="h-4 w-4 text-[#1B4F72]" />
                          <Input
                            type="time"
                            className="w-28"
                            value={dayHours?.end || '17:00'}
                            onChange={(e) => updateDayTime(day.id, 'end', e.target.value)}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({calculateDuration(dayHours?.start, dayHours?.end)}h)
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Fermé
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#1B4F72]" />
            Paramètres des rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Durée par défaut des rendez-vous</Label>
              <p className="text-sm text-muted-foreground">
                Durée standard pour chaque consultation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-20"
                {...register('appointmentDuration', { valueAsNumber: true })}
                min={5}
                max={120}
                step={5}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="bg-[#1B4F72] hover:bg-[#1B4F72]/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les préférences
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Helper function to calculate duration in hours
function calculateDuration(start?: string, end?: string): string {
  if (!start || !end) return '0'
  
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  const diffMinutes = endMinutes - startMinutes
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours === 0) return `${minutes}`
  if (minutes === 0) return `${hours}`
  return `${hours}.${minutes.toString().padStart(2, '0')}`
}
